"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import BubbleMenu from '../components/BubbleMenu'
import Floating3DLogo from '../components/Floating3DLogo'
import Preloader from '../components/Preloader'
import { PixelAvatar } from '../components/PixelAvatars'
import Footer from '../components/Footer'
import { SoundEngine } from '../components/SoundEngine'

const TEAM_MEMBERS = [
  {
    id: 'anda',
    name: 'ANDA',
    fullName: 'Anda',
    role: 'Lead Architect & Engine Specialist',
    university: 'KMUTT',
    faculty: 'Computer Science & Technology',
    avatarKey: 'hero',
    cardColor: 'bg-[#00FFA3]',
    accentColor: '#00FFA3',
    stats: { 'Poker IQ': 96, 'Luck': 88 },
    bio: 'Architecting high-performance Texas Hold\'em engine mechanics and real-time state machines.',
    tag: 'CORE ARCHITECT'
  },
  {
    id: 'hut',
    name: 'HUT',
    fullName: 'Hut',
    role: '3D Graphics & Shader Engineer',
    university: 'KMUTT',
    faculty: 'Interactive Media & Simulation',
    avatarKey: 'samurai',
    cardColor: 'bg-[#FF70A6]',
    accentColor: '#FF70A6',
    stats: { 'Poker IQ': 91, 'Luck': 95 },
    bio: 'Crafting procedural 3D card physics, lighting atmosphere, and spatial canvas interactions.',
    tag: '3D ENGINE'
  },
  {
    id: 'gram',
    name: 'GRAM',
    fullName: 'Gram',
    role: 'UI/UX & Neo-Brutalist Designer',
    university: 'KMUTT',
    faculty: 'Digital Design & Experience',
    avatarKey: 'cyborg',
    cardColor: 'bg-[#FFE500]',
    accentColor: '#FFE500',
    stats: { 'Poker IQ': 94, 'Luck': 92 },
    bio: 'Designing high-contrast typography, 8-bit visual assets, and arcade-grade user experiences.',
    tag: 'LEAD DESIGNER'
  },
  {
    id: 'p',
    name: 'P',
    fullName: 'P',
    role: 'AI Logic & Game Systems Engineer',
    university: 'KMUTT',
    faculty: 'Software Engineering & AI Systems',
    avatarKey: 'punk',
    cardColor: 'bg-[#00F5FF]',
    accentColor: '#00F5FF',
    stats: { 'Poker IQ': 98, 'Luck': 85 },
    bio: 'Building intelligent bot decision trees, side-pot calculations, and shot-clock timing flow.',
    tag: 'AI SPECIALIST'
  }
]

export default function AboutPage() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [])

  const handleToggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    SoundEngine.setMuted(next)
    if (!next) SoundEngine.playClick()
  }

  const bubbleMenuItems = useMemo(() => [
    {
      label: 'home',
      ariaLabel: 'Back to Home Showcase',
      rotation: -4,
      hoverStyles: { bgColor: '#FFDE59', textColor: '#000000' },
      onClick: () => {
        window.location.href = '/'
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
        window.location.href = '/#deck-skins'
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
        window.location.href = '/#how-to-play'
      }
    }
  ], [])

  return (
    <main className="w-full relative min-h-screen text-true-black overflow-x-hidden bg-[#F6F5FA] font-display pt-24 pb-0">
      {/* Infinite Seamless Fixed Graph Grid */}
      <div className="fixed-graph-grid opacity-20" />

      {/* Intro Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Navigation Navbar */}
      <BubbleMenu
        logo={
          <Floating3DLogo
            onClick={() => {
              window.location.href = '/'
            }}
          />
        }
        actions={
          <>
            <button
              onClick={handleToggleMute}
              className={`brutal-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 font-pixel text-[9px] sm:text-[10px] uppercase font-bold transition-all shrink-0 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] ${
                !isMuted ? 'bg-accent-cyan text-true-black' : 'bg-white text-gray-500'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              <span>{isMuted ? 'MUTED' : 'SFX: ON'}</span>
            </button>

            <Link
              href="/game"
              className="brutal-btn bg-[#00FFA3] text-true-black flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 font-display text-xs font-black uppercase hover:bg-[#00e693] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] shrink-0"
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
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        items={bubbleMenuItems}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col gap-10 sm:gap-14 relative z-10 pb-16">

        {/* ======================================================== */}
        {/* HERO TITLE & UNIVERSITY BANNER                           */}
        {/* ======================================================== */}
        <section className="flex flex-col items-center text-center gap-3 sm:gap-4 mt-6">
          
          {/* KMUTT Pride Badge */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] border-[2.5px] sm:border-[3px] border-[#0D0D0D] px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-[3px_3px_0px_#0D0D0D] -rotate-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] border border-black" />
            <span className="font-pixel text-[8.5px] sm:text-xs font-bold text-[#0D0D0D] uppercase tracking-wider">
              KMUTT CREATIVE CREW • KING MONGKUT&apos;S UNIVERSITY OF TECHNOLOGY THONBURI
            </span>
          </div>

          {/* Main Headline */}
          <div className="bg-[#FFE500] border-[3.5px] sm:border-[5px] border-[#0D0D0D] px-6 sm:px-12 py-3 sm:py-5 shadow-[6px_6px_0px_#0D0D0D] sm:shadow-[10px_10px_0px_#0D0D0D] rotate-1">
            <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black text-[#0D0D0D] uppercase tracking-tight">
              MEET THE DEVS
            </h1>
          </div>

          <p className="font-mono-nb text-xs sm:text-base font-bold text-gray-700 max-w-2xl mt-1">
            We are a team of 4 creators from <span className="text-[#0D0D0D] font-black underline decoration-[#FF70A6] decoration-4">KMUTT</span> crafting next-generation 3D interactive web experiences, procedural card physics, and intelligent game architectures.
          </p>
        </section>

        {/* ======================================================== */}
        {/* 4 DEVELOPER ROSTER CARDS                                */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.id}
              className={`border-[3px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[5px_5px_0px_#0D0D0D] sm:shadow-[7px_7px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_#0D0D0D] ${member.cardColor}`}
            >
              <div>
                {/* Card Header: Tag & Number */}
                <div className="flex items-center justify-between border-b-[2.5px] border-[#0D0D0D] pb-3 mb-4">
                  <span className="font-pixel text-[8px] sm:text-[9px] font-black px-2 py-0.5 bg-[#0D0D0D] text-[#FFE500] rounded">
                    {member.tag}
                  </span>
                  <span className="font-display font-black text-sm text-[#0D0D0D]">
                    0{idx + 1}
                  </span>
                </div>

                {/* 8-Bit Pixel Character Avatar Container */}
                <div className="w-full aspect-square bg-[#FFFFFF] border-[3px] border-[#0D0D0D] rounded-xl sm:rounded-2xl flex items-center justify-center p-3 shadow-[3px_3px_0px_#0D0D0D] mb-4 overflow-hidden relative group">
                  <PixelAvatar
                    avatarKey={member.avatarKey}
                    size={3.8}
                    className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  />
                  {/* University Badge overlay */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#FFE500] border-[1.5px] border-[#0D0D0D] font-pixel text-[7px] font-black shadow-[1px_1px_0px_#0D0D0D]">
                    KMUTT
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[#0D0D0D] uppercase tracking-tight">
                  {member.name}
                </h3>
                <div className="font-mono-nb text-[11px] sm:text-xs font-black text-[#0D0D0D] mt-0.5 mb-2">
                  {member.role}
                </div>

                {/* Bio */}
                <p className="font-mono-nb text-[10px] sm:text-[11px] text-gray-900 font-bold leading-relaxed bg-[#FFFFFF]/75 border-[1.5px] border-[#0D0D0D] p-2.5 rounded-lg mb-3">
                  {member.bio}
                </p>
              </div>

              {/* Character Stats Meters (Poker IQ & Luck) */}
              <div className="mt-2 pt-3 border-t-[2px] border-[#0D0D0D] flex flex-col gap-2 bg-[#FFFFFF]/90 p-3 rounded-xl border-[1.5px] shadow-[2px_2px_0px_#0D0D0D]">
                {Object.entries(member.stats).map(([statName, statVal]) => {
                  const isLuck = statName.toLowerCase().includes('luck')
                  const barColor = isLuck ? '#FFE500' : '#00F5FF'
                  return (
                    <div key={statName} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[8.5px] sm:text-[9.5px] font-pixel font-black text-[#0D0D0D]">
                        <span className="flex items-center gap-1">
                          <span>{isLuck ? '⚡' : '★'}</span>
                          <span>{statName}</span>
                        </span>
                        <span className="font-mono-nb font-black text-[10px]">{statVal}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0D0D0D] rounded-full p-0.5 overflow-hidden border border-black">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${statVal}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 6px ${barColor}`
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </section>

        {/* ======================================================== */}
        {/* MISSION & TECH STACK SECTION                             */}
        {/* ======================================================== */}
        <section className="bg-[#FFFFFF] border-[3.5px] sm:border-[4px] border-[#0D0D0D] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#0D0D0D] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-[#0D0D0D] pb-4">
            <div>
              <h2 className="font-display text-xl sm:text-3xl font-black text-[#0D0D0D] uppercase">
                THE POKEHUB ARCHITECTURE
              </h2>
              <p className="font-mono-nb text-xs text-gray-700 font-bold">
                Built by KMUTT engineers using bleeding-edge web technologies
              </p>
            </div>
            <Link
              href="/game"
              className="brutal-btn px-6 py-2.5 bg-[#FFE500] hover:bg-[#00FFA3] text-[#0D0D0D] border-[2.5px] border-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0px_#0D0D0D] self-start sm:self-auto"
            >
              LAUNCH GAME ARENA →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border-[2px] border-[#0D0D0D] bg-[#F6F5FA] shadow-[3px_3px_0px_#0D0D0D]">
              <div className="font-pixel text-[9px] font-black text-[#00FFA3] bg-[#0D0D0D] px-2 py-0.5 rounded inline-block mb-2">
                ENGINE
              </div>
              <h4 className="font-display text-base font-black text-[#0D0D0D] uppercase">WSOP Poker Engine</h4>
              <p className="font-mono-nb text-xs text-gray-700 font-bold mt-1">
                Deterministic turn order (UTG to Button), blind rotation, multi-way side pots, and 7-card evaluators.
              </p>
            </div>

            <div className="p-4 rounded-xl border-[2px] border-[#0D0D0D] bg-[#F6F5FA] shadow-[3px_3px_0px_#0D0D0D]">
              <div className="font-pixel text-[9px] font-black text-[#FF70A6] bg-[#0D0D0D] px-2 py-0.5 rounded inline-block mb-2">
                GRAPHICS
              </div>
              <h4 className="font-display text-base font-black text-[#0D0D0D] uppercase">Three.js & Canvas 3D</h4>
              <p className="font-mono-nb text-xs text-gray-700 font-bold mt-1">
                Spatial lighting, tactile felt ambience, 6 custom shader card decks, and chip projectile physics.
              </p>
            </div>

            <div className="p-4 rounded-xl border-[2px] border-[#0D0D0D] bg-[#F6F5FA] shadow-[3px_3px_0px_#0D0D0D]">
              <div className="font-pixel text-[9px] font-black text-[#FFE500] bg-[#0D0D0D] px-2 py-0.5 rounded inline-block mb-2">
                DESIGN
              </div>
              <h4 className="font-display text-base font-black text-[#0D0D0D] uppercase">Neo-Brutalist Arcade</h4>
              <p className="font-mono-nb text-xs text-gray-700 font-bold mt-1">
                High-contrast typography, box drop-shadows, 8-bit pixel avatars, and tactile audio synthesis.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* ======================================================== */}
      {/* FOOTER                                                   */}
      {/* ======================================================== */}
      <Footer className="mt-20" />

    </main>
  )
}
