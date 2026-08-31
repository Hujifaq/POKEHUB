"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import BubbleMenu from '../components/BubbleMenu'
import Preloader from '../components/Preloader'
import HandRankingsModal from '../components/HandRankingsModal'
import VIPClubModal from '../components/VIPClubModal'
import { SoundEngine } from '../components/SoundEngine'
import { generateGameUrl } from '../utils/gameUrl'
import { PixelAvatar } from '../components/PixelAvatars'

// Mock High Rollers Hall of Fame Data
const INITIAL_LEADERBOARD = [
  { id: '1', rank: 1, name: 'SATOSHI_NAKAMOTO', avatarKey: 'roller', chips: 1500000, tier: 'MYTHIC', winRate: '88%', streak: '14W', color: '#FFDE59' },
  { id: '2', rank: 2, name: 'CYBER_ACE_99', avatarKey: 'punk', chips: 850000, tier: 'HIGH ROLLER', winRate: '76%', streak: '8W', color: '#00FFA3' },
  { id: '3', rank: 3, name: 'VIP_SHARK_88', avatarKey: 'samurai', chips: 520000, tier: 'SHARK', winRate: '71%', streak: '5W', color: '#FF3333' },
  { id: '4', rank: 4, name: 'MACAU_WHALE', avatarKey: 'neko', chips: 340000, tier: 'WHALE', winRate: '65%', streak: '4W', color: '#00F0FF' },
  { id: '5', rank: 5, name: 'BLUFF_KING_X', avatarKey: 'queen', chips: 210000, tier: 'PRO', winRate: '62%', streak: '3W', color: '#FF90E8' },
  { id: '6', rank: 6, name: 'QUANT_BRAIN', avatarKey: 'punk', chips: 145000, tier: 'PRO', winRate: '59%', streak: '2W', color: '#FFDE59' },
  { id: '7', rank: 7, name: 'NEO_GAMBLER', avatarKey: 'samurai', chips: 95000, tier: 'ELITE', winRate: '54%', streak: '3W', color: '#FFFFFF' },
  { id: '8', rank: 8, name: 'LAS_VEGAS_KID', avatarKey: 'roller', chips: 65000, tier: 'ELITE', winRate: '51%', streak: '1W', color: '#FFFFFF' },
  { id: '9', rank: 9, name: 'LUCKY_SEVEN', avatarKey: 'neko', chips: 42000, tier: 'CONTENDER', winRate: '48%', streak: '2W', color: '#FFFFFF' },
  { id: '10', rank: 10, name: 'CHIP_COLLECTOR', avatarKey: 'queen', chips: 25000, tier: 'CONTENDER', winRate: '45%', streak: '1W', color: '#FFFFFF' },
]

export default function LeaderboardPage() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [activeTab, setActiveTab] = useState('all-time') // 'all-time', 'weekly', 'today'
  const [bankroll, setBankroll] = useState(10000)
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD)
  const [playerRank, setPlayerRank] = useState(11)

  const [isRankingsOpen, setIsRankingsOpen] = useState(false)
  const [isVIPOpen, setIsVIPOpen] = useState(false)

  // Load bankroll from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokehub_bankroll')
      if (saved) {
        setBankroll(Number(saved))
      }
    }
  }, [])

  // Calculate dynamic ranking with Player inserted
  useEffect(() => {
    const playerEntry = {
      id: 'player_you',
      name: 'YOU (HIGH ROLLER)',
      avatarKey: 'hero',
      chips: bankroll,
      tier: bankroll >= 500000 ? 'SHARK' : bankroll >= 100000 ? 'PRO' : bankroll >= 25000 ? 'ELITE' : 'CHALLENGER',
      winRate: '68%',
      streak: 'ACTIVE',
      isPlayer: true,
      color: '#00FFA3'
    }

    const combined = [...INITIAL_LEADERBOARD.filter(item => item.id !== 'player_you'), playerEntry]
    combined.sort((a, b) => b.chips - a.chips)

    const withRanks = combined.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }))

    setLeaderboard(withRanks)

    const pRank = withRanks.findIndex(item => item.id === 'player_you') + 1
    setPlayerRank(pRank)
  }, [bankroll])

  const bubbleMenuItems = [
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
        window.location.href = '/'
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
        window.location.href = '/about'
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
  ]

  return (
    <main className="w-full relative min-h-screen text-true-black overflow-x-hidden bg-[#fdfaf7] py-20 px-4 sm:px-6">
      {/* Infinite Seamless Fixed Graph Grid */}
      <div className="fixed-graph-grid" />

      {/* Intro Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Unified Responsive Bubble Navbar */}
      <BubbleMenu
        logo={
          <div className="flex items-center justify-center cursor-pointer" onClick={() => window.location.href = '/'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/PKH_Logo.jpg"
              alt="POKERHUB Logo"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain mix-blend-multiply bg-transparent select-none pointer-events-none"
            />
          </div>
        }
        actions={
          <>
            <Link
              href="/"
              className="brutal-btn bg-white text-true-black flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 font-display text-xs font-black uppercase hover:bg-accent-yellow transition-colors shadow-[2px_2px_0px_#000]"
              title="Back to Home"
            >
              <span>HOME</span>
            </Link>

            <Link
              href="/game?mode=3d_arena"
              className="brutal-btn bg-[#00FFA3] text-true-black flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 font-display text-xs font-black uppercase hover:bg-[#00e693] transition-all shadow-[2px_2px_0px_#000000] -rotate-1"
              title="Open 3D Arena"
            >
              <span>3D ARENA</span>
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

      {/* Main Leaderboard Container */}
      <div className="max-w-4xl mx-auto pt-10 relative z-10 flex flex-col gap-6">

        {/* Header Title Section */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFDE59] border-[3px] border-true-black shadow-[4px_4px_0px_#000000] -rotate-1">
            <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-true-black">
              HIGH ROLLER HALL OF FAME
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase text-true-black tracking-tight drop-shadow-[4px_4px_0px_#FF90E8] mt-2">
            GLOBAL LEADERBOARD
          </h1>
          <p className="font-mono-nb text-xs sm:text-sm text-gray-700 font-bold max-w-lg">
            Ranked by lifetime poker chip accumulation. Play 3D Texas Hold&apos;em in the Arena to climb the ladder!
          </p>
        </div>

        {/* ======================================================== */}
        {/* TOP 3 PODIUM HERO */}
        {/* ======================================================== */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 pb-2">
          {/* #2 SILVER PODIUM */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center bg-white border-[3px] border-true-black rounded-2xl p-3 sm:p-4 shadow-[5px_5px_0px_#000000] -rotate-1 relative">
              <span className="absolute -top-3 bg-gray-200 border-[2px] border-true-black font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 font-black">
                RANK #2
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 mt-2 rounded-full border-[2px] border-black bg-white flex items-center justify-center p-1 shadow-[2px_2px_0px_#000]">
                <PixelAvatar avatarKey={leaderboard[1].avatarKey || 'punk'} size={2.2} />
              </div>
              <h3 className="font-display font-black text-xs sm:text-sm text-true-black truncate max-w-full mt-1.5">
                {leaderboard[1].name}
              </h3>
              <span className="font-mono-nb text-xs sm:text-sm font-black text-emerald-600">
                ${leaderboard[1].chips.toLocaleString()}
              </span>
            </div>
          )}

          {/* #1 GOLD PODIUM */}
          {leaderboard[0] && (
            <div className="flex flex-col items-center bg-[#FFDE59] border-[4px] border-true-black rounded-2xl p-4 sm:p-6 shadow-[8px_8px_0px_#000000] scale-105 z-20 relative">
              <span className="absolute -top-4 bg-[#FF3333] text-white border-[2px] border-true-black font-pixel text-[9px] sm:text-[10px] px-3 py-0.5 font-black animate-pulse shadow-[2px_2px_0px_#000000]">
                CHAMPION #1
              </span>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mt-2 rounded-full border-[2.5px] border-black bg-white flex items-center justify-center p-1 shadow-[3px_3px_0px_#000]">
                <PixelAvatar avatarKey={leaderboard[0].avatarKey || 'roller'} size={2.6} />
              </div>
              <h3 className="font-display font-black text-sm sm:text-base text-true-black truncate max-w-full mt-1.5">
                {leaderboard[0].name}
              </h3>
              <span className="font-display text-base sm:text-xl font-black text-true-black tracking-tight">
                ${leaderboard[0].chips.toLocaleString()}
              </span>
              <span className="font-pixel text-[8px] bg-white border-[1.5px] border-true-black px-2 py-0.5 font-bold mt-1">
                {leaderboard[0].streak} STREAK
              </span>
            </div>
          )}

          {/* #3 BRONZE PODIUM */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center bg-white border-[3px] border-true-black rounded-2xl p-3 sm:p-4 shadow-[5px_5px_0px_#000000] rotate-1 relative">
              <span className="absolute -top-3 bg-[#f59e0b] text-white border-[2px] border-true-black font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 font-black">
                RANK #3
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 mt-2 rounded-full border-[2px] border-black bg-white flex items-center justify-center p-1 shadow-[2px_2px_0px_#000]">
                <PixelAvatar avatarKey={leaderboard[2].avatarKey || 'samurai'} size={2.2} />
              </div>
              <h3 className="font-display font-black text-xs sm:text-sm text-true-black truncate max-w-full mt-1.5">
                {leaderboard[2].name}
              </h3>
              <span className="font-mono-nb text-xs sm:text-sm font-black text-emerald-600">
                ${leaderboard[2].chips.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* YOUR ACTIVE STANDING CARD */}
        {/* ======================================================== */}
        <div className="bg-[#00FFA3] border-[3px] border-true-black rounded-xl p-3 sm:p-4 shadow-[5px_5px_0px_#000000] flex flex-wrap items-center justify-between gap-3 -rotate-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-[2px] border-true-black flex items-center justify-center p-1 shadow-[2px_2px_0px_#000000]">
              <PixelAvatar avatarKey="hero" size={2.0} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base text-true-black uppercase">
                  YOUR CURRENT STANDING
                </span>
                <span className="font-pixel text-[8px] bg-[#FFDE59] border-[1.5px] border-true-black px-1.5 py-0.5 font-bold">
                  RANK #{playerRank}
                </span>
              </div>
              <span className="font-mono-nb text-xs font-bold text-gray-900">
                Chips: <strong className="text-true-black">${bankroll.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <Link
            href="/game?mode=texas_holdem&duel=open"
            className="brutal-btn ml-auto px-5 py-2.5 bg-true-black text-white font-display text-xs sm:text-sm font-black uppercase hover:bg-white hover:text-true-black transition-colors"
          >
            PLAY IN 3D ARENA →
          </Link>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center justify-between gap-2 border-b-[3px] border-true-black pb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { key: 'all-time', label: 'ALL-TIME' },
              { key: 'weekly', label: 'WEEKLY' },
              { key: 'today', label: 'TODAY' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  SoundEngine.playClick()
                  setActiveTab(tab.key)
                }}
                className={`font-display text-xs sm:text-sm font-black px-3 sm:px-4 py-1.5 border-[2px] border-true-black cursor-pointer transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#FFDE59] text-true-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="font-pixel text-[8px] sm:text-[9px] text-gray-600 font-bold hidden sm:inline">
            AUTO-UPDATED REALTIME
          </span>
        </div>

        {/* ======================================================== */}
        {/* LEADERBOARD RANKINGS TABLE */}
        {/* ======================================================== */}
        <div className="bg-white border-[4px] border-true-black rounded-2xl shadow-[6px_6px_0px_#000000] overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="bg-[#FF90E8] border-b-[3px] border-true-black px-4 py-2.5 grid grid-cols-12 gap-2 font-display font-black text-xs uppercase text-true-black">
            <span className="col-span-2 sm:col-span-1 text-center">RANK</span>
            <span className="col-span-6 sm:col-span-5">PLAYER</span>
            <span className="col-span-4 sm:col-span-3 text-right">CHIPS</span>
            <span className="hidden sm:block sm:col-span-3 text-center">STATUS</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y-[2px] divide-black/10">
            {leaderboard.map((player) => (
              <div
                key={player.id}
                className={`px-4 py-3 grid grid-cols-12 gap-2 items-center transition-colors ${
                  player.isPlayer
                    ? 'bg-[#00FFA3]/30 font-black ring-2 ring-inset ring-[#00FFA3]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank Number */}
                <div className="col-span-2 sm:col-span-1 text-center">
                  {player.rank === 1 ? (
                    <span className="inline-block w-6 h-6 rounded-full bg-[#FFDE59] border-[2px] border-true-black font-display font-black text-xs leading-5">
                      1
                    </span>
                  ) : player.rank === 2 ? (
                    <span className="inline-block w-6 h-6 rounded-full bg-gray-200 border-[2px] border-true-black font-display font-black text-xs leading-5">
                      2
                    </span>
                  ) : player.rank === 3 ? (
                    <span className="inline-block w-6 h-6 rounded-full bg-[#f59e0b] text-white border-[2px] border-true-black font-display font-black text-xs leading-5">
                      3
                    </span>
                  ) : (
                    <span className="font-mono-nb text-xs font-bold text-gray-700">
                      #{player.rank}
                    </span>
                  )}
                </div>

                {/* Player Avatar & Name */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-full border-[1.5px] border-black bg-white flex items-center justify-center p-0.5 shrink-0 shadow-[1px_1px_0px_#000]">
                    <PixelAvatar avatarKey={player.avatarKey || 'roller'} size={1.4} />
                  </div>
                  <div className="truncate">
                    <span className={`font-display text-xs sm:text-sm truncate block ${
                      player.isPlayer ? 'font-black text-[#FF3333]' : 'font-bold text-true-black'
                    }`}>
                      {player.name}
                    </span>
                    <span className="font-pixel text-[7px] text-gray-500 block sm:hidden">
                      {player.tier} • {player.winRate} WIN
                    </span>
                  </div>
                </div>

                {/* Chips Bankroll */}
                <div className="col-span-4 sm:col-span-3 text-right">
                  <span className="font-mono-nb text-xs sm:text-sm font-black text-emerald-600">
                    ${player.chips.toLocaleString()}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="hidden sm:flex sm:col-span-3 items-center justify-center gap-1.5">
                  <span className="font-pixel text-[8px] bg-white border-[1px] border-true-black px-2 py-0.5 font-bold uppercase shadow-[1px_1px_0px_#000000]">
                    {player.tier}
                  </span>
                  <span className="font-pixel text-[8px] bg-[#00F0FF] border-[1px] border-true-black px-1.5 py-0.5 font-bold shadow-[1px_1px_0px_#000000]">
                    {player.winRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-6 flex flex-col items-center gap-3">
          <Link
            href="/game?mode=texas_holdem&duel=open"
            className="brutal-btn px-8 py-3.5 bg-[#FFDE59] text-true-black font-display text-base font-black uppercase hover:bg-[#00FFA3] shadow-[5px_5px_0px_#000000] -rotate-1 hover:rotate-0 transition-all cursor-pointer"
          >
            PLAY 3D ARENA &amp; CLIMB LEADERBOARD →
          </Link>
          <Link href="/" className="font-mono-nb text-xs font-bold text-gray-600 hover:text-black underline">
            ← Back to Home Showcase
          </Link>
        </div>

      </div>

      {/* Poker Hand Rankings Official Guide */}
      <HandRankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />

      {/* VIP High Roller Club Modal */}
      <VIPClubModal
        isOpen={isVIPOpen}
        onClose={() => setIsVIPOpen(false)}
      />
    </main>
  )
}
