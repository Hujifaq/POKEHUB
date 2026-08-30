"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BubbleMenu from '../components/BubbleMenu'
import Preloader from '../components/Preloader'
import ControlDock from '../components/ControlDock'
import CardInspectorHUD from '../components/CardInspectorHUD'
import PokerDuelGame from '../components/PokerDuelGame'
import HandRankingsModal from '../components/HandRankingsModal'
import VIPClubModal from '../components/VIPClubModal'
import { SoundEngine } from '../components/SoundEngine'

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

  // 3D Scene states
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHolo, setIsHolo] = useState(true)
  const [isFanMode, setIsFanMode] = useState(false)
  const [deckSkin, setDeckSkin] = useState('classic')
  const [activeSuit, setActiveSuit] = useState('hearts')
  const [tossSignal, setTossSignal] = useState(0)
  const [telemetry, setTelemetry] = useState({ pitch: 0, yaw: 0, roll: 0, velX: 0, velY: 0, speed: 0 })

  // Financial & Audio states
  const [bankroll, setBankroll] = useState(10000)
  const [isMuted, setIsMuted] = useState(false)

  // Modal Dialogs
  const [isDuelOpen, setIsDuelOpen] = useState(false)
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)

  // Load bankroll from localStorage on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokehub_bankroll')
      if (saved) {
        setBankroll(Number(saved))
      }
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
  const bubbleMenuItems = [
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
      label: '3d arena',
      ariaLabel: '3D Poker Arena',
      rotation: 4,
      hoverStyles: { bgColor: '#00FFA3', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/game'
      }
    },
    {
      label: 'leaderboard',
      ariaLabel: 'High Roller Leaderboard',
      rotation: -6,
      hoverStyles: { bgColor: '#FF90E8', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/leaderboard'
      }
    },
    {
      label: 'rankings',
      ariaLabel: 'Poker Hand Rankings Guide',
      rotation: 6,
      hoverStyles: { bgColor: '#d4af37', textColor: '#14161c' },
      onClick: () => setIsRankingsOpen(true)
    },
    {
      label: 'vip club',
      ariaLabel: 'VIP High Roller Suite',
      rotation: -8,
      hoverStyles: { bgColor: '#14161c', textColor: '#e8e2d6' },
      onClick: () => setIsVIPOpen(true)
    }
  ]

  return (
    <main className="w-full relative h-screen transition-colors duration-700 text-true-black overflow-hidden bg-transparent">
      {/* Infinite Seamless Fixed Graph Grid */}
      <div className="fixed-graph-grid" />

      {/* Intro Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Bubble Navbar */}
      <BubbleMenu
        logo={
          <div className="flex items-center gap-2 cursor-pointer py-0.5" onClick={() => window.location.href = '/'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/PKH_Logo.jpg"
              alt="POKERHUB Logo"
              className="h-8 md:h-9 w-auto object-contain rounded-sm border border-true-black/40 drop-shadow-[1px_1px_0px_#050505]"
            />
            <span className="font-display font-black text-xs md:text-sm tracking-tight text-true-black uppercase hidden sm:inline-block">
              POKERHUB
            </span>
          </div>
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

      {/* Top Floating Luxury HUD Header -> Y2K Faux OS Taskbar */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-[950] pointer-events-auto flex items-center gap-2 sm:gap-3">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="brutal-btn bg-white text-true-black flex items-center gap-1.5 px-3 py-2 font-display text-xs font-black uppercase hover:bg-accent-yellow transition-colors"
          title="Back to Home"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">HOME</span>
        </Link>

        {/* Bankroll Faux Window */}
        <div className="brutal-window flex items-center gap-2 px-3 sm:px-4 py-2">
          <span className="text-sm">💰</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-pixel text-true-black hidden sm:inline">
            BANKROLL:
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight drop-shadow-[1px_1px_0px_#050505] font-display">
            ${bankroll.toLocaleString()}
          </span>
          <button
            onClick={handleRefillBankroll}
            className="brutal-btn bg-accent-yellow text-true-black text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5"
            title="Add +$5,000 High Roller Chips"
          >
            +$5K
          </button>
        </div>

        {/* Sound Effects Mute / Unmute Toggle Button */}
        <button
          onClick={handleToggleMute}
          className={`brutal-btn flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] uppercase font-bold transition-all ${
            !isMuted
              ? 'bg-accent-cyan text-true-black'
              : 'bg-white text-gray-500'
          }`}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          <span className="text-xs">{isMuted ? '🔇' : '🔊'}</span>
          <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'SFX ON'}</span>
        </button>

        {/* Leaderboard Link Button */}
        <Link
          href="/leaderboard"
          className="brutal-btn bg-ui-pink text-true-black flex items-center gap-1.5 px-3 py-2 font-display text-xs font-black uppercase hover:bg-[#ff8cb8] shadow-[2px_2px_0px_#000000]"
          title="Open Leaderboard"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">RANKS</span>
        </Link>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="brutal-btn w-9 h-9 bg-accent-yellow text-true-black flex items-center justify-center font-bold font-pixel"
          title="Toggle Fullscreen"
        >
          <span className="text-[10px]">🗖</span>
        </button>
      </header>

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
            className="text-[14vw] sm:text-[15vw] md:text-[16vw] font-display text-ui-pink drop-shadow-[6px_6px_0px_#050505] md:drop-shadow-[8px_8px_0px_#050505] tracking-tighter leading-none scale-y-[1.6] md:scale-y-[2] opacity-100 transition-colors duration-700"
            style={{ 
              whiteSpace: 'nowrap',
              WebkitTextStroke: '4px #050505'
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
              onTelemetry={setTelemetry}
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
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center gap-2">
          <button
            onClick={() => {
              SoundEngine.playCardSwoosh()
              setIsDuelOpen(true)
            }}
            className="brutal-btn group flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#FFDE59] text-true-black font-display text-lg sm:text-2xl font-black uppercase tracking-wider shadow-[6px_6px_0px_#000000] hover:bg-[#00FFA3] hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer -rotate-1 hover:rotate-0"
            title="Launch Texas Hold'em 3D Duel"
          >
            <span className="text-2xl sm:text-3xl animate-bounce">⚔️</span>
            <span>PLAY NOW</span>
            <span className="font-pixel text-[9px] sm:text-xs bg-true-black text-white px-2 py-1 rounded shadow-[2px_2px_0px_#000000]">
              3D DUEL
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-mono-nb text-[9px] sm:text-[11px] font-bold bg-white/95 border-[2px] border-true-black px-3 py-0.5 shadow-[2px_2px_0px_#000000] uppercase text-true-black">
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
        isHolo={isHolo}
        setIsHolo={setIsHolo}
        deckSkin={deckSkin}
        setDeckSkin={setDeckSkin}
        activeSuit={activeSuit}
        setActiveSuit={setActiveSuit}
        onTossChip={handleTossChip}
        onOpenDuel={() => setIsDuelOpen(true)}
        onOpenRankings={() => setIsRankingsOpen(true)}
      />

      {/* Texas Hold'em 3D Duel Modal Game */}
      <PokerDuelGame
        isOpen={isDuelOpen}
        onClose={() => setIsDuelOpen(false)}
        bankroll={bankroll}
        setBankroll={updateBankroll}
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
