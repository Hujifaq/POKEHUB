"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BubbleMenu from './components/BubbleMenu'
import Preloader from './components/Preloader'
import ControlDock from './components/ControlDock'
import CardInspectorHUD from './components/CardInspectorHUD'
import PokerDuelGame from './components/PokerDuelGame'
import HandRankingsModal from './components/HandRankingsModal'
import VIPClubModal from './components/VIPClubModal'
import HorizontalShowcase from './components/HorizontalShowcase'
import NeoBrutalistHero from './components/NeoBrutalistHero'
import { SoundEngine } from './components/SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const heroSectionRef = useRef(null)
  const heroSceneRef = useRef(null)
  const neoSectionRef = useRef(null)
  const gallerySectionRef = useRef(null)
  const heroTitleBottomRef = useRef(null)
  const heroTitleTopRef = useRef(null)
  const scrollCueRef = useRef(null)
  const hudContainerRef = useRef(null)

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
  const [isScrolled, setIsScrolled] = useState(false)

  // Modal Dialogs
  const [isDuelOpen, setIsDuelOpen] = useState(false)
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Track scroll position and animate Section 1 -> Section 2 smooth parallax handoff
  useEffect(() => {
    if (!mounted) return

    const updateScrollState = () => {
      const atTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 25
      setIsScrolled(!atTop)
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()

    const ctx = gsap.context(() => {
      // General scroll flag tracker
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          setIsScrolled(self.scroll > 25)
        }
      })

      // Section 1 -> Section 2 Parallax & Smooth Exit Timeline
      if (heroSectionRef.current) {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true,
          }
        })

        // 1. Text layers glide up with subtle scale & smooth fade
        if (heroTitleBottomRef.current && heroTitleTopRef.current) {
          heroTl.to([heroTitleBottomRef.current, heroTitleTopRef.current], {
            yPercent: -35,
            scale: 1.12,
            opacity: 0.12,
            ease: 'none'
          }, 0)
        }

        // 2. 3D Scene smoothly scales down and translates with the scroll
        if (heroSceneRef.current) {
          heroTl.to(heroSceneRef.current, {
            scale: 0.7,
            yPercent: 15,
            opacity: 0,
            ease: 'power1.in'
          }, 0)
        }

        // 3. Scroll cue fades out quickly
        if (scrollCueRef.current) {
          heroTl.to(scrollCueRef.current, {
            opacity: 0,
            y: 20,
            ease: 'power1.out'
          }, 0)
        }

        // 4. Floating HUD & ControlDock fade away cleanly
        if (hudContainerRef.current) {
          heroTl.to(hudContainerRef.current, {
            opacity: 0,
            y: 35,
            ease: 'power1.in'
          }, 0)
        }
      }
    })

    // Recalculate all pinned trigger positions once components are mounted
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 400)

    return () => {
      clearTimeout(refreshTimer)
      window.removeEventListener('scroll', updateScrollState)
      ctx.revert()
    }
  }, [mounted])





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
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    {
      label: 'gallery',
      ariaLabel: 'Deck Showcase Gallery',
      rotation: 8,
      hoverStyles: { bgColor: '#ffa6c9', textColor: '#050505' },
      onClick: () => {
        SoundEngine.playClick()
        if (gallerySectionRef.current) {
          gallerySectionRef.current.scrollIntoView({ behavior: 'smooth' })
        } else if (heroSectionRef.current) {
          window.scrollTo({ top: heroSectionRef.current.offsetHeight, behavior: 'smooth' })
        }
      }
    },
    {
      label: 'games',
      ariaLabel: 'Texas Hold\'em 3D Duel',
      rotation: -6,
      hoverStyles: { bgColor: '#c0392b', textColor: '#ffffff' },
      onClick: () => {
        SoundEngine.playCardSwoosh()
        setIsDuelOpen(true)
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

        {/* SECTION 1: MAIN 3D HERO ARENA */}
        <section
          ref={heroSectionRef}
          className="relative w-full h-screen overflow-hidden flex items-center justify-center"
        >
          {/* Main 3D Stage & Layers Wrapper */}
          <div ref={contentRef} className="absolute inset-0" style={{ willChange: 'filter, transform' }}>

            {/* Bottom Text Layer — behind 3D cards */}
            <div
              ref={heroTitleBottomRef}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none will-change-transform"
            >
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

            {/* 3D Scene Layer — Interactive Canvas (smoothly scales down to 0 on scroll) */}
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
                  isScrolled={isScrolled}
                  onTelemetry={setTelemetry}
                />
              )}
            </div>

            {/* Top Text Layer — in front of cards (P K H B letters only) */}
            <div
              ref={heroTitleTopRef}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none will-change-transform"
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

            {/* Section 1 -> Section 2 Smooth Scroll Indicator */}
            <div
              ref={scrollCueRef}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1 select-none will-change-transform"
            >
              <div className="font-pixel text-[9px] bg-white/95 border-[2px] border-true-black px-3 py-1.5 brutal-shadow-sm font-bold text-true-black flex items-center gap-2">
                <span className="animate-bounce text-xs">▼</span>
                <span>SCROLL TO EXPLORE</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: NEO-BRUTALIST HERO STAGE (SCROLLYTELLING 3D ACE OF SPADES) */}
        <NeoBrutalistHero
          containerRefProp={neoSectionRef}
          onOpenDuel={() => setIsDuelOpen(true)}
          onScrollToGallery={() => {
            if (gallerySectionRef.current) {
              gallerySectionRef.current.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        />

        {/* SECTION 3: GSAP HORIZONTAL SCROLL SHOWCASE (Frame 2 เดิม) */}
        <HorizontalShowcase
          containerRefProp={gallerySectionRef}
          onSelectDeck={(skin) => {
            setDeckSkin(skin)
            SoundEngine.playCardFlip()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onOpenDuel={() => setIsDuelOpen(true)}
        />

        {/* SECTION 4: NEO-BRUTALIST ARCADE FOOTER */}
        <footer className="w-full bg-white border-t-[4px] border-true-black py-12 px-6 md:px-16 z-30 relative select-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎴</span>
                <span className="font-display text-2xl font-black text-true-black tracking-tight">
                  POKERHUB
                </span>
                <span className="font-pixel text-[9px] bg-accent-yellow border-[2px] border-true-black px-1.5 py-0.5 font-bold">
                  v2.5
                </span>
              </div>
              <p className="font-pixel text-[10px] text-gray-600 max-w-sm text-center md:text-left">
                Next-Gen 3D WebGL Poker Experience. Procedural cards, real-time physics, high-roller duels &amp; luxury foil archives.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  SoundEngine.playCardSwoosh()
                  setIsDuelOpen(true)
                }}
                className="brutal-btn bg-ui-pink text-true-black px-4 py-2 font-display text-xs uppercase font-bold"
              >
                ⚔️ 3D Duel
              </button>
              <button
                onClick={() => {
                  SoundEngine.playClick()
                  setIsRankingsOpen(true)
                }}
                className="brutal-btn bg-accent-yellow text-true-black px-4 py-2 font-display text-xs uppercase font-bold"
              >
                📜 Hand Rankings
              </button>
              <button
                onClick={() => {
                  SoundEngine.playClick()
                  setIsVIPOpen(true)
                }}
                className="brutal-btn bg-accent-cyan text-true-black px-4 py-2 font-display text-xs uppercase font-bold"
              >
                💎 VIP Club
              </button>
              <button
                onClick={() => {
                  SoundEngine.playClick()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="brutal-btn bg-white text-true-black px-4 py-2 font-pixel text-[10px] uppercase font-bold"
              >
                ▲ Top
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t-[2px] border-true-black flex flex-col sm:flex-row items-center justify-between text-gray-500 font-pixel text-[9px] gap-2">
            <span>© 2026 POKERHUB CASINO. ALL RIGHTS RESERVED.</span>
            <span>BUILT WITH THREE.JS, REACT THREE FIBER, GSAP &amp; LENIS.</span>
          </div>
        </footer>

        {/* Real-time 3D Telemetry HUD & Control Dock (smoothly fades on scroll towards Section 2) */}
        <div ref={hudContainerRef} className="contents will-change-transform">
          <CardInspectorHUD
            telemetry={telemetry}
            deckSkin={deckSkin}
            activeSuit={activeSuit}
            isHolo={isHolo}
            isFanMode={isFanMode}
          />

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
        </div>

        {/* Texas Hold'em 3D Duel Modal Game */}
        <PokerDuelGame
          isOpen={isDuelOpen}
          onClose={() => setIsDuelOpen(false)}
          bankroll={bankroll}
          setBankroll={setBankroll}
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


