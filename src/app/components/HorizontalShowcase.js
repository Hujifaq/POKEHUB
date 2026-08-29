"use client"

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const SHOWCASE_EDITIONS = [
  {
    id: '01',
    name: 'OBSIDIAN FOIL',
    subtitle: 'THE MIDNIGHT ACE OF SPADES',
    tag: 'MYTHIC CLASS',
    bgGradient: 'from-[#121420] via-[#1a1c2b] to-[#0d0e17]',
    accentColor: '#b388ff',
    borderColor: '#050505',
    pillBg: 'bg-accent-cyan',
    rotation: '-rotate-[4deg]',
    cardSuit: '♠',
    cardRank: 'A',
    cardSkin: 'obsidian',
    badgeText: 'BLACK CHROME FOIL',
    stats: { rarity: '0.1% DROP', chips: '$10,000 CHIP', finish: 'VAPOR DEPOSITED' },
    chipColor: 'bg-[#181824] text-[#b388ff] border-[#b388ff]',
    decorTokens: ['♠', '★', '💎', '🪙']
  },
  {
    id: '02',
    name: 'IVORY GOLD',
    subtitle: '24K ROYAL KING OF HEARTS',
    tag: 'VIP HIGH ROLLER',
    bgGradient: 'from-[#fbf5e8] via-[#f3e7cb] to-[#e8d5af]',
    accentColor: '#d4af37',
    borderColor: '#050505',
    pillBg: 'bg-accent-yellow',
    rotation: 'rotate-[5deg]',
    cardSuit: '♥',
    cardRank: 'K',
    cardSkin: 'classic',
    badgeText: '24K MIRROR FINISH',
    stats: { rarity: 'ROYAL TIED', chips: '$25,000 CHIP', finish: 'HAND-ENGRAVED' },
    chipColor: 'bg-[#ffd700] text-[#050505] border-true-black',
    decorTokens: ['♥', '👑', '✨', '⚜️']
  },
  {
    id: '03',
    name: 'CYBER NEON',
    subtitle: 'HOLOGRAPHIC QUEEN OF DIAMONDS',
    tag: 'SYNTHWAVE 2099',
    bgGradient: 'from-[#081a2e] via-[#0f2d4a] to-[#1e0d2d]',
    accentColor: '#00f0ff',
    borderColor: '#050505',
    pillBg: 'bg-ui-pink',
    rotation: '-rotate-[3deg]',
    cardSuit: '♦',
    cardRank: 'Q',
    cardSkin: 'cyber',
    badgeText: 'PRISM GLITCH FOIL',
    stats: { rarity: 'CYBER VAULT', chips: '$5,000 CHIP', finish: 'LASER DIFFRACTION' },
    chipColor: 'bg-[#00f0ff] text-[#050505] border-true-black',
    decorTokens: ['♦', '⚡', '💾', '🎲']
  },
  {
    id: '04',
    name: 'EMERALD SUITE',
    subtitle: 'CASINO FELT JACK OF CLUBS',
    tag: 'MONTE CARLO',
    bgGradient: 'from-[#0a2717] via-[#0f3d23] to-[#06180e]',
    accentColor: '#2ecc71',
    borderColor: '#050505',
    pillBg: 'bg-accent-yellow',
    rotation: 'rotate-[6deg]',
    cardSuit: '♣',
    cardRank: 'J',
    cardSkin: 'emerald',
    badgeText: 'BAIZE FELT WEAVE',
    stats: { rarity: 'DEALER EXCLUSIVE', chips: '$50,000 CHIP', finish: 'WATERPROOF PVC' },
    chipColor: 'bg-[#2ecc71] text-[#050505] border-true-black',
    decorTokens: ['♣', '🍀', '🎲', '🪙']
  },
  {
    id: '05',
    name: 'SAKURA RUBY',
    subtitle: 'ARCADE ACE OF HEARTS',
    tag: 'AKIHABARA SPECIAL',
    bgGradient: 'from-[#ffe0ea] via-[#ffb8ce] to-[#ffa6c9]',
    accentColor: '#e74c3c',
    borderColor: '#050505',
    pillBg: 'bg-accent-cyan',
    rotation: '-rotate-[5deg]',
    cardSuit: '♥',
    cardRank: 'A',
    cardSkin: 'sakura',
    badgeText: 'CHERRY FOIL EMBOSS',
    stats: { rarity: 'LIMITED 1/100', chips: '$1,000 CHIP', finish: 'VELVET SOFT-TOUCH' },
    chipColor: 'bg-[#ffa6c9] text-[#050505] border-true-black',
    decorTokens: ['♥', '🌸', '✨', '🍒']
  },
  {
    id: '06',
    name: 'RETRO 8-BIT',
    subtitle: 'PIXEL ARCADE JOKER WILD',
    tag: 'GENESIS EDITION',
    bgGradient: 'from-[#fff4a3] via-[#ffdf6d] to-[#ffbe3b]',
    accentColor: '#ff6b00',
    borderColor: '#050505',
    pillBg: 'bg-ui-blue',
    rotation: 'rotate-[4deg]',
    cardSuit: '★',
    cardRank: '777',
    cardSkin: 'retro',
    badgeText: 'CRT SCANLINE PHOSPHOR',
    stats: { rarity: 'SECRET UNLOCK', chips: '$100,000 CHIP', finish: 'CHIP TUNE AUDIO' },
    chipColor: 'bg-[#ff6b00] text-white border-true-black',
    decorTokens: ['★', '🕹️', '🪙', '⭐']
  }
]

// Single Interactive Showcase Card Frame with Smooth Mouse-Tracking 3D Tilt
function InteractiveShowcaseCard({ item, onSelectDeck }) {
  const cardFrameRef = useRef(null)
  const cardBodyRef = useRef(null)
  const chipRef = useRef(null)
  const token1Ref = useRef(null)
  const token2Ref = useRef(null)
  const watermarkRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardFrameRef.current) return
    const rect = cardFrameRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5

    // Smooth mouse tracking on central card with 3D tilt
    if (cardBodyRef.current) {
      gsap.to(cardBodyRef.current, {
        x: px * 36,
        y: py * 28,
        rotationY: px * 24,
        rotationX: -py * 24,
        rotationZ: px * 5,
        transformPerspective: 1000,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // Floating chip tracks with dynamic counter-motion
    if (chipRef.current) {
      gsap.to(chipRef.current, {
        x: -px * 48,
        y: -py * 38,
        rotation: px * 35,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // Floating tokens track mouse at varying depths
    if (token1Ref.current) {
      gsap.to(token1Ref.current, {
        x: px * 22,
        y: py * 18,
        rotation: -px * 25,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (token2Ref.current) {
      gsap.to(token2Ref.current, {
        x: px * 28,
        y: py * 22,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: px * 16,
        y: py * 12,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }
  }

  const handleMouseLeave = () => {
    // Smoothly spring back to rest position on mouse leave
    if (cardBodyRef.current) {
      gsap.to(cardBodyRef.current, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.7,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      })
    }

    if (chipRef.current) {
      gsap.to(chipRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      })
    }

    if (token1Ref.current) {
      gsap.to(token1Ref.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (token2Ref.current) {
      gsap.to(token2Ref.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }
  }

  return (
    <div
      ref={cardFrameRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-[85vw] sm:w-[520px] md:w-[580px] lg:w-[640px] h-[520px] sm:h-[580px] md:h-[620px] shrink-0 relative flex flex-col justify-between p-6 sm:p-8 rounded-[32px] border-[4px] border-true-black shadow-[10px_10px_0px_#050505] overflow-hidden bg-gradient-to-br ${item.bgGradient} ${item.rotation} transition-transform duration-300 hover:scale-[1.01]`}
      style={{ perspective: 1200 }}
    >
      {/* Background Watermark Number */}
      <div
        ref={watermarkRef}
        className="absolute -bottom-10 -right-6 font-display text-[180px] sm:text-[240px] font-black text-black/10 select-none pointer-events-none leading-none z-0 will-change-transform"
      >
        {item.id}
      </div>

      {/* Faint Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(#000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Frame Top Header */}
      <div className="relative z-10 flex items-start justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] font-bold px-2 py-0.5 bg-white border-[2px] border-true-black brutal-shadow-sm text-true-black">
              EDITION {item.id}/06
            </span>
            <span
              className={`font-pixel text-[9px] font-bold px-2 py-0.5 ${item.pillBg} border-[2px] border-true-black brutal-shadow-sm text-true-black uppercase`}
            >
              {item.tag}
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[2px_2px_0px_#050505] tracking-tight">
            {item.name}
          </h3>
          <p className="font-pixel text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider mt-0.5">
            {item.subtitle}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full border-[3px] border-true-black bg-white flex items-center justify-center font-display text-lg font-black brutal-shadow-sm text-true-black">
          {item.cardSuit}
        </div>
      </div>

      {/* Frame Center: Focal 3D Card Artwork with Smooth Mouse Tracking */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2 pointer-events-none">
        
        {/* Background Floating Token 1 */}
        <div
          ref={token1Ref}
          className="absolute top-2 left-6 text-3xl sm:text-4xl drop-shadow-[2px_2px_0px_#000] select-none will-change-transform"
        >
          {item.decorTokens[1]}
        </div>

        {/* Background Floating Token 2 */}
        <div
          ref={token2Ref}
          className="absolute bottom-8 right-10 text-2xl sm:text-3xl drop-shadow-[2px_2px_0px_#000] select-none will-change-transform"
        >
          {item.decorTokens[3]}
        </div>

        {/* Main Focal Card Container (Smoothly tracks mouse with 3D rotation) */}
        <div
          ref={cardBodyRef}
          className="relative w-[200px] sm:w-[230px] md:w-[260px] h-[290px] sm:h-[330px] md:h-[370px] rounded-2xl border-[4px] border-true-black bg-[#ffffff] shadow-[8px_8px_0px_#050505] p-3 flex flex-col justify-between overflow-hidden will-change-transform"
        >
          {/* Holographic Sheen Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none opacity-60" />

          {/* Card Corner Top-Left */}
          <div className="flex flex-col items-center leading-none z-10">
            <span className="font-pixel text-xl sm:text-2xl font-black text-true-black">
              {item.cardRank}
            </span>
            <span
              className="text-lg sm:text-xl"
              style={{ color: ['♥', '♦'].includes(item.cardSuit) ? '#e74c3c' : '#050505' }}
            >
              {item.cardSuit}
            </span>
          </div>

          {/* Card Centerpiece Seal */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div
              className="w-20 sm:w-24 h-20 sm:h-24 rounded-full border-[3px] border-true-black flex items-center justify-center text-4xl sm:text-5xl brutal-shadow-sm"
              style={{ backgroundColor: item.accentColor }}
            >
              {item.cardSuit}
            </div>
            <span className="font-pixel text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-true-black mt-2 bg-accent-yellow border-[2px] border-true-black px-1.5 py-0.5">
              {item.badgeText}
            </span>
          </div>

          {/* Card Corner Bottom-Right */}
          <div className="flex flex-col items-center leading-none self-end rotate-180 z-10">
            <span className="font-pixel text-xl sm:text-2xl font-black text-true-black">
              {item.cardRank}
            </span>
            <span
              className="text-lg sm:text-xl"
              style={{ color: ['♥', '♦'].includes(item.cardSuit) ? '#e74c3c' : '#050505' }}
            >
              {item.cardSuit}
            </span>
          </div>
        </div>

        {/* Foreground Floating Casino Chip */}
        <div
          ref={chipRef}
          className={`absolute -bottom-3 -left-4 sm:-left-6 w-16 sm:w-20 h-16 sm:h-20 rounded-full border-[3px] border-true-black ${item.chipColor} flex flex-col items-center justify-center font-pixel text-[7px] sm:text-[8px] font-black shadow-[4px_4px_0px_#050505] z-20 will-change-transform`}
        >
          <span>{item.stats.chips.split(' ')[0]}</span>
          <span className="text-[6px]">CHIP</span>
        </div>

        {/* Foreground Floating Token 2 */}
        <div className="absolute -top-4 -right-2 sm:-right-4 text-4xl sm:text-5xl drop-shadow-[4px_4px_0px_#000] z-20 select-none">
          {item.decorTokens[0]}
        </div>
      </div>

      {/* Frame Bottom Bar: Stats and Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t-[3px] border-black/20">
        <div className="flex items-center gap-2 text-white">
          <span className="font-pixel text-[8px] sm:text-[9px] bg-black/40 border border-white/20 px-2 py-1 rounded">
            {item.stats.rarity}
          </span>
          <span className="font-pixel text-[8px] sm:text-[9px] bg-black/40 border border-white/20 px-2 py-1 rounded hidden sm:inline">
            {item.stats.finish}
          </span>
        </div>

        <button
          onClick={() => {
            SoundEngine.playCardFlip()
            if (onSelectDeck) onSelectDeck(item.cardSkin)
          }}
          className="brutal-btn bg-white hover:bg-accent-yellow text-true-black px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ml-auto"
          title={`Equip ${item.name} skin`}
        >
          <span>🎴</span>
          <span>EQUIP DECK</span>
        </button>
      </div>
    </div>
  )
}

export default function HorizontalShowcase({ onSelectDeck, onOpenDuel, containerRefProp }) {
  const localContainerRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const trackRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      const container = containerRef.current
      const pinWrapper = pinWrapperRef.current
      if (!track || !container || !pinWrapper) return

      // Calculate total horizontal scroll distance
      const getScrollDistance = () => track.scrollWidth - window.innerWidth

      // Main pinned horizontal scroll tween
      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden select-none z-30 rounded-t-[36px] sm:rounded-t-[48px] md:rounded-t-[60px] border-t-[4px] border-true-black bg-transparent"
      >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex items-center h-full w-max px-8 md:px-20 gap-10 md:gap-16 will-change-transform"
      >
        {/* SLIDE 1: Hero Typography Headline (Styled after attached prototype) */}
        <div className="w-[88vw] sm:w-[620px] lg:w-[680px] shrink-0 flex flex-col justify-center pr-4">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan border-[3px] border-true-black brutal-shadow-sm w-max mb-6">
            <span className="text-xs">🎴</span>
            <span className="font-pixel text-[10px] sm:text-xs font-black uppercase text-true-black">
              POKERHUB VAULT
            </span>
          </div>

          {/* Main Huge Punchy Title */}
          <div className="font-display tracking-tight text-true-black leading-[0.95]">
            <span className="block text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-[4px_4px_0px_#ffa6c9]">
              WE HAVE 6
            </span>

            {/* FREAKING Boxed Highlight Badge */}
            <div className="my-2 sm:my-3 inline-block transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="bg-accent-yellow border-[4px] border-true-black px-4 sm:px-6 py-1.5 sm:py-2 brutal-shadow">
                <span className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-true-black tracking-tight">
                  FREAKING
                </span>
              </div>
            </div>

            <span className="block text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-[4px_4px_0px_#a6d8ff]">
              ELITE DECKS
            </span>
          </div>

          {/* Subtitle description */}
          <p className="font-pixel text-xs sm:text-sm text-gray-700 mt-6 leading-relaxed max-w-lg">
            (COLLECTIBLE HIGH-ROLLER ARCHIVES, HOLOGRAPHIC FOILS &amp; PROCEDURAL 3D FINISHES)
          </p>

          {/* Action Button & Scroll Indicator */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                SoundEngine.playClick()
                if (onOpenDuel) onOpenDuel()
              }}
              className="brutal-btn bg-ui-pink hover:bg-[#ff8cb8] text-true-black px-6 py-3 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer flex items-center gap-2"
            >
              <span>⚔️</span>
              <span>PLAY 3D DUEL</span>
            </button>

            <div className="brutal-window px-4 py-2.5 bg-white flex items-center gap-2">
              <span className="font-pixel text-[9px] sm:text-[10px] font-bold text-true-black animate-pulse">
                SCROLL RIGHT ►
              </span>
            </div>
          </div>
        </div>

        {/* SLIDES 2 to 7: The 6 Tilted Product Showcase Frames with Smooth Mouse-Tracking Tilt */}
        {SHOWCASE_EDITIONS.map((item) => (
          <InteractiveShowcaseCard
            key={item.id}
            item={item}
            onSelectDeck={onSelectDeck}
          />
        ))}

        {/* SLIDE 8: Outro Call-To-Action Finale Frame */}
        <div className="w-[85vw] sm:w-[480px] h-[520px] sm:h-[580px] md:h-[620px] shrink-0 relative flex flex-col justify-between p-8 rounded-[32px] border-[4px] border-true-black shadow-[10px_10px_0px_#050505] bg-gradient-to-br from-[#ffa6c9] via-[#ffbed3] to-[#a6d8ff] -rotate-[2deg]">
          
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[10px] font-black uppercase px-2 py-1 bg-white border-[2px] border-true-black brutal-shadow-sm text-true-black">
              GAME READY
            </span>
            <span className="text-3xl">🎰</span>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-4xl sm:text-5xl font-black text-true-black leading-tight">
              TEST YOUR HAND IN 3D
            </h3>
            <p className="font-pixel text-xs text-true-black/90 leading-relaxed">
              Step into the high-roller table. Challenge dealer AI, double down on your bankroll, and climb the royal flush rankings.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                SoundEngine.playCardSwoosh()
                if (onOpenDuel) onOpenDuel()
              }}
              className="brutal-btn w-full py-4 bg-accent-yellow text-true-black font-display text-base font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⚔️</span>
              <span>START TEXAS HOLD'EM</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="brutal-btn w-full py-2.5 bg-white text-true-black font-pixel text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>▲</span>
              <span>BACK TO 3D ARENA</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  </div>
  )
}

