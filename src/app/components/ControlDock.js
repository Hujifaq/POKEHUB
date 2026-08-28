"use client"

import React from 'react'
import { SoundEngine } from './SoundEngine'

export default function ControlDock({
  isFanMode,
  setIsFanMode,
  isFlipped,
  setIsFlipped,
  isHolo,
  setIsHolo,
  deckSkin,
  setDeckSkin,
  activeSuit,
  setActiveSuit,
  onTossChip,
  onOpenDuel,
  onOpenRankings
}) {
  const suits = [
    { key: 'hearts', symbol: '♥', color: '#e74c3c' },
    { key: 'spades', symbol: '♠', color: '#ffffff' },
    { key: 'diamonds', symbol: '♦', color: '#e74c3c' },
    { key: 'clubs', symbol: '♣', color: '#ffffff' }
  ]

  const skins = [
    { key: 'classic', label: 'Ivory Gold' },
    { key: 'obsidian', label: 'Obsidian' },
    { key: 'cyber', label: 'Cyberpunk' },
    { key: 'emerald', label: 'Emerald' }
  ]

  const handleFlip = () => {
    SoundEngine.playCardFlip()
    setIsFlipped(!isFlipped)
  }

  const handleFanToggle = () => {
    SoundEngine.playCardSwoosh()
    setIsFanMode(!isFanMode)
  }

  const handleHoloToggle = () => {
    SoundEngine.playClick()
    setIsHolo(!isHolo)
  }

  const handleSkinChange = () => {
    SoundEngine.playClick()
    const currentIdx = skins.findIndex(s => s.key === deckSkin)
    const nextSkin = skins[(currentIdx + 1) % skins.length].key
    setDeckSkin(nextSkin)
  }

  const handleSuitChange = (suitKey) => {
    SoundEngine.playClick()
    setActiveSuit(suitKey)
  }

  return (
    <aside aria-label="Poker Controls" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[900] pointer-events-auto max-w-[95vw]">
      <div className="brutal-window flex flex-col w-max">
        {/* Title Bar */}
        <div className="bg-ui-blue border-b-[4px] border-true-black px-2 py-1 flex items-center justify-between">
          <span className="font-pixel text-true-black font-bold text-[10px] uppercase">Controls.exe</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 border-[2px] border-true-black bg-white"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-3 px-3 md:px-5 py-2.5 bg-primary-base">
          
          {/* Fan-Out Button */}
          <button
            onClick={handleFanToggle}
            className={`brutal-btn flex items-center gap-1.5 px-3 md:px-4 py-2 font-display text-xs md:text-sm uppercase font-bold cursor-pointer ${
              isFanMode ? 'bg-accent-yellow text-true-black active-press' : 'bg-white text-true-black'
            }`}
            title="Toggle 5-Card Royal Flush Fan"
          >
            <span className="text-base">🎴</span>
            <span className="hidden sm:inline">{isFanMode ? '1-Card' : 'Fan Out'}</span>
          </button>

          {/* Flip Card Button */}
          <button
            onClick={handleFlip}
            className={`brutal-btn flex items-center gap-1.5 px-3 md:px-4 py-2 font-display text-xs md:text-sm uppercase font-bold cursor-pointer ${
              isFlipped ? 'bg-ui-pink text-true-black active-press' : 'bg-white text-true-black'
            }`}
            title="Flip Card (Spacebar)"
          >
            <span className="text-base">🔄</span>
            <span className="hidden sm:inline">Flip</span>
          </button>

          {/* Toss 3D Chip Button */}
          <button
            onClick={onTossChip}
            className="brutal-btn flex items-center gap-1.5 px-3 md:px-4 py-2 bg-accent-yellow text-true-black font-display text-xs md:text-sm uppercase font-bold cursor-pointer"
            title="Toss 3D Casino Chip (C)"
          >
            <span className="text-base">🪙</span>
            <span className="hidden sm:inline">Toss</span>
          </button>

          {/* Holographic Shimmer Toggle */}
          <button
            onClick={handleHoloToggle}
            className={`brutal-btn flex items-center gap-1.5 px-3 md:px-4 py-2 font-display text-xs md:text-sm uppercase font-bold cursor-pointer ${
              isHolo ? 'bg-accent-cyan text-true-black active-press' : 'bg-white text-true-black'
            }`}
            title="Toggle Holographic Foil (H)"
          >
            <span className="text-base">✨</span>
            <span className="hidden sm:inline">Holo</span>
          </button>

          {/* Deck Skin Switcher */}
          <button
            onClick={handleSkinChange}
            className="brutal-btn flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white text-true-black font-display text-xs md:text-sm uppercase font-bold cursor-pointer"
            title="Cycle Deck Skin"
          >
            <span className="text-base">🎨</span>
            <span className="hidden sm:inline">{deckSkin}</span>
          </button>

          {/* Suit Selector Mini-Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-white border-[4px] border-true-black p-1 brutal-shadow-sm">
            {suits.map(s => (
              <button
                key={s.key}
                onClick={() => handleSuitChange(s.key)}
                className={`w-7 h-7 text-xs flex items-center justify-center font-bold border-[2px] border-true-black cursor-pointer ${
                  activeSuit === s.key ? 'bg-accent-yellow' : 'bg-white'
                }`}
                style={{ color: activeSuit === s.key ? 'var(--true-black)' : s.color }}
                title={s.key}
              >
                {s.symbol}
              </button>
            ))}
          </div>

          <div className="h-6 w-[4px] bg-true-black mx-1 hidden sm:block" />

          {/* Texas Hold'em 3D Duel Modal Button */}
          <button
            onClick={() => {
              SoundEngine.playCardSwoosh()
              onOpenDuel()
            }}
            className="brutal-btn flex items-center gap-2 px-3.5 md:px-5 py-2 bg-ui-pink text-true-black font-display text-xs md:text-sm uppercase font-black cursor-pointer"
            title="Play 3D Poker Duel"
          >
            <span className="text-base">⚔️</span>
            <span>DUEL</span>
          </button>

        </div>
      </div>
    </aside>
  )
}
