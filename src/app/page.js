"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BubbleMenu from './components/BubbleMenu'
import Floating3DLogo from './components/Floating3DLogo'
import Preloader from './components/Preloader'
import HandRankingsModal from './components/HandRankingsModal'
import VIPClubModal from './components/VIPClubModal'
import HorizontalShowcase from './components/HorizontalShowcase'
import RiffleShuffleSection from './components/RiffleShuffleSection'
import PokerHandOrbitSection from './components/PokerHandOrbitSection'
import NeoBrutalistHero from './components/NeoBrutalistHero'
import GameSetupModal from './components/GameSetupModal'
import Footer from './components/Footer'
import { SoundEngine } from './components/SoundEngine'
import { generateGameUrl } from './utils/gameUrl'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
}

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [mounted, setMounted] = useState(false)
  const neoSectionRef = useRef(null)
  const gallerySectionRef = useRef(null)
  const howToPlaySectionRef = useRef(null)

  const scrollToHowToPlay = useCallback(() => {
    if (howToPlaySectionRef.current) {
      howToPlaySectionRef.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      const el = document.getElementById('how-to-play')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const scrollToDeckSkins = useCallback(() => {
    if (gallerySectionRef.current) {
      gallerySectionRef.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      const el = document.getElementById('deck-skins')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Financial & Audio states
  const [bankroll, setBankroll] = useState(10000)
  const [isMuted, setIsMuted] = useState(false)

  // Modal Dialogs
  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)

  // Force scroll to top on refresh or initial visit and load bankroll
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }

      // Clear any hash so page refresh always resets to Hero
      if (window.location.hash) {
        try {
          window.history.replaceState(null, '', window.location.pathname)
        } catch {}
      }

      const resetToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }

      resetToTop()
      requestAnimationFrame(resetToTop)
      const t1 = setTimeout(resetToTop, 50)
      const t2 = setTimeout(resetToTop, 200)

      const saved = localStorage.getItem('pokehub_bankroll')
      if (saved) {
        setBankroll(Number(saved))
      }

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [])

  // Handle beforeunload, pagehide and pageshow to always ensure top position on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    const handlePageShow = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      window.removeEventListener('pageshow', handlePageShow)
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

  // Subscribe to SoundEngine mute state and sync with local state
  useEffect(() => {
    setIsMuted(SoundEngine.getMuted())
    return SoundEngine.subscribe((muted) => {
      setIsMuted(muted)
    })
  }, [])

  // Sound Effects Mute Toggle handler
  const handleToggleMute = useCallback(() => {
    SoundEngine.toggleMute()
  }, [])

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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle hash navigation to #how-to-play or #deck-skins
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkHash = () => {
        if (window.location.hash === '#how-to-play') {
          setTimeout(() => {
            scrollToHowToPlay()
          }, 350)
        } else if (window.location.hash === '#deck-skins' || window.location.hash === '#deck-skin') {
          setTimeout(() => {
            scrollToDeckSkins()
          }, 350)
        } else if (window.location.hash === '#about') {
          setTimeout(() => {
            const el = document.getElementById('about')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 350)
        }
      }
      checkHash()
      window.addEventListener('hashchange', checkHash)
      return () => window.removeEventListener('hashchange', checkHash)
    }
  }, [scrollToHowToPlay, scrollToDeckSkins])

  // Hamburger Menu Items: Home, 3D Arena, Deck Skin, Rankings, How to Play
  const bubbleMenuItems = useMemo(() => [
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
      label: 'deck skin',
      ariaLabel: '6 Freaking Elite Decks Showcase',
      rotation: -6,
      hoverStyles: { bgColor: '#FF90E8', textColor: '#000000' },
      onClick: () => {
        scrollToDeckSkins()
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
        scrollToHowToPlay()
      }
    }
  ], [scrollToHowToPlay, scrollToDeckSkins])

  return (
    <main className="w-full relative min-h-screen transition-colors duration-700 text-true-black overflow-x-hidden bg-transparent">
      {/* Infinite Seamless Fixed Graph Grid across all sections */}
      <div className="fixed-graph-grid" />

      {/* Intro Preloader */}
      {showPreloader && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem('pokehub_intro_seen', 'true')
            } catch {}
            setShowPreloader(false)
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
              document.documentElement.scrollTop = 0
              document.body.scrollTop = 0
            }
            ScrollTrigger.refresh()
          }}
        />
      )}

      {/* Unified Responsive Bubble Navbar */}
      <BubbleMenu
        logo={
          <Floating3DLogo
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }}
          />
        }
        actions={
          <>
            {/* Play 3D Arena Button (Navigates to /game) - shown on md+ */}
            <Link
              href="/game"
              className="brutal-btn bg-[#00FFA3] text-true-black hidden md:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 font-display text-[11px] sm:text-xs font-black uppercase hover:bg-[#00e693] transition-all shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] -rotate-1 cursor-pointer shrink-0"
              title="Open Standalone 3D Poker Arena"
            >
              <span>3D ARENA</span>
            </Link>

            {/* Bankroll Faux Window */}
            <div className="brutal-window flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2.5 sm:px-3.5 py-1 sm:py-2 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] shrink-0">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-pixel text-true-black hidden sm:inline">
                BANKROLL:
              </span>
              <span className="text-[11px] xs:text-xs sm:text-sm font-black text-emerald-600 tracking-tight drop-shadow-[1px_1px_0px_#050505] font-display">
                ${bankroll.toLocaleString()}
              </span>
              <button
                onClick={handleRefillBankroll}
                className="brutal-btn bg-accent-yellow text-true-black text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5"
                title="Add +$5,000 High Roller Chips"
              >
                +$5K
              </button>
            </div>

            {/* Sound Effects Mute / Unmute Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`brutal-btn flex items-center gap-1 px-1.5 xs:px-2.5 sm:px-3 py-1 sm:py-2 font-pixel text-[8px] xs:text-[9px] sm:text-[10px] uppercase font-bold transition-all shrink-0 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] ${
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
              className="brutal-btn w-8 h-8 sm:w-9 sm:h-9 bg-accent-yellow text-true-black hidden xl:flex items-center justify-center font-black font-pixel shrink-0 shadow-[2px_2px_0px_#000000]"
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
        animationEase="back.out(1.2)"
        animationDuration={0.65}
        staggerDelay={0.10}
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
      {/* SECTION 2: 3D CARD RIFFLE SHUFFLE (HOW TO PLAY PART 1)   */}
      {/* ======================================================== */}
      <RiffleShuffleSection containerRefProp={howToPlaySectionRef} />

      {/* ======================================================== */}
      {/* SECTION 3: 3D POV POKER TABLE (HOW TO PLAY PART 2)       */}
      {/* ======================================================== */}
      <PokerHandOrbitSection />

      {/* ======================================================== */}
      {/* SECTION 4: GSAP HORIZONTAL SCROLL SHOWCASE (6 DECKS)   */}
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
      {/* SECTION 5: NEO-BRUTALIST ARCADE FOOTER                   */}
      {/* ======================================================== */}
      <Footer
        onOpenRankings={() => setIsRankingsOpen(true)}
        onOpenVIP={() => setIsVIPOpen(true)}
        onOpenDuel={() => setIsSetupModalOpen(true)}
      />

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
