"use client"

import React from 'react'
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

export default function HandRankingsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn select-none font-display">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#FFFFFF] border-[3px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_#0D0D0D] sm:shadow-[10px_10px_0px_#0D0D0D] flex flex-col overflow-hidden">
        
        {/* Title Bar */}
        <div className="bg-[#FFE500] border-b-[3px] sm:border-b-[4px] border-[#0D0D0D] p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0D0D0D]" />
            <h2 className="font-display text-sm sm:text-lg font-black text-[#0D0D0D] uppercase tracking-wide">
              HAND RANKINGS & TIPS
            </h2>
          </div>
          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#FF3333] hover:text-white text-[#0D0D0D] border-[2px] border-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list of hands */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 sm:space-y-3 bg-[#F6F5FA] custom-scrollbar flex-1">
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

        {/* Footer */}
        <div className="px-4 py-2.5 sm:py-3 border-t-[3px] border-[#0D0D0D] bg-white flex justify-between items-center">
          <span className="font-pixel text-[8px] sm:text-[9px] text-gray-700 font-bold">
            STANDARD TEXAS HOLD&apos;EM
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
