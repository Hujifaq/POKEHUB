"use client"

import React, { useState } from 'react'
import { SoundEngine } from './SoundEngine'

export default function ControlDock({
  isFanMode,
  setIsFanMode,
  isFlipped,
  setIsFlipped,
  deckSkin,
  setDeckSkin,
  activeSuit,
  setActiveSuit,
  onTossChip,
  onOpenDuel,
  onOpenRankings
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const suits = [
    { key: 'hearts', symbol: '♥', color: '#e74c3c' },
    { key: 'spades', symbol: '♠', color: '#ffffff' },
    { key: 'diamonds', symbol: '♦', color: '#e74c3c' },
    { key: 'clubs', symbol: '♣', color: '#ffffff' }
  ]

  const skins = [
    { key: 'obsidian', label: 'Obsidian', icon: '🔮' },
    { key: 'gold', label: 'Ivory Gold', icon: '👑' },
    { key: 'cyber', label: 'Cyberpunk', icon: '⚡' },
    { key: 'emerald', label: 'Emerald', icon: '💎' },
    { key: 'sakura', label: 'Sakura', icon: '🌸' },
    { key: 'retro', label: 'Retro 8-Bit', icon: '🎴' }
  ]

  const toggleExpand = () => {
    SoundEngine.playClick()
    setIsExpanded(prev => !prev)
  }

  const handleFlip = () => {
    SoundEngine.playCardFlip()
    setIsFlipped(!isFlipped)
  }

  const handleFanToggle = () => {
    SoundEngine.playCardSwoosh()
    setIsFanMode(!isFanMode)
  }

  const handleSkinChange = () => {
    const currentIdx = skins.findIndex(s => s.key === deckSkin)
    const nextSkin = skins[(currentIdx + 1) % skins.length].key
    setDeckSkin(nextSkin)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', nextSkin)
    }
  }

  const handleSuitChange = (suitKey) => {
    SoundEngine.playClick()
    setActiveSuit(suitKey)
  }

  const activeSkinObj = skins.find(s => s.key === deckSkin) || skins[0]

  return (
    <aside aria-label="Poker Controls" className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-[900] pointer-events-auto max-w-[96vw]">
      <div className="brutal-window flex flex-col w-max max-w-[96vw] transition-all duration-200 shadow-[3px_3px_0px_#000]">
        {/* Title Bar / Expand-Collapse Tab */}
        <div
          onClick={toggleExpand}
          className={`bg-ui-blue px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between gap-2 sm:gap-3 cursor-pointer select-none hover:bg-[#8ec7ff] transition-colors ${
            isExpanded ? 'border-b-[3px] sm:border-b-[4px] border-true-black' : ''
          }`}
          title={isExpanded ? "Collapse Controls (Click)" : "Expand Controls (Click)"}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-true-black animate-pulse" />
            <span className="font-pixel text-true-black font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              Controls.exe
            </span>
            <span className="font-pixel text-[7px] sm:text-[8px] bg-white border-[1.5px] border-true-black px-1 py-0.2 font-bold text-true-black">
              {isExpanded ? 'OPEN' : 'MIN'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 border-[1.5px] border-true-black bg-white flex items-center justify-center font-pixel text-[8px] font-bold shadow-[1px_1px_0px_#050505]"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? '▼' : '▲'}
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 px-2 sm:px-4 py-2 bg-primary-base animate-fadeIn overflow-x-auto max-w-[94vw] no-scrollbar">
            
            {/* Fan-Out Button */}
            <button
              onClick={handleFanToggle}
              className={`brutal-btn flex items-center gap-1 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 font-display text-[11px] sm:text-xs md:text-sm uppercase font-bold cursor-pointer shrink-0 shadow-[2px_2px_0px_#000] ${
                isFanMode ? 'bg-accent-yellow text-true-black active-press' : 'bg-white text-true-black'
              }`}
              title="Toggle 5-Card Royal Flush Fan"
            >
              <span className="text-sm sm:text-base">🎴</span>
              <span className="hidden xs:inline sm:inline">{isFanMode ? '1-Card' : 'Fan Out'}</span>
            </button>

            {/* Flip Card Button */}
            <button
              onClick={handleFlip}
              className={`brutal-btn flex items-center gap-1 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 font-display text-[11px] sm:text-xs md:text-sm uppercase font-bold cursor-pointer shrink-0 shadow-[2px_2px_0px_#000] ${
                isFlipped ? 'bg-ui-pink text-true-black active-press' : 'bg-white text-true-black'
              }`}
              title="Flip Card (Spacebar)"
            >
              <span className="text-sm sm:text-base">🔄</span>
              <span className="hidden xs:inline sm:inline">Flip</span>
            </button>

            {/* Toss 3D Chip Button */}
            <button
              onClick={onTossChip}
              className="brutal-btn flex items-center gap-1 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-accent-yellow text-true-black font-display text-[11px] sm:text-xs md:text-sm uppercase font-bold cursor-pointer shrink-0 shadow-[2px_2px_0px_#000]"
              title="Toss 3D Casino Chip (C)"
            >
              <span className="text-sm sm:text-base">🪙</span>
              <span className="hidden xs:inline sm:inline">Toss</span>
            </button>

            {/* Deck Skin Switcher */}
            <button
              onClick={handleSkinChange}
              className="brutal-btn flex items-center gap-1.5 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white hover:bg-[#FFE500] text-true-black font-display text-[11px] sm:text-xs md:text-sm uppercase font-bold cursor-pointer shrink-0 shadow-[2px_2px_0px_#000] transition-colors"
              title="Cycle Deck Skin"
            >
              <span className="text-sm sm:text-base">{activeSkinObj.icon}</span>
              <span className="hidden xs:inline sm:inline">{activeSkinObj.label}</span>
            </button>

            {/* Suit Selector Mini-Pills */}
            <div className="hidden lg:flex items-center gap-1 bg-white border-[3px] border-true-black p-0.5 brutal-shadow-sm shrink-0">
              {suits.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSuitChange(s.key)}
                  className={`w-6 h-6 text-[10px] flex items-center justify-center font-bold border-[1.5px] border-true-black cursor-pointer ${
                    activeSuit === s.key ? 'bg-accent-yellow' : 'bg-white'
                  }`}
                  style={{ color: activeSuit === s.key ? 'var(--true-black)' : s.color }}
                  title={s.key}
                >
                  {s.symbol}
                </button>
              ))}
            </div>

            <div className="h-5 w-[2px] bg-true-black mx-0.5 hidden sm:block shrink-0" />

            {/* Texas Hold'em 3D Duel Modal Button */}
            <button
              onClick={() => {
                SoundEngine.playCardSwoosh()
                onOpenDuel()
              }}
              className="brutal-btn flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 bg-ui-pink text-true-black font-display text-[11px] sm:text-xs md:text-sm uppercase font-black cursor-pointer shrink-0 shadow-[2px_2px_0px_#000]"
              title="Play 3D Poker Duel"
            >
              <span className="text-sm sm:text-base">⚔️</span>
              <span>DUEL</span>
            </button>

          </div>
        )}
      </div>
    </aside>
  )
}

