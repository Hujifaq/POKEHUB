"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import BubbleMenu from './components/BubbleMenu'
import Preloader from './components/Preloader'
import ControlDock from './components/ControlDock'
import CardInspectorHUD from './components/CardInspectorHUD'
import PokerDuelGame from './components/PokerDuelGame'
import ThemeSelector from './components/ThemeSelector'
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
  const [theme, setTheme] = useState('macau')
  const [tossSignal, setTossSignal] = useState(0)
  const [telemetry, setTelemetry] = useState({ pitch: 0, yaw: 0, roll: 0, velX: 0, velY: 0, speed: 0 })

  // Financial & Audio states
  const [bankroll, setBankroll] = useState(10000)
  const [isAudioActive, setIsAudioActive] = useState(false)

  // Modal Dialogs
  const [isDuelOpen, setIsDuelOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
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

  // Theme visual backgrounds
  const themeBackgroundStyles = {
    macau: 'bg-gradient-to-b from-[#e8e2d6] via-[#ded6c5] to-[#c7bca5] text-[#14161c]',
    vegas: 'bg-gradient-to-b from-[#1a080b] via-[#100406] to-[#050102] text-[#ededed]',
    cyber: 'bg-gradient-to-b from-[#090b17] via-[#05060e] to-[#020307] text-[#00f0ff]',
    emerald: 'bg-gradient-to-b from-[#072415] via-[#04170d] to-[#020d07] text-[#f1c40f]'
  }[theme] || 'bg-[#e8e2d6] text-[#14161c]'

  // Custom Bubble menu items wired to active features
  const bubbleMenuItems = [
    {
      label: 'home',
      ariaLabel: '3D Stage Free Play',
      rotation: -8,
      hoverStyles: { bgColor: '#14161c', textColor: '#e8e2d6' },
      onClick: () => {
        setIsDuelOpen(false)
        setIsThemeOpen(false)
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
      label: 'tables',
      ariaLabel: 'Casino Felt & Ambiance Themes',
      rotation: -6,
      hoverStyles: { bgColor: '#27ae60', textColor: '#ffffff' },
      onClick: () => setIsThemeOpen(true)
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
    <main className={`w-full h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-700 ${themeBackgroundStyles}`}>

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
        menuBg={theme === 'macau' ? '#e8e2d6' : '#141622'}
        menuContentColor={theme === 'macau' ? '#14161c' : '#f5f5f5'}
        menuAriaLabel="Toggle navigation"
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        items={bubbleMenuItems}
        onMenuClick={handleNavToggle}
      />

      {/* Top Floating Luxury HUD Header */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-[950] pointer-events-auto hidden md:flex items-center gap-3">
        {/* Bankroll Chip Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#10121a]/85 backdrop-blur-xl border border-[#d4af37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="text-sm">🪙</span>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">BANKROLL:</span>
          <span className="text-sm font-black text-[#f1c40f] tracking-tight font-mono">${bankroll.toLocaleString()}</span>
          <button
            onClick={handleRefillBankroll}
            className="text-[10px] font-black bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black px-2 py-0.5 rounded-full border border-[#d4af37]/50 transition-all cursor-pointer"
            title="Add +$5,000 High Roller Chips"
          >
            +$5K
          </button>
        </div>

        {/* Atmosphere Theme Selector Button */}
        <button
          onClick={() => setIsThemeOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#10121a]/85 backdrop-blur-xl border border-white/15 hover:border-[#d4af37]/60 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-md hover:scale-105"
        >
          <span>🏛️</span>
          <span className="capitalize">{theme} Felt</span>
        </button>

        {/* Audio / Ambient Music Toggle Button with Equalizer bars */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-md hover:scale-105 ${
            isAudioActive
              ? 'bg-[#10121a]/85 border-[#2ecc71]/60 text-emerald-400'
              : 'bg-[#10121a]/85 border-white/15 text-gray-400'
          }`}
          title="Toggle Audio & Ambient Casino Lounge"
        >
          {isAudioActive ? (
            <div className="flex items-end gap-0.5 h-3.5 w-4">
              <span className="w-0.5 bg-emerald-400 rounded-full equalizer-bar" />
              <span className="w-0.5 bg-emerald-400 rounded-full equalizer-bar" />
              <span className="w-0.5 bg-emerald-400 rounded-full equalizer-bar" />
              <span className="w-0.5 bg-emerald-400 rounded-full equalizer-bar" />
            </div>
          ) : (
            <span className="text-xs">🔇</span>
          )}
          <span className="text-xs font-bold">{isAudioActive ? 'Sound ON' : 'Muted'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="w-9 h-9 rounded-full bg-[#10121a]/85 backdrop-blur-xl border border-white/15 hover:border-white/40 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          <span className="text-xs">⛶</span>
        </button>
      </header>

      {/* Main 3D Stage & Layers Wrapper */}
      <div ref={contentRef} className="absolute inset-0" style={{ willChange: 'filter, transform' }}>

        {/* Bottom Text Layer — behind 3D cards */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
          <h1
            className={`text-[15vw] font-black tracking-tighter leading-none scale-y-[1.8] opacity-90 transition-colors duration-700 ${
              theme === 'macau'
                ? 'text-[#14161c]'
                : theme === 'vegas'
                ? 'text-[#2a0b10]'
                : theme === 'cyber'
                ? 'text-[#0d1633]'
                : 'text-[#062413]'
            }`}
            style={{ whiteSpace: 'nowrap' }}
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
              theme={theme}
              tossSignal={tossSignal}
              onTelemetry={setTelemetry}
            />
          )}
        </div>

        {/* Top Text Layer — in front of cards (P K H B letters only) */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none">
          <h1
            className={`text-[15vw] font-black tracking-tighter leading-none flex scale-y-[1.8] opacity-90 transition-colors duration-700 ${
              theme === 'macau'
                ? 'text-[#14161c]'
                : theme === 'vegas'
                ? 'text-[#2a0b10]'
                : theme === 'cyber'
                ? 'text-[#0d1633]'
                : 'text-[#062413]'
            }`}
            style={{ whiteSpace: 'nowrap' }}
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

      {/* Atmosphere Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        activeTheme={theme}
        onThemeChange={setTheme}
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
