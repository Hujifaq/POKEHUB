"use client"

import React, { useState, useRef, useEffect } from 'react'
import { SoundEngine } from './SoundEngine'

const HAND_RANKINGS = [
  {
    rank: 1,
    name: 'Royal Flush',
    subtitle: 'A, K, Q, J, 10 of the same suit',
    cards: ['10♥', 'J♥', 'Q♥', 'K♥', 'A♥'],
    odds: '1 in 649,740',
    payout: '1,000 : 1',
    badge: 'SUPREME'
  },
  {
    rank: 2,
    name: 'Straight Flush',
    subtitle: 'Five consecutive cards in the same suit',
    cards: ['5♠', '6♠', '7♠', '8♠', '9♠'],
    odds: '1 in 72,192',
    payout: '200 : 1',
    badge: 'ULTRA RARE'
  },
  {
    rank: 3,
    name: 'Four of a Kind',
    subtitle: 'Four cards of identical rank',
    cards: ['A♠', 'A♥', 'A♦', 'A♣', 'K♦'],
    odds: '1 in 4,165',
    payout: '50 : 1',
    badge: 'EPIC'
  },
  {
    rank: 4,
    name: 'Full House',
    subtitle: 'Three of a kind combined with a pair',
    cards: ['K♠', 'K♥', 'K♦', '10♣', '10♥'],
    odds: '1 in 694',
    payout: '20 : 1',
    badge: 'STRONG'
  },
  {
    rank: 5,
    name: 'Flush',
    subtitle: 'Any five cards of the same suit',
    cards: ['2♦', '6♦', '9♦', 'J♦', 'A♦'],
    odds: '1 in 508',
    payout: '10 : 1',
    badge: 'RARE'
  },
  {
    rank: 6,
    name: 'Straight',
    subtitle: 'Five consecutive cards of any suit',
    cards: ['4♠', '5♥', '6♦', '7♣', '8♠'],
    odds: '1 in 254',
    payout: '5 : 1',
    badge: 'STRONG'
  },
  {
    rank: 7,
    name: 'Three of a Kind',
    subtitle: 'Three cards of the identical rank',
    cards: ['Q♠', 'Q♥', 'Q♦', '8♣', '4♥'],
    odds: '1 in 47',
    payout: '3 : 1',
    badge: 'SOLID'
  },
  {
    rank: 8,
    name: 'Two Pair',
    subtitle: 'Two different pairs of cards',
    cards: ['J♠', 'J♥', '7♦', '7♣', '2♠'],
    odds: '1 in 21',
    payout: '2 : 1',
    badge: 'COMMON'
  },
  {
    rank: 9,
    name: 'One Pair',
    subtitle: 'Two cards of the same rank',
    cards: ['9♥', '9♣', 'K♠', '4♦', '2♥'],
    odds: '1 in 2.4',
    payout: '1 : 1',
    badge: 'BASIC'
  },
  {
    rank: 10,
    name: 'High Card',
    subtitle: 'No pair; highest single card decides',
    cards: ['A♠', 'Q♥', '9♦', '6♣', '2♠'],
    odds: '1 in 2',
    payout: '0 : 1',
    badge: 'LOW'
  }
]

const POKER_TIPS = [
  {
    id: 'tip-1',
    category: 'POSITION',
    title: 'Position is Real Power',
    badge: 'RULE #1',
    bgColor: 'bg-[#FFE500]',
    icon: '🎯',
    tip: 'Acting last on the Flop, Turn, and River gives you immense informational advantage. You see what opponents do before committing your chips.'
  },
  {
    id: 'tip-2',
    category: 'SELECTION',
    title: 'Be Selective Pre-Flop',
    badge: 'DISCIPLINE',
    bgColor: 'bg-[#00F5FF]',
    icon: '🃏',
    tip: 'Do not play every hand. Premium pairs (AA, KK, QQ) and suited high connectors (AKs, AQs, J10s) dominate in the long run. Fold junk offsuit cards early.'
  },
  {
    id: 'tip-3',
    category: 'POT ODDS',
    title: 'Count Outs & Pot Odds',
    badge: 'MATH EDGE',
    bgColor: 'bg-[#00FFA3]',
    icon: '📊',
    tip: 'Count your winning outs (e.g. 9 outs for a 4-flush = ~36% to hit by River). Compare that percentage with the pot ratio before calling a bet.'
  },
  {
    id: 'tip-4',
    category: 'AGGRESSION',
    title: 'Controlled Aggression & Semi-Bluffs',
    badge: 'PRESSURE',
    bgColor: 'bg-[#FF70A6]',
    icon: '⚡',
    tip: 'Betting and raising wins pots two ways: having the best showdown hand, or forcing your opponent to fold. Semi-bluff when you hold strong draws.'
  },
  {
    id: 'tip-5',
    category: 'BOARD TEXTURE',
    title: 'Read Dangerous Board Textures',
    badge: 'AWARENESS',
    bgColor: 'bg-[#FFF8EE]',
    icon: '🔍',
    tip: 'Watch for paired boards (Full House danger), 3 cards of the same suit (Flush danger), or connected cards. Do not over-commit on weak one-pair hands.'
  },
  {
    id: 'tip-6',
    category: 'BANKROLL',
    title: 'Protect Your Total Bankroll',
    badge: 'SURVIVAL',
    bgColor: 'bg-[#E58383]',
    icon: '🛡️',
    tip: 'Never risk your entire stack on marginal spots. Maintain at least 20-30 buy-ins for your target stakes to safely absorb variance.'
  }
]

export default function HandRankingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'rankings' | 'tips'
  const scrollContainerRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        SoundEngine.playClick()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Mouse wheel scroll forwarder: ensures mouse scrolling anywhere over the modal dialog or backdrop scrolls smoothly
  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          SoundEngine.playClick()
          onClose()
        }
      }}
      onWheel={handleWheel}
      className="fixed inset-0 z-[2100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn font-display select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] bg-[#FFFFFF] border-[3px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_#0D0D0D] sm:shadow-[10px_10px_0px_#0D0D0D] flex flex-col overflow-hidden"
      >
        
        {/* Title Bar */}
        <div className="bg-[#FFE500] border-b-[3px] sm:border-b-[4px] border-[#0D0D0D] p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0D0D0D] animate-pulse" />
            <h2 className="font-display text-xs sm:text-base md:text-lg font-black text-[#0D0D0D] uppercase tracking-wide">
              HAND RANKINGS & TIPS
            </h2>
          </div>
          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#FF3333] hover:text-white text-[#0D0D0D] border-[2px] border-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] transition-all cursor-pointer"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="bg-[#FFFFFF] border-b-[2.5px] border-[#0D0D0D] px-3 sm:px-5 py-2 flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              SoundEngine.playClick()
              setActiveTab('all')
            }}
            className={`px-3 py-1 rounded-lg border-[2px] border-[#0D0D0D] font-display text-[10px] sm:text-xs font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#0D0D0D] text-[#FFE500] -translate-y-0.5'
                : 'bg-[#F0F2F5] text-[#0D0D0D] hover:bg-[#FFE500]'
            }`}
          >
            ALL (16)
          </button>
          <button
            onClick={() => {
              SoundEngine.playClick()
              setActiveTab('rankings')
            }}
            className={`px-3 py-1 rounded-lg border-[2px] border-[#0D0D0D] font-display text-[10px] sm:text-xs font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] shrink-0 ${
              activeTab === 'rankings'
                ? 'bg-[#0D0D0D] text-[#00FFA3] -translate-y-0.5'
                : 'bg-[#F0F2F5] text-[#0D0D0D] hover:bg-[#00FFA3]'
            }`}
          >
            HAND RANKINGS (10)
          </button>
          <button
            onClick={() => {
              SoundEngine.playClick()
              setActiveTab('tips')
            }}
            className={`px-3 py-1 rounded-lg border-[2px] border-[#0D0D0D] font-display text-[10px] sm:text-xs font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] shrink-0 ${
              activeTab === 'tips'
                ? 'bg-[#0D0D0D] text-[#FF70A6] -translate-y-0.5'
                : 'bg-[#F0F2F5] text-[#0D0D0D] hover:bg-[#FF70A6]'
            }`}
          >
            STRATEGY TIPS (6)
          </button>
        </div>

        {/* Scrollable Container (Fully Enabled for Smooth Mouse Wheel & Touchpad Scrolling) */}
        <div
          ref={scrollContainerRef}
          className="p-3 sm:p-5 overflow-y-auto space-y-4 bg-[#F6F5FA] custom-scrollbar flex-1 min-h-0 overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* SECTION 1: HAND RANKINGS */}
          {(activeTab === 'all' || activeTab === 'rankings') && (
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-pixel text-[9px] sm:text-[10px] font-black uppercase text-[#0D0D0D] tracking-wider">
                  01 / OFFICIAL HAND HIERARCHY
                </span>
                <span className="font-mono-nb text-[8px] sm:text-[9px] font-bold text-gray-500">
                  HIGHEST TO LOWEST
                </span>
              </div>

              {HAND_RANKINGS.map((item, index) => {
                const bgColors = ['bg-[#FF70A6]', 'bg-[#FFE500]', 'bg-[#00F5FF]', 'bg-[#00FFA3]', 'bg-[#FFFFFF]']
                const cardBg = bgColors[index % bgColors.length]

                return (
                  <div
                    key={item.rank}
                    className={`p-2.5 sm:p-3.5 border-[2px] sm:border-[2.5px] border-[#0D0D0D] rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 transition-transform hover:-translate-y-0.5 ${cardBg}`}
                  >
                    {/* Rank Number & Name */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 border-[2px] border-[#0D0D0D] bg-white text-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center rounded-lg shrink-0 shadow-[1px_1px_0px_#0D0D0D]">
                        {item.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black uppercase text-[#0D0D0D]">
                            {item.name}
                          </h3>
                          <span className="text-[7px] sm:text-[8px] font-pixel font-bold px-1.5 py-0.2 bg-[#0D0D0D] text-[#FFE500] uppercase rounded">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[8px] sm:text-[9.5px] font-mono-nb font-bold text-[#0D0D0D]/80">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Sample Cards */}
                    <div className="flex items-center gap-1 sm:gap-1.5 self-start md:self-auto overflow-x-auto max-w-full">
                      {item.cards.map((c, i) => {
                        const isRed = c.includes('♥') || c.includes('♦')
                        return (
                          <div
                            key={i}
                            className="w-7 h-9 sm:w-8 sm:h-11 bg-white border-[1.5px] sm:border-[2px] border-[#0D0D0D] rounded-md flex items-center justify-center font-display font-black text-[10px] sm:text-xs shadow-[1px_1px_0px_#0D0D0D] shrink-0"
                            style={{ color: isRed ? '#FF3333' : '#0D0D0D' }}
                          >
                            {c}
                          </div>
                        )
                      })}
                    </div>

                    {/* Odds */}
                    <div className="text-left md:text-right shrink-0 bg-white border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-2 py-1 rounded-lg shadow-[1px_1px_0px_#0D0D0D]">
                      <div className="text-[8px] sm:text-[9px] font-mono-nb font-black text-[#0D0D0D]">
                        ODDS: {item.odds}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* SECTION 2: PRO STRATEGY TIPS */}
          {(activeTab === 'all' || activeTab === 'tips') && (
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-pixel text-[9px] sm:text-[10px] font-black uppercase text-[#0D0D0D] tracking-wider">
                  02 / PRO POKER STRATEGY & TACTICS
                </span>
                <span className="font-mono-nb text-[8px] sm:text-[9px] font-bold text-gray-500">
                  ESSENTIAL RULES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {POKER_TIPS.map((tipItem) => (
                  <div
                    key={tipItem.id}
                    className={`p-3 sm:p-4 border-[2px] sm:border-[2.5px] border-[#0D0D0D] rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] flex flex-col justify-between gap-2 transition-transform hover:-translate-y-0.5 ${tipItem.bgColor}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm sm:text-base">{tipItem.icon}</span>
                        <h4 className="text-xs sm:text-sm font-black uppercase text-[#0D0D0D]">
                          {tipItem.title}
                        </h4>
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-pixel font-bold px-1.5 py-0.5 bg-[#0D0D0D] text-white uppercase rounded shrink-0">
                        {tipItem.badge}
                      </span>
                    </div>

                    <p className="text-[9px] sm:text-[10px] font-mono-nb font-bold text-[#0D0D0D]/90 leading-relaxed bg-white/60 p-2 rounded-lg border border-[#0D0D0D]/30">
                      {tipItem.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2.5 sm:py-3 border-t-[3px] border-[#0D0D0D] bg-white flex justify-between items-center shrink-0">
          <span className="font-pixel text-[8px] sm:text-[9px] text-gray-700 font-bold">
            STANDARD TEXAS HOLD&apos;EM RULES
          </span>
          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="brutal-btn px-4 sm:px-6 py-1 sm:py-1.5 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] border-[2px] border-[#0D0D0D] font-display text-[10px] sm:text-xs font-black uppercase shadow-[2px_2px_0px_#0D0D0D] cursor-pointer"
          >
            GOT IT
          </button>
        </div>

      </div>
    </div>
  )
}
