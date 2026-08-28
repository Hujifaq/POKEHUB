"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import BubbleMenu from './components/BubbleMenu'
import Preloader from './components/Preloader'
import ControlDock from './components/ControlDock'
import CardInspectorHUD from './components/CardInspectorHUD'
import PokerDuelGame from './components/PokerDuelGame'
import HandRankingsModal from './components/HandRankingsModal'
import VIPClubModal from './components/VIPClubModal'
import { SoundEngine } from './components/SoundEngine'

// Dynamically import PokerScene with ssr: false for rock-solid 3D Canvas initialization
const PokerScene = dynamic(() => import('./components/PokerScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
    </div>
  )
})

const topLetters = ['P', 'K', 'H', 'B']
const text = "POKERHUB"

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef(null)

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
  const [isAudioActive, setIsAudioActive] = useState(false)

  // Modal Dialogs
  const [isDuelOpen, setIsDuelOpen] = useState(false)
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Toss chip handler
  const handleTossChip = useCallback(() => {
    setTossSignal(s => s + 1)
    setBankroll(b => Math.max(0, b - 100))
  }, [])

  // Audio Toggle handler
  const handleToggleAudio = useCallback(() => {
    SoundEngine.playClick()
    const next = !isAudioActive
    setIsAudioActive(next)
    SoundEngine.setMuted(!next)
    SoundEngine.toggleAmbient(next)
  }, [isAudioActive])

  // Refill Bankroll
  const handleRefillBankroll = () => {
    SoundEngine.playJackpot()
    setBankroll(b => b + 5000)
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTossChip])

  // Nav blur effect
  const handleNavToggle = useCallback((isOpen) => {
    if (!contentRef.current) return
    gsap.to(contentRef.current, {
      filter: isOpen ? 'blur(20px) brightness(0.6)' : 'blur(0px) brightness(1)',
      scale: isOpen ? 0.96 : 1,
      duration: 0.5,
      ease: 'power3.out',
    })
  }, [])

  // Y2K background is handled in globals.css

  // Custom Bubble menu items wired to active features
  const bubbleMenuItems = [
    {
      label: 'home',
      ariaLabel: '3D Stage Free Play',
      rotation: -8,
      hoverStyles: { bgColor: '#14161c', textColor: '#e8e2d6' },
      onClick: () => {
        setIsDuelOpen(false)
        setIsRankingsOpen(false)
        setIsVIPOpen(false)
      }
    },
    {
      label: 'games',
      ariaLabel: 'Texas Hold\'em 3D Duel',
      rotation: 8,
      hoverStyles: { bgColor: '#c0392b', textColor: '#ffffff' },
      onClick: () => {
        SoundEngine.playCardSwoosh()
        setIsDuelOpen(true)
      }
    },
    {
      label: 'tournaments',
      ariaLabel: 'Tournaments',
      rotation: -6,
      hoverStyles: { bgColor: '#ffa6c9', textColor: '#050505' },
      onClick: () => {}
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
    <main className="w-full h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-700 text-true-black">

      {/* Intro Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Bubble Navbar */}
      <BubbleMenu
        logo={
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsVIPOpen(true)}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
            <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.04em', fontFamily: 'var(--font-geist-sans)' }}>
              PH
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
        onMenuClick={handleNavToggle}
      />

      {/* Top Floating Luxury HUD Header -> Y2K Faux OS Taskbar */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-[950] pointer-events-auto hidden md:flex items-center gap-3">
        {/* Bankroll Faux Window */}
        <div className="brutal-window flex items-center gap-2.5 px-4 py-2">
          <span className="text-sm">💰</span>
          <span className="text-xs font-black uppercase tracking-wider font-pixel text-true-black">BANKROLL:</span>
          <span className="text-sm font-black text-ui-pink tracking-tight drop-shadow-[2px_2px_0px_#050505] font-display">${bankroll.toLocaleString()}</span>
          <button
            onClick={handleRefillBankroll}
            className="brutal-btn bg-accent-yellow text-true-black text-[10px] font-black px-2 py-0.5"
            title="Add +$5,000 High Roller Chips"
          >
            + $5K
          </button>
        </div>

        {/* Audio / Ambient Music Toggle Button */}
        <button
          onClick={handleToggleAudio}
          className={`brutal-btn flex items-center gap-2 px-3.5 py-2 font-pixel text-[10px] uppercase font-bold ${
            isAudioActive
              ? 'bg-accent-cyan text-true-black'
              : 'bg-white text-gray-500'
          }`}
          title="Toggle Audio & Ambient Casino Lounge"
        >
          {isAudioActive ? (
            <div className="flex items-end gap-0.5 h-3.5 w-4">
              <span className="w-0.5 bg-true-black equalizer-bar" />
              <span className="w-0.5 bg-true-black equalizer-bar" />
              <span className="w-0.5 bg-true-black equalizer-bar" />
              <span className="w-0.5 bg-true-black equalizer-bar" />
            </div>
          ) : (
            <span>🔇</span>
          )}
          <span>{isAudioActive ? 'ON' : 'MUTE'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="brutal-btn w-9 h-9 bg-ui-pink text-true-black flex items-center justify-center font-bold font-pixel"
          title="Toggle Fullscreen"
        >
          <span className="text-[10px]">🗖</span>
        </button>
      </header>

      {/* Main 3D Stage & Layers Wrapper */}
      <div ref={contentRef} className="absolute inset-0" style={{ willChange: 'filter, transform' }}>

        {/* Bottom Text Layer — behind 3D cards */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
          <h1
            className="text-[16vw] font-display text-ui-pink drop-shadow-[8px_8px_0px_#050505] tracking-tighter leading-none scale-y-[2] opacity-100 transition-colors duration-700"
            style={{ 
              whiteSpace: 'nowrap',
              WebkitTextStroke: '4px #050505'
            }}
          >
            {text}
          </h1>
        </div>

        {/* 3D Scene Layer — Interactive Canvas */}
        <div className="absolute inset-0 z-20">
          {mounted && (
            <PokerScene
              isReady={!showPreloader}
              isFlipped={isFlipped}
              isHolo={isHolo}
              isFanMode={isFanMode}
              deckSkin={deckSkin}
              activeSuit={activeSuit}
              theme="macau" // Fallback since scene might still expect it
              tossSignal={tossSignal}
              onTelemetry={setTelemetry}
            />
          )}
        </div>

        {/* Top Text Layer — in front of cards (P K H B letters only) */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none">
          <h1
            className="text-[16vw] font-display text-ui-pink drop-shadow-[8px_8px_0px_#050505] tracking-tighter leading-none scale-y-[2] opacity-100 transition-colors duration-700"
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

      </div>

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
        setBankroll={setBankroll}
      />

      {/* Atmosphere Theme Selector Modal - REMOVED */}

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
