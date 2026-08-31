"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BubbleMenu from '../components/BubbleMenu'
import Floating3DLogo from '../components/Floating3DLogo'
import Preloader from '../components/Preloader'
import { PixelAvatar } from '../components/PixelAvatars'
import Footer from '../components/Footer'
import { SoundEngine } from '../components/SoundEngine'
import HandRankingsModal from '../components/HandRankingsModal'

// =========================================================================
// DEVELOPER TEAM ROSTER (KMUTT)
// =========================================================================
const TEAM_MEMBERS = [
  {
    id: 'palise',
    name: 'PALISE WATANAVISO',
    email: 'palise.wata@mail.kmutt.ac.th',
    avatarKey: 'hero',
    cardColor: 'bg-[#00FFA3]',
    role: 'FRONTEND & 3D GRAPHICS'
  },
  {
    id: 'nanthanat',
    name: 'NANTHANAT CHAROENSUK',
    email: 'nanthanat.char@mail.kmutt.ac.th',
    avatarKey: 'samurai',
    cardColor: 'bg-[#FF70A6]',
    role: 'GAME ENGINE & LOGIC'
  },
  {
    id: 'kadsan',
    name: 'KADSAN SUPPHAAKKARHASOPHON',
    email: 'kadsan.supp@mail.kmutt.ac.th',
    avatarKey: 'cyborg',
    cardColor: 'bg-[#FFE500]',
    role: 'AUDIO & UI/UX DESIGN'
  },
  {
    id: 'phurichaya',
    name: 'PHURICHAYA CHALOEMSRI',
    email: 'phurichaya.chal@mail.kmutt.ac.th',
    avatarKey: 'punk',
    cardColor: 'bg-[#00F5FF]',
    role: 'ARCHITECTURE & QA'
  }
]

// =========================================================================
// FULL PROJECT TECHNOLOGY STACK
// =========================================================================
const TECH_STACK_DOMAINS = [
  {
    domain: 'FRAMEWORK & RUNTIME',
    themeColor: 'bg-[#FFE500]',
    items: [
      {
        tech: 'Next.js 16 (App Router)',
        role: 'Server & Client Components architecture, dynamic code splitting, and SSR optimization.'
      },
      {
        tech: 'React 19',
        role: 'Concurrent rendering, reactive game state handling, and custom audio/render hooks.'
      }
    ]
  },
  {
    domain: '3D GRAPHICS & WEBGL',
    themeColor: 'bg-[#00FFA3]',
    items: [
      {
        tech: 'Three.js (r185)',
        role: 'WebGL scene graph, spatial perspective cameras, dynamic lighting, and card collision physics.'
      },
      {
        tech: '@react-three/fiber & drei',
        role: 'Declarative 3D pipeline in React, GLTF model loading, and 6 procedural card deck shaders.'
      }
    ]
  },
  {
    domain: 'MOTION & PHYSICS',
    themeColor: 'bg-[#FF70A6]',
    items: [
      {
        tech: 'GSAP 3.15 + ScrollTrigger',
        role: 'Scroll-scrubbed 3D showcase timelines, horizontal card pinning, and card orbit kinetic sequences.'
      },
      {
        tech: 'Lenis 1.3 & Motion 13',
        role: 'Inertial smooth scrolling engine integrated with requestAnimationFrame and spring physics.'
      }
    ]
  },
  {
    domain: 'PROCEDURAL WEB AUDIO',
    themeColor: 'bg-[#00F5FF]',
    items: [
      {
        tech: 'Web Audio API (AudioContext)',
        role: 'Synthesizes real-time ASMR card shuffles, riffle snaps, chip clinks, and table landing thuds.'
      },
      {
        tech: 'Zero-Asset Sound Synthesizer',
        role: 'Pure code-generated audio with 0ms asset loading delay and 0KB external MP3/WAV overhead.'
      }
    ]
  },
  {
    domain: 'POKER ENGINE & CRYPTO',
    themeColor: 'bg-[#FFE500]',
    items: [
      {
        tech: 'WSOP Texas Hold\'em State Machine',
        role: 'Turn order (UTG to Button), multiway side pots, 7-card hand evaluators, and heuristic bot AI.'
      },
      {
        tech: 'Web Crypto API (RNG)',
        role: 'Cryptographically secure Fisher-Yates randomization for 100% provably fair deck shuffling.'
      }
    ]
  },
  {
    domain: 'STYLING & TYPOGRAPHY',
    themeColor: 'bg-[#FFFFFF]',
    items: [
      {
        tech: 'Tailwind CSS v4 + PostCSS',
        role: 'High-contrast neo-brutalist utility system, 3-4px solid black borders, and hard-offset shadows.'
      },
      {
        tech: 'Google Fonts Pipeline',
        role: 'Bungee, Press Start 2P, Archivo Black, Space Mono, and Instrument Serif typography.'
      }
    ]
  }
]

export default function AboutPage() {
  const router = useRouter()
  const [showPreloader, setShowPreloader] = useState(true)
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return SoundEngine.getMuted()
    }
    return false
  })
  const [copiedEmail, setCopiedEmail] = useState(null)
  const [handRankingsOpen, setHandRankingsOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    return SoundEngine.subscribe((muted) => {
      setIsMuted(muted)
    })
  }, [])

  const handleToggleMute = () => {
    const next = SoundEngine.toggleMute()
    setIsMuted(next)
  }

  const handleCopyEmail = (email) => {
    try {
      SoundEngine.playClick()
    } catch {}
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(email).then(() => {
        setCopiedEmail(email)
        setTimeout(() => setCopiedEmail(null), 2000)
      }).catch(() => {})
    }
  }

  const bubbleMenuItems = useMemo(() => [
    {
      label: 'home',
      ariaLabel: 'Back to Home Showcase',
      rotation: -4,
      hoverStyles: { bgColor: '#FFDE59', textColor: '#000000' },
      onClick: () => {
        router.push('/')
      }
    },
    {
      label: 'poker duel',
      ariaLabel: 'Play Texas Hold\'em Poker Duel',
      rotation: 4,
      hoverStyles: { bgColor: '#00FFA3', textColor: '#000000' },
      onClick: () => {
        router.push('/game')
      }
    },
    {
      label: 'deck skin',
      ariaLabel: '6 Elite Decks Showcase',
      rotation: -6,
      hoverStyles: { bgColor: '#FF90E8', textColor: '#000000' },
      onClick: () => {
        router.push('/#deck-skins')
      }
    },
    {
      label: 'about us',
      ariaLabel: 'About POKEHUB & Team KMUTT',
      rotation: 6,
      hoverStyles: { bgColor: '#d4af37', textColor: '#14161c' },
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    {
      label: 'how to play',
      ariaLabel: 'How to Play Texas Hold\'em Rules & Flow',
      rotation: -8,
      hoverStyles: { bgColor: '#FFE500', textColor: '#000000' },
      onClick: () => {
        router.push('/#how-to-play')
      }
    }
  ], [router])

  return (
    <main className="w-full relative min-h-screen text-[#0D0D0D] overflow-x-hidden bg-[#F6F5FA] font-display pt-24 pb-0">
      <div className="fixed-graph-grid opacity-25" />

      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      <BubbleMenu
        logo={
          <Floating3DLogo
            onClick={() => {
              router.push('/')
            }}
          />
        }
        actions={
          <>
            <button
              onClick={handleToggleMute}
              className={`brutal-btn flex items-center gap-1 px-1.5 xs:px-2.5 sm:px-3 py-1 sm:py-2 font-pixel text-[8px] xs:text-[9px] sm:text-[10px] uppercase font-bold transition-all shrink-0 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] cursor-pointer ${
                !isMuted ? 'bg-[#00F5FF] text-[#0D0D0D]' : 'bg-white text-gray-500'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              <span>{isMuted ? 'MUTED' : 'SFX: ON'}</span>
            </button>

            <Link
              href="/game"
              onClick={() => {
                try { SoundEngine.playClick() } catch {}
              }}
              className="brutal-btn bg-[#00FFA3] text-[#0D0D0D] flex items-center gap-1 px-2 xs:px-3 sm:px-4 py-1 sm:py-2 font-display text-[10px] xs:text-xs font-black uppercase hover:bg-[#00e693] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] shrink-0 cursor-pointer"
              title="Play 3D Arena"
            >
              <span>PLAY ARENA</span>
            </Link>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col gap-10 sm:gap-14 relative z-10 pb-16">

        <section className="mt-4 sm:mt-6">
          <div className="bg-[#FFFFFF] border-[3.5px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_#0D0D0D] sm:shadow-[8px_8px_0px_#0D0D0D] overflow-hidden">
            
            <div className="bg-[#0D0D0D] text-white px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b-[3px] border-[#0D0D0D]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF3366] border border-black inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFE500] border border-black inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#00FFA3] border border-black inline-block" />
                <span className="font-pixel text-[8px] sm:text-[10px] text-[#FFE500] font-bold ml-2 tracking-wider">
                  SYS://KMUTT.POKEHUB.V1.0
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-4">
              <div className="flex items-center gap-2 bg-[#F6F5FA] border-[2.5px] border-[#0D0D0D] px-3.5 sm:px-5 py-1.5 rounded-full shadow-[3px_3px_0px_#0D0D0D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] border border-black animate-pulse" />
                <span className="font-pixel text-[8.5px] sm:text-xs font-bold text-[#0D0D0D] uppercase tracking-wider">
                  KING MONGKUT&apos;S UNIVERSITY OF TECHNOLOGY THONBURI (KMUTT)
                </span>
              </div>

              <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black text-[#0D0D0D] uppercase tracking-tight leading-tight">
                MEET THE DEVS &amp; ARCHITECTURE
              </h1>

              <p className="font-mono-nb text-xs sm:text-sm text-gray-700 max-w-2xl font-bold leading-relaxed">
                POKEHUB is a real-time 3D Texas Hold&apos;em arcade built with hardware-accelerated WebGL, procedural Web Audio synthesis, and deterministic poker algorithms.
              </p>
            </div>

          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b-[3px] border-[#0D0D0D] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-[#FFE500] border-[2px] border-[#0D0D0D] text-[#0D0D0D] font-pixel text-[9px] sm:text-xs font-black rounded shadow-[2px_2px_0px_#0D0D0D]">
                CORE TEAM
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#0D0D0D] uppercase">
                ENGINEERING ROSTER
              </h2>
            </div>
            <span className="font-mono-nb text-xs text-gray-600 font-bold hidden sm:block">
              4 DEVELOPERS • KMUTT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className={`border-[3px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[5px_5px_0px_#0D0D0D] sm:shadow-[7px_7px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_#0D0D0D] ${member.cardColor}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b-[2.5px] border-[#0D0D0D] pb-3 mb-4">
                    <span className="font-pixel text-[8px] sm:text-[9px] font-bold px-2 py-0.5 bg-white border border-[#0D0D0D] text-[#0D0D0D] rounded">
                      {member.role}
                    </span>
                  </div>

                  <div className="w-full aspect-square bg-[#FFFFFF] border-[3px] border-[#0D0D0D] rounded-xl sm:rounded-2xl flex items-center justify-center p-3 shadow-[3px_3px_0px_#0D0D0D] mb-4 overflow-hidden relative group">
                    <PixelAvatar
                      avatarKey={member.avatarKey}
                      size={3.8}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#FFE500] border-[1.5px] border-[#0D0D0D] font-pixel text-[7px] font-black shadow-[1px_1px_0px_#0D0D0D]">
                      KMUTT
                    </div>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-black text-[#0D0D0D] uppercase tracking-tight leading-snug break-words">
                    {member.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t-[2px] border-[#0D0D0D]">
                  <button
                    onClick={() => handleCopyEmail(member.email)}
                    className="w-full flex items-center justify-between gap-1.5 bg-[#FFFFFF] hover:bg-[#FFE500] border-[2px] border-[#0D0D0D] px-2.5 py-2 rounded-xl shadow-[2px_2px_0px_#0D0D0D] transition-colors cursor-pointer text-left group"
                    title="Click to copy student email"
                  >
                    <span className="font-mono-nb text-[9px] sm:text-[9.5px] font-bold text-[#FF3366] group-hover:text-[#0D0D0D] truncate">
                      {member.email}
                    </span>
                    <span className="font-pixel text-[7.5px] font-black bg-[#0D0D0D] text-[#FFE500] px-1.5 py-0.5 rounded shrink-0">
                      {copiedEmail === member.email ? 'COPIED!' : 'COPY'}
                    </span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#FFFFFF] border-[3.5px] sm:border-[4px] border-[#0D0D0D] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#0D0D0D] flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[3px] border-[#0D0D0D] pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 bg-[#00FFA3] border border-black rounded-full inline-block" />
                <span className="font-pixel text-[9px] font-black text-[#0D0D0D] uppercase tracking-wider">
                  COMPLETE ARCHITECTURE
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0D0D0D] uppercase tracking-tight">
                TECHNOLOGY STACK
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try { SoundEngine.playClick() } catch {}
                  setHandRankingsOpen(true)
                }}
                className="brutal-btn px-4 py-2 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] font-display text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#0D0D0D] cursor-pointer"
              >
                HAND RULES
              </button>
              <Link
                href="/game"
                onClick={() => {
                  try { SoundEngine.playClick() } catch {}
                }}
                className="brutal-btn px-4 py-2 bg-[#00FFA3] hover:bg-[#FF70A6] text-[#0D0D0D] font-display text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#0D0D0D] cursor-pointer"
              >
                TEST ARENA →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TECH_STACK_DOMAINS.map((domain, dIdx) => (
              <div
                key={`domain-${dIdx}`}
                className="border-[2.5px] border-[#0D0D0D] rounded-2xl bg-[#F6F5FA] p-5 shadow-[4px_4px_0px_#0D0D0D] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="border-b-[2px] border-[#0D0D0D] pb-2.5 mb-3">
                    <h3 className="font-display text-xs sm:text-sm font-black text-[#0D0D0D] uppercase">
                      {domain.domain}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {domain.items.map((item, iIdx) => (
                      <div key={`item-${iIdx}`} className="bg-[#FFFFFF] border-[1.5px] border-[#0D0D0D] rounded-xl p-3 shadow-[2px_2px_0px_#0D0D0D]">
                        <h4 className="font-display text-xs sm:text-sm font-black text-[#0D0D0D] mb-1">
                          {item.tech}
                        </h4>
                        <p className="font-mono-nb text-[11px] sm:text-xs text-gray-700 font-bold leading-relaxed">
                          {item.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>

      </div>

      <HandRankingsModal
        isOpen={handRankingsOpen}
        onClose={() => setHandRankingsOpen(false)}
      />

      <Footer className="mt-20" onOpenRankings={() => setHandRankingsOpen(true)} />

    </main>
  )
}
