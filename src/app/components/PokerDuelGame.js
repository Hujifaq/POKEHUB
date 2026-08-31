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
import {
  GamePhase,
  PlayerActionType,
  createShuffledDeck,
  evaluate7CardHand,
  calculateSidePots,
  startNewHand as engineStartNewHand,
  executePlayerAction as engineExecuteAction,
  isBettingRoundComplete
} from '../utils/pokerEngine'

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
    xs: 'w-5 h-5 sm:w-6 sm:h-6 text-[5.5px] sm:text-[6.5px]',
    sm: 'w-7 h-7 sm:w-8 sm:h-8 text-[7px] sm:text-[8px]',
    md: 'w-10 h-10 sm:w-11 sm:h-11 text-[9px] sm:text-[10px]',
    lg: 'w-12 h-12 sm:w-13 sm:h-13 text-[10px] sm:text-xs'
  }

  const activeStyle = sizeStyles[size] || sizeStyles.sm

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
        className={`${activeStyle} rounded-full border-[2.5px] border-[#0D0D0D] flex items-center justify-center relative cursor-pointer font-pixel font-black select-none transition-all duration-150 ${interactive
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
      className={`flex items-center gap-1.5 bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] px-2.5 py-1 rounded-full shadow-[3px_3px_0px_#0D0D0D] cursor-pointer hover:scale-105 active:scale-95 transition-all select-none ${animate ? 'animate-chipToss' : ''
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

// Official Texas Hold'em Hand Evaluator with exact 5-card kicker tie-breaking & matched card tracking
function evaluateHand(cards) {
  if (!cards || cards.length === 0) {
    return { score: 0, name: 'NO CARDS', rank: 0, matchingCards: [], bestFiveCards: [] }
  }

  const sorted = [...cards].sort((a, b) => b.val - a.val)

  // Handle 2 cards (e.g. preflop hole cards)
  if (sorted.length === 2) {
    if (sorted[0].val === sorted[1].val) {
      const pairVal = sorted[0].val
      return {
        score: 1e10 + pairVal * 1e8,
        name: `POCKET PAIR OF ${getCardRankName(pairVal)}S`,
        rank: 1,
        matchingCards: [sorted[0], sorted[1]],
        bestFiveCards: sorted
      }
    }
    return {
      score: sorted[0].val * 1e8 + sorted[1].val * 1e6,
      name: `HIGH CARD (${getCardRankName(sorted[0].val)})`,
      rank: 0,
      matchingCards: [],
      bestFiveCards: sorted
    }
  }

  const valCounts = {}
  const suitCounts = {}
  const suitCards = {}

  sorted.forEach(c => {
    valCounts[c.val] = (valCounts[c.val] || 0) + 1
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1
    if (!suitCards[c.suit]) suitCards[c.suit] = []
    suitCards[c.suit].push(c)
  })

  // 1. Check Flush (5 or more of the same suit)
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
        const seqVals = [topVal, topVal - 1, topVal - 2, topVal - 3, topVal - 4]
        const sfCards = seqVals.map(v => fCards.find(c => (v === 1 ? c.val === 14 : c.val === v))).filter(Boolean)

        if (topVal === 14) {
          return {
            score: 9e10,
            name: 'ROYAL FLUSH',
            rank: 9,
            matchingCards: sfCards,
            bestFiveCards: sfCards
          }
        }
        return {
          score: 8e10 + topVal * 1e8,
          name: `STRAIGHT FLUSH (${getCardRankName(topVal)} HIGH)`,
          rank: 8,
          matchingCards: sfCards,
          bestFiveCards: sfCards
        }
      }
    }
  }

  // Group card value frequencies
  const counts = Object.entries(valCounts)
    .map(([val, count]) => ({ val: Number(val), count }))
    .sort((a, b) => b.count - a.count || b.val - a.val)

  // 3. Four of a Kind
  if (counts[0] && counts[0].count === 4) {
    const quadVal = counts[0].val
    const quadCards = sorted.filter(c => c.val === quadVal)
    const kicker = sorted.find(c => c.val !== quadVal)
    const bestFive = kicker ? [...quadCards, kicker] : quadCards
    return {
      score: 7e10 + quadVal * 1e8 + (kicker?.val || 0) * 1e6,
      name: `FOUR OF A KIND (${getCardRankName(quadVal)}S)`,
      rank: 7,
      matchingCards: quadCards,
      bestFiveCards: bestFive
    }
  }

  // 4. Full House (trips + pair or trips + trips)
  if (counts[0] && counts[0].count === 3 && counts[1] && counts[1].count >= 2) {
    const tripsVal = counts[0].val
    const pairVal = counts[1].val
    const tripsCards = sorted.filter(c => c.val === tripsVal).slice(0, 3)
    const pairCards = sorted.filter(c => c.val === pairVal).slice(0, 2)
    const fhCards = [...tripsCards, ...pairCards]
    return {
      score: 6e10 + tripsVal * 1e8 + pairVal * 1e6,
      name: `FULL HOUSE (${getCardRankName(tripsVal)}S OVER ${getCardRankName(pairVal)}S)`,
      rank: 6,
      matchingCards: fhCards,
      bestFiveCards: fhCards
    }
  }

  // 5. Flush (top 5 flush cards)
  if (flushSuit) {
    const fCards = suitCards[flushSuit].sort((a, b) => b.val - a.val).slice(0, 5)
    const score = 5e10 +
      fCards[0].val * 1e8 +
      (fCards[1]?.val || 0) * 1e6 +
      (fCards[2]?.val || 0) * 1e4 +
      (fCards[3]?.val || 0) * 1e2 +
      (fCards[4]?.val || 0)
    return {
      score,
      name: `FLUSH (${getCardRankName(fCards[0].val)} HIGH)`,
      rank: 5,
      matchingCards: fCards,
      bestFiveCards: fCards
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
      const seqVals = [topVal, topVal - 1, topVal - 2, topVal - 3, topVal - 4]
      const stCards = seqVals.map(v => sorted.find(c => (v === 1 ? c.val === 14 : c.val === v))).filter(Boolean)
      return {
        score: 4e10 + topVal * 1e8,
        name: `STRAIGHT (${getCardRankName(topVal)} HIGH)`,
        rank: 4,
        matchingCards: stCards,
        bestFiveCards: stCards
      }
    }
  }

  // 7. Three of a Kind
  if (counts[0] && counts[0].count === 3) {
    const tripsVal = counts[0].val
    const tripsCards = sorted.filter(c => c.val === tripsVal).slice(0, 3)
    const kickers = sorted.filter(c => c.val !== tripsVal).slice(0, 2)
    const k1 = kickers[0]?.val || 0
    const k2 = kickers[1]?.val || 0
    return {
      score: 3e10 + tripsVal * 1e8 + k1 * 1e6 + k2 * 1e4,
      name: `THREE OF A KIND (${getCardRankName(tripsVal)}S)`,
      rank: 3,
      matchingCards: tripsCards,
      bestFiveCards: [...tripsCards, ...kickers]
    }
  }

  // 8. Two Pair
  if (counts[0] && counts[0].count === 2 && counts[1] && counts[1].count === 2) {
    const highPair = Math.max(counts[0].val, counts[1].val)
    const lowPair = Math.min(counts[0].val, counts[1].val)
    const p1Cards = sorted.filter(c => c.val === highPair).slice(0, 2)
    const p2Cards = sorted.filter(c => c.val === lowPair).slice(0, 2)
    const kicker = sorted.find(c => c.val !== highPair && c.val !== lowPair)
    const tpCards = [...p1Cards, ...p2Cards]
    return {
      score: 2e10 + highPair * 1e8 + lowPair * 1e6 + (kicker?.val || 0) * 1e4,
      name: `TWO PAIR (${getCardRankName(highPair)}S & ${getCardRankName(lowPair)}S)`,
      rank: 2,
      matchingCards: tpCards,
      bestFiveCards: kicker ? [...tpCards, kicker] : tpCards
    }
  }

  // 9. One Pair
  if (counts[0] && counts[0].count === 2) {
    const pairVal = counts[0].val
    const pairCards = sorted.filter(c => c.val === pairVal).slice(0, 2)
    const kickers = sorted.filter(c => c.val !== pairVal).slice(0, 3)
    const k1 = kickers[0]?.val || 0
    const k2 = kickers[1]?.val || 0
    const k3 = kickers[2]?.val || 0
    return {
      score: 1e10 + pairVal * 1e8 + k1 * 1e6 + k2 * 1e4 + k3 * 1e2,
      name: `ONE PAIR OF ${getCardRankName(pairVal)}S`,
      rank: 1,
      matchingCards: pairCards,
      bestFiveCards: [...pairCards, ...kickers]
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
    rank: 0,
    matchingCards: [],
    bestFiveCards: top5
  }
}

function getMatchBadgeLabel(rank, isWinner) {
  if (isWinner) return 'WIN'
  switch (rank) {
    case 9: return 'ROYAL'
    case 8: return 'ST-FLUSH'
    case 7: return 'QUADS'
    case 6: return 'FULL HOUSE'
    case 5: return 'FLUSH'
    case 4: return 'STRAIGHT'
    case 3: return 'TRIPS'
    case 2: return '2-PAIR'
    case 1: return 'PAIR'
    default: return 'MATCH'
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
  isWinner = false,
  matchBadge = null,
  small = false,
  large = false,
  deckSkin = 'obsidian',
  isBot = false
}) {
  const [isHovered, setIsHovered] = useState(false)
  const isDefaultSkin = deckSkin === 'default' || isBot
  const skinTheme = isDefaultSkin
    ? (DECK_SKIN_THEMES.default || {
      id: 'default',
      name: 'CLASSIC RETRO',
      themeStyle: 'default',
      accentColor: '#B84A4A',
      cardBackBg: '#FFF8EE'
    })
    : (DECK_SKIN_THEMES[deckSkin] || DECK_SKIN_THEMES.obsidian)

  const graffitiMat = PIXEL_GRAFFITI[skinTheme.themeStyle] || PIXEL_GRAFFITI.default || PIXEL_GRAFFITI.obsidian
  const frontMat = PIXEL_FRONTS[skinTheme.themeStyle] || PIXEL_FRONTS.obsidian
  const suitPix = card ? (PIX_SUITS[card.suit] || PIX_SUITS.spades) : PIX_SUITS.spades

  // FLUID SIZES FOR MAXIMUM READABILITY & FULL DEVICE RESPONSIVENESS
  const sizeClasses = small
    ? 'w-7 h-10 xs:w-8 xs:h-12 sm:w-10 sm:h-15 md:w-12 md:h-18'
    : large
      ? 'w-13 h-19 xs:w-16 xs:h-23 sm:w-20 sm:h-29 md:w-26 md:h-38'
      : 'w-9 h-13 xs:w-11 xs:h-16 sm:w-14 sm:h-21 md:w-19 md:h-28'

  const hardShadowStyle = {
    boxShadow: isWinner
      ? `0 0 0 3.5px #FFE500, 0 0 18px rgba(255, 229, 0, 0.85), 4.5px 4.5px 0px #0D0D0D`
      : highlighted
        ? `0 0 0 3px #00F5FF, 0 0 14px rgba(0, 245, 255, 0.75), 4px 4px 0px #0D0D0D`
        : `2.5px 2.5px 0px #0D0D0D`
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block select-none transform transition-all duration-300 ${(highlighted || isWinner) && !hidden
        ? '-translate-y-2 scale-105 z-20'
        : 'hover:-translate-y-1 hover:scale-105'
        }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Flame aura ONLY for player/board cards, NO flame on bot cards */}
      {!isBot && !isDefaultSkin && (
        <PixelFireAura
          themeStyle={skinTheme.themeStyle}
          isHovered={isHovered}
          small={small}
        />
      )}

      {/* Floating MATCH / PAIR / WINNER Badge on matching cards */}
      {(highlighted || isWinner) && !hidden && card && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none whitespace-nowrap animate-bounce">
          <span
            className={`font-pixel font-black flex items-center gap-0.5 rounded-full border-[1.5px] border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] ${small
              ? 'text-[6px] px-1 py-0.2'
              : large
                ? 'text-[9px] sm:text-[10px] px-2 py-0.5'
                : 'text-[7.5px] sm:text-[8.5px] px-1.5 py-0.5'
              } ${isWinner
                ? 'bg-[#FFE500] text-[#0D0D0D] ring-2 ring-[#0D0D0D]'
                : 'bg-[#00F5FF] text-[#0D0D0D]'
              }`}
          >
            <span>★</span>
            <span>{isWinner ? 'WINNER' : (matchBadge || 'MATCH')}</span>
          </span>
        </div>
      )}

      {hidden || !card ? (
        isDefaultSkin ? (
          // EXACT ATTACHED DESIGN: Retro Classic Lattice with Ivory Margin and Rose Field
          <div
            className={`${sizeClasses} rounded-lg sm:rounded-xl border-[2px] sm:border-[2.5px] border-[#0D0D0D] bg-[#FFF8EE] flex flex-col items-center justify-center p-0.5 sm:p-1 relative select-none overflow-hidden z-10`}
            style={hardShadowStyle}
          >
            <div className="w-full h-full rounded-sm border border-[#0D0D0D]/40 bg-[#E58383] p-0.5 flex items-center justify-center overflow-hidden relative">
              <PixelArt
                matrix={PIXEL_GRAFFITI.default}
                size={large ? 3.2 : small ? 1.3 : 2.0}
                defaultColor="#B84A4A"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ) : (
          // Custom Equipped Deck Back (Obsidian, Gold, Cyber, Emerald, Sakura, Retro)
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
        )
      ) : (
        // EXACT FRONT FACE: Porcelain Creme #FAF7F2, 8-Bit Pixel Typography, Corner Suits & Centerpiece Emblem
        <div
          className={`${sizeClasses} rounded-xl border-[3px] ${isWinner
            ? 'border-[#FFE500] ring-2 ring-[#0D0D0D]'
            : highlighted
              ? 'border-[#00F5FF] ring-2 ring-[#0D0D0D]'
              : 'border-[#0D0D0D]'
            } bg-[#FAF7F2] flex flex-col justify-between p-1.5 sm:p-2 relative select-none cursor-pointer z-10 overflow-hidden`}
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
            <div className={`p-1 sm:p-1.5 md:p-2 rounded-xl border-[2px] sm:border-[2.5px] ${isWinner ? 'border-[#0D0D0D] bg-[#FFE500]/25' : highlighted ? 'border-[#0D0D0D] bg-[#00F5FF]/20' : 'border-[#0D0D0D] bg-white'
              } shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center`}>
              <PixelArt
                matrix={frontMat}
                size={large ? 3.4 : small ? 1.5 : 2.4}
                defaultColor={isWinner ? '#FFE500' : highlighted ? '#00F5FF' : skinTheme.accentColor}
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

export default function PokerDuelGame({
  isOpen,
  onClose,
  bankroll,
  setBankroll,
  userId = 'usr_hero',
  gameId = 'holdem_session',
  table = 'macau_nlh_500',
  stakes = '250-500',
  initialBots = 2,
  deckSkin = 'obsidian',
  setDeckSkin,
  onCopyUri
}) {
  // Game Setup
  const [activeBots, setActiveBots] = useState([])
  const [equippedDeck, setEquippedDeck] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pokehub_equipped_deck') || deckSkin || 'obsidian'
    }
    return deckSkin || 'obsidian'
  })

  useEffect(() => {
    if (deckSkin) {
      setEquippedDeck(deckSkin)
    }
  }, [deckSkin])

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
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false)
  const [isPlayerFolded, setIsPlayerFolded] = useState(false)
  const [isPlayerAllIn, setIsPlayerAllIn] = useState(false)

  // Standard Texas Hold'em Positions & Side Pots
  const [dealerButtonIndex, setDealerButtonIndex] = useState(0)
  const [sbIndex, setSbIndex] = useState(1)
  const [bbIndex, setBbIndex] = useState(2)
  const [sidePots, setSidePots] = useState([])
  const [showdownPotsSummary, setShowdownPotsSummary] = useState([])
  const engineStateRef = useRef(null)

  // Bankruptcy & Table Seating Management States
  const [isHeroSittingOut, setIsHeroSittingOut] = useState(false)
  const [heroQueuedToJoin, setHeroQueuedToJoin] = useState(false)
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(true)
  const [isStreetMenuOpen, setIsStreetMenuOpen] = useState(false)
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

  // Stop background timers when game is closed
  useEffect(() => {
    if (!isOpen) {
      if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
      if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
      if (botThinkTimeoutRef.current) clearTimeout(botThinkTimeoutRef.current)
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [isOpen])

  const triggerChipFlight = useCallback((origin, amount) => {
    if (!isOpen || !amount || amount <= 0) return
    const id = Math.random()
    const chip = getChipForValue(amount)
    setFlyingChips(prev => [...prev, { id, origin, amount, chip }])
    SoundEngine.playChipClink({ brightness: 1.3, pitch: chip.soundPitch })

    setTimeout(() => {
      if (!isOpen) return
      setPotPulsing(true)
      SoundEngine.playChipsStack()
      setTimeout(() => setPotPulsing(false), 260)
      setFlyingChips(prev => prev.filter(c => c.id !== id))
    }, 520)
  }, [isOpen])

  // Floating Action Pop-up Alert
  const [actionToast, setActionToast] = useState(null)
  const toastTimerRef = useRef(null)

  const triggerToast = (actor, actionText, color = '#FFE500', icon = '•') => {
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
    SoundEngine.playThemeCardHover(skinKey)
    setEquippedDeck(skinKey)
    if (setDeckSkin) setDeckSkin(skinKey)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', skinKey)
    }
    if (DECK_SKIN_THEMES[skinKey]) {
      triggerToast('DECK', `EQUIPPED ${DECK_SKIN_THEMES[skinKey].name}!`, '#FFE500', '✓')
    }
  }

  // Initialize Table Seats according to initialBots
  useEffect(() => {
    const seatedCount = Math.max(1, Math.min(4, Number(initialBots) || 2))
    const initialSeats = BOT_ROSTER.map((bot, idx) => ({
      ...bot,
      isSeated: idx < seatedCount,
      cards: [],
      bankroll: idx < seatedCount ? 10000 : 0,
      currentBet: 0,
      lastAction: 'ANTE $500',
      actionType: 'ante',
      folded: idx >= seatedCount,
      isBusted: idx >= seatedCount,
      queuedToJoin: false,
      handName: '',
      isThinking: false
    }))
    setActiveBots(initialSeats)
    activeBotsRef.current = initialSeats
  }, [initialBots])

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
    triggerToast('TABLE', `${rosterBot.name} SEATED ($10,000)!`, '#FFE500', '+')
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
    triggerToast('TABLE', `${rosterBot.name} LEFT THE TABLE`, '#CCCCCC', '✕')
  }

  // Table & Player Rebuy Management
  const handleHeroRebuy = () => {
    SoundEngine.playJackpot()
    setHeroQueuedToJoin(true)
    heroQueuedToJoinRef.current = true
    triggerToast('YOU', 'REBUY $10,000! QUEUED TO JOIN NEXT HAND', '#00F5FF', '✓')
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
    triggerToast('TABLE', `${bot?.name || 'BOT'} +$10,000! QUEUED TO RE-JOIN NEXT HAND`, '#FFE500', '✓')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  const handleRebuyAllBots = () => {
    SoundEngine.playJackpot()
    const updated = activeBots.map(b => ({ ...b, isSeated: true, queuedToJoin: true, isBusted: false, bankroll: 10000 }))
    setActiveBots(updated)
    activeBotsRef.current = updated
    triggerToast('TABLE', 'ALL BOTS SEATED & REBOUGHT ($10,000)!', '#FFE500', '✓')
    if (stageRef.current === 'table_paused' || stageRef.current === 'showdown' || stageRef.current === 'idle') {
      setTimeout(startNewHand, 300)
    }
  }

  // Sync pure PokerEngine state into React state & UI
  const syncEngineToReact = useCallback((engineState) => {
    if (!engineState || !engineState.players) return

    const hero = engineState.players[0] || {}
    const bots = engineState.players.slice(1)

    const stageMap = {
      [GamePhase.IDLE]: 'idle',
      [GamePhase.PRE_FLOP]: 'preflop',
      [GamePhase.FLOP]: 'flop',
      [GamePhase.TURN]: 'turn',
      [GamePhase.RIVER]: 'river',
      [GamePhase.SHOWDOWN]: 'showdown',
      [GamePhase.HAND_RESOLVED]: 'showdown'
    }

    const currentStage = stageMap[engineState.phase] || 'preflop'
    setStage(currentStage)
    stageRef.current = currentStage

    setDeck(engineState.deck || [])
    deckRef.current = engineState.deck || []

    setCommunityCards(engineState.communityCards || [])
    communityCardsRef.current = engineState.communityCards || []

    setPot(engineState.totalPot || 0)
    potRef.current = engineState.totalPot || 0

    setCurrentRoundHighBet(engineState.currentRoundHighBet || 0)
    highBetRef.current = engineState.currentRoundHighBet || 0

    setPlayerRoundBet(hero.roundBet || 0)
    if (hero.bankroll !== undefined) {
      setBankroll(hero.bankroll)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pokehub_bankroll', hero.bankroll.toString())
      }
    }

    setIsPlayerFolded(hero.folded || false)
    isPlayerFoldedRef.current = hero.folded || false

    setIsPlayerAllIn(hero.isAllIn || false)
    isPlayerAllInRef.current = hero.isAllIn || false

    setDealerButtonIndex(engineState.dealerButtonIndex || 0)
    setSbIndex(engineState.sbIndex !== undefined ? engineState.sbIndex : 1)
    setBbIndex(engineState.bbIndex !== undefined ? engineState.bbIndex : 2)
    setSidePots(engineState.sidePots || [])

    // Map bots to activeBots format
    const mappedBots = BOT_ROSTER.map((roster, idx) => {
      const b = bots[idx]
      if (!b) return { ...roster, isSeated: false, bankroll: 0, cards: [], isBusted: true, folded: true }
      return {
        ...roster,
        ...b,
        currentBet: b.roundBet || 0,
        isBusted: b.bankroll < (engineState.bbAmount || 500) && !b.totalHandBet,
        cards: b.cards || []
      }
    })

    setActiveBots(mappedBots)
    activeBotsRef.current = mappedBots

    if (hero.cards && hero.cards.length === 2) {
      setPlayerCards(hero.cards)
    }
  }, [setBankroll])

  // Showdown and Hand Resolution Handler
  const handleShowdownConclusion = useCallback((state) => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
    if (botThinkTimeoutRef.current) clearTimeout(botThinkTimeoutRef.current)

    setStage('showdown')
    stageRef.current = 'showdown'
    setCurrentTurnActor('SHOWDOWN')
    setActiveTurnName('SHOWDOWN — REVEALING HANDS')
    setShowWinnerOverlay(false)
    SoundEngine.playCardFlip()

    const hero = state.players[0]
    const isHeroWinner = (state.winners || []).some(w => w.id === 'player_hero')
    const winnerNames = (state.winners || []).map(w => w.name).join(' & ')
    const isSplit = (state.winners || []).length > 1

    setWinnerName(winnerNames || 'TABLE')
    setWinningHandName(state.winningHandName || 'BEST 5-CARD HAND')
    setGameResult(isSplit ? 'split' : isHeroWinner ? 'win' : hero.folded ? 'bot_win' : 'lose')
    setShowdownPotsSummary(state.showdownPotsSummary || [])

    setTimeout(() => {
      if (isHeroWinner) {
        SoundEngine.playJackpot()
        triggerToast('DEALER', `YOU WON $${state.totalPot.toLocaleString()}!`, '#00F5FF', '★')
      } else {
        SoundEngine.playChipsStack()
        triggerToast('DEALER', `${winnerNames} WON $${state.totalPot.toLocaleString()}!`, '#FFE500', '★')
      }
      setShowWinnerOverlay(true)

      // Auto-advance to next hand after 6 seconds
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
    }, 2400)
  }, [])

  // Universal Turn Runner (Manages turn sequence between Hero & Bots)
  const runTurnLoop = useCallback((state) => {
    if (!isOpen) return

    // 1. If hand resolved or reached showdown -> trigger reveal
    if (state.phase === GamePhase.HAND_RESOLVED || state.phase === GamePhase.SHOWDOWN) {
      handleShowdownConclusion(state)
      return
    }

    const turnIdx = state.currentTurnIndex

    // 2. If no actionable player left -> auto runout
    if (turnIdx < 0) {
      const survivors = state.players.filter(p => p.isSeated && !p.folded)
      if (survivors.length <= 1) {
        handleShowdownConclusion(state)
        return
      }
      setTimeout(() => {
        if (!isOpen) return
        const nextState = engineExecuteAction(state, state.currentTurnIndex, PlayerActionType.CHECK)
        engineStateRef.current = nextState
        syncEngineToReact(nextState)
        runTurnLoop(nextState)
      }, 800)
      return
    }

    // 3. Hero's turn (Seat Index 0)
    if (turnIdx === 0) {
      const hero = state.players[0]
      if (hero.folded || hero.isAllIn || hero.bankroll <= 0) {
        const nextState = engineExecuteAction(state, 0, PlayerActionType.CHECK)
        engineStateRef.current = nextState
        syncEngineToReact(nextState)
        runTurnLoop(nextState)
        return
      }

      setCurrentTurnActor('PLAYER')
      setActiveTurnName('YOUR MOVE')
      setIsProcessingBot(false)

      // Start 10-second Shot Clock for Hero
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
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
          const callNeeded = Math.max(0, state.currentRoundHighBet - (hero.roundBet || 0))
          if (callNeeded === 0) {
            handlePlayerCheck()
          } else {
            handlePlayerFold()
          }
        }
      }, 100)
      return
    }

    // 4. Bot's turn (Seat Index 1 to 5)
    const botIdx = turnIdx - 1
    const bot = state.players[turnIdx]
    setCurrentTurnActor(bot.id)
    setActiveTurnName(`${bot.name}'S TURN`)
    setIsProcessingBot(true)

    executeBotTurn(turnIdx, state)
  }, [isOpen, handleShowdownConclusion, syncEngineToReact])

  // Execute Bot AI Turn with Realistic 2-8s Timing & Smart Decisioning
  const executeBotTurn = useCallback((seatIndex, state) => {
    if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
    if (botThinkTimeoutRef.current) clearTimeout(botThinkTimeoutRef.current)

    const bot = state.players[seatIndex]
    if (!bot || bot.folded || bot.isAllIn || bot.bankroll <= 0) {
      const nextState = engineExecuteAction(state, seatIndex, PlayerActionType.CHECK)
      engineStateRef.current = nextState
      syncEngineToReact(nextState)
      runTurnLoop(nextState)
      return
    }

    const callNeeded = Math.max(0, state.currentRoundHighBet - (bot.roundBet || 0))
    const isFacingPressure = callNeeded > 1000

    // Randomized think duration (2.0s to 7.0s)
    const thinkDuration = isFacingPressure
      ? Math.floor(Math.random() * 4000) + 3000
      : Math.floor(Math.random() * 3200) + 2000

    const startTime = Date.now()
    const BOT_ACTION_TIME_LIMIT = 10

    setActiveBots(prev => prev.map((b, i) => i === seatIndex - 1 ? {
      ...b,
      isThinking: true,
      timeRemaining: BOT_ACTION_TIME_LIMIT,
      timePercent: 100
    } : { ...b, isThinking: false }))

    botThinkIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remainingMs = Math.max(0, (BOT_ACTION_TIME_LIMIT * 1000) - elapsed)
      const remainingSec = Math.max(0, remainingMs / 1000)
      const percent = (remainingSec / BOT_ACTION_TIME_LIMIT) * 100

      setActiveBots(prev => prev.map((b, i) => i === seatIndex - 1 ? {
        ...b,
        isThinking: true,
        timeRemaining: remainingSec,
        timePercent: percent
      } : b))
    }, 100)

    botThinkTimeoutRef.current = setTimeout(() => {
      if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)

      // Evaluate Hand Strength
      const allCards = [...(bot.cards || []), ...(state.communityCards || [])]
      const evalResult = evaluate7CardHand(allCards)
      const rank = evalResult.rank || 0

      let actionType = PlayerActionType.CHECK
      let targetRaise = 0

      if (callNeeded === 0) {
        // Free to check
        if (rank >= 2 && Math.random() < 0.35) {
          actionType = PlayerActionType.RAISE
          targetRaise = state.currentRoundHighBet + (state.minRaise || 500)
        } else {
          actionType = PlayerActionType.CHECK
        }
      } else {
        // Facing a bet
        if (rank >= 3) {
          // Three of a kind or higher
          if (Math.random() < 0.45 && bot.bankroll > callNeeded + (state.minRaise || 500)) {
            actionType = PlayerActionType.RAISE
            targetRaise = state.currentRoundHighBet + (state.minRaise || 500)
          } else {
            actionType = PlayerActionType.CALL
          }
        } else if (rank >= 1) {
          // One pair or two pair
          if (callNeeded > bot.bankroll * 0.7 && rank === 1) {
            actionType = Math.random() < 0.35 ? PlayerActionType.CALL : PlayerActionType.FOLD
          } else {
            actionType = PlayerActionType.CALL
          }
        } else {
          // High card
          if (callNeeded <= 500) {
            actionType = Math.random() < 0.4 ? PlayerActionType.CALL : PlayerActionType.FOLD
          } else {
            actionType = Math.random() < 0.12 ? PlayerActionType.CALL : PlayerActionType.FOLD
          }
        }
      }

      // Execute in engine
      const nextState = engineExecuteAction(state, seatIndex, actionType, targetRaise)
      engineStateRef.current = nextState

      // Audio & Chip particle effects
      if (actionType === PlayerActionType.FOLD) {
        SoundEngine.playCardSwoosh()
        triggerToast(bot.name, 'FOLDED', '#CCCCCC', '✕')
      } else if (actionType === PlayerActionType.CHECK) {
        SoundEngine.playClick()
        triggerToast(bot.name, 'CHECKED', '#FFE500', '✓')
      } else if (actionType === PlayerActionType.CALL) {
        const added = (nextState.players[seatIndex].roundBet || 0) - (bot.roundBet || 0)
        if (added > 0) triggerChipFlight(`bot_${seatIndex - 1}`, added)
        triggerToast(bot.name, `CALLED $${added.toLocaleString()}`, '#00F5FF', '✓')
      } else if (actionType === PlayerActionType.RAISE || actionType === PlayerActionType.ALL_IN) {
        const added = (nextState.players[seatIndex].roundBet || 0) - (bot.roundBet || 0)
        if (added > 0) triggerChipFlight(`bot_${seatIndex - 1}`, added)
        triggerToast(bot.name, `RAISED TO $${nextState.currentRoundHighBet.toLocaleString()}`, '#FF70A6', '+')
      }

      syncEngineToReact(nextState)

      setTimeout(() => {
        runTurnLoop(nextState)
      }, 450)
    }, thinkDuration)
  }, [syncEngineToReact, runTurnLoop, triggerChipFlight])

  // Start a new standard Texas Hold'em hand
  const startNewHand = useCallback(() => {
    if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current)
    if (botThinkIntervalRef.current) clearInterval(botThinkIntervalRef.current)
    if (botThinkTimeoutRef.current) clearTimeout(botThinkTimeoutRef.current)
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    setAutoNextSeconds(null)

    // 1. Process Hero Rebuy / Status
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

    // 2. Process Bot Rebuys & Seated Status
    const currentBotsList = activeBotsRef.current.length > 0 ? activeBotsRef.current : activeBots
    const updatedBots = BOT_ROSTER.map((rosterBot, idx) => {
      const existing = currentBotsList[idx]
      if (!existing || !existing.isSeated) {
        return {
          ...rosterBot,
          isSeated: false,
          bankroll: 0,
          isBusted: true,
          queuedToJoin: false,
          cards: [],
          roundBet: 0,
          totalHandBet: 0,
          folded: true,
          isAllIn: false,
          hasActed: true,
          lastAction: 'LEFT TABLE',
          handName: '',
          isThinking: false
        }
      }

      let bBankroll = existing.bankroll
      let bBusted = existing.isBusted

      if (existing.queuedToJoin) {
        bBankroll = 10000
        bBusted = false
      } else if (bBankroll < 500) {
        bBusted = true
      }

      return {
        ...existing,
        isSeated: true,
        bankroll: bBankroll,
        isBusted: bBusted,
        queuedToJoin: false,
        cards: [],
        roundBet: 0,
        totalHandBet: 0,
        folded: bBusted,
        isAllIn: false,
        hasActed: false,
        lastAction: bBusted ? 'BUSTED' : 'WAITING',
        handName: '',
        isThinking: false
      }
    })

    // 3. Assemble all 6 seats for pokerEngine (Seat 0: Hero, Seats 1-5: Bots)
    const heroSeat = {
      id: 'player_hero',
      name: 'YOU',
      avatarKey: 'hero',
      bankroll: currentHeroBankroll,
      isSeated: true,
      isSittingOut: !heroParticipating,
      isBusted: currentHeroBankroll < 500,
      cards: [],
      roundBet: 0,
      totalHandBet: 0,
      folded: !heroParticipating,
      isAllIn: false,
      hasActed: false,
      lastAction: heroParticipating ? 'WAITING' : 'OUT'
    }

    const allSeats = [heroSeat, ...updatedBots]
    const seatedAndFunded = allSeats.filter(p => p.isSeated && !p.isSittingOut && p.bankroll >= 500)

    if (seatedAndFunded.length < 2) {
      setActiveBots(updatedBots)
      activeBotsRef.current = updatedBots
      setStage('table_paused')
      stageRef.current = 'table_paused'
      setCurrentTurnActor('TABLE_PAUSED')
      if (heroParticipating && updatedBots.every(b => b.isBusted)) {
        setActiveTurnName('TABLE CONQUERED!')
        triggerToast('CHAMPION', 'ALL OPPONENTS BUSTED!', '#00F5FF', '★')
      } else {
        setActiveTurnName('TABLE PAUSED')
      }
      return
    }

    // 4. Initialize Hand with pokerEngine
    const prevEngineState = engineStateRef.current || {}
    const nextHandState = engineStartNewHand({
      ...prevEngineState,
      dealerButtonIndex: prevEngineState.dealerButtonIndex !== undefined ? prevEngineState.dealerButtonIndex : 0,
      sbAmount: 250,
      bbAmount: 500,
      players: allSeats
    })

    engineStateRef.current = nextHandState

    // 5. Sync React state
    syncEngineToReact(nextHandState)
    setShowWinnerOverlay(false)
    setGameResult(null)
    setWinnerName('')
    setWinningHandName('')
    setPlayerHandName('')
    setRaiseAmount(500)

    SoundEngine.playCardSwoosh()
    setTimeout(() => SoundEngine.playCardFlip(), 200)

    // Trigger Blinds chip animations
    const sbIdx = nextHandState.sbIndex
    const bbIdx = nextHandState.bbIndex
    if (sbIdx === 0) triggerChipFlight('player', 250)
    else triggerChipFlight(`bot_${sbIdx - 1}`, 250)

    setTimeout(() => {
      if (bbIdx === 0) triggerChipFlight('player', 500)
      else triggerChipFlight(`bot_${bbIdx - 1}`, 500)
    }, 120)

    // 6. Run turn loop
    runTurnLoop(nextHandState)
  }, [bankroll, isHeroSittingOut, syncEngineToReact, runTurnLoop, triggerChipFlight, setBankroll])

  useEffect(() => {
    if (isOpen && stage === 'idle') {
      startNewHand()
    }
  }, [isOpen, stage, startNewHand])

  // Real-time Player Hand Evaluator
  useEffect(() => {
    if (playerCards.length > 0) {
      const evalResult = evaluate7CardHand([...playerCards, ...communityCards])
      setPlayerHandName(evalResult.name)
    }
  }, [playerCards, communityCards])

  const playerCallAmount = Math.max(0, currentRoundHighBet - playerRoundBet)

  // Player Actions
  const handlePlayerCheck = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    SoundEngine.playClick()
    triggerToast('YOU', 'CHECKED', '#00F5FF', '✓')

    const currentState = engineStateRef.current
    const nextState = engineExecuteAction(currentState, 0, PlayerActionType.CHECK)
    engineStateRef.current = nextState
    syncEngineToReact(nextState)

    setTimeout(() => {
      runTurnLoop(nextState)
    }, 350)
  }

  const handlePlayerCall = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const currentState = engineStateRef.current
    const hero = currentState.players[0]
    const callAmt = Math.min(hero.bankroll, playerCallAmount)

    const nextState = engineExecuteAction(currentState, 0, PlayerActionType.CALL)
    engineStateRef.current = nextState

    if (callAmt > 0) triggerChipFlight('player', callAmt)
    triggerToast('YOU', `CALLED $${callAmt.toLocaleString()}`, '#00F5FF', '✓')
    syncEngineToReact(nextState)

    setTimeout(() => {
      runTurnLoop(nextState)
    }, 350)
  }

  const handlePlayerRaise = (amount) => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const currentState = engineStateRef.current
    const targetTotal = currentState.currentRoundHighBet + (amount || raiseAmount)

    const nextState = engineExecuteAction(currentState, 0, PlayerActionType.RAISE, targetTotal)
    engineStateRef.current = nextState

    const hero = currentState.players[0]
    const added = (nextState.players[0].roundBet || 0) - (hero.roundBet || 0)
    if (added > 0) triggerChipFlight('player', added)
    triggerToast('YOU', `RAISED TO $${nextState.currentRoundHighBet.toLocaleString()}`, '#FF70A6', '+')
    syncEngineToReact(nextState)

    setTimeout(() => {
      runTurnLoop(nextState)
    }, 350)
  }

  const handlePlayerAllIn = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const currentState = engineStateRef.current
    const hero = currentState.players[0]
    const allInAmt = hero.bankroll

    const nextState = engineExecuteAction(currentState, 0, PlayerActionType.ALL_IN)
    engineStateRef.current = nextState

    if (allInAmt > 0) triggerChipFlight('player', allInAmt)
    triggerToast('YOU', `ALL-IN $${allInAmt.toLocaleString()}!`, '#FF3333', '!')
    syncEngineToReact(nextState)

    setTimeout(() => {
      runTurnLoop(nextState)
    }, 350)
  }

  const handlePlayerFold = () => {
    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current)
    const currentState = engineStateRef.current
    const nextState = engineExecuteAction(currentState, 0, PlayerActionType.FOLD)
    engineStateRef.current = nextState

    SoundEngine.playCardSwoosh()
    triggerToast('YOU', 'YOU FOLDED (SPECTATING BOTS)', '#CCCCCC', '✕')
    syncEngineToReact(nextState)

    setTimeout(() => {
      runTurnLoop(nextState)
    }, 350)
  }

  const handleSkipToShowdown = () => {
    if (stageRef.current === 'showdown') return
    SoundEngine.playCardFlip()
    const currentState = engineStateRef.current
    if (!currentState) return

    const deck = [...currentState.deck]
    const community = [...currentState.communityCards]
    while (community.length < 5 && deck.length > 0) {
      deck.pop()
      community.push(deck.pop())
    }

    const showdownState = {
      ...currentState,
      deck,
      communityCards: community,
      phase: GamePhase.SHOWDOWN
    }
    const resolvedState = evaluateShowdownAndDistributePots(showdownState)
    engineStateRef.current = resolvedState
    syncEngineToReact(resolvedState)
    handleShowdownConclusion(resolvedState)
  }

  if (!isOpen) return null

  const isMyTurn = currentTurnActor === 'PLAYER' && stage !== 'showdown'

  // Real-time Hero Hand and Matched Card IDs calculation
  const heroEval = playerCards.length > 0 ? evaluateHand([...playerCards, ...communityCards]) : null
  const heroMatchedCardIds = new Set(
    (heroEval?.matchingCards || []).map(c => c.id).filter(Boolean)
  )
  const heroMatchBadgeLabel = getMatchBadgeLabel(heroEval?.rank || 0, false)

  // Showdown Winning Hand and Matched Card IDs calculation
  const winningBot = stage === 'showdown' && (gameResult === 'bot_win' || gameResult === 'split')
    ? activeBots.find(b => winnerName === b.name || winnerName.includes(b.name))
    : null

  const winningCardsForEval = stage === 'showdown'
    ? (gameResult === 'win'
      ? [...playerCards, ...communityCards]
      : winningBot && winningBot.cards && winningBot.cards.length > 0
        ? [...winningBot.cards, ...communityCards]
        : [...playerCards, ...communityCards])
    : []
  const winningEval = stage === 'showdown' && winningCardsForEval.length > 0 ? evaluateHand(winningCardsForEval) : null
  const winningMatchedCardIds = new Set(
    (winningEval?.matchingCards || []).map(c => c.id).filter(Boolean)
  )

  // Standard Poker Seat Pod Component (ENLARGED)
  const renderBotSeat = (bot, index, positionClasses, chipPosClasses) => {
    const rosterBot = BOT_ROSTER[index] || { name: `BOT ${index + 1}` }
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
              +
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
              className={`w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#FFFFFF] border-[2.5px] sm:border-[3.5px] border-[#0D0D0D] flex items-center justify-center p-0.5 sm:p-1.5 shadow-[2.5px_2.5px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] relative transition-all overflow-hidden ${isActive ? 'ring-3 sm:ring-4 ring-[#00F5FF] scale-105 sm:scale-110' : ''
                } ${isBotAllIn ? 'ring-3 sm:ring-4 ring-[#FF3333] shadow-[0_0_12px_#FF3333]' : ''} ${isBusted ? 'cursor-pointer hover:scale-105 active:scale-95 bg-gray-100' : bot.folded ? 'opacity-50 grayscale' : ''
                }`}
              title={isBusted ? (bot.queuedToJoin ? 'Queued to rejoin next hand ($10,000)' : 'Click [+] to bring bot back with $10,000') : bot.name}
            >
              <PixelAvatar
                avatarKey={bot.avatarKey || 'samurai'}
                size={2.4}
                isBusted={isBusted}
                isQueued={bot.queuedToJoin}
                className="w-full h-full object-contain"
              />

              {/* Position Badges (D / SB / BB) */}
              <div className="absolute -bottom-2 -left-2 flex items-center gap-1 z-40 pointer-events-none">
                {dealerButtonIndex === (index + 1) && (
                  <div className="w-5 h-5 rounded-full bg-[#FFFFFF] border-[2px] border-[#0D0D0D] font-pixel font-black text-[9px] text-[#0D0D0D] flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D]" title="Dealer Button">
                    D
                  </div>
                )}
                {sbIndex === (index + 1) && (
                  <div className="px-1.5 py-0.5 rounded bg-[#00F5FF] border-[1.5px] border-[#0D0D0D] font-pixel font-bold text-[7.5px] text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]" title="Small Blind ($250)">
                    SB
                  </div>
                )}
                {bbIndex === (index + 1) && (
                  <div className="px-1.5 py-0.5 rounded bg-[#FFE500] border-[1.5px] border-[#0D0D0D] font-pixel font-bold text-[7.5px] text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]" title="Big Blind ($500)">
                    BB
                  </div>
                )}
              </div>

              {/* All-in Badge on Avatar */}
              {isBotAllIn && (
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#FF3333] border-[1.5px] border-[#0D0D0D] rounded-full text-white font-pixel text-[6px] sm:text-[7px] font-black shadow-[1px_1px_0px_#000] animate-pulse z-40">
                  ALL-IN
                </div>
              )}

              {/* Busted [+] Floating Rebuy Button Directly on Avatar Profile */}
              {isBusted && !bot.queuedToJoin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRebuyBot(bot.id)
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#FFE500] hover:bg-[#00F5FF] border-[2px] border-[#0D0D0D] text-[#0D0D0D] font-display font-black text-xs sm:text-base md:text-lg flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] cursor-pointer animate-bounce z-40 transition-transform active:scale-90"
                  title="Click to bring this bot back with $10,000"
                >
                  +
                </button>
              )}

              {/* Queued Checkmark on Avatar Profile */}
              {isBusted && bot.queuedToJoin && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#00F5FF] border-[2px] border-[#0D0D0D] text-[#0D0D0D] font-display font-black text-[9px] sm:text-xs flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] z-40 animate-pulse">
                  ✓
                </div>
              )}

              {/* Thinking Pulsar */}
              {bot.isThinking && !isBusted && !isBotAllIn && (
                <span className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 bg-[#FF70A6] border-[1.5px] border-[#0D0D0D] font-pixel text-[6px] sm:text-[7px] px-1 sm:px-2 py-0.2 sm:py-0.5 font-black shadow-[1.5px_1.5px_0px_#0D0D0D] animate-bounce whitespace-nowrap z-30 text-[#0D0D0D]">
                  THINKING...
                </span>
              )}
            </div>
          </div>

          {/* Bot 2 Hole Cards or Busted Indicator */}
          {!isBusted ? (
            <div className="flex -space-x-3 xs:-space-x-4 sm:-space-x-5 relative">
              {(() => {
                const isBotShowdown = stage === 'showdown' && !bot.folded
                const botEval = isBotShowdown ? evaluateHand([...bot.cards, ...communityCards]) : null
                const botMatchedIds = isBotShowdown ? new Set((botEval?.matchingCards || []).map(c => c.id).filter(Boolean)) : new Set()
                const isThisBotWinner = stage === 'showdown' && showWinnerOverlay && (winnerName === bot.name || winnerName.includes(bot.name))
                const botBadge = getMatchBadgeLabel(botEval?.rank || 0, isThisBotWinner)

                return (
                  <>
                    <BrutalistCard
                      card={bot.cards[0]}
                      hidden={stage !== 'showdown' || bot.folded}
                      small
                      isBot={true}
                      deckSkin="default"
                      highlighted={isBotShowdown && botMatchedIds.has(bot.cards[0]?.id)}
                      isWinner={isThisBotWinner && botMatchedIds.has(bot.cards[0]?.id)}
                      matchBadge={isBotShowdown && botMatchedIds.has(bot.cards[0]?.id) ? botBadge : null}
                    />
                    <BrutalistCard
                      card={bot.cards[1]}
                      hidden={stage !== 'showdown' || bot.folded}
                      small
                      isBot={true}
                      deckSkin="default"
                      highlighted={isBotShowdown && botMatchedIds.has(bot.cards[1]?.id)}
                      isWinner={isThisBotWinner && botMatchedIds.has(bot.cards[1]?.id)}
                      matchBadge={isBotShowdown && botMatchedIds.has(bot.cards[1]?.id) ? botBadge : null}
                    />
                  </>
                )
              })()}
              {bot.folded && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/65 rounded-lg">
                  <span className="font-display font-black text-[9px] sm:text-xs text-white bg-[#FF3333] px-1 sm:px-1.5 py-0.2 sm:py-0.5 border border-black rotate-12">
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
              className={`border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-center shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-all ${bot.queuedToJoin ? 'bg-[#00F5FF] text-[#0D0D0D]' : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                }`}
              title={bot.queuedToJoin ? 'Rejoining next hand with $10,000' : 'Click [+] to bring back with $10,000'}
            >
              <span className={`font-pixel text-[7px] sm:text-[9px] font-black block ${bot.queuedToJoin ? 'text-[#0D0D0D] animate-pulse' : 'text-[#FF3333]'}`}>
                {bot.queuedToJoin ? 'RE-ENTERING ($10K)' : 'OUT (CLICK +)'}
              </span>
            </div>
          )}
        </div>

        {/* Large Name & Bankroll Plaque */}
        <div className={`mt-0.5 sm:mt-1.5 bg-[#FFFFFF] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-[1.5px_1.5px_0px_#0D0D0D] sm:shadow-[2.5px_2.5px_0px_#0D0D0D] text-center min-w-[62px] xs:min-w-[70px] sm:min-w-[105px] relative group/plaque ${isBusted ? 'opacity-85 bg-gray-100' : ''
          }`}>
          <div className="font-display font-black text-[8px] xs:text-[9px] sm:text-xs text-[#0D0D0D] truncate max-w-[60px] xs:max-w-[70px] sm:max-w-[95px]">
            {bot.name}
          </div>
          <div className={`font-mono-nb text-[8.5px] xs:text-[10px] sm:text-sm font-black ${isBotAllIn
            ? 'text-[#FF3333] animate-pulse'
            : isBusted
              ? (bot.queuedToJoin ? 'text-emerald-600' : 'text-red-500')
              : 'text-[#00F5FF]'
            }`}>
            {isBotAllIn
              ? 'ALL-IN'
              : isBusted
                ? (bot.queuedToJoin ? '+$10K' : '$0')
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
                QUEUED ($10K)
              </div>
            ) : (
              <button
                onClick={() => handleRebuyBot(bot.id)}
                className="px-2.5 py-0.5 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] border-[1.5px] border-[#0D0D0D] rounded-full font-display text-[8px] sm:text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all animate-bounce"
                title="Rebuy this bot with $10,000 for next hand"
              >
                + REBUY $10K
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

  if (!isOpen) return null

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
      <header className="h-12 sm:h-16 shrink-0 bg-[#FF70A6] border-b-[3px] sm:border-b-[4px] border-[#0D0D0D] px-2 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-3 z-30 relative shadow-[0px_3px_0px_#0D0D0D] sm:shadow-[0px_4px_0px_#0D0D0D]">

        {/* Left: Brand, Stakes & Live Game ID */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          <div className="hidden xs:flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF3333] border-[1.5px] sm:border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFE500] border-[1.5px] sm:border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00F5FF] border-[1.5px] sm:border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#000]" />
          </div>

          {/* Table & Stakes Badge */}
          <div className="bg-[#FFFFFF] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-[1.5px_1.5px_0px_#0D0D0D] sm:shadow-[2px_2px_0px_#0D0D0D] flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="font-pixel text-[7.5px] sm:text-[9px] font-bold text-[#0D0D0D]">TABLE:</span>
            <span className="font-display font-black text-[9px] sm:text-xs text-[#0D0D0D] uppercase truncate max-w-[70px] xs:max-w-[120px] sm:max-w-none">
              {table.replace(/_/g, ' ')} (${stakes})
            </span>
          </div>

          {/* Session URI Copy Button */}
          <div className="hidden xl:flex items-center gap-1 bg-[#FFFFFF] border-[2px] border-[#0D0D0D] px-2 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#0D0D0D]">
            <span className="font-pixel text-[8px] font-bold text-purple-700">ID:</span>
            <span className="font-mono-nb text-[9px] font-black text-purple-900 truncate max-w-[80px]" title={gameId}>
              {gameId}
            </span>
            <button
              onClick={() => {
                if (onCopyUri) {
                  onCopyUri()
                } else if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href)
                  SoundEngine.playClick()
                  triggerToast('SESSION', 'GAME URI COPIED TO CLIPBOARD!', '#00F5FF', '✓')
                }
              }}
              className="font-pixel text-[7.5px] font-black bg-[#FFE500] hover:bg-[#00FFA3] text-[#0D0D0D] border border-black px-1.5 py-0.2 rounded cursor-pointer transition-colors"
              title="Copy Game URI with all parameters"
            >
              COPY URI
            </button>
          </div>
        </div>

        {/* Center: Street Tracker (Desktop: 5 Pills | Mobile: Responsive Toggle Icon & Dropdown) */}
        <div className="relative">
          {/* Mobile View: Toggle Icon & Current Street Badge */}
          <div className="flex sm:hidden items-center relative">
            <button
              onClick={() => {
                SoundEngine.playClick()
                setIsStreetMenuOpen(prev => !prev)
              }}
              className={`brutal-btn flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-[#0D0D0D] rounded-lg font-pixel text-[8px] font-black shadow-[2px_2px_0px_#0D0D0D] cursor-pointer transition-all active:scale-95 ${isStreetMenuOpen ? 'bg-[#00F5FF] text-[#0D0D0D]' : 'bg-[#FFE500] text-[#0D0D0D]'
                }`}
              title="Toggle Street Breakdown Menu"
            >
              <span>{GAME_STAGES.find(s => s.key === stage)?.label || stage.toUpperCase()}</span>
              <span className="text-[7px] bg-[#0D0D0D] text-[#FFE500] px-1 py-0.2 rounded font-mono-nb">
                {Math.max(1, GAME_STAGES.findIndex(s => s.key === stage) + 1)}/5
              </span>
              <span className="text-[8px] font-bold">{isStreetMenuOpen ? '▲' : '▼'}</span>
            </button>

            {/* Mobile Dropdown Popover on Toggle */}
            {isStreetMenuOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#FFFFFF] border-[2.5px] border-[#0D0D0D] rounded-xl shadow-[4px_4px_0px_#0D0D0D] p-2 flex flex-col gap-1 min-w-[170px] animate-fadeIn pointer-events-auto">
                <div className="font-pixel text-[7.5px] text-gray-600 font-bold px-1 border-b-[1.5px] border-[#0D0D0D] pb-1 flex justify-between items-center">
                  <span>STREET PROGRESS</span>
                  <span className="bg-[#0D0D0D] text-[#FFE500] px-1 rounded font-mono-nb text-[7px]">
                    {Math.max(1, GAME_STAGES.findIndex(s => s.key === stage) + 1)} / 5
                  </span>
                </div>
                {GAME_STAGES.map((s, idx) => {
                  const isActive = stage === s.key
                  const isPassed = GAME_STAGES.findIndex(x => x.key === stage) > idx
                  return (
                    <div
                      key={s.key}
                      onClick={() => {
                        SoundEngine.playClick()
                        setIsStreetMenuOpen(false)
                      }}
                      className={`px-2 py-1 rounded-md border-[1.5px] border-[#0D0D0D] font-pixel text-[8px] font-black flex items-center justify-between transition-colors cursor-pointer ${isActive
                        ? 'bg-[#FFE500] text-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] scale-102'
                        : isPassed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-gray-100 text-gray-400 border-dashed'
                        }`}
                    >
                      <span>{s.label}</span>
                      <span>{isActive ? 'LIVE' : isPassed ? 'DONE' : '—'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Desktop View: Full 5-Pill Street Bar */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {GAME_STAGES.map((s, idx) => {
              const isActive = stage === s.key
              const isPassed = GAME_STAGES.findIndex(x => x.key === stage) > idx
              return (
                <div
                  key={s.key}
                  className={`px-2.5 sm:px-3 py-0.5 sm:py-1 border-[1.5px] sm:border-[2px] border-[#0D0D0D] rounded-md sm:rounded-lg transition-all font-pixel text-[8px] sm:text-xs font-bold shrink-0 ${isActive
                    ? 'bg-[#FFE500] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] font-black'
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
        </div>

        {/* Right: Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onClose}
            className="brutal-btn px-2.5 sm:px-4 py-0.5 sm:py-1 bg-[#FFFFFF] hover:bg-[#FF3333] hover:text-white text-[#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[2.5px_2.5px_0px_#0D0D0D] cursor-pointer"
          >
            ✕ LEAVE
          </button>
        </div>

      </header>

      {/* ======================================================== */}
      {/* 2. SPATIAL OVAL POKER ARENA (MAXIMUM SCALE & IMPACT)     */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-4 overflow-hidden">

        {/* Sleek Dealer Announcement Marquee / Toast (Non-Intrusive & Crystal Clear) */}
        {actionToast && (
          <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-300 animate-fadeIn max-w-[94vw]">
            <div
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full border-[2px] sm:border-[2.5px] border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] bg-[#FFFFFF] whitespace-nowrap"
            >
              <span className="text-xs sm:text-base">{actionToast.icon}</span>
              <span className="font-pixel text-[7px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded bg-[#0D0D0D] text-[#FFE500]">
                {actionToast.actor}
              </span>
              <span className="font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] tracking-wide truncate max-w-[180px] xs:max-w-[260px] sm:max-w-none">
                {actionToast.actionText}
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* THE POKER TABLE STRUCTURE (LARGE OVAL FELT)            */}
        {/* ------------------------------------------------------ */}
        <div className="relative w-full max-w-6xl h-[420px] xs:h-[460px] sm:h-[540px] md:h-[620px] max-h-[64vh] xs:max-h-[68vh] sm:max-h-[76vh] flex items-center justify-center">

          {/* Outer Table Rim (Lavender / Off-White Neo-Brutalist Border) */}
          <div className="absolute inset-x-1 sm:inset-x-6 md:inset-x-8 inset-y-2 sm:inset-y-6 md:inset-y-8 rounded-[40px] xs:rounded-[60px] sm:rounded-[120px] md:rounded-[180px] bg-[#FFFFFF] border-[3px] sm:border-[5px] border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] sm:shadow-[10px_10px_0px_#0D0D0D] flex items-center justify-center overflow-hidden">

            {/* Inner Felt Area */}
            <div className="w-[96%] h-[94%] rounded-[36px] xs:rounded-[56px] sm:rounded-[110px] md:rounded-[170px] bg-[#F6F5FA] border-[2px] sm:border-[3px] border-[#0D0D0D]/25 flex flex-col items-center justify-center relative">

              {/* Subtle Halftone Pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(#0D0D0D 2px, transparent 2px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Watermark Logo in Center */}
              <div className="absolute font-display font-black text-4xl xs:text-6xl sm:text-8xl text-[#0D0D0D]/5 tracking-widest pointer-events-none select-none">
                POKERHUB
              </div>

              {/* -------------------------------------------------- */}
              {/* CENTER FELT: TOTAL POT & 5 COMMUNITY CARDS         */}
              {/* -------------------------------------------------- */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 xs:gap-2 sm:gap-4">

                {/* Total Pot Pill with 3D Chips Pile */}
                <div
                  onClick={() => {
                    SoundEngine.playChipsStack()
                  }}
                  className={`bg-[#FFE500] border-[2.5px] sm:border-[3.5px] border-[#0D0D0D] px-3.5 sm:px-8 py-1 sm:py-2 rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[5px_5px_0px_#0D0D0D] flex items-center gap-1.5 sm:gap-3 -rotate-1 relative transition-all cursor-pointer hover:scale-105 active:scale-95 ${stage === 'flop' || stage === 'turn' || stage === 'river' ? 'ring-2 sm:ring-4 ring-[#00F5FF] scale-105' : ''
                    }`}
                  title="Click to hear chips!"
                >
                  <div className="flex -space-x-2.5 sm:-space-x-3.5 items-center">
                    <PokerChip denom={CHIP_DENOMINATIONS[3]} size="xs" />
                    <PokerChip denom={CHIP_DENOMINATIONS[2]} size="xs" />
                    <PokerChip denom={CHIP_DENOMINATIONS[1]} size="xs" />
                  </div>
                  <span className="font-pixel text-[8.5px] sm:text-xs font-bold text-[#0D0D0D]">POT:</span>
                  <span className="font-display font-black text-sm xs:text-lg sm:text-3xl text-[#0D0D0D]">
                    ${pot.toLocaleString()}
                  </span>
                </div>

                {/* Multi-way Side Pots Breakdown Pills */}
                {sidePots.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center animate-fadeIn z-20">
                    {sidePots.map((sp, spIdx) => (
                      <div
                        key={spIdx}
                        className={`px-2 sm:px-3 py-0.5 rounded-full border-[1.5px] border-[#0D0D0D] font-pixel text-[7.5px] sm:text-[9px] font-black shadow-[1px_1px_0px_#0D0D0D] ${spIdx === 0 ? 'bg-[#FFE500] text-[#0D0D0D]' : 'bg-[#00F5FF] text-[#0D0D0D]'}`}
                      >
                        {spIdx === 0 ? 'MAIN' : `SIDE ${spIdx}`}: ${sp.amount.toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}

                {/* 5 Community Cards */}
                <div className="flex gap-1 xs:gap-1.5 sm:gap-2.5 md:gap-3.5 items-center">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const card = communityCards[idx]
                    const isHeroMatched = card && !isPlayerFolded && heroMatchedCardIds.has(card.id)
                    const isShowdownWinnerCard = card && stage === 'showdown' && showWinnerOverlay && winningMatchedCardIds.has(card.id)
                    const isHighlighted = isShowdownWinnerCard || isHeroMatched
                    const isWinner = isShowdownWinnerCard
                    const badge = isWinner ? 'WIN' : heroMatchBadgeLabel

                    return (
                      <BrutalistCard
                        key={idx}
                        card={card}
                        hidden={!card}
                        delay={idx * 70}
                        highlighted={isHighlighted}
                        isWinner={isWinner}
                        matchBadge={isHighlighted ? badge : null}
                        deckSkin={equippedDeck}
                      />
                    )
                  })}
                </div>

                {/* Dealer Button Token */}
                <div className="absolute -left-6 sm:-left-10 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FFFFFF] border-[2px] sm:border-[2.5px] border-[#0D0D0D] flex items-center justify-center font-display font-black text-[10px] sm:text-sm shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D]">
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
                          <PokerChip denom={fc.chip} size="sm" />
                        </div>
                        <span className="font-pixel text-[7px] sm:text-[9px] font-black text-[#FFE500] drop-shadow-[1.5px_1.5px_0px_#000] bg-[#0D0D0D] px-1.5 py-0.2 rounded mt-0.5 border border-white">
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
          {renderBotSeat(activeBots[0], 0, 'top-1 sm:top-3 left-1 sm:left-6 md:left-8', 'top-[75px] sm:top-[96px] -right-6 sm:-right-12')}

          {/* SEAT 2: Top Center (Bot 1 - Lucky Neko) */}
          {renderBotSeat(activeBots[1], 1, 'top-0 sm:top-1 left-1/2 -translate-x-1/2', 'top-[95px] sm:top-[116px] left-1/2 -translate-x-1/2')}

          {/* SEAT 3: Mid/Top Right (Bot 2 - Pixel Punk) */}
          {renderBotSeat(activeBots[2], 2, 'top-1 sm:top-3 right-1 sm:right-6 md:right-8', 'top-[75px] sm:top-[96px] -left-6 sm:-left-12')}

          {/* SEAT 4: Mid/Bottom Left (Bot 3 - High Roller) */}
          {renderBotSeat(activeBots[3], 3, 'bottom-14 sm:bottom-22 md:bottom-28 left-0.5 sm:left-3 md:left-4', '-top-9 sm:-top-14 left-8 sm:left-14')}

          {/* SEAT 5: Mid/Bottom Right (Bot 4 - Neon Queen) */}
          {renderBotSeat(activeBots[4], 4, 'bottom-14 sm:bottom-22 md:bottom-28 right-0.5 sm:right-3 md:right-4', '-top-9 sm:-top-14 right-8 sm:right-14')}

          {/* ------------------------------------------------------ */}
          {/* SEAT 0: BOTTOM CENTER (HERO / YOU - LARGE COCKPIT)     */}
          {/* ------------------------------------------------------ */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[96vw]">

            {/* Player's In-Pot Bet on Felt (3D ChipStack) */}
            {playerRoundBet > 0 && (
              <div className="mb-1 sm:mb-2">
                <ChipStack
                  amount={playerRoundBet}
                  size="sm"
                  animate={true}
                  onClick={() => {
                    SoundEngine.playChipClink({ brightness: 1.3 })
                  }}
                />
              </div>
            )}

            <div className="relative flex items-center gap-2 sm:gap-4">

              {/* Player Avatar Plaque */}
              <div className={`bg-[#FFFFFF] border-[2px] sm:border-[3px] border-[#0D0D0D] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-[2.5px_2.5px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] flex flex-col items-center min-w-[85px] xs:min-w-[105px] sm:min-w-[140px] relative ${isHeroSittingOut ? 'opacity-85' : ''
                }`}>
                {/* Position Badges (D / SB / BB) */}
                <div className="absolute -top-2.5 -left-2 flex items-center gap-1 z-40 pointer-events-none">
                  {dealerButtonIndex === 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#FFFFFF] border-[2px] border-[#0D0D0D] font-pixel font-black text-[9px] text-[#0D0D0D] flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D]" title="Dealer Button">
                      D
                    </div>
                  )}
                  {sbIndex === 0 && (
                    <div className="px-1.5 py-0.5 rounded bg-[#00F5FF] border-[1.5px] border-[#0D0D0D] font-pixel font-bold text-[7.5px] text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]" title="Small Blind ($250)">
                      SB
                    </div>
                  )}
                  {bbIndex === 0 && (
                    <div className="px-1.5 py-0.5 rounded bg-[#FFE500] border-[1.5px] border-[#0D0D0D] font-pixel font-bold text-[7.5px] text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]" title="Big Blind ($500)">
                      BB
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-white border-[2px] sm:border-[2.5px] border-[#0D0D0D] flex items-center justify-center p-0.5 sm:p-1 shadow-[1.5px_1.5px_0px_#0D0D0D] sm:shadow-[2px_2px_0px_#0D0D0D] overflow-hidden">
                    <PixelAvatar
                      avatarKey="hero"
                      size={2.4}
                      isBusted={isHeroSittingOut}
                      isQueued={heroQueuedToJoin}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-display font-black text-[10px] sm:text-sm text-[#0D0D0D]">
                      {isHeroSittingOut ? 'YOU (OUT)' : 'YOU (HERO)'}
                    </div>
                    <div className={`font-mono-nb text-[10px] sm:text-base font-black ${isHeroSittingOut ? 'text-red-500' : 'text-emerald-600'}`}>
                      ${bankroll.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Real-time Hand Strength / Sitting Out Pill */}
                <div className={`mt-1 sm:mt-1.5 w-full border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md sm:rounded-lg font-display font-black text-[8px] xs:text-[9px] sm:text-xs text-center truncate shadow-[1px_1px_0px_#0D0D0D] ${isHeroSittingOut ? 'bg-[#FF3333] text-white' : isPlayerFolded ? 'bg-gray-300 text-gray-700' : isPlayerAllIn ? 'bg-[#FFE500] text-[#0D0D0D]' : 'bg-[#FF70A6] text-[#0D0D0D]'
                  }`}>
                  {isHeroSittingOut ? (heroQueuedToJoin ? 'QUEUED' : 'OUT OF CHIPS') : isPlayerFolded ? 'FOLDED' : isPlayerAllIn ? `ALL-IN (${playerHandName || 'HIGH'})` : (playerHandName || 'CALCULATING...')}
                </div>
              </div>

              {/* Player's 2 Large Hole Cards or SITTING OUT REBUY CARD */}
              {!isHeroSittingOut ? (
                <div className={`flex -space-x-3 xs:-space-x-4 sm:-space-x-6 relative transition-all ${isPlayerFolded ? 'opacity-40 grayscale' : 'hover:space-x-1'}`}>
                  {playerCards[0] && (
                    <BrutalistCard
                      card={playerCards[0]}
                      large
                      deckSkin={equippedDeck}
                      highlighted={!isPlayerFolded && (heroMatchedCardIds.has(playerCards[0].id) || isPlayerAllIn)}
                      isWinner={stage === 'showdown' && showWinnerOverlay && (gameResult === 'win' || gameResult === 'split') && heroMatchedCardIds.has(playerCards[0].id)}
                      matchBadge={!isPlayerFolded && heroMatchedCardIds.has(playerCards[0].id) ? heroMatchBadgeLabel : null}
                    />
                  )}
                  {playerCards[1] && (
                    <BrutalistCard
                      card={playerCards[1]}
                      large
                      deckSkin={equippedDeck}
                      highlighted={!isPlayerFolded && (heroMatchedCardIds.has(playerCards[1].id) || isPlayerAllIn)}
                      isWinner={stage === 'showdown' && showWinnerOverlay && (gameResult === 'win' || gameResult === 'split') && heroMatchedCardIds.has(playerCards[1].id)}
                      matchBadge={!isPlayerFolded && heroMatchedCardIds.has(playerCards[1].id) ? heroMatchBadgeLabel : null}
                    />
                  )}
                  {isPlayerFolded && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <span className="font-display font-black text-[10px] sm:text-sm text-white bg-[#FF3333] px-2 sm:px-2.5 py-0.5 sm:py-1 border-[1.5px] sm:border-[2px] border-black rotate-12 shadow-[1.5px_1.5px_0px_#000]">
                        FOLDED
                      </span>
                    </div>
                  )}
                  {isPlayerAllIn && !isPlayerFolded && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <span className="font-display font-black text-[9px] sm:text-xs text-[#0D0D0D] bg-[#FFE500] px-2 py-0.5 border-[2px] border-black shadow-[2px_2px_0px_#000] animate-bounce">
                        ALL-IN
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {!heroQueuedToJoin ? (
                    <button
                      onClick={handleHeroRebuy}
                      className="brutal-btn px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] border-[2.5px] sm:border-[3px] border-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] cursor-pointer animate-bounce flex items-center gap-1.5"
                    >
                      REBUY $10K & RE-JOIN
                    </button>
                  ) : (
                    <div className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#00F5FF] border-[2px] sm:border-[2.5px] border-[#0D0D0D] rounded-lg sm:rounded-xl shadow-[2px_2px_0px_#0D0D0D] font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] animate-pulse">
                      JOINING IN NEXT HAND...
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Active Turn Indicator */}
            {isMyTurn && !isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut && (
              <div className="mt-1 sm:mt-1.5 bg-[#00F5FF] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] font-display font-black text-[10px] sm:text-sm animate-pulse text-center truncate max-w-[94vw]">
                YOUR TURN // {playerCallAmount > 0 ? `CALL $${playerCallAmount.toLocaleString()}` : 'CHECK OR RAISE'}
              </div>
            )}

            {/* 10-Second Turn Countdown HP-style Gauge Bar */}
            {isMyTurn && !isPlayerFolded && !isPlayerAllIn && !isHeroSittingOut && (
              <div className="w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] mt-1 sm:mt-1.5 flex flex-col items-center animate-fadeIn">
                <div className="w-full flex items-center justify-between px-1 mb-0.5">
                  <span className="font-pixel text-[7.5px] sm:text-[9px] font-black text-[#0D0D0D]">
                    TIME:
                  </span>
                  <span className={`font-mono-nb text-[9.5px] sm:text-xs font-black ${turnTimeRemaining <= 3 ? 'text-[#FF3333] animate-pulse scale-110' : 'text-[#0D0D0D]'
                    }`}>
                    {turnTimeRemaining.toFixed(1)}s / 10.0s
                  </span>
                </div>

                {/* HP Gauge Container */}
                <div className="w-full h-2.5 sm:h-3.5 bg-[#0D0D0D] border-[1.5px] sm:border-[2px] border-[#0D0D0D] rounded-full p-0.5 shadow-[1.5px_1.5px_0px_#0D0D0D] sm:shadow-[2px_2px_0px_#0D0D0D] relative overflow-hidden">
                  {/* HP Gauge Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-100 ease-linear ${turnTimeRemaining <= 3 ? 'animate-pulse' : ''
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
              <div className="mt-1 sm:mt-1.5 bg-[#FFE500] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] font-display font-black text-[10px] sm:text-sm animate-pulse text-[#0D0D0D]">
                SPECTATING BOTS ROUND...
              </div>
            )}

            {isPlayerAllIn && !isPlayerFolded && stage !== 'showdown' && (
              <div className="mt-1 sm:mt-1.5 bg-[#FF70A6] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] font-display font-black text-[10px] sm:text-sm animate-pulse text-[#0D0D0D]">
                ALL-IN LIVE RUNOUT // WATCHING...
              </div>
            )}

          </div>

        </div>

        {/* ------------------------------------------------------ */}
        {/* TABLE PAUSED / VICTORY OVERLAY                         */}
        {/* ------------------------------------------------------ */}
        {stage === 'table_paused' && (
          <div className="absolute inset-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn">
            <div className="bg-[#00F5FF] border-[3px] sm:border-[4px] border-[#0D0D0D] px-4 sm:px-12 py-2 sm:py-3 shadow-[5px_5px_0px_#FFE500] sm:shadow-[8px_8px_0px_#FFE500] my-2 sm:my-3 -rotate-1">
              <h3 className="font-display text-lg sm:text-4xl font-black text-[#0D0D0D] uppercase">
                {activeBots.every(b => b.isBusted) ? 'TABLE CONQUERED! ALL BOTS BUSTED' : 'TABLE PAUSED (WAITING FOR PLAYERS)'}
              </h3>
            </div>
            <p className="font-mono-nb text-xs sm:text-base text-gray-200 mb-4 sm:mb-6 max-w-md">
              {activeBots.every(b => b.isBusted)
                ? 'You have eliminated every bot from the table! Rebuy all bots to start a new high-stakes match.'
                : 'Not enough active players to deal a hand. Rebuy busted bots or rejoin the table to resume action.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={handleRebuyAllBots}
                className="brutal-btn px-5 sm:px-8 py-2 sm:py-3 bg-[#FFE500] hover:bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] cursor-pointer"
              >
                REBUY ALL BOTS ($10K EACH)
              </button>
              {isHeroSittingOut && (
                <button
                  onClick={handleHeroRebuy}
                  className="brutal-btn px-5 sm:px-8 py-2 sm:py-3 bg-[#00F5FF] hover:bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] cursor-pointer"
                >
                  REBUY HERO ($10K)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* SHOWDOWN LIVE CARD REVEAL PHASE INDICATOR             */}
        {/* ------------------------------------------------------ */}
        {stage === 'showdown' && !showWinnerOverlay && (
          <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-40 bg-[#FFE500] border-[2px] sm:border-[3px] border-[#0D0D0D] px-3.5 sm:px-7 py-1 sm:py-2 rounded-full shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] animate-bounce flex items-center gap-2 whitespace-nowrap">
            <span>SHOWDOWN // REVEALING ALL HANDS...</span>
            <span className="font-mono-nb text-[9px] sm:text-xs bg-[#0D0D0D] text-[#FFE500] px-1.5 py-0.2 rounded font-black">
              CHECKING CARDS
            </span>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* SHOWDOWN FULL RESULT OVERLAY                           */}
        {/* ------------------------------------------------------ */}
        {stage === 'showdown' && showWinnerOverlay && (
          <div className="absolute inset-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn max-w-[96vw] mx-auto">
            {gameResult === 'win' ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="bg-[#00F5FF] border-[3px] sm:border-[4px] border-[#0D0D0D] px-6 sm:px-10 py-2 sm:py-3 shadow-[5px_5px_0px_#FFE500] sm:shadow-[8px_8px_0px_#FFE500] -rotate-2">
                  <h3 className="font-display text-xl sm:text-5xl font-black text-[#0D0D0D] uppercase">
                    YOU WON THE POT!
                  </h3>
                </div>
                <p className="font-mono-nb text-xs sm:text-lg font-bold text-white mt-1">
                  {playerHandName}
                </p>
                <div className="bg-[#FFE500] border-[2.5px] sm:border-[3px] border-[#0D0D0D] px-5 sm:px-8 py-1.5 sm:py-2 shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[5px_5px_0px_#0D0D0D] font-display text-lg sm:text-3xl font-black text-[#0D0D0D]">
                  +${pot.toLocaleString()} CHIPS COLLECTED
                </div>
              </div>
            ) : gameResult === 'split' ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="bg-[#FFE500] border-[3px] sm:border-[4px] border-[#0D0D0D] px-6 sm:px-10 py-2 sm:py-3 shadow-[5px_5px_0px_#00F5FF] sm:shadow-[8px_8px_0px_#00F5FF] -rotate-1">
                  <h3 className="font-display text-lg sm:text-4xl font-black text-[#0D0D0D] uppercase">
                    SPLIT POT!
                  </h3>
                </div>
                <p className="font-mono-nb text-xs sm:text-base font-bold text-[#FFE500] bg-[#0D0D0D] px-2.5 py-0.5 border border-white/40 rounded-lg">
                  TIED: {winningHandName || 'IDENTICAL HIGH CARDS'}
                </p>
                <div className="bg-[#FFFFFF] border-[2.5px] sm:border-[3px] border-[#0D0D0D] px-4 sm:px-6 py-1 sm:py-1.5 shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] font-display text-base sm:text-2xl font-black text-[#0D0D0D]">
                  {winnerName} SPLIT ${pot.toLocaleString()}
                </div>
              </div>
            ) : gameResult === 'bot_win' ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="bg-[#FFE500] border-[3px] sm:border-[4px] border-[#0D0D0D] px-6 sm:px-10 py-2 sm:py-3 shadow-[5px_5px_0px_#00F5FF] sm:shadow-[8px_8px_0px_#00F5FF] -rotate-1">
                  <h3 className="font-display text-lg sm:text-4xl font-black text-[#0D0D0D] uppercase">
                    {winnerName} WINS!
                  </h3>
                </div>
                <p className="font-mono-nb text-xs sm:text-base font-bold text-[#FFE500] bg-[#0D0D0D] px-2.5 py-0.5 border border-white/40 rounded-lg">
                  WINNING HAND: {winningHandName || 'HIGH CARD'}
                </p>
                <div className="bg-[#FFFFFF] border-[2.5px] sm:border-[3px] border-[#0D0D0D] px-4 sm:px-6 py-1 sm:py-1.5 shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] font-display text-base sm:text-2xl font-black text-[#0D0D0D]">
                  ${pot.toLocaleString()} POT COLLECTED
                </div>
                <p className="font-pixel text-[8px] sm:text-[10px] text-gray-400">
                  (You folded this hand)
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="bg-[#FF70A6] border-[3px] sm:border-[4px] border-[#0D0D0D] px-6 sm:px-10 py-2 sm:py-3 shadow-[5px_5px_0px_#0D0D0D] sm:shadow-[8px_8px_0px_#0D0D0D] rotate-2">
                  <h3 className="font-display text-lg sm:text-5xl font-black text-[#0D0D0D] uppercase">
                    {winnerName} WINS!
                  </h3>
                </div>
                <p className="font-mono-nb text-xs sm:text-base font-bold text-gray-200">
                  WINNING HAND: {winningHandName || 'BETTER HAND'}
                </p>
              </div>
            )}

            {/* Multi-Pot Breakdown Details */}
            {showdownPotsSummary && showdownPotsSummary.length > 1 && (
              <div className="mt-2 sm:mt-3 flex flex-col gap-1 max-w-sm w-full bg-[#FFFFFF] border-[2px] border-[#0D0D0D] p-2 rounded-xl shadow-[3px_3px_0px_#0D0D0D] text-[#0D0D0D]">
                <div className="font-pixel text-[8px] sm:text-[9px] font-black uppercase text-center border-b border-black pb-1">
                  POT DISTRIBUTION SUMMARY
                </div>
                {showdownPotsSummary.map((potInfo, pIdx) => (
                  <div key={pIdx} className="flex justify-between items-center text-[8px] sm:text-[10px] font-mono-nb font-bold px-1">
                    <span>{potInfo.isSidePot ? `Side Pot ${potInfo.potIndex}` : 'Main Pot'}: ${potInfo.amount.toLocaleString()}</span>
                    <span className="text-emerald-700">→ {potInfo.winners.map(w => w.name).join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              <button
                onClick={startNewHand}
                className="brutal-btn px-6 sm:px-10 py-2.5 sm:py-3.5 bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[5px_5px_0px_#0D0D0D] active:translate-x-1 active:translate-y-1"
              >
                DEAL NEXT HAND → {autoNextSeconds ? `(${autoNextSeconds}s)` : ''}
              </button>
              {autoNextSeconds && (
                <span className="font-pixel text-[8px] sm:text-[9px] text-gray-300 animate-pulse">
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
      <footer className="h-auto min-h-[58px] sm:h-22 py-1.5 sm:py-2 px-2 sm:px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2.5 md:gap-3 z-30 relative bg-[#FFFFFF] border-t-[3px] sm:border-t-[4px] border-[#0D0D0D] shadow-[0px_-3px_0px_#0D0D0D] sm:shadow-[0px_-4px_0px_#0D0D0D]">

        {/* Left: Interactive 3D Casino Chip Rack / Bet Builder */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 sm:gap-2 bg-[#F6F5FA] border-[1.5px] sm:border-[2.5px] border-[#0D0D0D] p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D]">
            <span className="font-pixel text-[7.5px] sm:text-[9px] font-bold text-gray-700 hidden md:inline px-1">
              CHIPS:
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              {CHIP_DENOMINATIONS.map(denom => (
                <PokerChip
                  key={denom.val}
                  denom={denom}
                  size="sm"
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
          <div className="flex items-center gap-1">
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipClink({ brightness: 1.2 })
                setRaiseAmount(500)
              }}
              className="font-pixel text-[7.5px] sm:text-[9px] bg-white border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold hover:bg-gray-100 cursor-pointer shadow-[1px_1px_0px_#0D0D0D] sm:shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 disabled:opacity-40"
            >
              MIN
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipsStack()
                setRaiseAmount(Math.max(500, Math.min(bankroll, Math.floor(pot / 2))))
              }}
              className="font-pixel text-[7.5px] sm:text-[9px] bg-[#00F5FF] border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold hover:bg-[#00d8e6] cursor-pointer shadow-[1px_1px_0px_#0D0D0D] sm:shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              1/2
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playChipsStack()
                setRaiseAmount(Math.max(500, Math.min(bankroll, pot)))
              }}
              className="font-pixel text-[7.5px] sm:text-[9px] bg-[#FFE500] border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold hover:bg-[#ebd300] cursor-pointer shadow-[1px_1px_0px_#0D0D0D] sm:shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              POT
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playJackpot()
                setRaiseAmount(bankroll)
              }}
              className="font-pixel text-[7.5px] sm:text-[9px] bg-[#FF70A6] border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold hover:bg-[#ff5292] cursor-pointer shadow-[1px_1px_0px_#0D0D0D] sm:shadow-[1.5px_1.5px_0px_#0D0D0D] active:scale-95 text-[#0D0D0D] disabled:opacity-40"
            >
              MAX
            </button>
            <button
              disabled={isPlayerFolded || isPlayerAllIn || isHeroSittingOut}
              onClick={() => {
                SoundEngine.playClick()
                setRaiseAmount(500)
              }}
              className="font-pixel text-[7.5px] sm:text-[9px] bg-gray-200 border-[1.5px] sm:border-[2px] border-[#0D0D0D] px-1 sm:px-1.5 py-0.5 sm:py-1 font-bold hover:bg-gray-300 cursor-pointer shadow-[1px_1px_0px_#0D0D0D] sm:shadow-[1.5px_1.5px_0px_#0D0D0D] text-gray-700 disabled:opacity-40"
              title="Reset bet"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Right: Poker Action Buttons / Spectator Bar */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {stage !== 'showdown' && stage !== 'table_paused' ? (
            isHeroSittingOut ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="bg-[#FFE500] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-2.5 sm:px-5 py-1 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[2.5px_2.5px_0px_#0D0D0D]">
                  <span className="font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] uppercase">
                    {heroQueuedToJoin ? 'WAITING FOR NEXT HAND...' : 'SITTING OUT'}
                  </span>
                </div>
                {!heroQueuedToJoin ? (
                  <button
                    onClick={handleHeroRebuy}
                    className="brutal-btn px-3 sm:px-7 py-1.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase hover:bg-[#FFE500] cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                  >
                    REBUY $10K & JOIN
                  </button>
                ) : (
                  <button
                    onClick={handleSkipToShowdown}
                    className="brutal-btn px-3 sm:px-6 py-1.5 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                    title="Fast forward to showdown"
                  >
                    SKIP TO SHOWDOWN
                  </button>
                )}
              </div>
            ) : isPlayerFolded ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="bg-[#F6F5FA] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-2.5 sm:px-5 py-1 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_#0D0D0D]">
                  <span className="font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] uppercase">
                    SPECTATING BOTS DUEL...
                  </span>
                </div>
                <button
                  onClick={handleSkipToShowdown}
                  className="brutal-btn px-3 sm:px-6 py-1.5 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase hover:bg-[#00F5FF] cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                  title="Fast forward to showdown"
                >
                  SKIP TO SHOWDOWN
                </button>
              </div>
            ) : isPlayerAllIn ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="bg-[#FFE500] border-[2px] sm:border-[2.5px] border-[#0D0D0D] px-2.5 sm:px-5 py-1 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_#0D0D0D]">
                  <span className="font-display font-black text-[10px] sm:text-sm text-[#0D0D0D] uppercase">
                    ALL-IN RUNOUT...
                  </span>
                </div>
                <button
                  onClick={handleSkipToShowdown}
                  className="brutal-btn px-3 sm:px-6 py-1.5 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-[10px] sm:text-sm font-black uppercase hover:bg-[#FFE500] cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                  title="Fast forward to showdown"
                >
                  SKIP TO SHOWDOWN
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2.5 md:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">

                {/* 10s Timer Warning Badge in Action Dock */}
                {isMyTurn && (
                  <div className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-[2px] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] transition-colors ${turnTimeRemaining <= 3 ? 'bg-[#FF3333] text-white animate-pulse' : 'bg-[#FFFFFF] text-[#0D0D0D]'
                    }`}>
                    <span className="font-pixel text-[8px] font-bold">TIME:</span>
                    <span className="font-mono-nb font-black text-xs">
                      {turnTimeRemaining.toFixed(1)}s
                    </span>
                  </div>
                )}

                {/* FOLD */}
                <button
                  disabled={!isMyTurn}
                  onClick={handlePlayerFold}
                  className="brutal-btn px-2.5 xs:px-3.5 sm:px-6 py-1.5 sm:py-2.5 md:py-3 bg-white text-[#0D0D0D] font-display text-[10px] xs:text-[11px] sm:text-sm font-black uppercase hover:bg-[#FF70A6] transition-colors disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                >
                  FOLD
                </button>

                {/* CHECK / CALL */}
                {playerCallAmount === 0 ? (
                  <button
                    disabled={!isMyTurn}
                    onClick={handlePlayerCheck}
                    className="brutal-btn px-3 xs:px-4 sm:px-8 py-1.5 sm:py-2.5 md:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-[10px] xs:text-[11px] sm:text-sm font-black uppercase hover:bg-[#00d8e6] disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                  >
                    CHECK
                  </button>
                ) : (
                  <button
                    disabled={!isMyTurn}
                    onClick={handlePlayerCall}
                    className="brutal-btn px-3 xs:px-4 sm:px-8 py-1.5 sm:py-2.5 md:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-[10px] xs:text-[11px] sm:text-sm font-black uppercase hover:bg-[#00d8e6] disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                  >
                    CALL ${playerCallAmount.toLocaleString()}
                  </button>
                )}

                {/* RAISE */}
                <button
                  disabled={!isMyTurn}
                  onClick={() => handlePlayerRaise(raiseAmount)}
                  className="brutal-btn px-3 xs:px-4 sm:px-7 py-1.5 sm:py-2.5 md:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-[10px] xs:text-[11px] sm:text-sm font-black uppercase hover:bg-[#ebd300] disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                >
                  +${raiseAmount.toLocaleString()}
                </button>

                {/* ALL-IN */}
                <button
                  disabled={!isMyTurn}
                  onClick={handlePlayerAllIn}
                  className="brutal-btn px-3 xs:px-4 sm:px-7 py-1.5 sm:py-2.5 md:py-3 bg-[#FF70A6] text-[#0D0D0D] font-display text-[10px] xs:text-[11px] sm:text-sm font-black uppercase hover:bg-[#ff5292] animate-pulse disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#0D0D0D] sm:shadow-[3px_3px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
                >
                  ALL-IN
                </button>

              </div>
            )
          ) : stage === 'table_paused' ? (
            <button
              onClick={handleRebuyAllBots}
              className="brutal-btn px-4 sm:px-8 py-2 sm:py-3 bg-[#00F5FF] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase hover:bg-[#FFE500] shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
            >
              REBUY ALL BOTS
            </button>
          ) : (
            <button
              onClick={startNewHand}
              className="brutal-btn px-4 sm:px-8 py-2 sm:py-3 bg-[#FFE500] text-[#0D0D0D] font-display text-xs sm:text-base font-black uppercase hover:bg-[#00F5FF] shadow-[3px_3px_0px_#0D0D0D] sm:shadow-[4px_4px_0px_#0D0D0D] border-[2px] sm:border-[2.5px] border-[#0D0D0D]"
            >
              DEAL NEXT HAND → {autoNextSeconds ? `(${autoNextSeconds}s)` : ''}
            </button>
          )}
        </div>

      </footer>

    </div>
  )
}
