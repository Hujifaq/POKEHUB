"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Floating3DLogo from './Floating3DLogo'
import { SoundEngine } from './SoundEngine'
import HandRankingsModal from './HandRankingsModal'

export default function Footer({
  onOpenRankings,
  className = ""
}) {
  const [toastMessage, setToastMessage] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [internalRankingsOpen, setInternalRankingsOpen] = useState(false)

  // Subscribe to SoundEngine mute state
  React.useEffect(() => {
    setIsMuted(SoundEngine.getMuted())
    return SoundEngine.subscribe((muted) => {
      setIsMuted(muted)
    })
  }, [])

  // Show temporary toast notification
  const triggerToast = (msg, duration = 3000) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, duration)
  }

  // Sound Mute Toggle
  const handleToggleSound = () => {
    const nextMute = SoundEngine.toggleMute()
    if (!nextMute) {
      triggerToast("SOUND EFFECTS: ENABLED")
    } else {
      triggerToast("SOUND EFFECTS: MUTED")
    }
  }

  // Handle Back to Top
  const scrollToTop = () => {
    try {
      SoundEngine.playCardSwoosh()
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Open Hand Rankings
  const handleOpenRankings = () => {
    try {
      SoundEngine.playClick()
    } catch {}
    if (onOpenRankings) {
      onOpenRankings()
    } else {
      setInternalRankingsOpen(true)
    }
  }

  const marqueeItems = [
    { icon: "♠", text: "POKERHUB 3D ARENA" },
    { icon: "★", text: "100% PROVABLY FAIR RNG" },
    { icon: "♦", text: "6 PROCEDURAL 3D DECKS" },
    { icon: "⚡", text: "REAL-TIME TEXAS HOLD'EM" },
    { icon: "♣", text: "INTELLIGENT BOT AI" },
    { icon: "♥", text: "KMUTT SENIOR ARCHIVE" },
  ]

  return (
    <footer id="about" className={`w-full bg-[#0A0A0E] text-white border-t-[4px] border-true-black relative z-40 overflow-hidden select-none ${className}`}>
      
      {/* Subtle Graph Grid Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ======================================================== */}
      {/* 1. CLEAN RETRO RUNNING MARQUEE TICKER                     */}
      {/* ======================================================== */}
      <div className="w-full bg-[#FFFB00] text-true-black border-b-[3px] border-true-black py-2 overflow-hidden relative shadow-[0px_2px_0px_#000000]">
        <div className="animate-marquee-left flex items-center whitespace-nowrap">
          {/* Loop 1 */}
          <div className="flex items-center gap-8 px-4">
            {marqueeItems.map((item, idx) => (
              <div key={`m1-${idx}`} className="flex items-center gap-2 font-display text-xs md:text-sm font-black tracking-wider uppercase">
                <span>{item.icon}</span>
                <span>{item.text}</span>
                <span className="text-xs opacity-60">•</span>
              </div>
            ))}
          </div>
          {/* Loop 2 for smooth infinite flow */}
          <div className="flex items-center gap-8 px-4">
            {marqueeItems.map((item, idx) => (
              <div key={`m2-${idx}`} className="flex items-center gap-2 font-display text-xs md:text-sm font-black tracking-wider uppercase">
                <span>{item.icon}</span>
                <span>{item.text}</span>
                <span className="text-xs opacity-60">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT: BALANCED 2-COLUMN LAYOUT                */}
      {/* ======================================================== */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center pb-8 border-b border-white/10">
          
          {/* COLUMN 1: Brand, Tagline & Socials */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5">
              <Floating3DLogo
                onClick={() => {
                  SoundEngine.playClick()
                  scrollToTop()
                }}
              />
              <div
                className="inline-flex items-center group cursor-pointer select-none transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                onClick={() => SoundEngine.playClick()}
              >
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase transition-all duration-300">
                  <span className="text-[#FF70A6] drop-shadow-[3px_3px_0px_#000000] group-hover:drop-shadow-[0_0_16px_rgba(255,112,166,0.8)] transition-all">
                    POKER
                  </span>
                  <span className="text-accent-yellow drop-shadow-[3px_3px_0px_#000000] group-hover:drop-shadow-[0_0_16px_rgba(255,251,0,0.9)] transition-all">
                    HUB
                  </span>
                </span>
              </div>
            </div>

            <p className="font-mono-nb text-xs text-gray-400 max-w-md leading-relaxed">
              Next-Gen Neo-Brutalist 3D Texas Hold'em Arena with procedural card physics, custom shaders, and intelligent AI opponents.
            </p>

            {/* Social Badges & Audio Toggle */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <a
                href="https://github.com/Hujifaq/POKEHUB"
                target="_blank"
                rel="noreferrer"
                onClick={() => SoundEngine.playClick()}
                className="px-3.5 py-2 bg-[#FFE500] hover:bg-[#00F5FF] text-true-black border-[3px] border-true-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-pixel text-[9.5px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>GITHUB</span>
              </a>
              <button
                onClick={handleToggleSound}
                className={`px-3.5 py-2 border-[3px] border-true-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-pixel text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-[#FFFFFF] text-true-black hover:bg-[#FF70A6]'
                    : 'bg-[#00FFA3] text-true-black hover:bg-[#00F5FF]'
                }`}
              >
                <span>{isMuted ? "SFX: OFF" : "SFX: ON"}</span>
              </button>
            </div>
          </div>

          {/* COLUMN 2: 4-Grid Navigation Links */}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Link
                href="/"
                onClick={() => SoundEngine.playClick()}
                className="py-3.5 px-4 bg-[#FFFFFF] hover:bg-[#FFE500] text-true-black border-[3px] border-true-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none font-display font-black text-xs sm:text-sm uppercase tracking-wide transition-all text-center flex items-center justify-center cursor-pointer"
              >
                <span>Home</span>
              </Link>

              <Link
                href="/game"
                onClick={() => SoundEngine.playClick()}
                className="py-3.5 px-4 bg-[#FFFFFF] hover:bg-[#00F5FF] text-true-black border-[3px] border-true-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none font-display font-black text-xs sm:text-sm uppercase tracking-wide transition-all text-center flex items-center justify-center cursor-pointer"
              >
                <span>Play Poker</span>
              </Link>

              <Link
                href="/about"
                onClick={() => SoundEngine.playClick()}
                className="py-3.5 px-4 bg-[#FFFFFF] hover:bg-[#FF70A6] text-true-black border-[3px] border-true-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none font-display font-black text-xs sm:text-sm uppercase tracking-wide transition-all text-center flex items-center justify-center cursor-pointer"
              >
                <span>About Us</span>
              </Link>

              <button
                onClick={handleOpenRankings}
                className="py-3.5 px-4 bg-[#FFFFFF] hover:bg-[#00FFA3] text-true-black border-[3px] border-true-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none font-display font-black text-xs sm:text-sm uppercase tracking-wide transition-all text-center flex items-center justify-center cursor-pointer"
              >
                <span>Hand Rankings</span>
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. CLEAN BOTTOM BAR                                      */}
        {/* ======================================================== */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono-nb text-xs text-gray-400">
          <div>
            <span>© 2026 POKERHUB ARCHIVES.</span> ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="px-4 py-2 bg-[#FFE500] hover:bg-[#00FFA3] text-true-black border-[3px] border-true-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>BACK TO TOP</span>
              <span className="text-sm font-bold">↑</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] animate-scaleUp">
          <div className="brutal-window px-4 py-2.5 bg-[#FFFB00] text-true-black border-[3px] border-true-black shadow-[4px_4px_0px_#000] flex items-center gap-2.5">
            <span className="font-pixel text-[10px] font-black uppercase tracking-wider">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Internal Hand Rankings Modal */}
      <HandRankingsModal
        isOpen={internalRankingsOpen}
        onClose={() => setInternalRankingsOpen(false)}
      />

    </footer>
  )
}
