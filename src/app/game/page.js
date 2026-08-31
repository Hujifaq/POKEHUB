"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BubbleMenu from '../components/BubbleMenu'
import Preloader from '../components/Preloader'
import ControlDock from '../components/ControlDock'
import CardInspectorHUD from '../components/CardInspectorHUD'
import PokerDuelGame from '../components/PokerDuelGame'
import GameSetupModal from '../components/GameSetupModal'
import HandRankingsModal from '../components/HandRankingsModal'
import VIPClubModal from '../components/VIPClubModal'
import { SoundEngine } from '../components/SoundEngine'
import {
  parseGameUrlParams,
  generateGameUrl,
  getOrCreateUserId,
  generateGameId
} from '../utils/gameUrl'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Dynamically import PokerScene with ssr: false for rock-solid 3D Canvas initialization
const PokerScene = dynamic(() => import('../components/PokerScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
    </div>
  )
})

const topLetters = ['P', 'K', 'H', 'B']
const text = "POKERHUB"

export default function GamePage() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)
  const heroSectionRef = useRef(null)
  const heroSceneRef = useRef(null)
  const heroTitleBottomRef = useRef(null)
  const heroTitleTopRef = useRef(null)

  // URL Slug & Query URI states
  const [userId, setUserId] = useState('usr_highroller_99')
  const [gameId, setGameId] = useState('holdem_session')
  const [tableName, setTableName] = useState('macau_nlh_500')
  const [stakes, setStakes] = useState('250-500')
  const [mode, setMode] = useState('texas_holdem')
  const [initialBots, setInitialBots] = useState(2)
  const [toastNotification, setToastNotification] = useState(null)

  // 3D Scene states
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHolo, setIsHolo] = useState(true)
  const [isFanMode, setIsFanMode] = useState(false)
  const [deckSkin, setDeckSkin] = useState('obsidian')
  const [activeSuit, setActiveSuit] = useState('hearts')
  const [tossSignal, setTossSignal] = useState(0)
  const [telemetry, setTelemetry] = useState({ pitch: 0, yaw: 0, roll: 0, velX: 0, velY: 0, speed: 0 })

  // Financial & Audio states
  const [bankroll, setBankroll] = useState(10000)
  const [isMuted, setIsMuted] = useState(false)
  const [tableTheme, setTableTheme] = useState('classic_pink')

  // Modal Dialogs
  const [isDuelOpen, setIsDuelOpen] = useState(false)
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)

  // Load URL slug, query URI params, and bankroll on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const parsed = parseGameUrlParams(window.location.search)
      const pathParts = window.location.pathname.split('/').filter(Boolean)
      const pathSlugGameId = pathParts.length >= 2 && pathParts[0] === 'game' ? pathParts[1] : null

      const activeUserId = parsed.userId || getOrCreateUserId()
      const activeGameId = pathSlugGameId || parsed.gameId || generateGameId()
      const activeTable = parsed.table || 'macau_nlh_500'
      const activeStakes = parsed.stakes || '250-500'
      const activeSkin = parsed.skin || 'obsidian'
      const activeTheme = parsed.theme || localStorage.getItem('pokehub_table_theme') || 'classic_pink'
      const activeMode = parsed.mode || 'texas_holdem'
      const activeBotsCount = Number(parsed.bots) || 2
      const isDuelFromUrl = parsed.duel === 'open' || parsed.duel === 'active' || parsed.duel === 'true' || parsed.duel === '1'

      setUserId(activeUserId)
      setGameId(activeGameId)
      setTableName(activeTable)
      setStakes(activeStakes)
      setMode(activeMode)
      setInitialBots(activeBotsCount)
      setTableTheme(activeTheme)
      if (activeSkin && activeSkin !== 'classic') {
        setDeckSkin(activeSkin)
      }
      if (isDuelFromUrl) {
        setIsDuelOpen(true)
      }

      const saved = localStorage.getItem('pokehub_bankroll')
      if (saved) {
        setBankroll(Number(saved))
      }
    }
  }, [])

  // Sync URL query string when duel is active
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      if (isDuelOpen) {
        const searchParams = new URLSearchParams()
        searchParams.set('userId', userId)
        searchParams.set('gameId', gameId)
        searchParams.set('table', tableName)
        searchParams.set('stakes', stakes)
        searchParams.set('skin', deckSkin)
        searchParams.set('theme', tableTheme)
        searchParams.set('bots', initialBots.toString())
        searchParams.set('duel', 'open')
        window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
      } else {
        // When leaving or outside game duel, keep URL clean /game
        if (window.location.search) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    }
  }, [mounted, userId, gameId, tableName, stakes, deckSkin, tableTheme, initialBots, isDuelOpen])

  // Leave active poker session & delete session parameters
  const handleLeaveGame = useCallback(() => {
    setIsDuelOpen(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // Launch a new session configured from Setup Modal
  const handleLaunchSessionFromModal = (sessionConfig) => {
    setIsSetupModalOpen(false)
    setUserId(sessionConfig.userId)
    setGameId(sessionConfig.gameId)
    setTableName(sessionConfig.table)
    setStakes(sessionConfig.stakes)
    if (sessionConfig.skin) {
      setDeckSkin(sessionConfig.skin)
    }
    if (sessionConfig.theme) {
      setTableTheme(sessionConfig.theme)
    }
    if (sessionConfig.bots) {
      setInitialBots(Number(sessionConfig.bots))
    }
    if (typeof window !== 'undefined') {
      if (sessionConfig.theme) localStorage.setItem('pokehub_table_theme', sessionConfig.theme)
      if (sessionConfig.skin) localStorage.setItem('pokehub_equipped_deck', sessionConfig.skin)
    }
    setIsDuelOpen(true)
  }

  // Copy Full Game URI with Query Parameters to Clipboard
  const handleCopyGameUri = useCallback(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href
      navigator.clipboard.writeText(fullUrl).then(() => {
        SoundEngine.playClick()
        setToastNotification('GAME URI COPIED TO CLIPBOARD!')
        setTimeout(() => setToastNotification(null), 2500)
      }).catch(() => {})
    }
  }, [])

  // Sync bankroll updates to localStorage
  const updateBankroll = (valOrFn) => {
    setBankroll(prev => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn
      if (typeof window !== 'undefined') {
        localStorage.setItem('pokehub_bankroll', nextVal.toString())
      }
      return nextVal
    })
  }

  // Toss chip handler
  const handleTossChip = useCallback(() => {
    setTossSignal(s => s + 1)
    updateBankroll(b => Math.max(0, b - 100))
  }, [])

  // Sound Effects Mute Toggle handler
  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    SoundEngine.setMuted(nextMuted)
    if (!nextMuted) {
      SoundEngine.playClick()
    }
  }, [isMuted])

  // Refill Bankroll
  const handleRefillBankroll = () => {
    SoundEngine.playJackpot()
    updateBankroll(b => b + 5000)
  }

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    SoundEngine.playClick()
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || !e.target) return
      if (e.target.tagName && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        SoundEngine.playCardFlip()
        setIsFlipped(f => !f)
      } else if (e.key === 'c' || e.key === 'C') {
        handleTossChip()
      } else if (e.key === 'h' || e.key === 'H') {
        SoundEngine.playClick()
        setIsHolo(h => !h)
      } else if (e.key === 'f' || e.key === 'F') {
        SoundEngine.playCardSwoosh()
        setIsFanMode(fm => !fm)
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDuelOpen(d => !d)
      }
    }

    if (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        if (typeof window !== 'undefined' && window && typeof window.removeEventListener === 'function') {
          window.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [handleTossChip])

  // Navigation Items (with Leaderboard replacing 3D Duel)
  const bubbleMenuItems = useMemo(() => [
    {
      label: 'home',
      ariaLabel: 'Back to Home Showcase',
      rotation: -4,
      hoverStyles: { bgColor: '#FFDE59', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/'
      }
    },
    {
      label: 'poker duel',
      ariaLabel: 'Play Texas Hold\'em Poker Duel',
      rotation: 4,
      hoverStyles: { bgColor: '#00FFA3', textColor: '#000000' },
      onClick: () => {
        handleLeaveGame()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    {
      label: 'deck skin',
      ariaLabel: '6 Freaking Elite Decks Showcase',
      rotation: -6,
      hoverStyles: { bgColor: '#FF90E8', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/#deck-skins'
      }
    },
    {
      label: 'about us',
      ariaLabel: 'About POKEHUB & Team KMUTT',
      rotation: 6,
      hoverStyles: { bgColor: '#d4af37', textColor: '#14161c' },
      onClick: () => {
        window.location.href = '/about'
      }
    },
    {
      label: 'how to play',
      ariaLabel: 'How to Play Texas Hold\'em Rules & Flow',
      rotation: -8,
      hoverStyles: { bgColor: '#FFE500', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/#how-to-play'
      }
    }
  ], [handleLeaveGame])

  return (
    <main className="w-full relative h-screen transition-colors duration-700 text-true-black overflow-hidden bg-transparent">
      {/* Infinite Seamless Fixed Graph Grid */}
      <div className="fixed-graph-grid" />

      {/* Intro Preloader */}
      {showPreloader && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem('pokehub_intro_seen', 'true')
            } catch {}
            setShowPreloader(false)
          }}
        />
      )}

      {/* Unified Responsive Bubble Navbar */}
      <BubbleMenu
        logo={
          <div className="flex items-center justify-center cursor-pointer" onClick={() => window.location.href = '/'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/PKH_Logo.jpg"
              alt="POKERHUB Logo"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain mix-blend-multiply bg-transparent select-none pointer-events-none"
            />
          </div>
        }
        actions={
          <>
            {/* Back to Home Button - shown on md+ */}
            <Link
              href="/"
              className="brutal-btn bg-white text-true-black hidden md:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 font-display text-[10px] sm:text-xs font-black uppercase hover:bg-accent-yellow transition-colors shrink-0 shadow-[2px_2px_0px_#000]"
              title="Back to Home"
            >
              <span>HOME</span>
            </Link>

            {/* Bankroll Faux Window */}
            <div className="brutal-window flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 shrink-0 shadow-[2px_2px_0px_#000]">
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider font-pixel text-true-black hidden sm:inline">
                BANKROLL:
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight drop-shadow-[1px_1px_0px_#050505] font-display">
                ${bankroll.toLocaleString()}
              </span>
              <button
                onClick={handleRefillBankroll}
                className="brutal-btn bg-accent-yellow text-true-black text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5"
                title="Add +$5,000 High Roller Chips"
              >
                +$5K
              </button>
            </div>

            {/* Live Session URI & Copy Pill */}
            <div className="brutal-window hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-true-black shadow-[2px_2px_0px_#000]">
              <span className="font-pixel text-[8px] font-bold text-gray-600 uppercase">URI:</span>
              <span className="font-mono-nb text-[9px] font-black text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-300 truncate max-w-[110px]" title={`User: ${userId} | Game: ${gameId}`}>
                {userId}
              </span>
              <button
                onClick={handleCopyGameUri}
                className="brutal-btn bg-[#FFE500] hover:bg-[#00FFA3] text-true-black text-[8px] font-black px-2 py-0.5 flex items-center gap-1 cursor-pointer"
                title="Copy Game URL"
              >
                <span>COPY URI</span>
              </button>
            </div>

            {/* Sound Effects Mute / Unmute Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`brutal-btn flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 font-pixel text-[9px] sm:text-[10px] uppercase font-bold transition-all shrink-0 shadow-[2px_2px_0px_#000] ${
                !isMuted
                  ? 'bg-accent-cyan text-true-black'
                  : 'bg-white text-gray-500'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              <span>{isMuted ? 'MUTED' : 'SFX: ON'}</span>
            </button>

            {/* Fullscreen Button - shown on xl+ */}
            <button
              onClick={handleToggleFullscreen}
              className="brutal-btn w-8 h-8 sm:w-9 sm:h-9 bg-accent-yellow text-true-black hidden xl:flex items-center justify-center font-black font-pixel shrink-0 shadow-[2px_2px_0px_#000]"
              title="Toggle Fullscreen"
            >
              <span className="text-[9px] tracking-tighter">FS</span>
            </button>
          </>
        }
        useFixedPosition={true}
        menuBg="#ffffff"
        menuContentColor="#050505"
        menuAriaLabel="Toggle navigation"
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        items={bubbleMenuItems}
      />

      {/* 3D POKER ARENA STAGE */}
      <section
        ref={heroSectionRef}
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
      >
        {/* Bottom Text Layer — behind 3D cards */}
        <div
          ref={heroTitleBottomRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none px-4"
        >
          <h1
            className="text-[14vw] sm:text-[15vw] md:text-[16vw] font-display text-ui-pink drop-shadow-[4px_4px_0px_#050505] sm:drop-shadow-[6px_6px_0px_#050505] md:drop-shadow-[8px_8px_0px_#050505] tracking-tighter leading-none scale-y-[1.4] sm:scale-y-[1.6] md:scale-y-[2] opacity-100 transition-colors duration-700"
            style={{ 
              whiteSpace: 'nowrap',
              WebkitTextStroke: '3px #050505'
            }}
          >
            {text}
          </h1>
        </div>

        {/* 3D Scene Layer — Interactive Canvas */}
        <div
          ref={heroSceneRef}
          className="absolute inset-0 z-20 will-change-transform origin-center"
        >
          {mounted && (
            <PokerScene
              isReady={!showPreloader}
              isFlipped={isFlipped}
              isHolo={isHolo}
              isFanMode={isFanMode}
              deckSkin={deckSkin}
              activeSuit={activeSuit}
              theme="macau"
              tossSignal={tossSignal}
              isScrolled={false}
            />
          )}
        </div>

        {/* Top Text Layer — in front of cards (P K H B letters only) on desktop */}
        <div
          ref={heroTitleTopRef}
          className="absolute inset-0 z-30 hidden md:flex items-center justify-center pointer-events-none select-none"
        >
          <h1
            className="text-[16vw] font-display text-ui-pink drop-shadow-[8px_8px_0px_#050505] tracking-tighter leading-none scale-y-[2] opacity-100 transition-colors duration-700 pointer-events-none"
            style={{ 
              whiteSpace: 'nowrap',
              WebkitTextStroke: '4px #050505'
            }}
          >
            {text.split('').map((char, i) => (
              <span
                key={i}
                style={{ visibility: topLetters.includes(char) ? 'visible' : 'hidden' }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* ======================================================== */}
        {/* PROMINENT FLOATING "PLAY NOW" BUTTON ON 3D ARENA STAGE  */}
        {/* ======================================================== */}
        <div className="absolute bottom-20 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center gap-2 px-4 w-full max-w-xs sm:max-w-none">
          <button
            onClick={() => {
              SoundEngine.playClick()
              setIsSetupModalOpen(true)
            }}
            className="brutal-btn group flex items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-[#FFDE59] text-true-black font-display text-base sm:text-2xl font-black uppercase tracking-wider shadow-[4px_4px_0px_#000000] sm:shadow-[6px_6px_0px_#000000] hover:bg-[#00FFA3] hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer -rotate-1 hover:rotate-0"
            title="Setup & Launch Texas Hold'em 3D Duel"
          >
            <span>PLAY NOW</span>
            <span className="font-pixel text-[8px] sm:text-xs bg-true-black text-white px-2 py-0.5 sm:py-1 rounded shadow-[1.5px_1.5px_0px_#000000]">
              3D DUEL
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-mono-nb text-[8.5px] sm:text-[11px] font-bold bg-white/95 border-[2px] border-true-black px-2.5 sm:px-3 py-0.5 shadow-[1.5px_1.5px_0px_#000000] uppercase text-true-black text-center">
              Texas Hold&apos;em vs 5 Smart AI Bots
            </span>
          </div>
        </div>
      </section>

      {/* Real-time 3D Telemetry HUD */}
      <CardInspectorHUD
        telemetry={telemetry}
        deckSkin={deckSkin}
        activeSuit={activeSuit}
        isHolo={isHolo}
        isFanMode={isFanMode}
      />

      {/* Bottom Floating Control Dock */}
      <ControlDock
        isFanMode={isFanMode}
        setIsFanMode={setIsFanMode}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        deckSkin={deckSkin}
        setDeckSkin={setDeckSkin}
        activeSuit={activeSuit}
        setActiveSuit={setActiveSuit}
        onTossChip={handleTossChip}
        onOpenDuel={() => setIsSetupModalOpen(true)}
        onOpenRankings={() => setIsRankingsOpen(true)}
      />

      {/* Game Matchmaking & Table Setup Modal */}
      <GameSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onLaunchSession={handleLaunchSessionFromModal}
      />

      {/* Texas Hold'em 3D Duel Modal Game */}
      <PokerDuelGame
        isOpen={isDuelOpen}
        onClose={() => setIsDuelOpen(false)}
        bankroll={bankroll}
        setBankroll={updateBankroll}
        userId={userId}
        gameId={gameId}
        table={tableName}
        stakes={stakes}
        theme={tableTheme}
        setTheme={setTableTheme}
        initialBots={initialBots}
        deckSkin={deckSkin}
        setDeckSkin={setDeckSkin}
        onCopyUri={handleCopyGameUri}
      />

      {/* Poker Hand Rankings Official Guide */}
      <HandRankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />

      {/* VIP High Roller Club Modal */}
      <VIPClubModal
        isOpen={isVIPOpen}
        onClose={() => setIsVIPOpen(false)}
      />

    </main>
  )
}
