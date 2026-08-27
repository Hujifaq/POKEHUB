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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0b10] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#d4af37]/20 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                OFFICIAL POKER HAND RANKINGS
              </h2>
              <p className="text-xs text-[#d4af37]">Hierarchy, Probabilities & High Roller Payouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list of hands */}
        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
          {HAND_RANKINGS.map(item => (
            <div
              key={item.rank}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Info */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f1c40f] font-black text-sm flex items-center justify-center shrink-0">
                  {item.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{item.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f1c40f] border border-[#d4af37]/30">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              {/* Sample Cards */}
              <div className="flex items-center gap-1.5 self-center md:self-auto">
                {item.cards.map((c, i) => {
                  const isRed = c.includes('♥') || c.includes('♦')
                  return (
                    <div
                      key={i}
                      className="w-9 h-12 rounded-md bg-white border border-gray-300 shadow-sm flex items-center justify-center font-bold text-xs"
                      style={{ color: isRed ? '#e74c3c' : '#14161c' }}
                    >
                      {c}
                    </div>
                  )
                })}
              </div>

              {/* Odds & Payout */}
              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-emerald-400">Payout {item.payout}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{item.odds}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-xs text-gray-400">
          <span>Texas Hold'em Standard 52-Card Rules</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-black hover:bg-[#f1c40f] transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  )
}
