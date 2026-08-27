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
      <div className="flex items-center gap-1.5 md:gap-3 px-3 md:px-5 py-2.5 rounded-full bg-[#12141c]/80 backdrop-blur-2xl border border-[#d4af37]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        
        {/* Fan-Out Royal Flush Button */}
        <button
          onClick={handleFanToggle}
          className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            isFanMode
              ? 'bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-black shadow-[0_0_15px_rgba(212,175,55,0.6)] scale-105'
              : 'bg-white/5 hover:bg-white/15 text-gray-200'
          }`}
          title="Toggle 5-Card Royal Flush Fan"
        >
          <span className="text-base">🎴</span>
          <span className="hidden sm:inline">{isFanMode ? '1-Card View' : 'Fan Out Deck'}</span>
        </button>

        {/* Flip Card Button */}
        <button
          onClick={handleFlip}
          className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            isFlipped
              ? 'bg-[#c0392b] text-white shadow-[0_0_15px_rgba(192,57,43,0.5)]'
              : 'bg-white/5 hover:bg-white/15 text-gray-200'
          }`}
          title="Flip Card (Spacebar)"
        >
          <span className="text-base">🔄</span>
          <span className="hidden sm:inline">Flip</span>
        </button>

        {/* Toss 3D Chip Button */}
        <button
          onClick={onTossChip}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold bg-white/5 hover:bg-amber-500/20 hover:border-amber-400 text-amber-300 border border-amber-500/20 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
          title="Toss 3D Casino Chip (C)"
        >
          <span className="text-base">🪙</span>
          <span className="hidden sm:inline">Toss Chip</span>
        </button>

        {/* Holographic Shimmer Toggle */}
        <button
          onClick={handleHoloToggle}
          className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            isHolo
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
              : 'bg-white/5 hover:bg-white/15 text-gray-400'
          }`}
          title="Toggle Holographic Foil (H)"
        >
          <span className="text-base">✨</span>
          <span className="hidden sm:inline">Holo Foil</span>
        </button>

        {/* Deck Skin Switcher */}
        <button
          onClick={handleSkinChange}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold bg-white/5 hover:bg-white/15 text-gray-200 transition-all duration-300 cursor-pointer"
          title="Cycle Deck Skin"
        >
          <span className="text-base">🎨</span>
          <span className="capitalize hidden sm:inline">{deckSkin}</span>
        </button>

        {/* Suit Selector Mini-Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
          {suits.map(s => (
            <button
              key={s.key}
              onClick={() => handleSuitChange(s.key)}
              className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold transition-all cursor-pointer ${
                activeSuit === s.key ? 'bg-white/20 scale-110 ring-1 ring-[#d4af37]' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ color: s.color }}
              title={s.key}
            >
              {s.symbol}
            </button>
          ))}
        </div>

        <div className="h-5 w-[1px] bg-white/15 mx-1 hidden sm:block" />

        {/* Texas Hold'em 3D Duel Modal Button */}
        <button
          onClick={() => {
            SoundEngine.playCardSwoosh()
            onOpenDuel()
          }}
          className="flex items-center gap-2 px-3.5 md:px-5 py-2 rounded-full text-xs md:text-sm font-black bg-gradient-to-r from-[#e74c3c] to-[#c0392b] hover:from-[#ff5252] hover:to-[#d63031] text-white shadow-[0_0_20px_rgba(231,76,60,0.5)] transform hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Play 3D Poker Duel"
        >
          <span className="text-base">⚔️</span>
          <span>POKER DUEL</span>
        </button>

      </div>
    </aside>
  )
}
