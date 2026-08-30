"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SoundEngine } from './SoundEngine'
import {
  PixelArt,
  PixelFireAura,
  PIX_SUITS,
  PIXEL_FRONTS,
  PIXEL_GRAFFITI,
  DECK_SKIN_THEMES
} from './PixelDeckAssets'
import { PixelAvatar } from './PixelAvatars'

const SUITS = [
  { key: 'hearts', symbol: '♥', color: '#FF3333', name: 'HEARTS' },
  { key: 'diamonds', symbol: '♦', color: '#FF3333', name: 'DIAMONDS' },
  { key: 'spades', symbol: '♠', color: '#0D0D0D', name: 'SPADES' },
  { key: 'clubs', symbol: '♣', color: '#0D0D0D', name: 'CLUBS' }
]

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

// 5 Distinct Neo-Brutalist AI Bot Personalities with Handcrafted 8-Bit Pixel Avatars
const BOT_ROSTER = [
  { id: 'bot_0', name: 'BOT 1', avatarKey: 'samurai', level: 42, color: '#00F5FF', style: 'TAG' },
  { id: 'bot_1', name: 'BOT 2', avatarKey: 'neko', level: 68, color: '#FFE500', style: 'LAG' },
  { id: 'bot_2', name: 'BOT 3', avatarKey: 'punk', level: 54, color: '#FF70A6', style: 'BLUFFER' },
  { id: 'bot_3', name: 'BOT 4', avatarKey: 'roller', level: 99, color: '#00F5FF', style: 'NIT' },
  { id: 'bot_4', name: 'BOT 5', avatarKey: 'queen', level: 77, color: '#FF70A6', style: 'STATION' }
]

// -------------------------------------------------------------------
// 3D CASINO POKER CHIP SYSTEM (NEO-BRUTALIST & INTERACTIVE)
// -------------------------------------------------------------------
const CHIP_DENOMINATIONS = [
  { val: 100, label: '$100', color: '#FFFFFF', textColor: '#0D0D0D', rimColor: '#0D0D0D', soundPitch: 1.35 },
  { val: 500, label: '$500', color: '#FF3333', textColor: '#FFFFFF', rimColor: '#FFFFFF', soundPitch: 1.15 },
  { val: 1000, label: '$1K', color: '#00F5FF', textColor: '#0D0D0D', rimColor: '#0D0D0D', soundPitch: 1.0 },
  { val: 5000, label: '$5K', color: '#FFE500', textColor: '#0D0D0D', rimColor: '#0D0D0D', soundPitch: 0.88 },
  { val: 10000, label: '$10K', color: '#FF70A6', textColor: '#0D0D0D', rimColor: '#FFFFFF', soundPitch: 0.75 }
]

function getChipForValue(val) {
  const num = Number(val) || 0
  if (num >= 10000) return CHIP_DENOMINATIONS[4]
  if (num >= 5000) return CHIP_DENOMINATIONS[3]
  if (num >= 1000) return CHIP_DENOMINATIONS[2]
  if (num >= 500) return CHIP_DENOMINATIONS[1]
  return CHIP_DENOMINATIONS[0]
}

function PokerChip({
  denom,
  size = 'md', // 'sm', 'md', 'lg'
  onClick,
  interactive = false,
  animateToss = false,
  className = ''
}) {
  const [isWobbling, setIsWobbling] = useState(false)
  const [floatNotice, setFloatNotice] = useState(null)

  const sizeStyles = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 text-[7px] sm:text-[8px]',
    md: 'w-10 h-10 sm:w-11 sm:h-11 text-[9px] sm:text-[10px]',
    lg: 'w-12 h-12 sm:w-13 sm:h-13 text-[10px] sm:text-xs'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (interactive && onClick) {
      setIsWobbling(true)
      setTimeout(() => setIsWobbling(false), 450)
      setFloatNotice(`+${denom.label}`)
      setTimeout(() => setFloatNotice(null), 650)
      SoundEngine.playChipClink({ pitch: denom.soundPitch, volume: 0.4 })
      onClick(denom.val)
    } else if (onClick) {
      setIsWobbling(true)
      setTimeout(() => setIsWobbling(false), 450)
      SoundEngine.playChipClink({ pitch: denom.soundPitch, volume: 0.35 })
      onClick()
    }
  }

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {floatNotice && (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-pixel text-[10px] font-black text-[#FFE500] drop-shadow-[1.5px_1.5px_0px_#000] pointer-events-none z-50 animate-chipFloatUp whitespace-nowrap">
          {floatNotice}
        </span>
      )}
      <div
        onClick={handleClick}
        className={`${sizeStyles[size]} rounded-full border-[2.5px] border-[#0D0D0D] flex items-center justify-center relative cursor-pointer font-pixel font-black select-none transition-all duration-150 ${
          interactive
            ? 'hover:-translate-y-2 hover:rotate-6 hover:scale-115 active:scale-95 shadow-[3.5px_3.5px_0px_#0D0D0D]'
            : 'shadow-[2.5px_2.5px_0px_#0D0D0D] hover:scale-105'
        } ${isWobbling ? 'animate-chipWobble' : ''} ${animateToss ? 'animate-chipToss' : ''}`}
        style={{
          backgroundColor: denom.color,
          color: denom.textColor
        }}
      >
        {/* Outer 8-Segment Casino Notches */}
        <div
          className="absolute inset-0.5 rounded-full border-[1.5px] border-dashed pointer-events-none opacity-60"
          style={{ borderColor: denom.rimColor }}
        />
        
        {/* Inner Solid Ring Inlay with Realistic Ceramic Depth */}
        <div
          className="w-[70%] h-[70%] rounded-full border-[1.5px] border-[#0D0D0D] flex items-center justify-center bg-white/40 backdrop-blur-[0.5px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
        >
          <span className="leading-none tracking-tighter drop-shadow-[0.5px_0.5px_0px_rgba(255,255,255,0.4)]">
            {denom.label.replace('$', '')}
          </span>
        </div>
      </div>
    </div>
  )
}

// 3D Stack of Physical Casino Chips
function ChipStack({ amount, size = 'sm', onClick, animate = false }) {
  if (!amount || amount <= 0) return null

  // Determine top chips to render in stack
  let remaining = amount
  const stack = []
  
  if (remaining >= 10000) {
    stack.push(CHIP_DENOMINATIONS[4])
    remaining -= 10000
  }
  if (remaining >= 5000) {
    stack.push(CHIP_DENOMINATIONS[3])
    remaining -= 5000
  }
  if (remaining >= 1000) {
    stack.push(CHIP_DENOMINATIONS[2])
    remaining -= 1000
  }
  if (remaining >= 500) {
    stack.push(CHIP_DENOMINATIONS[1])
    remaining -= 500
  }
  if (stack.length === 0 || remaining > 0) {
    stack.push(CHIP_DENOMINATIONS[0])
  }

  const visibleStack = stack.slice(0, 3)

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1.5 bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] px-2.5 py-1 rounded-full shadow-[3px_3px_0px_#0D0D0D] cursor-pointer hover:scale-105 active:scale-95 transition-all select-none ${
        animate ? 'animate-chipToss' : ''
      }`}
    >
      <div className="flex -space-x-3.5 items-center">
        {visibleStack.map((denom, i) => (
          <div key={i} style={{ transform: `translateY(${-i * 1.5}px)` }}>
            <PokerChip denom={denom} size={size} interactive={false} />
          </div>
        ))}
      </div>
      <span className="font-mono-nb text-xs sm:text-sm font-black text-[#0D0D0D]">
        ${amount.toLocaleString()}
      </span>
    </div>
  )
}

// Generate standard 52-card deck
function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        rank,
        suit: suit.key,
        symbol: suit.symbol,
        color: suit.color,
        val: RANK_VALUES[rank],
        id: `${rank}-${suit.key}-${Math.random()}`
      })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Official 7-card Texas Hold'em Hand Evaluator with exact 5-card kicker tie-breaking
function evaluateHand(cards) {
  if (!cards || cards.length < 5) return { score: 0, name: 'HIGH CARD', rank: 0 }

  const sorted = [...cards].sort((a, b) => b.val - a.val)
  const valCounts = {}
  const suitCounts = {}
  const suitCards = {}

  sorted.forEach(c => {
    valCounts[c.val] = (valCounts[c.val] || 0) + 1
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1
    if (!suitCards[c.suit]) suitCards[c.suit] = []
    suitCards[c.suit].push(c)
  })

  // 1. Check Flush
  let flushSuit = null
  for (const s in suitCounts) {
    if (suitCounts[s] >= 5) {
      flushSuit = s
      break
    }
  }

  // 2. Check Straight Flush / Royal Flush
  if (flushSuit) {
    const fCards = suitCards[flushSuit].sort((a, b) => b.val - a.val)
    const fVals = Array.from(new Set(fCards.map(c => c.val)))
    if (fVals.includes(14)) fVals.push(1) // Ace can be low (A-2-3-4-5)

    for (let i = 0; i <= fVals.length - 5; i++) {
      if (
        fVals[i] - fVals[i + 1] === 1 &&
        fVals[i + 1] - fVals[i + 2] === 1 &&
        fVals[i + 2] - fVals[i + 3] === 1 &&
        fVals[i + 3] - fVals[i + 4] === 1
      ) {
        const topVal = fVals[i]
        if (topVal === 14) {
          return { score: 9e10, name: 'ROYAL FLUSH 👑', rank: 9 }
        }
        return {
          score: 8e10 + topVal * 1e8,
          name: `STRAIGHT FLUSH (${getCardRankName(topVal)} HIGH) 🔥`,
          rank: 8
        }
      }
    }
  }

  // Group card value frequencies
  const counts = Object.entries(valCounts)
    .map(([val, count]) => ({ val: Number(val), count }))
    .sort((a, b) => b.count - a.count || b.val - a.val)

  // 3. Four of a Kind
  if (counts[0].count === 4) {
    const quadVal = counts[0].val
    const kicker = sorted.find(c => c.val !== quadVal)?.val || 0
    return {
      score: 7e10 + quadVal * 1e8 + kicker * 1e6,
      name: `FOUR OF A KIND (${getCardRankName(quadVal)}S)`,
      rank: 7
    }
  }

  // 4. Full House (trips + pair or trips + trips)
  if (counts[0].count === 3 && counts[1] && counts[1].count >= 2) {
    const tripsVal = counts[0].val
    const pairVal = counts[1].val
    return {
      score: 6e10 + tripsVal * 1e8 + pairVal * 1e6,
      name: `FULL HOUSE (${getCardRankName(tripsVal)}S OVER ${getCardRankName(pairVal)}S)`,
      rank: 6
    }
  }

  // 5. Flush (top 5 flush cards)
  if (flushSuit) {
    const fCards = suitCards[flushSuit].sort((a, b) => b.val - a.val).slice(0, 5)
    const score = 5e10 +
      fCards[0].val * 1e8 +
      fCards[1].val * 1e6 +
      fCards[2].val * 1e4 +
      fCards[3].val * 1e2 +
      fCards[4].val
    return {
      score,
      name: `FLUSH (${getCardRankName(fCards[0].val)} HIGH)`,
      rank: 5
    }
  }

  // 6. Straight
  const uniqueVals = Array.from(new Set(sorted.map(c => c.val)))
  if (uniqueVals.includes(14)) uniqueVals.push(1) // Ace can be low for A-2-3-4-5 wheel

  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    if (
      uniqueVals[i] - uniqueVals[i + 1] === 1 &&
      uniqueVals[i + 1] - uniqueVals[i + 2] === 1 &&
      uniqueVals[i + 2] - uniqueVals[i + 3] === 1 &&
      uniqueVals[i + 3] - uniqueVals[i + 4] === 1
    ) {
      const topVal = uniqueVals[i]
      return {
        score: 4e10 + topVal * 1e8,
        name: `STRAIGHT (${getCardRankName(topVal)} HIGH)`,
        rank: 4
      }
    }
  }

  // 7. Three of a Kind
  if (counts[0].count === 3) {
    const tripsVal = counts[0].val
    const kickers = sorted.filter(c => c.val !== tripsVal).slice(0, 2)
    const k1 = kickers[0]?.val || 0
    const k2 = kickers[1]?.val || 0
    return {
      score: 3e10 + tripsVal * 1e8 + k1 * 1e6 + k2 * 1e4,
      name: `THREE OF A KIND (${getCardRankName(tripsVal)}S)`,
      rank: 3
    }
  }

  // 8. Two Pair
  if (counts[0].count === 2 && counts[1] && counts[1].count === 2) {
    const highPair = Math.max(counts[0].val, counts[1].val)
    const lowPair = Math.min(counts[0].val, counts[1].val)
    const kicker = sorted.find(c => c.val !== highPair && c.val !== lowPair)?.val || 0
    return {
      score: 2e10 + highPair * 1e8 + lowPair * 1e6 + kicker * 1e4,
      name: `TWO PAIR (${getCardRankName(highPair)}S & ${getCardRankName(lowPair)}S)`,
      rank: 2
    }
  }

  // 9. One Pair
  if (counts[0].count === 2) {
    const pairVal = counts[0].val
    const kickers = sorted.filter(c => c.val !== pairVal).slice(0, 3)
    const k1 = kickers[0]?.val || 0
    const k2 = kickers[1]?.val || 0
    const k3 = kickers[2]?.val || 0
    return {
      score: 1e10 + pairVal * 1e8 + k1 * 1e6 + k2 * 1e4 + k3 * 1e2,
      name: `ONE PAIR OF ${getCardRankName(pairVal)}S`,
      rank: 1
    }
  }

  // 10. High Card
  const top5 = sorted.slice(0, 5)
  const score =
    top5[0].val * 1e8 +
    (top5[1]?.val || 0) * 1e6 +
    (top5[2]?.val || 0) * 1e4 +
    (top5[3]?.val || 0) * 1e2 +
    (top5[4]?.val || 0)
  return {
    score,
    name: `HIGH CARD (${getCardRankName(top5[0].val)})`,
    rank: 0
  }
}

function getCardRankName(val) {
  if (val === 14 || val === 1) return 'ACE'
  if (val === 13) return 'KING'
  if (val === 12) return 'QUEEN'
  if (val === 11) return 'JACK'
  if (val === 10) return '10'
  return String(val)
}

// Smart AI Decision Engine
function decideBotAction({ bot, cards, communityCards, stage, pot, currentCallAmount, minRaise, bankroll }) {
  if (!cards || cards.length < 2 || !cards[0] || !cards[1]) {
    return { action: 'FOLD', amount: 0 }
  }
  const allCards = [...cards, ...(communityCards || [])]
  const evalResult = evaluateHand(allCards)
  const rank = evalResult.rank

  // Pre-flop
  if (stage === 'preflop') {
    const [c1, c2] = cards
    const isPair = c1.rank === c2.rank
    const isSuited = c1.suit === c2.suit
    const highVal = Math.max(c1.val, c2.val)
    const lowVal = Math.min(c1.val, c2.val)

    let strength = highVal * 2 + lowVal + (isPair ? 25 : 0) + (isSuited ? 5 : 0)
    if (bot.style === 'LAG') strength += 6
    if (bot.style === 'BLUFFER') strength += 8
    if (bot.style === 'STATION') strength += 4

    if (strength >= 42 || (isPair && c1.val >= 10)) {
      const raiseSize = Math.min(bankroll, minRaise * 2)
      return { action: 'RAISE', amount: raiseSize }
    } else if (strength >= 28 || isPair || highVal >= 11) {
      if (currentCallAmount === 0 && Math.random() > 0.45) {
        return { action: 'RAISE', amount: minRaise }
      }
      return { action: 'CALL', amount: currentCallAmount }
    } else if (currentCallAmount === 0) {
      return { action: 'CHECK', amount: 0 }
    } else if (currentCallAmount <= 500 && (bot.style === 'STATION' || Math.random() > 0.4)) {
      return { action: 'CALL', amount: currentCallAmount }
    } else {
      return { action: 'FOLD', amount: 0 }
    }
  }

  // Post-flop
  const bluffRoll = Math.random()
  const isBluffing =
    (bot.style === 'BLUFFER' && bluffRoll < 0.35) ||
    (bot.style === 'LAG' && bluffRoll < 0.22) ||
    bluffRoll < 0.08

  if (rank >= 4) {
    const raiseSize = Math.min(bankroll, Math.max(minRaise * 2, Math.floor(pot * 0.5)))
    return { action: 'RAISE', amount: raiseSize }
  } else if (rank >= 2) {
    if (currentCallAmount === 0 || Math.random() > 0.35) {
      const raiseSize = Math.min(bankroll, minRaise)
      return { action: 'RAISE', amount: raiseSize }
    }
    return { action: 'CALL', amount: currentCallAmount }
  } else if (rank === 1) {
    if (currentCallAmount === 0) {
      return { action: 'CHECK', amount: 0 }
    } else if (currentCallAmount <= pot * 0.4 || bot.style === 'STATION') {
      return { action: 'CALL', amount: currentCallAmount }
    } else if (isBluffing) {
      return { action: 'RAISE', amount: minRaise }
    } else {
      return { action: 'FOLD', amount: 0 }
    }
  } else {
    if (currentCallAmount === 0) {
      if (isBluffing && stage === 'river') {
        const bluffSize = Math.min(bankroll, minRaise * 2)
        return { action: 'RAISE', amount: bluffSize }
      }
      return { action: 'CHECK', amount: 0 }
    } else if (isBluffing && currentCallAmount <= minRaise) {
      return { action: 'RAISE', amount: minRaise * 2 }
    } else {
      return { action: 'FOLD', amount: 0 }
    }
  }
}

// Neo-Brutalist Playing Card with Dynamic Dealing & 3D Flip Animations
// Neo-Brutalist Playing Card with Exact 8-Bit Pixel Artwork & Tight Fire Aura (Exact Showcase Design)
function BrutalistCard({
  card,
  hidden = false,
  delay = 0,
  highlighted = false,
  small = false,
  large = false,
  deckSkin = 'obsidian'
}) {
  const skinTheme = DECK_SKIN_THEMES[deckSkin] || DECK_SKIN_THEMES.obsidian
  const graffitiMat = PIXEL_GRAFFITI[skinTheme.themeStyle] || PIXEL_GRAFFITI.obsidian
  const frontMat = PIXEL_FRONTS[skinTheme.themeStyle] || PIXEL_FRONTS.obsidian
  const suitPix = card ? (PIX_SUITS[card.suit] || PIX_SUITS.spades) : PIX_SUITS.spades

  // ENLARGED SIZES FOR MAXIMUM READABILITY & IMPACT
  const sizeClasses = small
    ? 'w-11 h-16 sm:w-13 sm:h-18'
    : large
    ? 'w-20 h-29 sm:w-25 sm:h-36 md:w-28 md:h-40'
    : 'w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-32'

  const hardShadowStyle = {
    boxShadow: highlighted
      ? `4px 4px 0px #0D0D0D, 0 0 0 2.5px #FF70A6`
      : `3.5px 3.5px 0px #0D0D0D`
  }

  return (
    <div
      className="relative inline-block select-none transform transition-all duration-200 hover:-translate-y-1 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      <PixelFireAura
        themeStyle={skinTheme.themeStyle}
        isHovered={highlighted || large}
      />

      {hidden || !card ? (
        // EXACT BACK FACE: Full-Card Outline Pixel Graffiti on Deep Black #07080d
        <div
          className={`${sizeClasses} rounded-xl border-[3px] border-[#0D0D0D] bg-[#07080d] flex items-center justify-center p-1 relative select-none overflow-hidden z-10`}
          style={hardShadowStyle}
        >
          <PixelArt
            matrix={graffitiMat}
            size={large ? 3.6 : small ? 1.6 : 2.7}
            defaultColor={skinTheme.accentColor}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        // EXACT FRONT FACE: Porcelain Creme #FAF7F2, 8-Bit Pixel Typography, Corner Suits & Centerpiece Emblem
        <div
          className={`${sizeClasses} rounded-xl border-[3px] border-[#0D0D0D] bg-[#FAF7F2] flex flex-col justify-between p-1.5 sm:p-2 relative select-none cursor-pointer z-10 overflow-hidden`}
          style={hardShadowStyle}
        >
          {/* Subtle CRT / Hologram Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />

          {/* Top Corner Index: 8-Bit Pixel Rank & Pixel Suit */}
          <div className="flex justify-between items-start leading-none relative z-10">
            <div className="flex flex-col items-center">
              <span
                className="font-pixel text-xs sm:text-sm md:text-base font-black leading-none drop-shadow-[1px_1px_0px_#fff]"
                style={{ color: card.color }}
              >
                {card.rank}
              </span>
              <div className="mt-1">
                <PixelArt
                  matrix={suitPix}
                  size={small ? 1.1 : large ? 1.6 : 1.4}
                  defaultColor={card.color}
                />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black" style={{ color: card.color }}>
              {card.symbol}
            </span>
          </div>

          {/* Centerpiece 8-Bit Artwork Motif in Iconic Neo-Brutalist Emblem Box */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-xl border-[2px] sm:border-[2.5px] border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center">
              <PixelArt
                matrix={frontMat}
                size={large ? 3.4 : small ? 1.5 : 2.4}
                defaultColor={skinTheme.accentColor}
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom Inverted Corner Index */}
          <div className="flex justify-between items-end leading-none rotate-180 relative z-10">
            <div className="flex flex-col items-center">
              <span
                className="font-pixel text-xs sm:text-sm md:text-base font-black leading-none drop-shadow-[1px_1px_0px_#fff]"
                style={{ color: card.color }}
              >
                {card.rank}
              </span>
              <div className="mt-1">
                <PixelArt
                  matrix={suitPix}
                  size={small ? 1.1 : large ? 1.6 : 1.4}
                  defaultColor={card.color}
                />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black" style={{ color: card.color }}>
              {card.symbol}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const GAME_STAGES = [
  { key: 'preflop', label: 'PRE-FLOP' },
  { key: 'flop', label: 'FLOP' },
  { key: 'turn', label: 'TURN' },
  { key: 'river', label: 'RIVER' },
  { key: 'showdown', label: 'SHOWDOWN' }
]

export default function PokerDuelGame({ isOpen, onClose, bankroll, setBankroll }) {
  // Game Setup
  const [activeBots, setActiveBots] = useState([])
  const [equippedDeck, setEquippedDeck] = useState('obsidian')
  
  const [deck, setDeck] = useState([])
  const [stage, setStage] = useState('idle')
  const [playerCards, setPlayerCards] = useState([])
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [currentRoundHighBet, setCurrentRoundHighBet] = useState(500)
  const [playerRoundBet, setPlayerRoundBet] = useState(500)
  const [raiseAmount, setRaiseAmount] = useState(500)
  const [playerHandName, setPlayerHandName] = useState('')
  const [winningHandName, setWinningHandName] = useState('')
  const [gameResult, setGameResult] = useState(null)
  const [winnerName, setWinnerName] = useState('')
  const [isPlayerFolded, setIsPlayerFolded] = useState(false)
  const [isPlayerAllIn, setIsPlayerAllIn] = useState(false)
  
  // Bankruptcy & Table Seating Management States
  const [isHeroSittingOut, setIsHeroSittingOut] = useState(false)
  const [heroQueuedToJoin, setHeroQueuedToJoin] = useState(false)
  const heroQueuedToJoinRef = useRef(false)
  
  // Real-time synchronization refs to prevent stale closure lockups
  const deckRef = useRef([])
  const communityCardsRef = useRef([])
  const stageRef = useRef('idle')
  const isPlayerFoldedRef = useRef(false)
  const isPlayerAllInRef = useRef(false)
  const activeBotsRef = useRef([])
  const highBetRef = useRef(500)
  const potRef = useRef(0)
  const [autoNextSeconds, setAutoNextSeconds] = useState(null)
  const autoNextIntervalRef = useRef(null)
  const botThinkIntervalRef = useRef(null)
  const botThinkTimeoutRef = useRef(null)
  
  // 10-Second Turn Countdown Timer (HP-style Gauge Bar)
  const TURN_TIME_LIMIT = 10
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(TURN_TIME_LIMIT)
  const turnTimerIntervalRef = useRef(null)

  const getTimerColor = (remaining) => {
    const percent = (remaining / TURN_TIME_LIMIT) * 100
    if (percent > 60) return '#00F5FF' // Electric Cyan (Healthy)
    if (percent > 30) return '#FFE500' // Yellow / Amber (Warning)
    return '#FF3333' // Critical Red (Danger)
  }

  // Turn Management States
  const [currentTurnActor, setCurrentTurnActor] = useState('PLAYER')
  const [activeTurnName, setActiveTurnName] = useState('YOUR MOVE')
  const [isProcessingBot, setIsProcessingBot] = useState(false)

  // Dynamic Flying Chip Particle State
  const [flyingChips, setFlyingChips] = useState([])
  const [potPulsing, setPotPulsing] = useState(false)

  const triggerChipFlight = useCallback((origin, amount) => {
    if (!amount || amount <= 0) return
    const id = Math.random()
    const chip = getChipForValue(amount)
    setFlyingChips(prev => [...prev, { id, origin, amount, chip }])
    SoundEngine.playChipClink({ brightness: 1.3, pitch: chip.soundPitch })

    setTimeout(() => {
      setPotPulsing(true)
      SoundEngine.playChipsStack()
      setTimeout(() => setPotPulsing(false), 260)
      setFlyingChips(prev => prev.filter(c => c.id !== id))
    }, 520)
  }, [])

  // Floating Action Pop-up Alert
  const [actionToast, setActionToast] = useState(null)
  const toastTimerRef = useRef(null)

  const triggerToast = (actor, actionText, color = '#FFE500', icon = '💬') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setActionToast({ actor, actionText, color, icon, id: Math.random() })
    toastTimerRef.current = setTimeout(() => {
      setActionToast(null)
    }, 2200)
  }

  // Load equipped deck from localStorage & listen for changes
  useEffect(() => {
    const checkEquipped = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pokehub_equipped_deck')
        if (saved && (DECK_SKIN_THEMES[saved] || saved === 'classic')) {
          const validKey = saved === 'classic' ? 'gold' : saved
          setEquippedDeck(validKey)
        }
      }
    }
    checkEquipped()
    if (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', checkEquipped)
      return () => {
        if (typeof window !== 'undefined' && window && typeof window.removeEventListener === 'function') {
          window.removeEventListener('storage', checkEquipped)
        }
      }
    }
  }, [isOpen])

  const handleSwitchDeck = (skinKey) => {
    SoundEngine.playCardFlip()
    setEquippedDeck(skinKey)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', skinKey)
    }
    triggerToast('DECK', `EQUIPPED ${DECK_SKIN_THEMES[skinKey].name}!`, '#FFE500', '🎴')
  }

  // Initialize 5 Table Seats (First 2 seated by default, 3 open with [+] buttons)
  useEffect(() => {
    const initialSeats = BOT_ROSTER.map((bot, idx) => ({
      ...bot,
      isSeated: idx < 2, // Seat 0 and Seat 1 seated by default
      cards: [],
      bankroll: idx < 2 ? 10000 : 0,
      currentBet: 0,
      lastAction: 'ANTE $500',
      actionType: 'ante',
      folded: idx >= 2,
      isBusted: idx >= 2,
      queuedToJoin: false,
      handName: '',
      isThinking: false
    }))
    setActiveBots(initialSeats)
    activeBotsRef.current = initialSeats
  }, [])

  // Seat Management: Sit Bot down with $10,000
  const handleSeatBot = (seatIndex) => {
    SoundEngine.playChipsStack()
    const rosterBot = BOT_ROSTER[seatIndex]
    setActiveBots(prev => {
      const updated = [...prev]
      updated[seatIndex] = {
        ...rosterBot,
        isSeated: true,
        bankroll: 10000,
        cards: [],
        currentBet: 0,
        lastAction: 'SEATED',
        actionType: 'none',
        folded: false,
        isBusted: false,
        queuedToJoin: true,
        handName: '',
        isThinking: false
      }
      activeBotsRef.current = updated
      return updated
    })
    triggerToast('TABLE', `${rosterBot.name} SEATED ($10,000)! 🪑`, '#FFE500', '🪑')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  const handleStandUpBot = (seatIndex) => {
    SoundEngine.playClick()
    const rosterBot = BOT_ROSTER[seatIndex]
    setActiveBots(prev => {
      const updated = [...prev]
      updated[seatIndex] = {
        ...rosterBot,
        isSeated: false,
        bankroll: 0,
        cards: [],
        currentBet: 0,
        folded: true,
        isBusted: true,
        queuedToJoin: false
      }
      activeBotsRef.current = updated
      return updated
    })
    triggerToast('TABLE', `${rosterBot.name} LEFT THE TABLE 🚪`, '#CCCCCC', '🚪')
  }

  // Table & Player Rebuy Management
  const handleHeroRebuy = () => {
    SoundEngine.playJackpot()
    setHeroQueuedToJoin(true)
    heroQueuedToJoinRef.current = true
    triggerToast('YOU', 'REBUY $10,000! QUEUED TO JOIN NEXT HAND ⏳', '#00F5FF', '💰')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  const handleRebuyBot = (botId) => {
    SoundEngine.playChipsStack()
    const updated = activeBots.map(b => b.id === botId ? { ...b, queuedToJoin: true, isSeated: true } : b)
    setActiveBots(updated)
    activeBotsRef.current = updated
    const bot = activeBots.find(b => b.id === botId)
    triggerToast('TABLE', `${bot?.name || 'BOT'} +$10,000! QUEUED TO RE-JOIN NEXT HAND 🔄`, '#FFE500', '🔄')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  const handleRebuyAllBots = () => {
    SoundEngine.playJackpot()
    const updated = activeBots.map(b => ({ ...b, isSeated: true, queuedToJoin: true, isBusted: false, bankroll: 10000 }))
    setActiveBots(updated)
    activeBotsRef.current = updated
    triggerToast('TABLE', 'ALL BOTS SEATED & REBOUGHT ($10,000)! 🤖', '#FFE500', '🤖')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  // Start a new hand
  const startNewHand = useCallback(() => {
    if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
    setAutoNextSeconds(null)

    // Check Hero Rebuy Queue & Status
    let currentHeroBankroll = bankroll
    let heroParticipating = !isHeroSittingOut && currentHeroBankroll >= 500

    if (heroQueuedToJoinRef.current || (isHeroSittingOut && currentHeroBankroll >= 500)) {
      if (currentHeroBankroll < 500) {
        currentHeroBankroll = 10000
        setBankroll(10000)
        SoundEngine.playJackpot()
      }
      setIsHeroSittingOut(false)
      setHeroQueuedToJoin(false)
      heroQueuedToJoinRef.current = false
      heroParticipating = true
    } else if (currentHeroBankroll < 500) {
      setIsHeroSittingOut(true)
      heroParticipating = false
    }

    const ante = 500
    let totalPot = 0

    // Process Bot Rebuys and Active Status
    const currentBotsList = activeBotsRef.current.length > 0 ? activeBotsRef.current : activeBots
    const newBots = BOT_ROSTER.map((rosterBot, idx) => {
      const existing = currentBotsList[idx]
      if (!existing || !existing.isSeated) {
        return {
          ...rosterBot,
          isSeated: false,
          bankroll: 0,
          isBusted: true,
          queuedToJoin: false,
          cards: [],
          currentBet: 0,
          lastAction: '',
          actionType: 'none',
          folded: true,
          handName: '',
          isThinking: false
        }
      }

      let bBankroll = existing.bankroll
      let bBusted = existing.isBusted

      if (existing.queuedToJoin) {
        bBankroll = 10000
        bBusted = false
      } else if (bBankroll < ante) {
        bBusted = true
      }

      return {
        ...existing,
        isSeated: true,
        bankroll: bBankroll,
        isBusted: bBusted,
        queuedToJoin: false,
        cards: [],
        currentBet: 0,
        lastAction: bBusted ? 'BUSTED 💀' : 'WAITING',
        actionType: 'none',
        folded: bBusted,
        handName: '',
        isThinking: false
      }
    })

    const playingBots = newBots.filter(b => b.isSeated && !b.isBusted)

    // Check if table has at least 2 active players to deal
    const totalActivePlayers = (heroParticipating ? 1 : 0) + playingBots.length
    if (totalActivePlayers < 2) {
      setActiveBots(newBots)
      activeBotsRef.current = newBots
      setStage('table_paused')
      stageRef.current = 'table_paused'
      setCurrentTurnActor('TABLE_PAUSED')
      if (heroParticipating && playingBots.length === 0) {
        setActiveTurnName('👑 TABLE CONQUERED!')
        triggerToast('CHAMPION', 'ALL OPPONENTS BUSTED! 🏆', '#00F5FF', '🏆')
      } else {
        setActiveTurnName('TABLE PAUSED ⏸️')
      }
      return
    }

    const newDeck = createDeck()

    // Deal to Hero if participating
    let pCards = []
    if (heroParticipating) {
      pCards = [newDeck.pop(), newDeck.pop()]
      currentHeroBankroll = Math.max(0, currentHeroBankroll - ante)
      setBankroll(currentHeroBankroll)
      setPlayerRoundBet(ante)
      totalPot += ante
      triggerChipFlight('player', ante)
      isPlayerFoldedRef.current = false
      setIsPlayerFolded(false)
      isPlayerAllInRef.current = false
      setIsPlayerAllIn(false)
    } else {
      isPlayerFoldedRef.current = true
      setIsPlayerFolded(true)
      setPlayerRoundBet(0)
    }

    // Deal to Playing Bots
    const finalBots = newBots.map(bot => {
      if (!bot.isSeated || bot.isBusted) return bot
      const bCards = [newDeck.pop(), newDeck.pop()]
      totalPot += ante
      return {
        ...bot,
        cards: bCards,
        bankroll: Math.max(0, bot.bankroll - ante),
        currentBet: ante,
        lastAction: 'ANTE $500',
        actionType: 'ante',
        folded: false
      }
    })

    playingBots.forEach((b, idx) => {
      const realIdx = finalBots.findIndex(x => x.id === b.id)
      setTimeout(() => triggerChipFlight(`bot_${realIdx}`, ante), idx * 90 + 50)
    })

    setCurrentRoundHighBet(ante)
    highBetRef.current = ante
    potRef.current = totalPot
    deckRef.current = newDeck
    communityCardsRef.current = []
    stageRef.current = 'preflop'

    setDeck(newDeck)
    setPlayerCards(pCards)
    setActiveBots(finalBots)
    activeBotsRef.current = finalBots
    setCommunityCards([])
    setPot(totalPot)
    setRaiseAmount(500)
    setStage('preflop')
    setGameResult(null)
    setWinnerName('')
    setWinningHandName('')
    setPlayerHandName('')

    if (heroParticipating) {
      setCurrentTurnActor('PLAYER')
      setActiveTurnName('YOUR MOVE 👑')
    } else {
      setCurrentTurnActor('BOTS_SPECTATING')
      setActiveTurnName('SPECTATING BOTS 🍿')
      setTimeout(() => {
        runSequentialBotTurns(newDeck, true, true, finalBots)
      }, 800)
    }

    setIsProcessingBot(false)
    setActionToast(null)
    SoundEngine.playCardSwoosh()
    setTimeout(() => SoundEngine.playCardFlip(), 200)
  }, [activeBots, bankroll, isHeroSittingOut, triggerChipFlight, setBankroll])

  useEffect(() => {
    if (isOpen && stage === 'idle') {
      startNewHand()
    }
  }, [isOpen, stage, startNewHand])

  // Turn Timer Effect: 10s Countdown with Auto-Fold on Expiry
  useEffect(() => {
    if (turnTimerIntervalRef.current) {
      clearInterval(turnTimerIntervalRef.current)
      turnTimerIntervalRef.current = null
    }

    if (isOpen && currentTurnActor === 'PLAYER' && stage !== 'showdown' && !isPlayerFolded && !isPlayerAllIn) {
      setTurnTimeRemaining(TURN_TIME_LIMIT)
      const startTime = Date.now()
      const totalDuration = TURN_TIME_LIMIT * 1000

      turnTimerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remainingMs = Math.max(0, totalDuration - elapsed)
        const remainingSec = Math.max(0, remainingMs / 1000)

        setTurnTimeRemaining(remainingSec)

        if (remainingSec <= 0) {
          clearInterval(turnTimerIntervalRef.current)
          turnTimerIntervalRef.current = null
          isPlayerFoldedRef.current = true
          setIsPlayerFolded(true)
          SoundEngine.playCardSwoosh()
          triggerToast('DEALER', "⏱️ TIME'S UP (10s)! AUTO-FOLDED 🏳️", '#FF3333', '⏱️')
          setCurrentTurnActor('BOTS_SPECTATING')
          setActiveTurnName('SPECTATING BOTS 🍿')
          runSequentialBotTurns(deckRef.current, true, true)
        }
      }, 100)
    } else {
      setTurnTimeRemaining(TURN_TIME_LIMIT)
    }

    return () => {
      if (turnTimerIntervalRef.current) {
        clearInterval(turnTimerIntervalRef.current)
        turnTimerIntervalRef.current = null
      }
    }
  }, [isOpen, currentTurnActor, stage, isPlayerFolded, isPlayerAllIn])

  // Real-time Player Hand Evaluator
  useEffect(() => {
    if (playerCards.length > 0) {
      const evalResult = evaluateHand([...playerCards, ...communityCards])
      setPlayerHandName(evalResult.name)
    }
  }, [playerCards, communityCards])

  const playerCallAmount = Math.max(0, currentRoundHighBet - playerRoundBet)

  // Bot Victory When All Others Folded
  const triggerBotVictory = (winnerBot, potVal, botsState) => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    setStage('showdown')
    stageRef.current = 'showdown'
    setCurrentTurnActor('SHOWDOWN')
    setActiveTurnName(`${winnerBot.name} WINS! 🏆`)
    setWinnerName(winnerBot.name)
    setWinningHandName('LAST SURVIVOR')
    setGameResult('bot_win')

    const updatedBots = (botsState || activeBots).map(b => {
      if (b.id === winnerBot.id) {
        const newB = b.bankroll + potVal
        return { ...b, bankroll: newB, isBusted: newB < 500, handName: 'WINNER 👑' }
      }
      return { ...b, isBusted: b.bankroll < 500 }
    })
    setActiveBots(updatedBots)
    SoundEngine.playChipsStack()
    triggerToast(winnerBot.name, `WINS $${potVal.toLocaleString()}! 🏆`, '#FFE500', '🏆')

    // Auto-advance countdown
    if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
    let remaining = 6
    setAutoNextSeconds(remaining)
    autoNextIntervalRef.current = setInterval(() => {
      remaining--
      if (remaining <= 0) {
        clearInterval(autoNextIntervalRef.current)
        setAutoNextSeconds(null)
        startNewHand()
      } else {
        setAutoNextSeconds(remaining)
      }
    }, 1000)
  }

  // Showdown Evaluation with Split Pot Support
  const triggerMultiShowdown = (botsState, potVal, playerFoldedNow = false, customBoard = null) => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    setStage('showdown')
    stageRef.current = 'showdown'
    setCurrentTurnActor('SHOWDOWN')
    setActiveTurnName('SHOWDOWN 🏆')
    SoundEngine.playCardFlip()

    const board = customBoard || communityCardsRef.current || communityCards
    const finalPot = potVal || pot
    const isHeroFolded = playerFoldedNow || isPlayerFoldedRef.current

    const contenders = []

    // Evaluate Hero
    let heroEval = null
    if (!isHeroFolded && playerCards.length > 0) {
      heroEval = evaluateHand([...playerCards, ...board])
      setPlayerHandName(heroEval.name)
      contenders.push({
        id: 'player',
        name: 'YOU',
        isHero: true,
        score: heroEval.score,
        handName: heroEval.name
      })
    }

    // Evaluate Bots
    const revealedBots = (botsState || activeBots).map(bot => {
      if (bot.folded || bot.isBusted) return bot
      const bEval = evaluateHand([...bot.cards, ...board])
      contenders.push({
        id: bot.id,
        name: bot.name,
        isHero: false,
        score: bEval.score,
        handName: bEval.name,
        botObj: bot
      })
      return { ...bot, handName: bEval.name }
    })

    if (contenders.length === 0) return

    // Find Highest Hand Score
    const maxScore = Math.max(...contenders.map(c => c.score))
    const winners = contenders.filter(c => c.score === maxScore)
    const winningHand = winners[0].handName
    setWinningHandName(winningHand)

    const splitPayout = Math.floor(finalPot / winners.length)
    const winnerNames = winners.map(w => w.name).join(' & ')
    setWinnerName(winnerNames)

    // Distribute Chips & Check Bankruptcy
    const isHeroWinner = winners.some(w => w.isHero)

    const finalBots = revealedBots.map(bot => {
      const isThisBotWinner = winners.some(w => w.id === bot.id)
      const newBankroll = isThisBotWinner ? bot.bankroll + splitPayout : bot.bankroll
      const isBustedNow = newBankroll < 500
      return {
        ...bot,
        bankroll: newBankroll,
        isBusted: isBustedNow,
        handName: isThisBotWinner ? `${winningHand} (WINNER)` : bot.handName
      }
    })
    setActiveBots(finalBots)

    if (winners.length > 1) {
      // Split Pot Scenario
      if (isHeroWinner) {
        setBankroll(b => {
          const newB = b + splitPayout
          if (newB < 500) setIsHeroSittingOut(true)
          return newB
        })
        setGameResult('split')
        SoundEngine.playJackpot()
        triggerToast('DEALER', `SPLIT POT! ${winnerNames} SPLIT $${finalPot.toLocaleString()} ($${splitPayout.toLocaleString()} EACH) 🤝`, '#FFE500', '🤝')
      } else {
        if (bankroll < 500) setIsHeroSittingOut(true)
        setGameResult('bot_win')
        SoundEngine.playChipsStack()
        triggerToast('DEALER', `SPLIT POT! ${winnerNames} SPLIT $${finalPot.toLocaleString()} 🤝`, '#FFE500', '🤝')
      }
    } else {
      // Single Winner Scenario
      if (isHeroWinner) {
        setGameResult('win')
        setBankroll(b => b + finalPot)
        SoundEngine.playJackpot()
        triggerToast('DEALER', `YOU WON $${finalPot.toLocaleString()}! 🏆`, '#00F5FF', '🏆')
      } else {
        if (bankroll < 500) {
          setIsHeroSittingOut(true)
          triggerToast('YOU', '💀 OUT OF CHIPS! SITTING OUT. REBUY TO JOIN NEXT HAND.', '#FF3333', '💀')
        }
        setGameResult(isHeroFolded ? 'bot_win' : 'lose')
        SoundEngine.playChipsStack()
        triggerToast(winners[0].name, `WINS $${finalPot.toLocaleString()}! 🏆`, '#FFE500', '🏆')
      }
    }

    // Auto-advance countdown
    if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
    let remaining = 6
    setAutoNextSeconds(remaining)
    autoNextIntervalRef.current = setInterval(() => {
      remaining--
      if (remaining <= 0) {
        clearInterval(autoNextIntervalRef.current)
        setAutoNextSeconds(null)
        startNewHand()
      } else {
        setAutoNextSeconds(remaining)
      }
    }, 1000)
  }

  // Advance Board Street (Deterministic length-based street transitions)
  const advanceBoardStreet = (deckSource, botsState, currentPotVal, currentHighBetVal, autoDrive = false) => {
    const curDeck = deckSource || deckRef.current || [...deck]
    const activeBotsList = botsState || (activeBotsRef.current.length > 0 ? activeBotsRef.current : activeBots)

    setPlayerRoundBet(0)
    setCurrentRoundHighBet(0)
    highBetRef.current = 0
    potRef.current = currentPotVal !== undefined ? currentPotVal : pot
    const resetBots = activeBotsList.map(b => ({ ...b, currentBet: 0 }))
    setActiveBots(resetBots)
    activeBotsRef.current = resetBots

    const currentLen = communityCardsRef.current.length

    if (currentLen === 0) {
      // Dealing Preflop -> FLOP (3 Cards)
      const c1 = curDeck.pop()
      const c2 = curDeck.pop()
      const c3 = curDeck.pop()
      const newBoard = [c1, c2, c3]
      communityCardsRef.current = newBoard
      deckRef.current = curDeck
      stageRef.current = 'flop'

      setCommunityCards(newBoard)
      setDeck([...curDeck])
      setStage('flop')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'FLOP (3 CARDS) 🃏', '#FFE500', '🃏')
    } else if (currentLen === 3) {
      // Dealing Flop -> TURN (4th Card)
      const turnCard = curDeck.pop()
      const newBoard = [...communityCardsRef.current, turnCard]
      communityCardsRef.current = newBoard
      deckRef.current = curDeck
      stageRef.current = 'turn'

      setCommunityCards(newBoard)
      setDeck([...curDeck])
      setStage('turn')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'TURN (4TH CARD) 🃏', '#FFE500', '🃏')
    } else if (currentLen === 4) {
      // Dealing Turn -> RIVER (5th Card)
      const riverCard = curDeck.pop()
      const newBoard = [...communityCardsRef.current, riverCard]
      communityCardsRef.current = newBoard
      deckRef.current = curDeck
      stageRef.current = 'river'

      setCommunityCards(newBoard)
      setDeck([...curDeck])
      setStage('river')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'RIVER (FINAL CARD) 🃏', '#FFE500', '🃏')
    } else {
      // 5 Cards Already Dealt -> SHOWDOWN!
      stageRef.current = 'showdown'
      triggerMultiShowdown(resetBots, currentPotVal, isPlayerFoldedRef.current, communityCardsRef.current)
      return
    }

    if (autoDrive) {
      setTimeout(() => {
        runSequentialBotTurns(deckRef.current, true, isPlayerFoldedRef.current, resetBots, 0, currentPotVal)
      }, 900)
    }
  }

  // Execute Bot AI Turn with Real-Time HighBet & Pot Synchronization
  const runSequentialBotTurns = (
    startingDeck,
    nextBoardStage,
    isPlayerFoldedNow = false,
    botsSource = null,
    overrideHighBet = null,
    overridePot = null
  ) => {
    const heroFolded = isPlayerFoldedNow || isPlayerFoldedRef.current
    const heroAllIn = isPlayerAllInRef.current
    setIsProcessingBot(true)
    let curDeck = startingDeck || deckRef.current || [...deck]
    let bots = botsSource ? [...botsSource] : (activeBotsRef.current.length > 0 ? [...activeBotsRef.current] : [...activeBots])
    let runningPot = overridePot !== null ? overridePot : (potRef.current || pot)
    let highBet = overrideHighBet !== null ? overrideHighBet : (highBetRef.current || currentRoundHighBet)

    potRef.current = runningPot
    highBetRef.current = highBet

    let botIndex = 0

    const processNextBot = () => {
      if (botIndex >= bots.length) {
        setIsProcessingBot(false)
        const remainingBots = bots.filter(b => !b.folded && !b.isBusted)

        // If only 1 bot remaining and hero folded:
        if (heroFolded && remainingBots.length === 1) {
          triggerBotVictory(remainingBots[0], runningPot, bots)
          return
        }

        // If all bots folded and hero NOT folded:
        if (!heroFolded && remainingBots.length === 0) {
          setGameResult('win')
          setWinnerName('PLAYER')
          setStage('showdown')
          stageRef.current = 'showdown'
          setBankroll(b => b + runningPot)
          SoundEngine.playJackpot()
          triggerToast('DEALER', 'ALL OPPONENTS FOLDED! YOU WIN 🏆', '#00F5FF', '🏆')
          if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
          let remaining = 6
          setAutoNextSeconds(remaining)
          autoNextIntervalRef.current = setInterval(() => {
            remaining--
            if (remaining <= 0) {
              clearInterval(autoNextIntervalRef.current)
              setAutoNextSeconds(null)
              startNewHand()
            } else {
              setAutoNextSeconds(remaining)
            }
          }, 1000)
          return
        }

        // If hero is folded OR hero is all-in: auto-advance board until Showdown!
        if (heroFolded || heroAllIn) {
          if (heroFolded) {
            setCurrentTurnActor('BOTS_SPECTATING')
            setActiveTurnName('SPECTATING BOTS 🍿')
          } else {
            setCurrentTurnActor('ALL_IN_RUNOUT')
            setActiveTurnName('ALL-IN BOARD RUNOUT 🚀')
          }

          if (communityCardsRef.current.length === 5) {
            triggerMultiShowdown(bots, runningPot, heroFolded, communityCardsRef.current)
          } else {
            advanceBoardStreet(curDeck, bots, runningPot, highBet, true)
          }
          return
        }

        // Normal flow (hero still playing):
        // If current street is River (5 cards) and bets are settled -> trigger Showdown!
        if (communityCardsRef.current.length === 5) {
          triggerMultiShowdown(bots, runningPot, false, communityCardsRef.current)
          return
        }

        // Advance to next street for Hero
        setCurrentTurnActor('PLAYER')
        setActiveTurnName('YOUR MOVE 👑')
        if (nextBoardStage) {
          advanceBoardStreet(curDeck, bots, runningPot, highBet, false)
        }
        return
      }

      const bot = bots[botIndex]
      if (!bot || bot.folded || bot.isBusted || !bot.cards || bot.cards.length < 2) {
        botIndex++
        processNextBot()
        return
      }

      // If bot is already all-in (bankroll === 0), it has already put all chips in! Skip its betting turn smoothly!
      if (bot.bankroll <= 0) {
        botIndex++
        processNextBot()
        return
      }

      setCurrentTurnActor(bot.id)
      setActiveTurnName(`${bot.name}'S TURN`)

      // Universal 10-Second Action Clock (Time Bank) for the Bot
      const BOT_ACTION_TIME_LIMIT = 10
      const startTime = Date.now()
      const totalDuration = BOT_ACTION_TIME_LIMIT * 1000

      // The bot decides how long to consider its move within the 10s window (2.0s - 8.0s)
      const callNeeded = Math.max(0, highBet - bot.currentBet)
      const isFacingPressure = callNeeded > 1000
      const thinkDuration = isFacingPressure
        ? Math.floor(Math.random() * 4500) + 3500 // 3.5s to 8.0s under pressure/big bet
        : Math.floor(Math.random() * 4000) + 2000 // 2.0s to 6.0s for standard actions

      if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
      if (botThinkTimeoutRef.current) clearTimeout(botThinkTimeoutRef.current)

      // Initialize Bot with 10.0s full gauge (100%)
      bots = bots.map((b, i) => i === botIndex ? {
        ...b,
        isThinking: true,
        timeRemaining: BOT_ACTION_TIME_LIMIT,
        timePercent: 100
      } : b)
      setActiveBots([...bots])
      activeBotsRef.current = [...bots]

      // Live 10-second Shot Clock countdown (out of 10s total action time)
      botThinkIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remainingMs = Math.max(0, totalDuration - elapsed)
        const remainingSec = Math.max(0, remainingMs / 1000)
        const percent = (remainingSec / BOT_ACTION_TIME_LIMIT) * 100

        setActiveBots(prev => prev.map((b, i) => i === botIndex ? {
          ...b,
          isThinking: true,
          timeRemaining: remainingSec,
          timePercent: percent
        } : b))
      }, 100)

      botThinkTimeoutRef.current = setTimeout(() => {
        if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
        const decision = decideBotAction({
          bot,
          cards: bot.cards,
          communityCards: communityCardsRef.current,
          stage: stageRef.current,
          pot: runningPot,
          currentCallAmount: callNeeded,
          minRaise: 500,
          bankroll: bot.bankroll
        })

        if (decision.action === 'FOLD') {
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            folded: true,
            isThinking: false,
            lastAction: 'FOLDED',
            actionType: 'fold'
          } : b)
          SoundEngine.playCardSwoosh()
          triggerToast(bot.name, 'FOLDED 🏳️', '#CCCCCC', '🏳️')
        } else if (decision.action === 'CHECK' && callNeeded === 0) {
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            isThinking: false,
            lastAction: 'CHECK',
            actionType: 'check'
          } : b)
          SoundEngine.playClick()
          triggerToast(bot.name, 'CHECKED ✓', '#00F5FF', '✓')
        } else if (decision.action === 'CALL' || (decision.action === 'CHECK' && callNeeded > 0)) {
          // If bot wants to stay in the hand with bet owed, it must pay the call amount!
          const actualCall = Math.min(bot.bankroll, callNeeded)
          runningPot += actualCall
          potRef.current = runningPot
          const isBotAllIn = (bot.bankroll - actualCall) <= 0
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            bankroll: Math.max(0, b.bankroll - actualCall),
            currentBet: b.currentBet + actualCall,
            isThinking: false,
            lastAction: isBotAllIn ? `ALL-IN $${actualCall.toLocaleString()}` : `CALL $${actualCall.toLocaleString()}`,
            actionType: 'call'
          } : b)
          triggerChipFlight(`bot_${botIndex}`, actualCall)
          triggerToast(bot.name, isBotAllIn ? `ALL-IN $${actualCall.toLocaleString()}! 🚀` : `CALLED $${actualCall.toLocaleString()} ✓`, '#00F5FF', '🪙')
        } else if (decision.action === 'RAISE') {
          const actualCall = Math.min(bot.bankroll, callNeeded)
          const remainingAfterCall = Math.max(0, bot.bankroll - actualCall)
          const actualRaise = Math.min(remainingAfterCall, decision.amount)
          const totalBotBet = actualCall + actualRaise
          runningPot += totalBotBet
          potRef.current = runningPot
          highBet += actualRaise
          highBetRef.current = highBet
          const isBotAllIn = (bot.bankroll - totalBotBet) <= 0
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            bankroll: Math.max(0, b.bankroll - totalBotBet),
            currentBet: b.currentBet + totalBotBet,
            isThinking: false,
            lastAction: isBotAllIn ? `ALL-IN $${totalBotBet.toLocaleString()}` : `RAISE $${actualRaise.toLocaleString()}`,
            actionType: 'raise'
          } : b)
          triggerChipFlight(`bot_${botIndex}`, totalBotBet)
          triggerToast(bot.name, isBotAllIn ? `ALL-IN $${totalBotBet.toLocaleString()}! 🚀` : `RAISED +$${actualRaise.toLocaleString()} 🔥`, '#FF70A6', '🔥')
        } else {
          // Fallback Fold
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            folded: true,
            isThinking: false,
            lastAction: 'FOLDED',
            actionType: 'fold'
          } : b)
          SoundEngine.playCardSwoosh()
          triggerToast(bot.name, 'FOLDED 🏳️', '#CCCCCC', '🏳️')
        }

        setPot(runningPot)
        potRef.current = runningPot
        setCurrentRoundHighBet(highBet)
        highBetRef.current = highBet
        setActiveBots([...bots])
        activeBotsRef.current = [...bots]

        botIndex++
        setTimeout(processNextBot, 400)
      }, thinkDuration)
    }

    processNextBot()
  }

  // Player Actions
  const handlePlayerCheck = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    SoundEngine.playClick()
    triggerToast('YOU', 'CHECKED ✓', '#00F5FF', '✓')
    runSequentialBotTurns(deckRef.current, true, false, activeBotsRef.current, highBetRef.current, potRef.current)
  }

  const handlePlayerCall = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const callAmt = Math.min(bankroll, playerCallAmount)
    const newBankroll = Math.max(0, bankroll - callAmt)
    const newPot = (potRef.current || pot) + callAmt
    const newPlayerRoundBet = playerRoundBet + callAmt

    potRef.current = newPot

    setBankroll(newBankroll)
    setPot(newPot)
    setPlayerRoundBet(newPlayerRoundBet)

    triggerChipFlight('player', callAmt)
    triggerToast('YOU', `CALLED $${callAmt.toLocaleString()} ✓`, '#00F5FF', '🪙')
    runSequentialBotTurns(deckRef.current, true, false, activeBotsRef.current, highBetRef.current, newPot)
  }

  const handlePlayerRaise = (amount) => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const finalRaise = amount || raiseAmount
    const callPortion = Math.min(bankroll, playerCallAmount)
    const remainingBankroll = Math.max(0, bankroll - callPortion)
    const actualRaise = Math.min(remainingBankroll, finalRaise)
    const totalToPutIn = callPortion + actualRaise

    const newBankroll = Math.max(0, bankroll - totalToPutIn)
    const newPot = (potRef.current || pot) + totalToPutIn
    const newPlayerRoundBet = playerRoundBet + totalToPutIn
    const newHighBet = (highBetRef.current || currentRoundHighBet) + actualRaise

    potRef.current = newPot
    highBetRef.current = newHighBet

    setBankroll(newBankroll)
    setPot(newPot)
    setPlayerRoundBet(newPlayerRoundBet)
    setCurrentRoundHighBet(newHighBet)

    triggerChipFlight('player', totalToPutIn)
    triggerToast('YOU', `RAISED +$${actualRaise.toLocaleString()} (BET: $${newHighBet.toLocaleString()}) 🔥`, '#FF70A6', '🔥')

    runSequentialBotTurns(deckRef.current, true, false, activeBotsRef.current, newHighBet, newPot)
  }

  const handlePlayerAllIn = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const allInAmt = Math.max(0, bankroll)
    const newPot = (potRef.current || pot) + allInAmt
    const newPlayerRoundBet = playerRoundBet + allInAmt
    const newHighBet = Math.max(highBetRef.current || currentRoundHighBet, newPlayerRoundBet)

    potRef.current = newPot
    highBetRef.current = newHighBet

    setBankroll(0)
    setPot(newPot)
    setPlayerRoundBet(newPlayerRoundBet)
    setCurrentRoundHighBet(newHighBet)

    isPlayerAllInRef.current = true
    setIsPlayerAllIn(true)

    triggerChipFlight('player', allInAmt)
    triggerToast('YOU', `ALL-IN $${allInAmt.toLocaleString()}! 🚀`, '#FF3333', '🚀')
    runSequentialBotTurns(deckRef.current, true, false, activeBotsRef.current, newHighBet, newPot)
  }

  const handlePlayerFold = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    isPlayerFoldedRef.current = true
    setIsPlayerFolded(true)
    SoundEngine.playCardSwoosh()
    triggerToast('YOU', 'YOU FOLDED 🏳️ (SPECTATING BOTS)', '#CCCCCC', '🏳️')
    setCurrentTurnActor('BOTS_SPECTATING')
    setActiveTurnName('SPECTATING BOTS 🍿')
    runSequentialBotTurns(deckRef.current, true, true, activeBotsRef.current, highBetRef.current, potRef.current)
  }

  const handleSkipToShowdown = () => {
    if (stageRef.current === 'showdown') return
    SoundEngine.playCardFlip()
    const curDeck = [...deckRef.current]
    const needed = 5 - communityCardsRef.current.length
    const dealt = []
    for (let i = 0; i < needed; i++) {
      if (curDeck.length > 0) dealt.push(curDeck.pop())
    }
    const finalBoard = [...communityCardsRef.current, ...dealt]
    communityCardsRef.current = finalBoard
    deckRef.current = curDeck
    stageRef.current = 'showdown'
    setCommunityCards(finalBoard)
    setDeck(curDeck)
    setStage('showdown')
    triggerMultiShowdown(activeBots, pot, isPlayerFoldedRef.current, finalBoard)
  }

  if (!isOpen) return null

  const isMyTurn = currentTurnActor === 'PLAYER' && stage !== 'showdown'

  // Standard Poker Seat Pod Component (ENLARGED)
  const renderBotSeat = (bot, index, positionClasses, chipPosClasses) => {
    const rosterBot = BOT_ROSTER[index] || { name: `BOT ${index + 1}`, avatar: '🤖' }
    const isSeated = bot && bot.isSeated

    // If no bot or not seated: Render Empty Seat Pod with [+] Button!
    if (!isSeated) {
      return (
        <div key={`empty_seat_${index}`} className={`absolute ${positionClasses} z-20 flex flex-col items-center select-none`}>
          <button
            onClick={() => handleSeatBot(index)}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFE500] border-[3px] border-dashed border-[#0D0D0D] flex flex-col items-center justify-center shadow-[3px_3px_0px_#0D0D0D] cursor-pointer transition-all hover:scale-110 active:scale-95 group"
            title={`Sit ${rosterBot.name} ($10,000)`}
          >
            <span className="font-display font-black text-2xl sm:text-3xl text-[#0D0D0D] group-hover:scale-125 transition-transform">
              ➕
            </span>
          </button>
          <div className="mt-1 bg-[#FFFFFF]/95 border-[2px] border-[#0D0D0D] px-2 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#0D0D0D] text-center">
            <span className="font-pixel text-[8px] sm:text-[9px] font-bold text-gray-700 block whitespace-nowrap">
              + SIT {rosterBot.name.split(' ')[0]}
            </span>
          </div>
        </div>
      )
    }

    const isActive = currentTurnActor === bot.id
    const isBotInHand = bot.cards && bot.cards.length >= 2
    const isBotAllIn = isBotInHand && !bot.folded && bot.bankroll <= 0
    const isBusted = !isBotInHand && (bot.isBusted || bot.bankroll < 500)

    return (
      <div key={bot.id} className={`absolute ${positionClasses} z-20 flex flex-col items-center select-none`}>
        {/* Seat Pod */}
        <div className="relative flex items-center gap-2.5">
          
          {/* Large Avatar Ring */}
          <div className="relative group">
            <div
              onClick={() => {
                if (isBusted && !bot.queuedToJoin) {
                  handleRebuyBot(bot.id)
                }
              }}
              className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#FFFFFF] border-[3.5px] border-[#0D0D0D] flex items-center justify-center p-1 sm:p-1.5 shadow-[4px_4px_0px_#0D0D0D] relative transition-all overflow-hidden ${
                isActive ? 'ring-4 ring-[#00F5FF] scale-110' : ''
              } ${isBotAllIn ? 'ring-4 ring-[#FF3333] shadow-[0_0_12px_#FF3333]' : ''} ${
                isBusted ? 'cursor-pointer hover:scale-105 active:scale-95 bg-gray-100' : bot.folded ? 'opacity-50 grayscale' : ''
              }`}
              title={isBusted ? (bot.queuedToJoin ? 'Queued to rejoin next hand ($10,000)' : 'Click [+] to bring bot back with $10,000') : bot.name}
            >
              <PixelAvatar
                avatarKey={bot.avatarKey || 'samurai'}
                size={2.8}
                isBusted={isBusted}
                isQueued={bot.queuedToJoin}
                className="w-full h-full object-contain"
              />

              {/* All-in Rocket Badge on Avatar */}
              {isBotAllIn && (
                <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-[#FF3333] border-[1.5px] border-[#0D0D0D] rounded-full text-white font-pixel text-[7px] font-black shadow-[1px_1px_0px_#000] animate-pulse z-40">
                  🚀 ALL-IN
                </div>
              )}

              {/* Busted [+] Floating Rebuy Button Directly on Avatar Profile */}
              {isBusted && !bot.queuedToJoin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRebuyBot(bot.id)
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFE500] hover:bg-[#00F5FF] border-[2.5px] border-[#0D0D0D] text-[#0D0D0D] font-display font-black text-base sm:text-lg flex items-center justify-center shadow-[2px_2px_0px_#0D0D0D] cursor-pointer animate-bounce z-40 transition-transform active:scale-90"
                  title="Click to bring this bot back with $10,000"
                >
                  ＋
                </button>
              )}

              {/* Queued Checkmark on Avatar Profile */}
              {isBusted && bot.queuedToJoin && (
                <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00F5FF] border-[2.5px] border-[#0D0D0D] text-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-[2px_2px_0px_#0D0D0D] z-40 animate-pulse">
                  ✓
                </div>
              )}

              {/* Thinking Pulsar */}
              {bot.isThinking && !isBusted && !isBotAllIn && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF70A6] border-[2px] border-[#0D0D0D] font-pixel text-[7px] px-2 py-0.5 font-black shadow-[2px_2px_0px_#0D0D0D] animate-bounce whitespace-nowrap z-30 text-[#0D0D0D]">
                  THINKING...
                </span>
              )}
            </div>
          </div>

          {/* Bot 2 Hole Cards or Busted Indicator */}
          {!isBusted ? (
            <div className="flex -space-x-5 relative">
              <BrutalistCard card={bot.cards[0]} hidden={stage !== 'showdown' || bot.folded} small deckSkin={equippedDeck} />
              <BrutalistCard card={bot.cards[1]} hidden={stage !== 'showdown' || bot.folded} small deckSkin={equippedDeck} />
              {bot.folded && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/65 rounded-lg">
                  <span className="font-display font-black text-xs text-white bg-[#FF3333] px-1.5 py-0.5 border border-black rotate-12">
                    FOLD
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => {
                if (!bot.queuedToJoin) handleRebuyBot(bot.id)
              }}
              className={`border-[2px] border-[#0D0D0D] px-2.5 py-1.5 rounded-xl text-center shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
                bot.queuedToJoin ? 'bg-[#00F5FF] text-[#0D0D0D]' : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
              }`}
              title={bot.queuedToJoin ? 'Rejoining next hand with $10,000' : 'Click [+] to bring back with $10,000'}
            >
              <span className={`font-pixel text-[8px] sm:text-[9px] font-black block ${bot.queuedToJoin ? 'text-[#0D0D0D] animate-pulse' : 'text-[#FF3333]'}`}>
                {bot.queuedToJoin ? '⏳ RE-ENTERING ($10K)' : '💀 OUT (CLICK ＋)'}
              </span>
            </div>
          )}
        </div>

        {/* Large Name & Bankroll Plaque */}
        <div className={`mt-1.5 bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] px-2.5 py-1 rounded-lg shadow-[2.5px_2.5px_0px_#0D0D0D] text-center min-w-[90px] sm:min-w-[105px] relative group/plaque ${
          isBusted ? 'opacity-85 bg-gray-100' : ''
        }`}>
          <div className="font-display font-black text-[10px] sm:text-xs text-[#0D0D0D] truncate max-w-[95px]">
            {bot.name}
          </div>
          <div className={`font-mono-nb text-xs sm:text-sm font-black ${
            isBotAllIn
              ? 'text-[#FF3333] animate-pulse'
              : isBusted
              ? (bot.queuedToJoin ? 'text-emerald-600' : 'text-red-500')
              : 'text-[#00F5FF]'
          }`}>
            {isBotAllIn
              ? '🚀 ALL-IN'
              : isBusted
              ? (bot.queuedToJoin ? '+$10,000 ⏳' : '$0 💀')
              : `$${bot.bankroll.toLocaleString()}`}
          </div>
          
          {/* Stand Up / Remove Bot Button */}
          {!isBotInHand && (
            <button
              onClick={() => handleStandUpBot(index)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-200 hover:bg-[#FF3333] hover:text-white text-gray-600 border border-black font-pixel text-[8px] flex items-center justify-center opacity-0 group-hover/plaque:opacity-100 transition-opacity cursor-pointer"
              title="Remove bot from seat"
            >
              ✕
            </button>
          )}
        </div>

        {/* Busted Bot Rebuy Button Badge */}
        {isBusted && (
          <div className="mt-1 flex flex-col items-center">
            {bot.queuedToJoin ? (
              <div className="px-2 py-0.5 bg-[#00F5FF] text-[#0D0D0D] border-[1.5px] border-[#0D0D0D] rounded font-pixel text-[7px] font-black shadow-[1px_1px_0px_#0D0D0D] animate-pulse">
                ✓ QUEUED ($10K)
              </div>
            ) : (
              <button
                onClick={() => handleRebuyBot(bot.id)}
                className="px-2.5 py-0.5 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] border-[1.5px] border-[#0D0D0D] rounded-full font-display text-[8px] sm:text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all animate-bounce"
                title="Rebuy this bot with $10,000 for next hand"
              >
                <span>➕</span> REBUY $10K
              </button>
            )}
          </div>
        )}

        {/* Bot Active Thinking HP Timer Bar (10.0s Shot Clock) */}
        {isActive && !bot.folded && !isBusted && !isBotAllIn && stage !== 'showdown' && (
          <div className="w-full mt-1 flex flex-col items-center animate-fadeIn">
            {/* HP-style 10s Gauge Container */}
            <div className="w-full h-2.5 sm:h-3 bg-[#0D0D0D] border-[1.5px] border-[#0D0D0D] rounded-full p-0.5 shadow-[1.5px_1.5px_0px_#0D0D0D] overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(100, bot.timePercent !== undefined ? bot.timePercent : 100))}%`,
                  backgroundColor: (bot.timeRemaining !== undefined ? bot.timeRemaining : 10) > 6
                    ? '#00F5FF'
                    : (bot.timeRemaining !== undefined ? bot.timeRemaining : 10) > 3
                    ? '#FFE500'
                    : '#FF3333',
                  boxShadow: `0 0 6px ${(bot.timeRemaining !== undefined ? bot.timeRemaining : 10) > 6 ? '#00F5FF' : (bot.timeRemaining !== undefined ? bot.timeRemaining : 10) > 3 ? '#FFE500' : '#FF3333'}`,
                  transitionDuration: '100ms'
                }}
              />
              {/* Fighting game HP bar segment notches */}
              <div className="absolute inset-0 flex justify-between pointer-events-none px-1.5">
                <div className="w-0.5 h-full bg-black/40" />
                <div className="w-0.5 h-full bg-black/40" />
                <div className="w-0.5 h-full bg-black/40" />
              </div>
            </div>
            
            <span className="font-pixel text-[7px] sm:text-[8px] text-gray-800 mt-0.5 font-bold flex items-center gap-1">
              <span>⏱️</span>
              <span className={`font-mono-nb font-black ${(bot.timeRemaining !== undefined ? bot.timeRemaining : 10) <= 3 ? 'text-[#FF3333] animate-pulse' : 'text-[#0D0D0D]'}`}>
                {(bot.timeRemaining !== undefined ? bot.timeRemaining : 10.0).toFixed(1)}s / 10.0s
              </span>
            </span>
          </div>
        )}

        {/* Bet Chips On Felt */}
        {bot.currentBet > 0 && !bot.folded && !isBusted && (
          <div className={`absolute ${chipPosClasses} z-10 whitespace-nowrap animate-fadeIn`}>
            <ChipStack
              amount={bot.currentBet}
              size="sm"
              animate={true}
              onClick={() => {
                SoundEngine.playChipClink({ brightness: 1.2 })
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-screen h-screen z-[1500] bg-[#F6F5FA] text-[#0D0D0D] flex flex-col justify-between select-none overflow-hidden font-display">
      
      {/* 8-Bit Graph Paper Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0D0D0D 1px, transparent 1px), linear-gradient(to bottom, #0D0D0D 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* ======================================================== */}
      {/* 1. TOP RETRO BAR (STREET PROGRESSION & CONTROLS)         */}
      {/* ======================================================== */}
      <header className="h-14 sm:h-16 shrink-0 bg-[#FF70A6] border-b-[4px] border-[#0D0D0D] px-4 sm:px-8 flex items-center justify-between gap-3 z-30 relative shadow-[0px_4px_0px_#0D0D0D]">
        
        {/* Left: Brand & Stakes */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF3333] border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFE500] border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#00F5FF] border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
          </div>

          <div className="bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] px-3 py-1 rounded-lg shadow-[2px_2px_0px_#0D0D0D] flex items-center gap-2">
            <span className="font-pixel text-[9px] font-bold text-[#0D0D0D]">TABLE:</span>
            <span className="font-display font-black text-xs sm:text-sm text-[#0D0D0D]">NLH $250 / $500</span>
          </div>
        </div>

        {/* Center: Clean Street Tracker */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {GAME_STAGES.map((s, idx) => {
            const isActive = stage === s.key
            const isPassed = GAME_STAGES.findIndex(x => x.key === stage) > idx
            return (
              <div
                key={s.key}
                className={`px-3 py-1 border-[2.5px] border-[#0D0D0D] rounded-lg transition-all font-pixel text-[9px] sm:text-xs font-bold ${
                  isActive
                    ? 'bg-[#FFE500] text-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] scale-105 ring-2 ring-black'
                    : isPassed
                    ? 'bg-[#FFFFFF] text-[#0D0D0D]'
                    : 'bg-[#F6F5FA] text-gray-400 border-dashed'
                }`}
              >
                {isPassed ? '✓ ' : ''}{s.label}
              </div>
            )
          })}
        </div>

        {/* Right: Live Deck Switcher & Exit */}
        <div className="flex items-center gap-2">
          
          {/* Deck Skins Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-[#FFFFFF] border-[2px] border-[#0D0D0D] p-1 rounded-lg shadow-[2px_2px_0px_#0D0D0D]">
            <span className="font-pixel text-[8px] font-bold text-gray-700 px-1">DECK:</span>
            {['obsidian', 'gold', 'cyber', 'emerald', 'sakura', 'retro'].map(skinKey => {
              const theme = DECK_SKIN_THEMES[skinKey]
              const isSelected = equippedDeck === skinKey
              return (
                <button
                  key={skinKey}
                  onClick={() => handleSwitchDeck(skinKey)}
                  className={`font-display text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 border-[1.5px] border-[#0D0D0D] rounded transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE500] text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] scale-105'
                      : 'bg-[#F6F5FA] text-gray-700 hover:bg-gray-200'
                  }`}
                  title={`Equip ${theme.name}`}
                >
                  {theme.icon}
                </button>
              )
            })}
          </div>

          <button
            onClick={onClose}
            className="brutal-btn px-4 py-1 bg-[#FFFFFF] hover:bg-[#FF3333] hover:text-white text-[#0D0D0D] border-[2.5px] border-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase shadow-[2.5px_2.5px_0px_#0D0D0D] cursor-pointer"
          >
            ✕ LEAVE
          </button>
        </div>

      </header>

      {/* ======================================================== */}
      {/* 2. SPATIAL OVAL POKER ARENA (MAXIMUM SCALE & IMPACT)     */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        
        {/* Sleek Dealer Announcement Marquee / Toast (Non-Intrusive & Crystal Clear) */}
        {actionToast && (
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-300 animate-fadeIn">
            <div
              className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-1.5 rounded-full border-[2.5px] border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] bg-[#FFFFFF] whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">{actionToast.icon}</span>
              <span className="font-pixel text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#0D0D0D] text-[#FFE500]">
                {actionToast.actor}
              </span>
              <span className="font-display font-black text-xs sm:text-sm text-[#0D0D0D] tracking-wide">
                {actionToast.actionText}
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* THE POKER TABLE STRUCTURE (LARGE OVAL FELT)            */}
        {/* ------------------------------------------------------ */}
        <div className="relative w-full max-w-6xl h-[520px] sm:h-[580px] md:h-[640px] flex items-center justify-center">
          
          {/* Outer Table Rim (Lavender / Off-White Neo-Brutalist Border) */}
          <div className="absolute inset-x-4 sm:inset-x-8 inset-y-6 sm:inset-y-8 rounded-[140px] sm:rounded-[180px] bg-[#FFFFFF] border-[5px] border-[#0D0D0D] shadow-[10px_10px_0px_#0D0D0D] flex items-center justify-center overflow-hidden">
            
            {/* Inner Felt Area */}
            <div className="w-[95%] h-[93%] rounded-[130px] sm:rounded-[170px] bg-[#F6F5FA] border-[3px] border-[#0D0D0D]/25 flex flex-col items-center justify-center relative">
              
              {/* Subtle Halftone Pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(#0D0D0D 2px, transparent 2px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Watermark Logo in Center */}
              <div className="absolute font-display font-black text-6xl sm:text-8xl text-[#0D0D0D]/5 tracking-widest pointer-events-none select-none">
                POKERHUB
              </div>

              {/* -------------------------------------------------- */}
              {/* CENTER FELT: TOTAL POT & 5 COMMUNITY CARDS         */}
              {/* -------------------------------------------------- */}
              <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
                
                {/* Total Pot Pill with 3D Chips Pile */}
                <div
                  onClick={() => {
                    SoundEngine.playChipsStack()
                  }}
                  className={`bg-[#FFE500] border-[3.5px] border-[#0D0D0D] px-6 sm:px-8 py-2 rounded-2xl shadow-[5px_5px_0px_#0D0D0D] flex items-center gap-3 -rotate-1 relative transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    stage === 'flop' || stage === 'turn' || stage === 'river' ? 'ring-4 ring-[#00F5FF] scale-105' : ''
                  }`}
                  title="Click to hear chips!"
                >
                  <div className="flex -space-x-3.5 items-center">
                    <PokerChip denom={CHIP_DENOMINATIONS[3]} size="sm" />
                    <PokerChip denom={CHIP_DENOMINATIONS[2]} size="sm" />
                    <PokerChip denom={CHIP_DENOMINATIONS[1]} size="sm" />
                  </div>
                  <span className="font-pixel text-[10px] sm:text-xs font-bold text-[#0D0D0D]">TOTAL POT:</span>
                  <span className="font-display font-black text-xl sm:text-3xl text-[#0D0D0D]">
                    ${pot.toLocaleString()}
                  </span>
                </div>

                {/* 5 Community Cards */}
                <div className="flex gap-2 sm:gap-3.5 items-center">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <BrutalistCard
                      key={idx}
                      card={communityCards[idx]}
                      hidden={!communityCards[idx]}
                      delay={idx * 70}
                      highlighted={stage === 'showdown'}
                      deckSkin={equippedDeck}
                    />
                  ))}
                </div>

                {/* Dealer Button Token */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] flex items-center justify-center font-display font-black text-xs sm:text-sm shadow-[3px_3px_0px_#0D0D0D]">
                  Ⓓ
                </div>

                {/* Dynamic Flying Chip Projectiles Arcing from Player/Bot into Total Pot */}
                {flyingChips.map(fc => {
                  const animClass = fc.origin === 'player'
                    ? 'animate-flyFromPlayer'
                    : fc.origin === 'bot_0'
                    ? 'animate-flyFromBot0'
                    : fc.origin === 'bot_1'
                    ? 'animate-flyFromBot1'
                    : fc.origin === 'bot_2'
                    ? 'animate-flyFromBot2'
                    : fc.origin === 'bot_3'
                    ? 'animate-flyFromBot3'
                    : 'animate-flyFromBot4'

                  return (
                    <div
                      key={fc.id}
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none ${animClass}`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex -space-x-3.5 items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                          <PokerChip denom={fc.chip} size="md" />
                          <PokerChip denom={fc.chip} size="md" />
                        </div>
                        <span className="font-pixel text-[8px] sm:text-[9px] font-black text-[#FFE500] drop-shadow-[1.5px_1.5px_0px_#000] bg-[#0D0D0D] px-1.5 py-0.2 rounded mt-0.5 border border-white">
                          +${fc.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}

              </div>

            </div>

          </div>

          {/* ------------------------------------------------------ */}
          {/* SPATIAL SEATS AROUND THE PERIMETER (SCALED UP)         */}
          {/* ------------------------------------------------------ */}

          {/* SEAT 1: Mid/Top Left (Bot 0 - Cyber Samurai) */}
          {renderBotSeat(activeBots[0], 0, 'top-2 sm:top-4 left-2 sm:left-8', 'top-[88px] sm:top-[96px] -right-8 sm:-right-12')}

          {/* SEAT 2: Top Center (Bot 1 - Lucky Neko) */}
          {renderBotSeat(activeBots[1], 1, 'top-0 sm:top-1 left-1/2 -translate-x-1/2', 'top-[108px] sm:top-[116px] left-1/2 -translate-x-1/2')}

          {/* SEAT 3: Mid/Top Right (Bot 2 - Pixel Punk) */}
          {renderBotSeat(activeBots[2], 2, 'top-2 sm:top-4 right-2 sm:right-8', 'top-[88px] sm:top-[96px] -left-8 sm:-left-12')}

          {/* SEAT 4: Mid/Bottom Left (Bot 3 - High Roller) */}
          {renderBotSeat(activeBots[3], 3, 'bottom-24 sm:bottom-28 left-1 sm:left-4', '-top-11 sm:-top-14 left-10 sm:left-14')}

          {/* SEAT 5: Mid/Bottom Right (Bot 4 - Neon Queen) */}
          {renderBotSeat(activeBots[4], 4, 'bottom-24 sm:bottom-28 right-1 sm:right-4', '-top-11 sm:-top-14 right-10 sm:right-14')}

          {/* ------------------------------------------------------ */}
          {/* SEAT 0: BOTTOM CENTER (HERO / YOU - LARGE COCKPIT)     */}
          {/* ------------------------------------------------------ */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            
            {/* Player's In-Pot Bet on Felt (3D ChipStack) */}
            {playerRoundBet > 0 && (
              <div className="mb-2">
                <ChipStack
                  amount={playerRoundBet}
                  size="md"
                  animate={true}
                  onClick={() => {
                    SoundEngine.playChipClink({ brightness: 1.3 })
                  }}
                />
              </div>
            )}

            <div className="relative flex items-center gap-4">
              
              {/* Player Avatar Plaque */}
              <div className={`bg-[#FFFFFF] border-[3px] border-[#0D0D0D] p-2.5 rounded-2xl shadow-[4px_4px_0px_#0D0D0D] flex flex-col items-center min-w-[120px] sm:min-w-[140px] ${
                isHeroSittingOut ? 'opacity-85' : ''
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-[2.5px] border-[#0D0D0D] flex items-center justify-center p-1 shadow-[2px_2px_0px_#0D0D0D] overflow-hidden">
                    <PixelAvatar
                      avatarKey="hero"
                      size={2.8}
                      isBusted={isHeroSittingOut}
                      isQueued={heroQueuedToJoin}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-display font-black text-xs sm:text-sm text-[#0D0D0D]">
                      {isHeroSittingOut ? 'YOU (SITTING OUT)' : 'YOU (HERO)'}
                    </div>
                    <div className={`font-mono-nb text-xs sm:text-base font-black ${isHeroSittingOut ? 'text-red-500' : 'text-emerald-600'}`}>
                      ${bankroll.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Real-time Hand Strength / Sitting Out Pill */}
                <div className={`mt-1.5 w-full border-[2px] border-[#0D0D0D] px-2 py-0.5 rounded-lg font-display font-black text-[9px] sm:text-xs text-center truncate shadow-[1px_1px_0px_#0D0D0D] ${
                  isHeroSittingOut ? 'bg-[#FF3333] text-white' : isPlayerFolded ? 'bg-gray-300 text-gray-700' : isPlayerAllIn ? 'bg-[#FFE500] text-[#0D0D0D]' : 'bg-[#FF70A6] text-[#0D0D0D]'
                }`}>
                  {isHeroSittingOut ? (heroQueuedToJoin ? '⏳ QUEUED FOR NEXT HAND' : '💀 OUT OF CHIPS') : isPlayerFolded ? '🏳️ FOLDED (SPECTATING)' : isPlayerAllIn ? `🚀 ALL-IN (${playerHandName || 'HIGH CARD'})` : (playerHandName || 'CALCULATING...')}
                </div>
              </div>

              {/* Player's 2 Large Hole Cards or SITTING OUT REBUY CARD */}
              {!isHeroSittingOut ? (
                <div className={`flex -space-x-5 sm:-space-x-6 relative transition-all ${isPlayerFolded ? 'opacity-40 grayscale' : 'hover:space-x-1'}`}>
                  <BrutalistCard card={playerCards[0]} large deckSkin={equippedDeck} highlighted={isPlayerAllIn} />
                  <BrutalistCard card={playerCards[1]} large deckSkin={equippedDeck} highlighted={isPlayerAllIn} />
                  {isPlayerFolded && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <span className="font-display font-black text-xs sm:text-sm text-white bg-[#FF3333] px-2 py-1 border-[2px] border-black rotate-12 shadow-[2px_2px_0px_#000]">
                        FOLDED 🏳️
                      </span>
                    </div>
                  )}
                  {isPlayerAllIn && !isPlayerFolded && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <span className="font-display font-black text-[10px] sm:text-xs text-[#0D0D0D] bg-[#FFE500] px-2 py-0.5 border-[2px] border-black shadow-[2px_2px_0px_#000] animate-bounce">
                        🚀 ALL-IN
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {!heroQueuedToJoin ? (
                    <button
                      onClick={handleHeroRebuy}
                      className="brutal-btn px-6 py-2.5 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] border-[3px] border-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase shadow-[4px_4px_0px_#0D0D0D] cursor-pointer animate-bounce flex items-center gap-2"
                    >
                      <span>💰</span> REBUY $10K & RE-JOIN
                    </button>
                  ) : (
                    <div className="px-5 py-2 bg-[#00F5FF] border-[2.5px] border-[#0D0D0D] rounded-xl shadow-[3px_3px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm text-[#0D0D0D] animate-pulse">
                      ⏳ JOINING IN NEXT HAND...
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Active Turn Indicator */}
            {isMyTurn && !isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut && (
              <div className="mt-1.5 bg-[#00F5FF] border-[2.5px] border-[#0D0D0D] px-4 py-1 rounded-full shadow-[3px_3px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm animate-pulse">
                YOUR TURN // {playerCallAmount > 0 ? `CALL $${playerCallAmount.toLocaleString()}` : 'CHECK OR RAISE'}
              </div>
            )}

            {/* 10-Second Turn Countdown HP-style Gauge Bar */}
            {isMyTurn && !isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut && (
              <div className="w-full max-w-[260px] sm:max-w-[320px] mt-1.5 flex flex-col items-center animate-fadeIn">
                <div className="w-full flex items-center justify-between px-1 mb-0.5">
                  <span className="font-pixel text-[8px] sm:text-[9px] font-black text-[#0D0D0D] flex items-center gap-1">
                    <span className={turnTimeRemaining <= 3 ? 'animate-ping inline-block text-red-600' : ''}>⏱️</span> TIME LIMIT
                  </span>
                  <span className={`font-mono-nb text-[11px] sm:text-xs font-black ${
                    turnTimeRemaining <= 3 ? 'text-[#FF3333] animate-pulse scale-110' : 'text-[#0D0D0D]'
                  }`}>
                    {turnTimeRemaining.toFixed(1)}s / 10.0s
                  </span>
                </div>

                {/* HP Gauge Container */}
                <div className="w-full h-3 sm:h-3.5 bg-[#0D0D0D] border-[2px] border-[#0D0D0D] rounded-full p-0.5 shadow-[2px_2px_0px_#0D0D0D] relative overflow-hidden">
                  {/* HP Gauge Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-100 ease-linear ${
                      turnTimeRemaining <= 3 ? 'animate-pulse' : ''
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (turnTimeRemaining / TURN_TIME_LIMIT) * 100))}%`,
                      backgroundColor: getTimerColor(turnTimeRemaining),
                      boxShadow: `0 0 8px ${getTimerColor(turnTimeRemaining)}`
                    }}
                  />
                  {/* Segment dividers like fighting game HP bars */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
                    <div className="w-0.5 h-full bg-black/40" />
                    <div className="w-0.5 h-full bg-black/40" />
                    <div className="w-0.5 h-full bg-black/40" />
                    <div className="w-0.5 h-full bg-black/40" />
                  </div>
                </div>
              </div>
            )}

            {isPlayerFolded && stage !== 'showdown' && (
              <div className="mt-1.5 bg-[#FFE500] border-[2.5px] border-[#0D0D0D] px-4 py-1 rounded-full shadow-[3px_3px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm animate-pulse text-[#0D0D0D]">
                🍿 SPECTATING BOTS ROUND...
              </div>
            )}

            {isPlayerAllIn && !isPlayerFolded && stage !== 'showdown' && (
              <div className="mt-1.5 bg-[#FF70A6] border-[2.5px] border-[#0D0D0D] px-4 py-1 rounded-full shadow-[3px_3px_0px_#0D0D0D] font-display font-black text-xs sm:text-sm animate-pulse text-[#0D0D0D]">
                🚀 ALL-IN LIVE RUNOUT // WATCHING BOT RESPONSES...
              </div>
            )}

          </div>

        </div>

        {/* ------------------------------------------------------ */}
        {/* TABLE PAUSED / VICTORY OVERLAY                         */}
        {/* ------------------------------------------------------ */}
        {stage === 'table_paused' && (
          <div className="absolute inset-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-6xl sm:text-7xl animate-bounce">
              {activeBots.every(b => b.isBusted) ? '👑' : '⏸️'}
            </span>
            <div className="bg-[#00F5FF] border-[4px] border-[#0D0D0D] px-8 sm:px-12 py-3 shadow-[8px_8px_0px_#FFE500] my-3 -rotate-1">
              <h3 className="font-display text-2xl sm:text-4xl font-black text-[#0D0D0D] uppercase">
                {activeBots.every(b => b.isBusted) ? 'TABLE CONQUERED! ALL BOTS BUSTED 🏆' : 'TABLE PAUSED (WAITING FOR PLAYERS)'}
              </h3>
            </div>
            <p className="font-mono-nb text-sm sm:text-base text-gray-200 mb-6 max-w-md">
              {activeBots.every(b => b.isBusted)
                ? 'You have eliminated every bot from the table! Rebuy all bots to start a new high-stakes match.'
                : 'Not enough active players to deal a hand. Rebuy busted bots or rejoin the table to resume action.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRebuyAllBots}
                className="brutal-btn px-8 py-3 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] font-display text-sm sm:text-base font-black uppercase shadow-[4px_4px_0px_#0D0D0D] cursor-pointer"
              >
                🤖 REBUY ALL BOTS ($10K EACH)
              </button>
              {isHeroSittingOut && (
                <button
                  onClick={handleHeroRebuy}
                  className="brutal-btn px-8 py-3 bg-[#00F5FF] hover:bg-[#FFE500] text-[#0D0D0D] font-display text-sm sm:text-base font-black uppercase shadow-[4px_4px_0px_#0D0D0D] cursor-pointer"
                >
                  💰 REBUY HERO ($10K)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* SHOWDOWN FULL RESULT OVERLAY                           */}
        {/* ------------------------------------------------------ */}
        {stage === 'showdown' && (
          <div className="absolute inset-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            {gameResult === 'win' ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl sm:text-7xl animate-bounce">🏆</span>
                <div className="bg-[#00F5FF] border-[4px] border-[#0D0D0D] px-10 py-3 shadow-[8px_8px_0px_#FFE500] -rotate-2">
                  <h3 className="font-display text-3xl sm:text-5xl font-black text-[#0D0D0D] uppercase">
                    YOU WON THE POT!
                  </h3>
                </div>
                <p className="font-mono-nb text-base sm:text-lg font-bold text-white mt-1">
                  {playerHandName}
                </p>
                <div className="bg-[#FFE500] border-[3px] border-[#0D0D0D] px-8 py-2 shadow-[5px_5px_0px_#0D0D0D] font-display text-2xl sm:text-3xl font-black text-[#0D0D0D]">
                  +${pot.toLocaleString()} CHIPS COLLECTED
                </div>
              </div>
            ) : gameResult === 'split' ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl sm:text-7xl animate-bounce">🤝</span>
                <div className="bg-[#FFE500] border-[4px] border-[#0D0D0D] px-10 py-3 shadow-[8px_8px_0px_#00F5FF] -rotate-1">
                  <h3 className="font-display text-2xl sm:text-4xl font-black text-[#0D0D0D] uppercase">
                    SPLIT POT!
                  </h3>
                </div>
                <p className="font-mono-nb text-sm sm:text-base font-bold text-[#FFE500] bg-[#0D0D0D] px-3 py-1 border border-white/40 rounded-lg">
                  TIED HAND: {winningHandName || 'IDENTICAL HIGH CARDS'}
                </p>
                <div className="bg-[#FFFFFF] border-[3px] border-[#0D0D0D] px-6 py-1.5 shadow-[4px_4px_0px_#0D0D0D] font-display text-xl sm:text-2xl font-black text-[#0D0D0D]">
                  {winnerName} SPLIT ${pot.toLocaleString()}
                </div>
              </div>
            ) : gameResult === 'bot_win' ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl sm:text-7xl animate-bounce">👑</span>
                <div className="bg-[#FFE500] border-[4px] border-[#0D0D0D] px-10 py-3 shadow-[8px_8px_0px_#00F5FF] -rotate-1">
                  <h3 className="font-display text-2xl sm:text-4xl font-black text-[#0D0D0D] uppercase">
                    {winnerName} WINS!
                  </h3>
                </div>
                <p className="font-mono-nb text-sm sm:text-base font-bold text-[#FFE500] bg-[#0D0D0D] px-3 py-1 border border-white/40 rounded-lg">
                  WINNING HAND: {winningHandName || 'HIGH CARD'}
                </p>
                <div className="bg-[#FFFFFF] border-[3px] border-[#0D0D0D] px-6 py-1.5 shadow-[4px_4px_0px_#0D0D0D] font-display text-xl sm:text-2xl font-black text-[#0D0D0D]">
                  ${pot.toLocaleString()} POT COLLECTED
                </div>
                <p className="font-pixel text-[9px] sm:text-[10px] text-gray-400">
                  (You folded this hand)
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl">💀</span>
                <div className="bg-[#FF70A6] border-[4px] border-[#0D0D0D] px-10 py-3 shadow-[8px_8px_0px_#0D0D0D] rotate-2">
                  <h3 className="font-display text-3xl sm:text-5xl font-black text-[#0D0D0D] uppercase">
                    {winnerName} WINS!
                  </h3>
                </div>
                <p className="font-mono-nb text-sm sm:text-base font-bold text-gray-200">
                  WINNING HAND: {winningHandName || 'BETTER HAND'}
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 mt-6">
              <button
                onClick={startNewHand}
                className="brutal-btn px-10 py-3.5 bg-[#FFE500] text-[#0D0D0D] font-display text-base font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[5px_5px_0px_#0D0D0D] active:translate-x-1 active:translate-y-1"
              >
                DEAL NEXT HAND → {autoNextSeconds ? `(${autoNextSeconds}s)` : ''}
              </button>
              {autoNextSeconds && (
                <span className="font-pixel text-[9px] text-gray-300 animate-pulse">
                  Auto-dealing next hand in {autoNextSeconds} seconds...
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM COMMAND & ACTION DOCK (3D CHIP TRAY & CONTROLS) */}
      {/* ======================================================== */}
      <footer className="h-20 sm:h-24 shrink-0 bg-[#FFFFFF] border-t-[4px] border-[#0D0D0D] px-3 sm:px-6 flex items-center justify-between gap-3 z-30 relative shadow-[0px_-4px_0px_#0D0D0D]">
        
        {/* Left: Interactive 3D Casino Chip Rack / Bet Builder */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2 bg-[#F6F5FA] border-[2.5px] border-[#0D0D0D] p-1.5 sm:p-2 rounded-2xl shadow-[3px_3px_0px_#0D0D0D]">
            <span className="font-pixel text-[8px] sm:text-[9px] font-bold text-gray-700 hidden md:inline px-1">
              CHIPS:
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              {CHIP_DENOMINATIONS.map(denom => (
                <PokerChip
                  key={denom.val}
                  denom={denom}
                  size="md"
                  interactive={!isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut}
                  onClick={(val) => {
                    if (!isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut) {
                      setRaiseAmount(r => Math.min(bankroll, r + val))
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick Bet Presets */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipClink({ brightness: 1.2 })
                setRaiseAmount(500)
              }}
              className="font-pixel text-[8px] sm:text-[9px] bg-white border-[2px] border-[#0D0D0D] px-2 py-1 font-bold hover:bg-gray-100 cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 disabled:opacity-40"
            >
              MIN
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipsStack()
                setRaiseAmount(Math.max(500, Math.min(bankroll, Math.floor(pot / 2))))
              }}
              className="font-pixel text-[8px] sm:text-[9px] bg-[#00F5FF] border-[2px] border-[#0D0D0D] px-2 py-1 font-bold hover:bg-[#00d8e6] cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              1/2
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipsStack()
                setRaiseAmount(Math.max(500, Math.min(bankroll, pot)))
              }}
              className="font-pixel text-[8px] sm:text-[9px] bg-[#FFE500] border-[2px] border-[#0D0D0D] px-2 py-1 font-bold hover:bg-[#ebd300] cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              POT
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playJackpot()
                setRaiseAmount(bankroll)
              }}
              className="font-pixel text-[8px] sm:text-[9px] bg-[#FF70A6] border-[2px] border-[#0D0D0D] px-2 py-1 font-bold hover:bg-[#ff5292] cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              MAX
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playClick()
                setRaiseAmount(500)
              }}
              className="font-pixel text-[8px] sm:text-[9px] bg-gray-200 border-[2px] border-[#0D0D0D] px-1.5 py-1 font-bold hover:bg-gray-300 cursor-pointer shadow-[1.5px_1.5px_0px_#0D0D0D] text-gray-700 disabled:opacity-40"
              title="Reset bet"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Right: Poker Action Buttons / Spectator Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {stage !== 'showdown' && stage !== 'table_paused' ? (
            isHeroSittingOut ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FFE500] border-[2.5px] border-[#0D0D0D] px-3.5 sm:px-5 py-2 rounded-xl flex items-center gap-2 shadow-[2.5px_2.5px_0px_#0D0D0D]">
                  <span className="text-base sm:text-lg animate-bounce">🍿</span>
                  <span className="font-display font-black text-xs sm:text-sm text-[#0D0D0D] uppercase">
                    {heroQueuedToJoin ? 'WAITING FOR NEXT HAND TO START...' : 'YOU ARE CURRENTLY SITTING OUT'}
                  </span>
                </div>
                {!heroQueuedToJoin ? (
                  <button
                    onClick={handleHeroRebuy}
                    className="brutal-btn px-5 sm:px-7 py-2.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#FFE500] cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                  >
                    💰 REBUY $10K & JOIN
                  </button>
                ) : (
                  <button
                    onClick={handleSkipToShowdown}
                    className="brutal-btn px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                    title="Fast forward to showdown"
                  >
                    ⚡ SKIP TO SHOWDOWN
                  </button>
                )}
              </div>
            ) : isPlayerFolded ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#F6F5FA] border-[2.5px] border-[#0D0D0D] px-3.5 sm:px-5 py-2 rounded-xl flex items-center gap-2 shadow-[2.5px_2.5px_0px_#0D0D0D]">
                  <span className="text-base sm:text-lg animate-bounce">🍿</span>
                  <span className="font-display font-black text-xs sm:text-sm text-[#0D0D0D] uppercase">
                    SPECTATING BOTS DUEL...
                  </span>
                </div>
                <button
                  onClick={handleSkipToShowdown}
                  className="brutal-btn px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                  title="Fast forward to showdown"
                >
                  ⚡ SKIP TO SHOWDOWN
                </button>
              </div>
            ) : isPlayerAllIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#FFE500] border-[2.5px] border-[#0D0D0D] px-3.5 sm:px-5 py-2 rounded-xl flex items-center gap-2 shadow-[2.5px_2.5px_0px_#0D0D0D]">
                  <span className="text-base sm:text-lg animate-bounce">🚀</span>
                  <span className="font-display font-black text-xs sm:text-sm text-[#0D0D0D] uppercase">
                    ALL-IN RUNOUT IN PROGRESS...
                  </span>
                </div>
                <button
                  onClick={handleSkipToShowdown}
                  className="brutal-btn px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#FFE500] cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                  title="Fast forward to showdown"
                >
                  ⚡ SKIP TO SHOWDOWN
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* 10s Timer Warning Badge in Action Dock */}
                {isMyTurn && (
                  <div className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-[2px] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] transition-colors ${
                    turnTimeRemaining <= 3 ? 'bg-[#FF3333] text-white animate-pulse' : 'bg-[#FFFFFF] text-[#0D0D0D]'
                  }`}>
                    <span className="text-xs">⏱️</span>
                    <span className="font-mono-nb font-black text-xs">
                      {turnTimeRemaining.toFixed(1)}s
                    </span>
                  </div>
                )}

                {/* FOLD */}
                <button
                  disabled={!isMyTurn}
                  onClick={handlePlayerFold}
                  className="brutal-btn px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#FF70A6] transition-colors disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                >
                  🏳️ FOLD
                </button>

                {/* CHECK / CALL */}
                {playerCallAmount === 0 ? (
                  <button
                    disabled={!isMyTurn}
                    onClick={handlePlayerCheck}
                    className="brutal-btn px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#00d8e6] disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                  >
                    ✓ CHECK
                  </button>
                ) : (
                  <button
                    disabled={!isMyTurn}
                    onClick={handlePlayerCall}
                    className="brutal-btn px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#00d8e6] disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                  >
                    ✓ CALL ${playerCallAmount.toLocaleString()}
                  </button>
                )}

                {/* RAISE */}
                <button
                  disabled={!isMyTurn}
                  onClick={() => handlePlayerRaise(raiseAmount)}
                  className="brutal-btn px-6 sm:px-7 py-2.5 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#ebd300] disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                >
                  🔥 RAISE +${raiseAmount.toLocaleString()}
                </button>

                {/* ALL-IN */}
                <button
                  disabled={!isMyTurn}
                  onClick={handlePlayerAllIn}
                  className="brutal-btn px-6 sm:px-7 py-2.5 sm:py-3 bg-[#FF70A6] text-[#0D0D0D] font-display text-xs sm:text-sm font-black uppercase hover:bg-[#ff5292] animate-pulse disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
                >
                  🚀 ALL-IN
                </button>

              </div>
            )
          ) : stage === 'table_paused' ? (
            <button
              onClick={handleRebuyAllBots}
              className="brutal-btn px-8 py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-sm sm:text-base font-black uppercase hover:bg-[#FFE500] shadow-[4px_4px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
            >
              🤖 REBUY ALL BOTS
            </button>
          ) : (
            <button
              onClick={startNewHand}
              className="brutal-btn px-8 py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-sm sm:text-base font-black uppercase hover:bg-[#00F5FF] shadow-[4px_4px_0px_#0D0D0D] border-[2.5px] border-[#0D0D0D]"
            >
              DEAL NEXT HAND → {autoNextSeconds ? `(${autoNextSeconds}s)` : ''}
            </button>
          )}
        </div>

      </footer>

    </div>
  )
}
