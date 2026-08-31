"use client"

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function PinVideoSection({ onOpenDuel, onOpenRankings, onOpenVIP }) {
  const sectionRef = useRef(null)
  const pinBoxRef = useRef(null)
  const textRef = useRef(null)
  const innerContentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      const pinBox = pinBoxRef.current
      const text = textRef.current
      const innerContent = innerContentRef.current

      if (!section || !pinBox) return

      // GSAP Pinned Scrub Timeline for Expanding pin-box
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1
        }
      })

      // 1. Expand the circular pin-box from 7% peek to 100% full screen
      tl.fromTo(
        pinBox,
        {
          clipPath: 'circle(7% at 50% 52%)'
        },
        {
          clipPath: 'circle(100% at 50% 50%)',
          ease: 'power2.inOut',
          duration: 2
        }
      )

      // 2. Scale & fade the background headline text as circle expands
      if (text) {
        tl.to(
          text,
          {
            scale: 0.92,
            opacity: 0.15,
            ease: 'power1.out',
            duration: 1.5
          },
          0
        )
      }

      // 3. Zoom and reveal the inner 3D interactive arena inside pin-box
      if (innerContent) {
        tl.fromTo(
          innerContent,
          {
            scale: 1.2,
            opacity: 0.7
          },
          {
            scale: 1,
            opacity: 1,
            ease: 'power1.out',
            duration: 2
          },
          0
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="video-wrapper relative w-full h-screen overflow-hidden bg-[#f7efe4] select-none z-30 flex items-center justify-center"
    >
      {/* Background Headline Typography (Matching Spylt Reference: WHAT'S EVERYONE TALKING ABOUT?) */}
      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 will-change-transform"
      >
        <h2 className="font-display text-[15vw] sm:text-[13vw] md:text-[12vw] font-black text-true-black uppercase tracking-tight leading-[0.82] text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,0.08)]">
          WHAT'S
        </h2>
        <h2 className="font-display text-[15vw] sm:text-[13vw] md:text-[12vw] font-black text-[#ba7f4e] uppercase tracking-tight leading-[0.82] text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,0.08)] my-1">
          EVERYONE
        </h2>
        <h2 className="font-display text-[8vw] sm:text-[7vw] md:text-[6vw] font-black text-true-black uppercase tracking-tight leading-[0.9] text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.08)] mt-2">
          TALKING ABOUT?
        </h2>
      </div>

      {/* The Expanding Circular Pin-Box (Recreated from Spylt clone source) */}
      <div
        ref={pinBoxRef}
        className="pin-box absolute inset-0 w-full h-full bg-[#0d0e14] z-20 overflow-hidden flex items-center justify-center will-change-[clip-path]"
        style={{
          clipPath: 'circle(7% at 50% 52%)'
        }}
      >
        {/* Inner Casino Video / Visual Experience with Retro Pixel UI */}
        <div
          ref={innerContentRef}
          className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 will-change-transform"
        >
          {/* Animated Matrix / Baize Felt Background Texture */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#00f0ff 1.5px, transparent 1.5px), radial-gradient(#ffa6c9 1.5px, transparent 1.5px)',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}
          />

          {/* CRT Scanline Overlay for authentic retro vibe */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent pointer-events-none z-10" />

          {/* Floating Neon Card Showcase Centerpiece */}
          <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl text-center">
            
            {/* Retro Pixel Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow border-[2px] border-true-black brutal-shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="font-pixel text-[9px] sm:text-[10px] font-black text-true-black uppercase tracking-wider">
                LIVE 3D CASINO ARENA // 60 FPS WEBGL
              </span>
            </div>

            {/* Main Punchy Heading inside Pin-Box */}
            <h3 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[0.95] drop-shadow-[4px_4px_0px_#050505]">
              THE UNDERGROUND HIGH-ROLLER ARENA
            </h3>

            <p className="font-pixel text-xs sm:text-sm text-gray-300 max-w-2xl mt-4 sm:mt-6 leading-relaxed">
              Step onto the felt. Real-time procedural 3D card physics, cryptographic fair deck RNG, instant chips tossing, and multiplayer Texas Hold'em.
            </p>

            {/* Visual Casino Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 w-full max-w-3xl">
              <div className="bg-[#161822] border-[3px] border-true-black p-3 rounded-xl brutal-shadow-sm">
                <span className="font-mono-nb text-lg font-black text-accent-cyan block mb-1">01</span>
                <span className="font-pixel text-[8px] sm:text-[9px] text-accent-cyan font-bold block uppercase">
                  PROVABLY FAIR
                </span>
                <span className="font-pixel text-[7px] text-gray-400">100% VERIFIABLE</span>
              </div>

              <div className="bg-[#161822] border-[3px] border-true-black p-3 rounded-xl brutal-shadow-sm">
                <span className="font-mono-nb text-lg font-black text-ui-pink block mb-1">02</span>
                <span className="font-pixel text-[8px] sm:text-[9px] text-ui-pink font-bold block uppercase">
                  PBR FOILS
                </span>
                <span className="font-pixel text-[7px] text-gray-400">6 LUXURY SKINS</span>
              </div>

              <div className="bg-[#161822] border-[3px] border-true-black p-3 rounded-xl brutal-shadow-sm">
                <span className="font-mono-nb text-lg font-black text-accent-yellow block mb-1">03</span>
                <span className="font-pixel text-[8px] sm:text-[9px] text-accent-yellow font-bold block uppercase">
                  ZERO LAG
                </span>
                <span className="font-pixel text-[7px] text-gray-400">HARDWARE ACCEL</span>
              </div>

              <div className="bg-[#161822] border-[3px] border-true-black p-3 rounded-xl brutal-shadow-sm">
                <span className="font-mono-nb text-lg font-black text-[#b388ff] block mb-1">04</span>
                <span className="font-pixel text-[8px] sm:text-[9px] text-[#b388ff] font-bold block uppercase">
                  VIP RANKINGS
                </span>
                <span className="font-pixel text-[7px] text-gray-400">ROYAL FLUSH CLUB</span>
              </div>
            </div>

            {/* Interactive Launch Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  SoundEngine.playCardSwoosh()
                  if (onOpenDuel) onOpenDuel()
                }}
                className="brutal-btn bg-ui-pink hover:bg-[#ff8cb8] text-true-black px-6 sm:px-8 py-3.5 sm:py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <span>ENTER 3D POKER DUEL →</span>
              </button>

              <button
                onClick={() => {
                  SoundEngine.playClick()
                  if (onOpenRankings) onOpenRankings()
                }}
                className="brutal-btn bg-accent-yellow hover:bg-[#fff952] text-true-black px-6 sm:px-8 py-3.5 sm:py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <span>HAND RANKINGS</span>
              </button>
            </div>

          </div>

          {/* Floating Corner Decorative Elements */}
          <div className="absolute top-8 left-8 hidden sm:flex items-center gap-2 text-white/40 font-pixel text-[9px]">
            <span>[ TABLE #01 ]</span>
            <span>MACAU VIP</span>
          </div>

          <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-2 text-white/40 font-pixel text-[9px]">
            <span>BANKROLL: $10,000</span>
            <span>♠ ♥ ♦ ♣</span>
          </div>

        </div>
      </div>
    </section>
  )
}
