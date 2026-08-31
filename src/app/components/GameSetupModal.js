"use client"

import React, { useState, useEffect } from 'react'
import { SoundEngine } from './SoundEngine'
import {
  PixelArt,
  PIXEL_FRONTS,
  PIXEL_GRAFFITI,
  PIX_SUITS
} from './PixelDeckAssets'
import { TABLE_THEMES } from '../utils/themeConfig'

export const ELITE_DECKS = [
  {
    key: 'obsidian',
    name: 'OBSIDIAN FOIL',
    subtitle: 'Void Holo Finish',
    icon: '♠',
    suitKey: 'spade',
    themeStyle: 'obsidian',
    accentColor: '#B388FF',
    badge: 'MYTHIC',
    frontBg: 'bg-[#12131A]',
    frontBorder: 'border-[#B388FF]',
    rankColor: 'text-[#B388FF]',
    backBg: '#07080D'
  },
  {
    key: 'gold',
    name: 'IVORY GOLD',
    subtitle: '24K Macau Leaf',
    icon: '♥',
    suitKey: 'heart',
    themeStyle: 'gold',
    accentColor: '#D4AF37',
    badge: 'LEGENDARY',
    frontBg: 'bg-[#FDFBF7]',
    frontBorder: 'border-[#D4AF37]',
    rankColor: 'text-[#D90429]',
    backBg: '#0B0904'
  },
  {
    key: 'cyber',
    name: 'CYBER NEON',
    subtitle: 'Synthwave Glow',
    icon: '♦',
    suitKey: 'diamond',
    themeStyle: 'cyber',
    accentColor: '#00F0FF',
    badge: 'CYBER',
    frontBg: 'bg-[#090D1A]',
    frontBorder: 'border-[#00F0FF]',
    rankColor: 'text-[#00F0FF]',
    backBg: '#050711'
  },
  {
    key: 'emerald',
    name: 'EMERALD SUITE',
    subtitle: 'Monte Carlo Velvet',
    icon: '♣',
    suitKey: 'club',
    themeStyle: 'emerald',
    accentColor: '#2ECC71',
    badge: 'VIP CLUB',
    frontBg: 'bg-[#F4FAF6]',
    frontBorder: 'border-[#2ECC71]',
    rankColor: 'text-[#1E824C]',
    backBg: '#04140B'
  },
  {
    key: 'sakura',
    name: 'SAKURA RUBY',
    subtitle: 'Tokyo Cherry Flora',
    icon: '♥',
    suitKey: 'heart',
    themeStyle: 'sakura',
    accentColor: '#FF2A6D',
    badge: 'FLORAL',
    frontBg: 'bg-[#FFF5F8]',
    frontBorder: 'border-[#FF2A6D]',
    rankColor: 'text-[#FF2A6D]',
    backBg: '#17040C'
  },
  {
    key: 'retro',
    name: 'RETRO 8-BIT',
    subtitle: 'Arcade Pixel 1989',
    icon: '★',
    suitKey: 'spade',
    themeStyle: 'retro',
    accentColor: '#FF6B00',
    badge: 'ARCADE',
    frontBg: 'bg-[#FFFDF0]',
    frontBorder: 'border-[#0D0D0D]',
    rankColor: 'text-[#0D0D0D]',
    backBg: '#0D0E14'
  }
]

const BOT_OPTIONS = [
  { count: 1, label: '1 BOT', tag: '1v1 DUEL' },
  { count: 2, label: '2 BOTS', tag: '3-MAX' },
  { count: 3, label: '3 BOTS', tag: '4-MAX' },
  { count: 4, label: '4 BOTS', tag: '5-MAX' },
  { count: 5, label: '5 BOTS', tag: '6-MAX' }
]

export default function GameSetupModal({ isOpen, onClose, onLaunchSession }) {
  const [selectedSkinKey, setSelectedSkinKey] = useState('obsidian')
  const [selectedThemeKey, setSelectedThemeKey] = useState('classic_pink')
  const [botCount, setBotCount] = useState(2)

  // Load stored preferences on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedSkin = localStorage.getItem('pokehub_equipped_deck')
      if (savedSkin && ELITE_DECKS.some(d => d.key === savedSkin)) {
        setSelectedSkinKey(savedSkin)
      }
      const savedTheme = localStorage.getItem('pokehub_table_theme')
      if (savedTheme) {
        setSelectedThemeKey(savedTheme)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeDeck = ELITE_DECKS.find(d => d.key === selectedSkinKey) || ELITE_DECKS[0]
  const activeTableTheme = TABLE_THEMES.find(t => t.key === selectedThemeKey) || TABLE_THEMES[0]

  const motifMatrix = PIXEL_FRONTS[activeDeck.themeStyle] || PIXEL_FRONTS.obsidian
  const graffitiMatrix = PIXEL_GRAFFITI[activeDeck.themeStyle] || PIXEL_GRAFFITI.obsidian
  const suitMatrix = PIX_SUITS[activeDeck.suitKey] || PIX_SUITS.spade

  const handleLaunch = () => {
    SoundEngine.playCardSwoosh()
    SoundEngine.playJackpot()

    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', selectedSkinKey)
      localStorage.setItem('pokehub_table_theme', selectedThemeKey)
    }

    const randSessionId = Math.random().toString(36).substring(2, 10)
    const userTag = 'usr_' + Math.random().toString(36).substring(2, 7).toUpperCase()

    if (onLaunchSession) {
      onLaunchSession({
        userId: userTag,
        gameId: `holdem_${randSessionId}`,
        table: selectedThemeKey,
        tableName: activeTableTheme.name,
        stakes: '250-500',
        skin: selectedSkinKey,
        theme: selectedThemeKey,
        bots: botCount
      })
    } else {
      const queryParams = new URLSearchParams({
        userId: userTag,
        gameId: `holdem_${randSessionId}`,
        table: selectedThemeKey,
        stakes: '250-500',
        skin: selectedSkinKey,
        theme: selectedThemeKey,
        bots: botCount.toString(),
        duel: 'open'
      })

      window.location.href = `/game?${queryParams.toString()}`
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn select-none font-display"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FFFFFF] border-[3.5px] sm:border-[4.5px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[8px_8px_0px_#0D0D0D] sm:shadow-[14px_14px_0px_#0D0D0D] flex flex-col overflow-hidden max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="bg-[#FFE500] border-b-[3.5px] border-[#0D0D0D] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0D0D0D]" />
            <h2 className="font-display text-sm sm:text-lg font-black text-[#0D0D0D] uppercase tracking-wide">
              DECK & TABLE ARENA CUSTOMIZER
            </h2>
          </div>

          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-[#FF3333] hover:text-white border-[2px] border-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] transition-all cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content Body (Grid Layout) */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#F6F5FA]">
          
          {/* ======================================================== */}
          {/* LEFT: 6 FREAKING ELITE DECK SKINS + FELT CAPSULES        */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* 1. Deck Skin Selection (6 Skins) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b-[2px] border-[#0D0D0D] pb-1.5">
                <div className="flex items-center gap-1.5 font-display font-black text-xs sm:text-sm text-[#0D0D0D] uppercase">
                  <span>1. EQUIP DECK SKIN</span>
                </div>
                <span className="font-pixel text-[8px] sm:text-[9px] font-black px-2 py-0.5 bg-[#0D0D0D] text-[#FFE500] rounded">
                  {activeDeck.name}
                </span>
              </div>

              {/* 6 Deck Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ELITE_DECKS.map(deck => {
                  const isSelected = deck.key === selectedSkinKey
                  return (
                    <button
                      key={deck.key}
                      onClick={() => {
                        SoundEngine.playCardSwoosh()
                        setSelectedSkinKey(deck.key)
                      }}
                      className={`group p-2.5 sm:p-3 rounded-xl border-[2.5px] border-[#0D0D0D] flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#FFE500] shadow-[4px_4px_0px_#0D0D0D] scale-102 font-black'
                          : 'bg-[#FFFFFF] hover:bg-[#FDFBF7] shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D]'
                      }`}
                    >
                      {/* Top Indicator */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className="w-6 h-6 rounded-lg border-[1.5px] border-[#0D0D0D] flex items-center justify-center font-display font-black text-xs shrink-0 shadow-[1px_1px_0px_#0D0D0D]"
                          style={{
                            backgroundColor: deck.accentColor,
                            color: '#0D0D0D'
                          }}
                        >
                          {deck.icon}
                        </div>

                        <span className="font-pixel text-[7px] font-black px-1.5 py-0.2 bg-[#0D0D0D] text-[#FFFFFF] rounded">
                          {deck.badge}
                        </span>
                      </div>

                      {/* Deck Info */}
                      <div>
                        <h3 className="font-display text-[11px] sm:text-xs font-black text-[#0D0D0D] uppercase truncate leading-tight">
                          {deck.name}
                        </h3>
                        <p className="font-mono-nb text-[8.5px] sm:text-[9.5px] text-gray-700 font-bold truncate mt-0.5">
                          {deck.subtitle}
                        </p>
                      </div>

                      {/* Equipped Mark */}
                      {isSelected && (
                        <div className="mt-2 pt-1 border-t border-[#0D0D0D]/20 flex items-center justify-between">
                          <span className="font-pixel text-[7px] font-black text-[#0D0D0D]">
                            EQUIPPED
                          </span>
                          <span className="font-pixel text-[8px] font-black text-[#0D0D0D]">
                            ✓
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Table Felt Theme Selector (6 Themes) */}
            <div className="bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] p-3 rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-[10px] sm:text-xs text-[#0D0D0D] uppercase">
                  2. TABLE FELT THEME
                </span>
                <span className="font-pixel text-[8px] font-black text-gray-700 uppercase">
                  {activeTableTheme.name}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {TABLE_THEMES.map(th => {
                  const isSelected = th.key === selectedThemeKey
                  return (
                    <button
                      key={th.key}
                      onClick={() => {
                        SoundEngine.playClick()
                        setSelectedThemeKey(th.key)
                      }}
                      className={`p-1.5 rounded-lg border-[1.5px] sm:border-[2px] border-[#0D0D0D] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFE500] shadow-[2.5px_2.5px_0px_#0D0D0D] scale-105'
                          : 'bg-[#F6F5FA] hover:bg-[#FFFFFF]'
                      }`}
                      title={th.name}
                    >
                      {/* Mini Table Felt Swatch Capsule */}
                      <div
                        className="w-6 h-4 rounded-full border-[1.5px] border-[#0D0D0D] flex items-center justify-center text-[7px] font-black shadow-[0.5px_0.5px_0px_#0D0D0D]"
                        style={{
                          backgroundColor: th.feltBg,
                          color: th.headerBg,
                          boxShadow: isSelected ? `0 0 8px ${th.headerBg}` : 'none'
                        }}
                      >
                        {th.icon}
                      </div>
                      <span className="font-pixel text-[6.5px] font-black truncate w-full text-center text-[#0D0D0D] uppercase">
                        {th.key.replace('_', ' ')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Opponents Count Selector */}
            <div className="bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] p-3 rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-[10px] sm:text-xs text-[#0D0D0D] uppercase">
                  3. TABLE OPPONENTS (BOTS)
                </span>
                <span className="font-mono-nb text-[9px] font-black text-gray-700">
                  {botCount + 1} Players Total
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {BOT_OPTIONS.map(opt => {
                  const isSelected = botCount === opt.count
                  return (
                    <button
                      key={opt.count}
                      onClick={() => {
                        SoundEngine.playClick()
                        setBotCount(opt.count)
                      }}
                      className={`py-1.5 px-1 rounded-lg border-[2px] border-[#0D0D0D] flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00FFA3] shadow-[2px_2px_0px_#0D0D0D] scale-105 font-black text-[#0D0D0D]'
                          : 'bg-[#F6F5FA] hover:bg-[#FFFFFF] text-[#0D0D0D]'
                      }`}
                    >
                      <span className="font-display font-black text-xs">
                        {opt.count} BOT
                      </span>
                      <span className="font-pixel text-[6.5px] text-[#0D0D0D]/80 uppercase">
                        {opt.tag}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT: LIVE CARD ARTWORK ON TABLE FELT PREVIEW STAGE    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            
            {/* Visual Card + Table Felt Stage Showcase */}
            <div
              className="border-[3px] border-[#0D0D0D] p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_#0D0D0D] flex flex-col items-center relative overflow-hidden transition-colors duration-500"
              style={{ backgroundColor: activeTableTheme.arenaBg }}
            >
              {/* Header Label inside arena stage */}
              <div className="flex items-center justify-between w-full border-b-[2px] border-white/20 pb-2 mb-2.5 z-10">
                <span className="font-display font-black text-[11px] sm:text-xs uppercase text-white tracking-wide">
                  LIVE CARD & FELT STAGE
                </span>
                <span className="font-pixel text-[8px] font-black text-white/80 uppercase">
                  {activeTableTheme.name}
                </span>
              </div>

              {/* Miniature Poker Table Oval Surface */}
              <div
                className="w-full rounded-2xl border-[3px] p-3 sm:p-4 flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500"
                style={{
                  backgroundColor: activeTableTheme.feltBg,
                  borderColor: activeTableTheme.feltBorder,
                  backgroundImage: activeTableTheme.feltPattern,
                  backgroundSize: activeTableTheme.feltPatternSize
                }}
              >
                {/* Center Pot / Arena Watermark Badge */}
                <div
                  className="px-2.5 py-0.5 rounded-full border-[1.5px] border-[#0D0D0D] font-display font-black text-[8.5px] sm:text-[9.5px] uppercase shadow-[1px_1px_0px_#0D0D0D] mb-2.5 select-none"
                  style={{
                    backgroundColor: activeTableTheme.potPillBg,
                    color: activeTableTheme.potPillText
                  }}
                >
                  {activeTableTheme.icon} {activeTableTheme.name}
                </div>

                {/* 2 Authentic Freaking Elite Cards Resting on the Live Felt */}
                <div className="relative w-full flex items-center justify-center gap-2.5 sm:gap-3.5 py-1 select-none z-10">
                  
                  {/* 1. FRONT CARD (ACE OF SPADES WITH BESPOKE PIXEL ART MOTIF) */}
                  <div
                    className={`w-24 h-36 sm:w-28 sm:h-40 rounded-xl ${activeDeck.frontBg} border-[2.5px] sm:border-[3px] ${activeDeck.frontBorder} shadow-[5px_5px_0px_#0D0D0D] p-2 flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105`}
                  >
                    {/* Subtle CRT Grid */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />

                    {/* Top-Left Index (Rank + Pixel Suit) */}
                    <div className="flex flex-col items-center leading-none z-10 self-start">
                      <span className={`font-pixel text-xs sm:text-sm font-black ${activeDeck.rankColor}`}>
                        A
                      </span>
                      <div className="mt-0.5">
                        <PixelArt matrix={suitMatrix} size={1.6} defaultColor={activeDeck.accentColor} />
                      </div>
                    </div>

                    {/* Central Pixel Art Motif from Freaking Elite Decks */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                      <div className="p-1.5 rounded-lg border-[2px] border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center">
                        <PixelArt matrix={motifMatrix} size={3.6} defaultColor={activeDeck.accentColor} />
                      </div>
                    </div>

                    {/* Bottom-Right Inverted Index */}
                    <div className="flex flex-col items-center leading-none self-end rotate-180 z-10">
                      <span className={`font-pixel text-xs sm:text-sm font-black ${activeDeck.rankColor}`}>
                        A
                      </span>
                      <div className="mt-0.5">
                        <PixelArt matrix={suitMatrix} size={1.6} defaultColor={activeDeck.accentColor} />
                      </div>
                    </div>
                  </div>

                  {/* 2. BACK CARD (FULL-CARD OUTLINE PIXEL GRAFFITI ARTWORK) */}
                  <div
                    className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-[2.5px] sm:border-[3px] border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D] p-1 flex items-center justify-center relative overflow-hidden transition-transform hover:scale-105"
                    style={{ backgroundColor: activeDeck.backBg }}
                  >
                    {/* Full-Card Edge-to-Edge Pixel Graffiti Art Piece */}
                    <div className="w-full h-full flex items-center justify-center p-0.5">
                      <PixelArt
                        matrix={graffitiMatrix}
                        size={3.2}
                        defaultColor={activeDeck.accentColor}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Deck & Felt Synergy Bar */}
              <div className="mt-2.5 w-full bg-white/10 backdrop-blur-xs border border-white/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-[10px] sm:text-xs uppercase">
                    {activeDeck.name}
                  </span>
                </div>

                {/* Felt Palette Swatches */}
                <div className="flex items-center gap-1">
                  {activeTableTheme.swatches.map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-black shadow-[0.5px_0.5px_0px_#000]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Match Rules & Blinds Summary */}
            <div className="bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] p-3 rounded-xl shadow-[3px_3px_0px_#0D0D0D] flex flex-col gap-1.5 text-xs font-mono-nb">
              <div className="flex justify-between items-center text-gray-800 border-b border-gray-200 pb-1">
                <span className="font-bold">Stakes / Blinds:</span>
                <span className="font-black text-[#0D0D0D] bg-[#FFE500] px-1.5 py-0.2 rounded border border-[#0D0D0D]">
                  $250 / $500
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-800 border-b border-gray-200 pb-1">
                <span className="font-bold">Starting Stack:</span>
                <span className="font-black text-emerald-600 font-display">
                  $10,000
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-800">
                <span className="font-bold">Rules Engine:</span>
                <span className="font-black text-[#0D0D0D]">
                  WSOP Texas Hold&apos;em
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#FFFFFF] border-t-[3.5px] border-[#0D0D0D] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="brutal-btn px-4 sm:px-6 py-2 bg-white hover:bg-gray-200 text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0px_#0D0D0D] border-[2px] border-[#0D0D0D] cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="brutal-btn px-6 sm:px-10 py-2.5 sm:py-3 bg-[#00FFA3] hover:bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase shadow-[4px_4px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D] cursor-pointer transition-all active:scale-95 flex items-center gap-2"
          >
            <span>★</span>
            <span>ENTER 3D ARENA →</span>
          </button>
        </div>

      </div>
    </div>
  )
}
