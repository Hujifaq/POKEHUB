"use client"

import React from 'react'

const HAND_RANKINGS = [
  {
    rank: 1,
    name: 'Royal Flush',
    subtitle: 'The ultimate unbeatable poker hand',
    cards: ['10♥', 'J♥', 'Q♥', 'K♥', 'A♥'],
    odds: '0.000154% (1 in 649,740)',
    payout: '1,000 : 1',
    badge: '👑 SUPREME'
  },
  {
    rank: 2,
    name: 'Straight Flush',
    subtitle: 'Five consecutive cards in the same suit',
    cards: ['5♠', '6♠', '7♠', '8♠', '9♠'],
    odds: '0.00139% (1 in 72,192)',
    payout: '200 : 1',
    badge: '🔥 ULTRA RARE'
  },
  {
    rank: 3,
    name: 'Four of a Kind',
    subtitle: 'All four cards of the same numerical rank',
    cards: ['A♠', 'A♥', 'A♦', 'A♣', 'K♦'],
    odds: '0.0240% (1 in 4,165)',
    payout: '50 : 1',
    badge: '⚡ EPIC'
  },
  {
    rank: 4,
    name: 'Full House',
    subtitle: 'Three of a kind combined with a pair',
    cards: ['K♠', 'K♥', 'K♦', '10♣', '10♥'],
    odds: '0.1441% (1 in 694)',
    payout: '20 : 1',
    badge: '💎 HIGH ROLLER'
  },
  {
    rank: 5,
    name: 'Flush',
    subtitle: 'Any five cards of the exact same suit',
    cards: ['2♦', '6♦', '9♦', 'J♦', 'A♦'],
    odds: '0.1965% (1 in 508)',
    payout: '10 : 1',
    badge: '✨ RARE'
  },
  {
    rank: 6,
    name: 'Straight',
    subtitle: 'Five cards of sequential rank of any suit',
    cards: ['4♠', '5♥', '6♦', '7♣', '8♠'],
    odds: '0.3925% (1 in 254)',
    payout: '5 : 1',
    badge: '🎯 STRONG'
  },
  {
    rank: 7,
    name: 'Three of a Kind',
    subtitle: 'Three cards of the identical rank',
    cards: ['Q♠', 'Q♥', 'Q♦', '8♣', '4♥'],
    odds: '2.1128% (1 in 47)',
    payout: '3 : 1',
    badge: 'SOLID'
  },
  {
    rank: 8,
    name: 'Two Pair',
    subtitle: 'Two distinct pairs of matching cards',
    cards: ['J♠', 'J♥', '7♦', '7♣', '2♠'],
    odds: '4.7539% (1 in 21)',
    payout: '2 : 1',
    badge: 'COMMON'
  },
  {
    rank: 9,
    name: 'One Pair',
    subtitle: 'Two cards of identical rank',
    cards: ['9♥', '9♣', 'K♠', '4♦', '2♥'],
    odds: '42.2569% (1 in 2.37)',
    payout: '1 : 1',
    badge: 'BASIC'
  },
  {
    rank: 10,
    name: 'High Card',
    subtitle: 'No combinations; highest card value decides',
    cards: ['A♠', 'Q♥', '9♦', '6♣', '2♠'],
    odds: '50.1177% (1 in 2)',
    payout: '0 : 1',
    badge: 'BASELINE'
  }
]

export default function HandRankingsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-true-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] brutal-window flex flex-col overflow-hidden shadow-[6px_6px_0px_#000]">
        
        {/* Title Bar */}
        <div className="bg-ui-blue border-b-[3px] sm:border-b-[4px] border-true-black p-2.5 sm:p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-true-black animate-pulse" />
            <span className="font-pixel text-true-black font-bold text-[10px] sm:text-xs uppercase">HAND_RANKINGS.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 brutal-btn bg-ui-pink text-true-black flex items-center justify-center font-pixel text-[10px] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list of hands */}
        <div className="p-2.5 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-primary-base custom-scrollbar">
          <div className="bg-white border-[3px] sm:border-[4px] border-true-black p-3 sm:p-4 brutal-shadow-sm mb-2 sm:mb-4">
            <h2 className="font-display text-lg sm:text-xl uppercase text-true-black mb-0.5">Official Poker Hand Rankings</h2>
            <p className="font-pixel text-[8.5px] sm:text-[10px] text-gray-600 uppercase">Hierarchy, Probabilities & High Roller Payouts</p>
          </div>

          {HAND_RANKINGS.map((item, index) => {
            // Alternate colors for a sticker-book feel
            const bgColors = ['bg-ui-pink', 'bg-accent-yellow', 'bg-ui-blue', 'bg-accent-cyan', 'bg-white'];
            const cardBg = bgColors[index % bgColors.length];

            return (
              <div
                key={item.rank}
                className={`p-3 sm:p-4 border-[3px] sm:border-[4px] border-true-black brutal-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 transition-transform hover:-translate-y-0.5 ${cardBg}`}
              >
                {/* Info */}
                <div className="flex items-start gap-2.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 border-[2.5px] sm:border-[4px] border-true-black bg-white text-true-black font-display text-base sm:text-lg flex items-center justify-center shrink-0 brutal-shadow-sm">
                    {item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-display uppercase text-true-black">{item.name}</h3>
                      <span className="text-[7.5px] sm:text-[8px] font-pixel px-1.5 sm:px-2 py-0.5 bg-true-black text-white uppercase border sm:border-[2px] border-white">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[8.5px] sm:text-[10px] font-pixel text-true-black uppercase">{item.subtitle}</p>
                  </div>
                </div>

                {/* Sample Cards */}
                <div className="flex items-center gap-1 sm:gap-2 self-start md:self-auto overflow-x-auto max-w-full">
                  {item.cards.map((c, i) => {
                    const isRed = c.includes('♥') || c.includes('♦')
                    return (
                      <div
                        key={i}
                        className="w-8 h-11 sm:w-10 sm:h-14 bg-white border-[2px] sm:border-[4px] border-true-black flex items-center justify-center font-display text-xs sm:text-sm brutal-shadow-sm shrink-0"
                        style={{ color: isRed ? '#ff0000' : 'var(--true-black)' }}
                      >
                        {c}
                      </div>
                    )
                  })}
                </div>

                {/* Odds & Payout */}
                <div className="text-left md:text-right shrink-0 bg-white border-[2.5px] sm:border-[4px] border-true-black p-1.5 sm:p-2 brutal-shadow-sm">
                  <div className="text-[9px] sm:text-[10px] font-pixel font-bold text-true-black uppercase">Payout {item.payout}</div>
                  <div className="text-[7.5px] sm:text-[8px] text-gray-700 mt-0.5 sm:mt-1 font-pixel uppercase">{item.odds}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-t-[3px] sm:border-t-[4px] border-true-black bg-white flex justify-between items-center gap-2">
          <span className="font-pixel text-[8px] sm:text-[10px] text-true-black uppercase truncate">Texas Hold'em 52-Card Rules</span>
          <button
            onClick={onClose}
            className="brutal-btn px-4 sm:px-6 py-1.5 sm:py-2 bg-accent-yellow text-true-black font-pixel text-[9px] sm:text-[10px] uppercase font-bold cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
