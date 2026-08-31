"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { SoundEngine } from './SoundEngine'
import HandRankingsModal from './HandRankingsModal'
import VIPClubModal from './VIPClubModal'

export default function Footer({
  onOpenRankings,
  onOpenVIP,
  onOpenDuel,
  className = ""
}) {
  const [toastMessage, setToastMessage] = useState(null)
  const [isMuted, setIsMuted] = useState(false)

  // Internal modal states if parent didn't provide callbacks
  const [internalRankingsOpen, setInternalRankingsOpen] = useState(false)
  const [internalVIPOpen, setInternalVIPOpen] = useState(false)

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
    setIsMuted(nextMute)
    if (!nextMute) {
      SoundEngine.playClick()
      triggerToast("🔊 SOUND EFFECTS: ENABLED")
    } else {
      triggerToast("🔇 SOUND EFFECTS: MUTED")
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

  // Open VIP Lounge
  const handleOpenVIP = () => {
    try {
      SoundEngine.playClick()
    } catch {}
    if (onOpenVIP) {
      onOpenVIP()
    } else {
      setInternalVIPOpen(true)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start pb-8 border-b border-white/10">
          
          {/* COLUMN 1: Brand, Tagline & Socials */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/PKH_Logo.jpg"
                alt="POKERHUB Logo"
                className="h-11 sm:h-12 w-auto rounded border-2 border-accent-yellow shadow-[3px_3px_0px_#FF70A6] cursor-pointer hover:-rotate-3 hover:scale-105 transition-all duration-200"
                onClick={() => SoundEngine.playClick()}
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
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => SoundEngine.playClick()}
                className="brutal-btn px-3 py-1.5 bg-[#161620] hover:bg-[#FF70A6] text-white hover:text-true-black font-pixel text-[9px] font-bold uppercase shadow-[2px_2px_0px_#000] transition-all"
              >
                GITHUB
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => SoundEngine.playClick()}
                className="brutal-btn px-3 py-1.5 bg-[#161620] hover:bg-[#00F0FF] text-white hover:text-true-black font-pixel text-[9px] font-bold uppercase shadow-[2px_2px_0px_#000] transition-all"
              >
                DISCORD
              </a>
              <button
                onClick={handleToggleSound}
                className="brutal-btn px-3 py-1.5 bg-[#161620] hover:bg-[#00FFA3] text-white hover:text-true-black font-pixel text-[9px] font-bold uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
              >
                {isMuted ? "🔇 SFX OFF" : "🔊 SFX ON"}
              </button>
            </div>
          </div>

          {/* COLUMN 2: Quick Navigation & Rules */}
          <div className="flex flex-col gap-2.5">
            <div className="font-pixel text-[9px] text-[#00F0FF] font-bold uppercase tracking-wider mb-0.5">
              // QUICK NAVIGATION
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/game"
                onClick={() => SoundEngine.playClick()}
                className="p-2 rounded-lg bg-[#14141E] hover:bg-[#00FFA3] hover:text-true-black border border-white/10 hover:border-true-black font-mono-nb text-xs font-bold text-gray-300 transition-all flex items-center gap-2 group cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span className="text-[#00FFA3] group-hover:text-true-black font-display text-sm">♠</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Play 3D Arena</span>
              </Link>

              <Link
                href="/leaderboard"
                onClick={() => SoundEngine.playClick()}
                className="p-2 rounded-lg bg-[#14141E] hover:bg-ui-pink hover:text-true-black border border-white/10 hover:border-true-black font-mono-nb text-xs font-bold text-gray-300 transition-all flex items-center gap-2 group cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span className="text-ui-pink group-hover:text-true-black font-display text-sm">♥</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Leaderboard</span>
              </Link>

              <Link
                href="/about"
                onClick={() => SoundEngine.playClick()}
                className="p-2 rounded-lg bg-[#14141E] hover:bg-accent-yellow hover:text-true-black border border-white/10 hover:border-true-black font-mono-nb text-xs font-bold text-gray-300 transition-all flex items-center gap-2 group cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span className="text-accent-yellow group-hover:text-true-black font-display text-sm">♦</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Project Specs</span>
              </Link>

              <button
                onClick={handleOpenRankings}
                className="p-2 rounded-lg bg-[#14141E] hover:bg-[#00F0FF] hover:text-true-black border border-white/10 hover:border-true-black font-mono-nb text-xs font-bold text-gray-300 transition-all flex items-center gap-2 group text-left cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span className="text-[#00F0FF] group-hover:text-true-black font-display text-sm">♣</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Hand Rules</span>
              </button>
            </div>

            <button
              onClick={handleOpenVIP}
              className="p-2 rounded-lg bg-[#14141E] hover:bg-[#FFDE59] hover:text-true-black border border-white/10 hover:border-true-black font-mono-nb text-xs font-bold text-gray-300 transition-all flex items-center justify-center gap-2 group text-center cursor-pointer shadow-[2px_2px_0px_#000] mt-0.5"
            >
              <span className="text-[#FFDE59] group-hover:text-true-black font-display text-sm">👑</span>
              <span className="group-hover:translate-x-0.5 transition-transform">VIP High Roller Lounge</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. CLEAN BOTTOM BAR (WITHOUT CREATOR NAMES)              */}
        {/* ======================================================== */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono-nb text-xs text-gray-400">
          <div>
            <span>© 2026 POKERHUB ARCHIVES.</span> ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="brutal-btn px-3.5 py-1.5 bg-[#FFFB00] hover:bg-[#00FFA3] text-true-black font-display text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
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
            <span className="text-lg">✨</span>
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

      {/* Internal VIP Club Modal */}
      <VIPClubModal
        isOpen={internalVIPOpen}
        onClose={() => setInternalVIPOpen(false)}
      />

    </footer>
  )
}
