"use client"

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PIN_CARDS = [
  {
    id: 'c1',
    name: 'OBSIDIAN FOIL',
    rank: 'A',
    suit: '♠',
    edition: '01 / 06',
    tag: 'MYTHIC',
    rotation: '-rotate-[12deg]',
    translation: '-translate-y-4',
    bg: 'from-[#121420] via-[#1a1c2b] to-[#0d0e17]',
    accentColor: '#b388ff',
    textColor: 'text-white',
    badgeBg: 'bg-accent-cyan'
  },
  {
    id: 'c2',
    name: 'IVORY GOLD',
    rank: 'K',
    suit: '♥',
    edition: '02 / 06',
    tag: '24K ROYAL',
    rotation: 'rotate-[5deg]',
    translation: 'translate-y-2',
    bg: 'from-[#fbf5e8] via-[#f3e7cb] to-[#e8d5af]',
    accentColor: '#d4af37',
    textColor: 'text-true-black',
    badgeBg: 'bg-accent-yellow'
  },
  {
    id: 'c3',
    name: 'CYBER NEON',
    rank: 'Q',
    suit: '♦',
    edition: '03 / 06',
    tag: 'SYNTH 2099',
    rotation: '-rotate-[4deg]',
    translation: '-translate-y-3',
    bg: 'from-[#081a2e] via-[#0f2d4a] to-[#1e0d2d]',
    accentColor: '#00f0ff',
    textColor: 'text-white',
    badgeBg: 'bg-ui-pink'
  },
  {
    id: 'c4',
    name: 'EMERALD SUITE',
    rank: 'J',
    suit: '♣',
    edition: '04 / 06',
    tag: 'MONTE CARLO',
    rotation: 'rotate-[6deg]',
    translation: 'translate-y-4',
    bg: 'from-[#0a2717] via-[#0f3d23] to-[#06180e]',
    accentColor: '#2ecc71',
    textColor: 'text-white',
    badgeBg: 'bg-accent-yellow'
  },
  {
    id: 'c5',
    name: 'SAKURA RUBY',
    rank: 'A',
    suit: '♥',
    edition: '05 / 06',
    tag: 'AKIHABARA',
    rotation: '-rotate-[8deg]',
    translation: '-translate-y-2',
    bg: 'from-[#ffe0ea] via-[#ffb8ce] to-[#ffa6c9]',
    accentColor: '#e74c3c',
    textColor: 'text-true-black',
    badgeBg: 'bg-accent-cyan'
  },
  {
    id: 'c6',
    name: '8-BIT WILD',
    rank: '777',
    suit: '★',
    edition: '06 / 06',
    tag: 'GENESIS',
    rotation: 'rotate-[5deg]',
    translation: 'translate-y-3',
    bg: 'from-[#fff4a3] via-[#ffdf6d] to-[#ffbe3b]',
    accentColor: '#ff6b00',
    textColor: 'text-true-black',
    badgeBg: 'bg-ui-blue'
  },
  {
    id: 'c7',
    name: 'ROYAL DRAGON',
    rank: 'K',
    suit: '♠',
    edition: 'SECRET',
    tag: 'VIP DROP',
    rotation: '-rotate-[3deg]',
    translation: 'translate-y-5',
    bg: 'from-[#2d083b] via-[#400d54] to-[#1d0326]',
    accentColor: '#ff007f',
    textColor: 'text-white',
    badgeBg: 'bg-accent-yellow'
  }
]

export default function PinBoxSection({ onOpenDuel }) {
  const containerRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current
      const pinWrapper = pinWrapperRef.current
      if (!container || !pinWrapper) return

      // Single pinned scrub timeline directly matching the Spylt source code
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          start: 'top top',
          end: '+=2000',
          scrub: 1.2,
          anticipatePin: 1
        }
      })

      // 1. Displace background headline text as you scroll
      tl.to(
        '.first-title-anim',
        {
          xPercent: 55,
          yPercent: -90,
          ease: 'power1.inOut'
        },
        0
      )
      tl.to(
        '.sec-title-anim',
        {
          xPercent: 25,
          yPercent: -60,
          ease: 'power1.inOut'
        },
        0
      )
      tl.to(
        '.third-title-anim',
        {
          xPercent: -55,
          yPercent: -90,
          ease: 'power1.inOut'
        },
        0
      )

      // 2. Cards rise UP from below the screen (yPercent: 320 -> 0)
      const validCards = cardsRef.current.filter(Boolean)
      if (validCards.length > 0) {
        tl.fromTo(
          validCards,
          {
            yPercent: 320,
            opacity: 0,
            scale: 0.75
          },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            duration: 1.6,
            ease: 'power2.out'
          },
          0
        )
      }

      // Small resting delay before unpinning
      tl.to({}, { duration: 0.4 })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="testimonials-section relative w-full h-screen overflow-hidden bg-primary-base select-none z-30 flex flex-col justify-between"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* Background Giant Text (What's Everyone Thinking / Talking) in Website Theme Colors */}
        <div className="all-title absolute inset-0 size-full flex flex-col items-center justify-center pointer-events-none z-10 px-4">
          <h1
            className="first-title-anim font-display text-[17vw] sm:text-[16vw] md:text-[14vw] font-black text-true-black uppercase tracking-tight leading-[0.82] text-center will-change-transform"
            style={{
              WebkitTextStroke: '3px #050505',
              textShadow: '6px 6px 0px rgba(0,0,0,0.08)'
            }}
          >
            WHAT'S
          </h1>
          <h1
            className="sec-title-anim font-display text-[17vw] sm:text-[16vw] md:text-[14vw] font-black text-ui-pink uppercase tracking-tight leading-[0.82] text-center will-change-transform my-1"
            style={{
              WebkitTextStroke: '4px #050505',
              textShadow: '6px 6px 0px #050505'
            }}
          >
            EVERYONE
          </h1>
          <h1
            className="third-title-anim font-display text-[17vw] sm:text-[16vw] md:text-[14vw] font-black text-true-black uppercase tracking-tight leading-[0.82] text-center will-change-transform"
            style={{
              WebkitTextStroke: '3px #050505',
              textShadow: '6px 6px 0px rgba(0,0,0,0.08)'
            }}
          >
            THINKING
          </h1>
        </div>

        {/* The Pin-Box: Image Cards that rise up from below */}
        <div className="pin-box relative z-20 flex items-center justify-center w-full h-full px-4 sm:px-12 md:px-20 overflow-visible pointer-events-auto">
          <div className="flex items-center justify-center w-max">
            {PIN_CARDS.map((card, index) => (
              <div
                key={card.id}
                ref={(el) => (cardsRef.current[index] = el)}
                onMouseEnter={() => {
                  SoundEngine.playThemeCardHover(card.name)
                }}
                onClick={() => {
                  SoundEngine.playThemeCardHover(card.name)
                  if (onOpenDuel) onOpenDuel()
                }}
                className={`vd-card w-44 sm:w-52 md:w-60 lg:w-68 h-64 sm:h-76 md:h-88 lg:h-[390px] shrink-0 rounded-2xl sm:rounded-3xl border-[4px] border-true-black shadow-[8px_8px_0px_#050505] -ms-16 sm:-ms-24 md:-ms-32 ${card.rotation} ${card.translation} bg-gradient-to-br ${card.bg} p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:scale-105 hover:z-50 hover:-translate-y-8 transition-all duration-300 will-change-transform group`}
                style={{
                  zIndex: index + 20
                }}
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-pixel text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 bg-white border-[2px] border-true-black text-true-black w-max brutal-shadow-sm">
                      {card.edition}
                    </span>
                    <span className={`font-pixel text-[7px] sm:text-[8px] font-bold ${card.badgeBg} border border-true-black text-true-black px-1 mt-1 uppercase w-max`}>
                      {card.tag}
                    </span>
                  </div>
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-[2px] border-true-black bg-white flex items-center justify-center font-display text-base sm:text-lg font-black text-true-black shadow-[2px_2px_0px_#050505]">
                    {card.suit}
                  </div>
                </div>

                {/* Card Center Artwork Emblem */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-[3px] border-true-black flex items-center justify-center text-3xl sm:text-4xl shadow-[4px_4px_0px_#050505] group-hover:rotate-12 transition-transform duration-300"
                    style={{ backgroundColor: card.accentColor }}
                  >
                    {card.suit}
                  </div>
                  <h3 className={`font-display text-xs sm:text-sm md:text-base font-black ${card.textColor} tracking-tight mt-3 text-center uppercase drop-shadow-[2px_2px_0px_#000]`}>
                    {card.name}
                  </h3>
                </div>

                {/* Card Bottom Bar */}
                <div className="flex items-center justify-between border-t-[2px] border-black/20 pt-2">
                  <span className={`font-pixel text-[8px] sm:text-[9px] ${card.textColor} font-black`}>
                    RANK: {card.rank}
                  </span>
                  <span className="font-pixel text-[7px] sm:text-[8px] bg-accent-yellow border-[2px] border-true-black px-1.5 py-0.5 text-true-black font-bold uppercase brutal-shadow-sm">
                    PLAY ►
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button Bar */}
        <div className="relative z-30 pb-8 flex justify-center items-center">
          <button
            onClick={() => {
              SoundEngine.playClick()
              if (onOpenDuel) onOpenDuel()
            }}
            className="brutal-btn bg-ui-pink hover:bg-[#ff8cb8] text-true-black px-8 sm:px-12 py-3 sm:py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer border-[3px] border-true-black brutal-shadow"
          >
            <span>⚔️ EXPLORE ALL DECKS</span>
          </button>
        </div>
      </section>
    </div>
  )
}
