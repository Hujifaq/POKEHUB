"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BubbleMenu from './components/BubbleMenu'
import Preloader from './components/Preloader'
import HandRankingsModal from './components/HandRankingsModal'
import VIPClubModal from './components/VIPClubModal'
import HorizontalShowcase from './components/HorizontalShowcase'
import RiffleShuffleSection from './components/RiffleShuffleSection'
import PokerHandOrbitSection from './components/PokerHandOrbitSection'
import NeoBrutalistHero from './components/NeoBrutalistHero'
import GameSetupModal from './components/GameSetupModal'
import { SoundEngine } from './components/SoundEngine'
import { generateGameUrl } from './utils/gameUrl'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)
  const neoSectionRef = useRef(null)
  const gallerySectionRef = useRef(null)

  // Financial & Audio states
  const [bankroll, setBankroll] = useState(10000)
  const [isMuted, setIsMuted] = useState(false)

  // Modal Dialogs
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)

  // Load bankroll from localStorage
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokehub_bankroll')
      if (saved) {
        setBankroll(Number(saved))
      }
    }
  }, [])

  // Sync bankroll updates
  const updateBankroll = (valOrFn) => {
    setBankroll(prev => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn
      if (typeof window !== 'undefined') {
        localStorage.setItem('pokehub_bankroll', nextVal.toString())
      }
      return nextVal
    })
  }

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
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.key === 'g' || e.key === 'G') {
        window.location.href = generateGameUrl()
      } else if (e.key === 'l' || e.key === 'L') {
        window.location.href = '/leaderboard'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Hamburger Menu Items: Home, 3D Arena, Leaderboard, Rankings, VIP Club
  const bubbleMenuItems = [
    {
      label: 'home',
      ariaLabel: 'POKERHUB Home',
      rotation: -4,
      hoverStyles: { bgColor: '#FFDE59', textColor: '#000000' },
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    {
      label: 'poker duel',
      ariaLabel: 'Play Texas Hold\'em Poker Duel',
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
    <main className="w-full relative min-h-screen transition-colors duration-700 text-true-black overflow-x-hidden bg-transparent">
      {/* Infinite Seamless Fixed Graph Grid across all sections */}
      <div className="fixed-graph-grid" />

      {/* Intro Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Unified Responsive Bubble Navbar */}
      <BubbleMenu
        logo={
          <div className="flex items-center justify-center cursor-pointer" onClick={() => setIsVIPOpen(true)}>
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
            {/* Play 3D Arena Button (Navigates to /game) - shown on md+ */}
            <Link
              href="/game"
              className="brutal-btn bg-[#00FFA3] text-true-black hidden md:flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-display text-[11px] sm:text-xs font-black uppercase hover:bg-[#00e693] transition-all shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] -rotate-1 cursor-pointer shrink-0"
              title="Open Standalone 3D Poker Arena"
            >
              <span className="text-xs sm:text-sm">🎮</span>
              <span className="hidden lg:inline">3D ARENA</span>
            </Link>

            {/* Bankroll Faux Window */}
            <div className="brutal-window flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] shrink-0">
              <span className="text-xs sm:text-sm">💰</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-pixel text-true-black hidden lg:inline">
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

            {/* Sound Effects Mute / Unmute Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`brutal-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 font-pixel text-[9px] sm:text-[10px] uppercase font-bold transition-all shrink-0 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] ${
                !isMuted
                  ? 'bg-accent-cyan text-true-black'
                  : 'bg-white text-gray-500'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              <span className="text-xs">{isMuted ? '🔇' : '🔊'}</span>
              <span className="hidden lg:inline">{isMuted ? 'MUTED' : 'SFX ON'}</span>
            </button>

            {/* Leaderboard Link Button - shown on sm+ */}
            <Link
              href="/leaderboard"
              className="brutal-btn bg-ui-pink text-true-black hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 font-display text-xs font-black uppercase hover:bg-[#ff8cb8] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] shrink-0"
              title="Open Leaderboard"
            >
              <span>🏆</span>
              <span className="hidden lg:inline">RANKS</span>
            </Link>

            {/* Fullscreen Button - shown on xl+ */}
            <button
              onClick={handleToggleFullscreen}
              className="brutal-btn w-8 h-8 sm:w-9 sm:h-9 bg-accent-yellow text-true-black hidden xl:flex items-center justify-center font-bold font-pixel shrink-0 shadow-[2px_2px_0px_#000000]"
              title="Toggle Fullscreen"
            >
              <span className="text-[10px]">🗖</span>
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

      {/* ======================================================== */}
      {/* SECTION 1 (HERO): NEO-BRUTALIST 3D ACE OF SPADES STAGE */}
      {/* ======================================================== */}
      <NeoBrutalistHero
        containerRefProp={neoSectionRef}
        onOpenDuel={() => {
          setIsSetupModalOpen(true)
        }}
        onScrollToGallery={() => {
          if (gallerySectionRef.current) {
            gallerySectionRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />

      {/* ======================================================== */}
      {/* SECTION 2: GSAP HORIZONTAL SCROLL SHOWCASE (6 DECKS)   */}
      {/* ======================================================== */}
      <HorizontalShowcase
        containerRefProp={gallerySectionRef}
        onSelectDeck={(skin) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('pokehub_equipped_deck', skin)
          }
        }}
        onOpenDuel={() => {
          setIsSetupModalOpen(true)
        }}
      />

      {/* ======================================================== */}
      {/* SECTION 3: 3D CARD RIFFLE SHUFFLE (SCROLLTRIGGER)       */}
      {/* ======================================================== */}
      <RiffleShuffleSection />

      {/* ======================================================== */}
      {/* SECTION 4: 3D POKER HAND SHOWCASE & ORBIT (SCROLLTRIGGER)*/}
      {/* ======================================================== */}
      <PokerHandOrbitSection onOpenDuel={() => setIsSetupModalOpen(true)} />

      {/* ======================================================== */}
      {/* SECTION 5: NEO-BRUTALIST ARCADE FOOTER                  */}
      {/* ======================================================== */}
      <footer className="w-full bg-true-black text-white border-t-[4px] border-true-black relative z-40 py-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b-[2px] border-white/20">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/PKH_Logo.jpg"
                  alt="POKERHUB Logo"
                  className="h-10 w-auto rounded border border-white/40"
                />
                <span className="font-display text-2xl md:text-3xl font-black tracking-tight uppercase text-accent-yellow">
                  POKERHUB
                </span>
              </div>
              <p className="font-mono-nb text-xs text-gray-400 max-w-md uppercase tracking-wider">
                Next-Gen Neo-Brutalist 3D Poker Arena with Procedural Physics & Intelligent AI Opponents.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/game"
                className="brutal-btn px-5 py-3 bg-[#00FFA3] text-true-black font-display text-xs md:text-sm font-black uppercase hover:bg-[#00e693] cursor-pointer"
              >
                🎮 PLAY 3D ARENA →
              </Link>
              <Link
                href="/leaderboard"
                className="brutal-btn px-5 py-3 bg-ui-pink text-true-black font-display text-xs md:text-sm font-black uppercase hover:bg-[#ff8cb8]"
              >
                🏆 LEADERBOARD
              </Link>
              <button
                onClick={() => setIsRankingsOpen(true)}
                className="brutal-btn px-4 py-3 bg-white text-true-black font-display text-xs md:text-sm font-black uppercase hover:bg-accent-yellow"
              >
                📜 HAND RULES
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono-nb text-xs text-gray-500">
            <div>
              © 2026 POKERHUB ARCHIVES. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Link href="/leaderboard" className="hover:text-white">LEADERBOARD</Link>
              <span className="cursor-pointer hover:text-white" onClick={() => setIsVIPOpen(true)}>VIP CLUB</span>
              <span className="cursor-pointer hover:text-white" onClick={() => setIsRankingsOpen(true)}>RULES</span>
              <span className="cursor-pointer hover:text-white" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP ↑</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Game Matchmaking & Table Setup Modal */}
      <GameSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
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
