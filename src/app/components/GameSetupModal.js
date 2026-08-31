"use client"

import React, { useState, useEffect } from 'react'
import { SoundEngine } from './SoundEngine'
import { DECK_SKIN_THEMES } from './PixelDeckAssets'

const TABLE_MAPS = [
  {
    id: 'macau_nlh_500',
    name: 'MACAU HIGH STAKES',
    location: 'Macau, SAR',
    stakes: '250-500',
    minBuyIn: 5000,
    icon: '♠',
    badgeColor: '#FFE500',
    feltTheme: 'Macau Emerald Noir',
    description: 'High-stakes VIP baccarat & poker salon with 14g ceramic chips.'
  },
  {
    id: 'vegas_strip_250',
    name: 'VEGAS NEON STRIP',
    location: 'Las Vegas, NV',
    stakes: '100-200',
    minBuyIn: 2500,
    icon: '♥',
    badgeColor: '#00F5FF',
    feltTheme: 'Electric Amber Glow',
    description: 'Fast-paced action under the dazzling neon signs of the Strip.'
  },
  {
    id: 'tokyo_cyber_1000',
    name: 'TOKYO CYBER ROOF',
    location: 'Shinjuku, Tokyo',
    stakes: '500-1000',
    minBuyIn: 10000,
    icon: '♦',
    badgeColor: '#FF70A6',
    feltTheme: 'Cyberpunk Synthwave',
    description: 'Underground high-tech poker duel on a neon-lit cyberpunk rooftop.'
  },
  {
    id: 'monaco_vip_2000',
    name: 'MONACO ROYALE',
    location: 'Monte Carlo, MC',
    stakes: '1000-2000',
    minBuyIn: 2500,
    icon: '♣',
    badgeColor: '#00FFA3',
    feltTheme: 'Velvet Gold Luxury',
    description: 'Exclusive private salon overlooking the Mediterranean coastline.'
  }
]

const BOT_COUNT_OPTIONS = [
  { count: 1, label: '1 BOT', subtitle: 'Heads-Up Duel (1v1)' },
  { count: 2, label: '2 BOTS', subtitle: 'Standard 3-Max Table' },
  { count: 3, label: '3 BOTS', subtitle: 'Dynamic 4-Max Ring' },
  { count: 4, label: '4 BOTS', subtitle: 'Full 5-Max Ring Arena' }
]

export default function GameSetupModal({ isOpen, onClose, onLaunchSession }) {
  const [selectedTable, setSelectedTable] = useState(TABLE_MAPS[0])
  const [selectedSkin, setSelectedSkin] = useState('obsidian')
  const [botCount, setBotCount] = useState(2)
  const [isFindingSession, setIsFindingSession] = useState(false)
  const [findingStep, setFindingStep] = useState(0)

  // Load saved equipped deck from storage on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedSkin = localStorage.getItem('pokehub_equipped_deck')
      if (savedSkin && DECK_SKIN_THEMES[savedSkin]) {
        setSelectedSkin(savedSkin)
      }
      setIsFindingSession(false)
      setFindingStep(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLaunchSession = () => {
    SoundEngine.playCardSwoosh()
    setIsFindingSession(true)
    setFindingStep(1)

    // Save equipped skin preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', selectedSkin)
    }

    // Step 1: Allocating table
    setTimeout(() => {
      SoundEngine.playChipClink()
      setFindingStep(2)
    }, 450)

    // Step 2: Seating bots & crypto deck shuffle
    setTimeout(() => {
      SoundEngine.playChipsStack()
      setFindingStep(3)
    }, 900)

    // Step 3: Launch custom game session URL
    setTimeout(() => {
      SoundEngine.playJackpot()
      const randSessionId = Math.random().toString(36).substring(2, 10)
      const userTag = 'usr_' + Math.random().toString(36).substring(2, 7).toUpperCase()

      if (onLaunchSession) {
        onLaunchSession({
          userId: userTag,
          gameId: `holdem_${randSessionId}`,
          table: selectedTable.id,
          tableName: selectedTable.name,
          stakes: selectedTable.stakes,
          skin: selectedSkin,
          bots: botCount
        })
      } else {
        const queryParams = new URLSearchParams({
          userId: userTag,
          gameId: `holdem_${randSessionId}`,
          table: selectedTable.id,
          stakes: selectedTable.stakes,
          skin: selectedSkin,
          bots: botCount.toString(),
          duel: 'open'
        })

        window.location.href = `/game?${queryParams.toString()}`
      }
    }, 1350)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="brutal-window w-full max-w-2xl bg-[#FAF7F2] border-[3.5px] border-[#0D0D0D] shadow-[8px_8px_0px_#0D0D0D] flex flex-col overflow-hidden animate-scaleUp max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="bg-[#FFE500] border-b-[3.5px] border-[#0D0D0D] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF3333] border-[1.5px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-3 h-3 rounded-full bg-[#FFE500] border-[1.5px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-3 h-3 rounded-full bg-[#00F5FF] border-[1.5px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="font-pixel text-xs sm:text-sm font-black text-[#0D0D0D] tracking-wider uppercase ml-1">
              SETUP_SESSION.EXE
            </span>
          </div>

          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            disabled={isFindingSession}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-[#FF3333] hover:text-white border-[2px] border-[#0D0D0D] font-display font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#0D0D0D] cursor-pointer transition-all active:scale-90 disabled:opacity-50"
            title="Close Setup"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Configuration Panels */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-[#0D0D0D]">

          {/* Section 1: Choose Casino Arena Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-pixel text-[10px] sm:text-xs font-black uppercase flex items-center gap-1.5 text-[#0D0D0D]">
                <span>1. SELECT CASINO ARENA</span>
              </label>
              <span className="font-mono-nb text-[9px] sm:text-[10px] font-bold text-gray-600">
                {selectedTable.location}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {TABLE_MAPS.map(table => {
                const isSelected = selectedTable.id === table.id
                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      if (!isFindingSession) {
                        SoundEngine.playClick()
                        setSelectedTable(table)
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-lg border-[2.5px] border-[#0D0D0D] cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-[#FFE500] shadow-[4px_4px_0px_#0D0D0D] scale-[1.01]'
                        : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#0D0D0D]'
                    } ${isFindingSession ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-mono-nb">{table.icon}</span>
                        <span className="font-display font-black text-xs sm:text-sm uppercase text-[#0D0D0D]">
                          {table.name}
                        </span>
                      </div>
                      <span className="font-pixel text-[8.5px] bg-white border-[1.5px] border-[#0D0D0D] px-1.5 py-0.2 font-black">
                        ${table.stakes}
                      </span>
                    </div>
                    <p className="font-mono-nb text-[9px] sm:text-[10px] text-gray-700 font-bold line-clamp-1">
                      {table.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Choose Custom Deck Skin */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-pixel text-[10px] sm:text-xs font-black uppercase flex items-center gap-1.5 text-[#0D0D0D]">
                <span>2. EQUIP DECK SKIN</span>
              </label>
              <span className="font-mono-nb text-[9px] sm:text-[10px] font-bold text-gray-600">
                {DECK_SKIN_THEMES[selectedSkin]?.name || 'DEFAULT'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {['obsidian', 'gold', 'cyber', 'emerald', 'sakura', 'retro'].map(skinKey => {
                const theme = DECK_SKIN_THEMES[skinKey]
                const isSelected = selectedSkin === skinKey
                return (
                  <button
                    key={skinKey}
                    type="button"
                    disabled={isFindingSession}
                    onClick={() => {
                      SoundEngine.playClick()
                      setSelectedSkin(skinKey)
                    }}
                    className={`p-2 rounded-lg border-[2px] border-[#0D0D0D] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00F5FF] shadow-[3px_3px_0px_#0D0D0D] scale-105 font-black ring-2 ring-[#0D0D0D]'
                        : 'bg-white hover:bg-gray-100 shadow-[1.5px_1.5px_0px_#0D0D0D]'
                    }`}
                    title={theme.name}
                  >
                    <span className="font-pixel text-[7.5px] uppercase truncate w-full text-center text-[#0D0D0D] font-black">
                      {skinKey}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Select Bot Opponents Count */}
          <div>
            <label className="block font-pixel text-[10px] sm:text-xs font-black uppercase mb-2 text-[#0D0D0D]">
              3. TABLE SEATS & BOT OPPONENTS
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BOT_COUNT_OPTIONS.map(opt => {
                const isSelected = botCount === opt.count
                return (
                  <button
                    key={opt.count}
                    type="button"
                    disabled={isFindingSession}
                    onClick={() => {
                      SoundEngine.playClick()
                      setBotCount(opt.count)
                    }}
                    className={`p-2.5 rounded-lg border-[2px] border-[#0D0D0D] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF70A6] text-white shadow-[3px_3px_0px_#0D0D0D] scale-102'
                        : 'bg-white hover:bg-gray-100 text-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D]'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-display font-black text-xs sm:text-sm">
                      <span>{opt.label}</span>
                    </div>
                    <span className={`font-mono-nb text-[8px] sm:text-[9px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                      {opt.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Matchmaking Progress Banner (Appears during Find Session) */}
          {isFindingSession && (
            <div className="bg-[#FFE500] border-[2.5px] border-[#0D0D0D] p-3 rounded-lg shadow-[3px_3px_0px_#0D0D0D] animate-fadeIn">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-pixel text-[9px] sm:text-[10px] font-black uppercase text-[#0D0D0D]">
                  {findingStep === 1
                    ? '[1/3] ALLOCATING CASINO TABLE...'
                    : findingStep === 2
                      ? '[2/3] SHUFFLING 8-BIT DECK & SEATING BOTS...'
                      : '[3/3] LAUNCHING DUEL ARENA...'}
                </span>
                <span className="font-mono-nb text-[10px] font-black text-[#0D0D0D]">
                  {findingStep * 33}%
                </span>
              </div>
              <div className="w-full bg-white border-[1.5px] border-[#0D0D0D] h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-[#00F5FF] h-full rounded-full transition-all duration-300 border border-[#0D0D0D]"
                  style={{ width: `${findingStep * 33}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#FFFFFF] border-t-[3.5px] border-[#0D0D0D] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="hidden xs:flex flex-col text-left">
            <span className="font-pixel text-[7.5px] sm:text-[8.5px] text-gray-500 font-bold uppercase">
              CONFIRMED BUY-IN:
            </span>
            <span className="font-display font-black text-xs sm:text-base text-emerald-600">
              ${selectedTable.minBuyIn.toLocaleString()} (STAKES ${selectedTable.stakes})
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto justify-end">
            <button
              type="button"
              disabled={isFindingSession}
              onClick={() => {
                SoundEngine.playClick()
                onClose()
              }}
              className="brutal-btn px-3 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-gray-200 text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0px_#0D0D0D] border-[2px] border-[#0D0D0D] cursor-pointer disabled:opacity-50"
            >
              CANCEL
            </button>

            <button
              type="button"
              disabled={isFindingSession}
              onClick={handleLaunchSession}
              className="brutal-btn flex-1 xs:flex-initial px-5 sm:px-8 py-2 sm:py-2.5 bg-[#00FFA3] hover:bg-[#00e693] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase shadow-[4px_4px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D] cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isFindingSession ? '⏳' : '⚡'}</span>
              <span>{isFindingSession ? 'CONNECTING...' : 'FIND SESSION →'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
