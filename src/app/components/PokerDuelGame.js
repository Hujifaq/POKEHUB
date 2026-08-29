"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SoundEngine } from './SoundEngine'

const SUITS = [
  { key: 'hearts', symbol: '♥', color: '#FF3333', name: 'HEARTS' },
  { key: 'diamonds', symbol: '♦', color: '#FF3333', name: 'DIAMONDS' },
  { key: 'spades', symbol: '♠', color: '#000000', name: 'SPADES' },
  { key: 'clubs', symbol: '♣', color: '#000000', name: 'CLUBS' }
]

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

// 5 Distinct Neo-Brutalist AI Bot Personalities
const BOT_ROSTER = [
  { id: 'bot_1', name: 'CYBER_ACE', avatar: '🤖', color: '#00FFA3', style: 'TAG' },
  { id: 'bot_2', name: 'VIP_SHARK', avatar: '🦈', color: '#FF3333', style: 'LAG' },
  { id: 'bot_3', name: 'NEO_WHALE', avatar: '🐋', color: '#00F0FF', style: 'STATION' },
  { id: 'bot_4', name: 'BLUFF_KING', avatar: '🃏', color: '#FF90E8', style: 'BLUFFER' },
  { id: 'bot_5', name: 'QUANT_BRAIN', avatar: '🧠', color: '#FFDE59', style: 'CALCULATOR' }
]

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

// 7-card Poker Hand Evaluator
function evaluateHand(cards) {
  if (!cards || cards.length < 5) return { score: 0, name: 'HIGH CARD', rank: 0 }

  const sorted = [...cards].sort((a, b) => b.val - a.val)
  const valCounts = {}
  const suitCounts = {}

  sorted.forEach(c => {
    valCounts[c.val] = (valCounts[c.val] || 0) + 1
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1
  })

  // Flush check
  let flushSuit = null
  for (const s in suitCounts) {
    if (suitCounts[s] >= 5) flushSuit = s
  }

  // Straight check
  const uniqueVals = Array.from(new Set(sorted.map(c => c.val))).sort((a, b) => b - a)
  let isStraight = false
  let straightHigh = 0

  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    if (
      uniqueVals[i] - uniqueVals[i + 1] === 1 &&
      uniqueVals[i + 1] - uniqueVals[i + 2] === 1 &&
      uniqueVals[i + 2] - uniqueVals[i + 3] === 1 &&
      uniqueVals[i + 3] - uniqueVals[i + 4] === 1
    ) {
      isStraight = true
      straightHigh = uniqueVals[i]
      break
    }
  }
  if (!isStraight && uniqueVals.includes(14) && uniqueVals.includes(2) && uniqueVals.includes(3) && uniqueVals.includes(4) && uniqueVals.includes(5)) {
    isStraight = true
    straightHigh = 5
  }

  const counts = Object.entries(valCounts).map(([val, count]) => ({ val: Number(val), count })).sort((a, b) => b.count - a.count || b.val - a.val)

  // 1. Royal / Straight Flush
  if (flushSuit) {
    const flushCards = sorted.filter(c => c.suit === flushSuit)
    const flushUnique = Array.from(new Set(flushCards.map(c => c.val))).sort((a, b) => b - a)
    for (let i = 0; i <= flushUnique.length - 5; i++) {
      if (
        flushUnique[i] - flushUnique[i + 1] === 1 &&
        flushUnique[i + 1] - flushUnique[i + 2] === 1 &&
        flushUnique[i + 2] - flushUnique[i + 3] === 1 &&
        flushUnique[i + 3] - flushUnique[i + 4] === 1
      ) {
        if (flushUnique[i] === 14) {
          return { score: 9000, name: 'ROYAL FLUSH 👑', rank: 9 }
        }
        return { score: 8000 + flushUnique[i], name: 'STRAIGHT FLUSH 🔥', rank: 8 }
      }
    }
  }

  // 2. Four of a Kind
  if (counts[0].count === 4) {
    return { score: 7000 + counts[0].val * 10 + (counts[1]?.val || 0), name: `FOUR OF A KIND (${counts[0].val})`, rank: 7 }
  }

  // 3. Full House
  if (counts[0].count === 3 && counts[1] && counts[1].count >= 2) {
    return { score: 6000 + counts[0].val * 10 + counts[1].val, name: `FULL HOUSE (${counts[0].val}S OVER ${counts[1].val}S)`, rank: 6 }
  }

  // 4. Flush
  if (flushSuit) {
    const flushCards = sorted.filter(c => c.suit === flushSuit)
    return { score: 5000 + flushCards[0].val, name: `FLUSH (${flushSuit.toUpperCase()})`, rank: 5 }
  }

  // 5. Straight
  if (isStraight) {
    return { score: 4000 + straightHigh, name: `STRAIGHT (${straightHigh} HIGH)`, rank: 4 }
  }

  // 6. Three of a Kind
  if (counts[0].count === 3) {
    return { score: 3000 + counts[0].val * 10 + (counts[1]?.val || 0), name: `THREE OF A KIND (${counts[0].val}S)`, rank: 3 }
  }

  // 7. Two Pair
  if (counts[0].count === 2 && counts[1] && counts[1].count === 2) {
    return { score: 2000 + counts[0].val * 15 + counts[1].val * 2, name: `TWO PAIR (${counts[0].val}S & ${counts[1].val}S)`, rank: 2 }
  }

  // 8. One Pair
  if (counts[0].count === 2) {
    return { score: 1000 + counts[0].val * 10 + sorted[0].val, name: `ONE PAIR OF ${counts[0].val}S`, rank: 1 }
  }

  // 9. High Card
  return { score: sorted[0].val, name: `HIGH CARD (${sorted[0].rank})`, rank: 0 }
}

// Smart AI Poker Decision Engine
function decideBotAction({ bot, cards, communityCards, stage, pot, currentCallAmount, minRaise, bankroll }) {
  const allCards = [...cards, ...communityCards]
  const evalResult = evaluateHand(allCards)
  const rank = evalResult.rank

  // Pre-flop Intelligence
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

  // Post-flop (Flop, Turn, River) Intelligence
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

// Neo-Brutalist Playing Card Component
function BrutalistCard({ card, hidden = false, delay = 0, highlighted = false, small = false }) {
  const sizeClasses = small
    ? 'w-10 h-14 sm:w-12 sm:h-18 md:w-14 md:h-20'
    : 'w-12 h-18 sm:w-16 sm:h-24 md:w-18 md:h-26'

  if (hidden || !card) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#00FFA3] border-[2px] sm:border-[3px] border-true-black shadow-[3px_3px_0px_#000000] flex items-center justify-center relative transform transition-all duration-300 hover:scale-105 select-none overflow-hidden`}
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #00FFA3, #00FFA3 5px, #000000 5px, #000000 8px)',
          animationDelay: `${delay}ms`
        }}
      >
        <div className="w-5 h-8 sm:w-7 sm:h-10 bg-[#FF3333] border-[2px] border-true-black flex items-center justify-center rotate-6 shadow-[1px_1px_0px_#000000]">
          <span className="font-display font-black text-[10px] text-white">♠</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses} rounded-lg bg-white border-[2px] sm:border-[3px] border-true-black ${
        highlighted
          ? 'shadow-[5px_5px_0px_#FF3333] -translate-y-1 rotate-1'
          : 'shadow-[3px_3px_0px_#000000]'
      } flex flex-col justify-between p-1 sm:p-1.5 relative transform transition-all duration-200 hover:-translate-y-1 select-none cursor-pointer`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-center leading-none">
        <span
          className="font-display font-black text-[11px] sm:text-xs md:text-sm leading-none"
          style={{ color: card.color }}
        >
          {card.rank}
        </span>
        <span className="text-[10px] sm:text-xs font-black" style={{ color: card.color }}>
          {card.symbol}
        </span>
      </div>

      <div
        className="text-center text-base sm:text-xl md:text-2xl font-black leading-none my-auto"
        style={{ color: card.color }}
      >
        {card.symbol}
      </div>

      <div className="flex justify-between items-center leading-none rotate-180">
        <span
          className="font-display font-black text-[11px] sm:text-xs md:text-sm leading-none"
          style={{ color: card.color }}
        >
          {card.rank}
        </span>
        <span className="text-[10px] sm:text-xs font-black" style={{ color: card.color }}>
          {card.symbol}
        </span>
      </div>
    </div>
  )
}

// Neo-Brutalist Chip Button
function BrutalistChip({ value, label, color, textColor = '#000000', onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative group flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full border-[2px] border-true-black shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] font-display font-black text-[9px] sm:text-[10px] uppercase cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      style={{ backgroundColor: color, color: textColor }}
      title={`Add +$${value.toLocaleString()} to bet`}
    >
      <span className="w-2.5 h-2.5 rounded-full border-[1px] border-true-black bg-white flex items-center justify-center text-[6px] font-bold text-true-black">
        $
      </span>
      <span>{label}</span>
    </button>
  )
}

export default function PokerDuelGame({ isOpen, onClose, bankroll, setBankroll }) {
  // Game Setup: Number of Bots (1, 2, 3, or 5 bots)
  const [botCount, setBotCount] = useState(2)
  const [activeBots, setActiveBots] = useState([])
  
  const [deck, setDeck] = useState([])
  const [stage, setStage] = useState('idle') // 'idle', 'deal', 'preflop', 'flop', 'turn', 'river', 'showdown'
  const [playerCards, setPlayerCards] = useState([])
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [currentRoundHighBet, setCurrentRoundHighBet] = useState(500)
  const [playerRoundBet, setPlayerRoundBet] = useState(500)
  const [raiseAmount, setRaiseAmount] = useState(500)
  const [playerHandName, setPlayerHandName] = useState('')
  const [gameResult, setGameResult] = useState(null) // 'win', 'lose', 'tie', 'fold'
  const [winnerName, setWinnerName] = useState('')
  
  // Turn Management States
  const [currentTurnActor, setCurrentTurnActor] = useState('PLAYER') // 'PLAYER' or bot ID
  const [activeTurnName, setActiveTurnName] = useState('YOUR TURN')
  const [isProcessingBot, setIsProcessingBot] = useState(false)

  // Floating Action Pop-up Alert
  const [actionToast, setActionToast] = useState(null)
  const toastTimerRef = useRef(null)

  const triggerToast = (actor, actionText, color = '#FFDE59', icon = '💬') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setActionToast({ actor, actionText, color, icon, id: Math.random() })
    toastTimerRef.current = setTimeout(() => {
      setActionToast(null)
    }, 1800)
  }

  // Initialize or Change Bot Seats
  useEffect(() => {
    const selected = BOT_ROSTER.slice(0, botCount).map(bot => ({
      ...bot,
      cards: [],
      bankroll: 10000,
      currentBet: 0,
      lastAction: 'ANTE $500',
      actionType: 'ante',
      folded: false,
      handName: '',
      isThinking: false
    }))
    setActiveBots(selected)
  }, [botCount])

  // Start a new hand
  const startNewHand = useCallback(() => {
    if (bankroll < 500) {
      setBankroll(prev => prev + 5000)
      SoundEngine.playJackpot()
    }

    const newDeck = createDeck()
    const pCards = [newDeck.pop(), newDeck.pop()]
    const ante = 500

    let totalPot = ante
    setBankroll(b => Math.max(0, b - ante))
    setPlayerRoundBet(ante)
    setCurrentRoundHighBet(ante)

    const newBots = BOT_ROSTER.slice(0, botCount).map(bot => {
      const bCards = [newDeck.pop(), newDeck.pop()]
      totalPot += ante
      return {
        ...bot,
        cards: bCards,
        bankroll: Math.max(0, 10000 - ante),
        currentBet: ante,
        lastAction: 'ANTE $500',
        actionType: 'ante',
        folded: false,
        handName: '',
        isThinking: false
      }
    })

    setDeck(newDeck)
    setPlayerCards(pCards)
    setActiveBots(newBots)
    setCommunityCards([])
    setPot(totalPot)
    setRaiseAmount(500)
    setStage('preflop')
    setGameResult(null)
    setWinnerName('')
    setPlayerHandName('')
    setCurrentTurnActor('PLAYER')
    setActiveTurnName('YOUR TURN 👑')
    setIsProcessingBot(false)
    setActionToast(null)

    SoundEngine.playCardSwoosh()
    setTimeout(() => SoundEngine.playCardFlip(), 250)
  }, [bankroll, botCount, setBankroll])

  useEffect(() => {
    if (isOpen && stage === 'idle') {
      startNewHand()
    }
  }, [isOpen, stage, startNewHand])

  // Real-time Player Hand Evaluator
  useEffect(() => {
    if (playerCards.length > 0) {
      const evalResult = evaluateHand([...playerCards, ...communityCards])
      setPlayerHandName(evalResult.name)
    }
  }, [playerCards, communityCards])

  // Calculate required call amount for player
  const playerCallAmount = Math.max(0, currentRoundHighBet - playerRoundBet)

  // Execute Bot AI Turn with 2–4s random thinking delay per bot
  const runSequentialBotTurns = (startingDeck, nextBoardStage) => {
    setIsProcessingBot(true)
    let currentDeck = startingDeck || [...deck]
    let bots = [...activeBots]
    let runningPot = pot
    let highBet = currentRoundHighBet

    let botIndex = 0

    const processNextBot = () => {
      if (botIndex >= bots.length) {
        setIsProcessingBot(false)
        setCurrentTurnActor('PLAYER')
        setActiveTurnName('YOUR TURN 👑')
        
        // Check if all bots folded
        const remainingBots = bots.filter(b => !b.folded)
        if (remainingBots.length === 0) {
          setGameResult('win')
          setWinnerName('PLAYER')
          setStage('showdown')
          setBankroll(b => b + runningPot)
          SoundEngine.playJackpot()
          triggerToast('DEALER', 'ALL OPPONENTS FOLDED! YOU WIN 🏆', '#00FFA3', '🏆')
          return
        }

        if (nextBoardStage) {
          advanceBoardStreet(currentDeck, bots, runningPot, highBet)
        }
        return
      }

      const bot = bots[botIndex]
      if (bot.folded) {
        botIndex++
        processNextBot()
        return
      }

      // Highlight active bot & thinking
      setCurrentTurnActor(bot.id)
      setActiveTurnName(`${bot.avatar} ${bot.name}'S TURN`)

      bots = bots.map((b, i) => i === botIndex ? { ...b, isThinking: true } : b)
      setActiveBots([...bots])

      // Randomized thinking duration between 2 to 4 seconds
      const thinkDuration = Math.floor(Math.random() * 2000) + 2000

      setTimeout(() => {
        const callNeeded = Math.max(0, highBet - bot.currentBet)
        const decision = decideBotAction({
          bot,
          cards: bot.cards,
          communityCards,
          stage,
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
            lastAction: '🏳️ FOLDED',
            actionType: 'fold'
          } : b)
          SoundEngine.playCardSwoosh()
          triggerToast(bot.name, 'FOLDED 🏳️', '#e5e7eb', '🏳️')
        } else if (decision.action === 'CHECK') {
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            isThinking: false,
            lastAction: '✓ CHECK',
            actionType: 'check'
          } : b)
          SoundEngine.playClick()
          triggerToast(bot.name, 'CHECKED ✓', '#00F0FF', '✓')
        } else if (decision.action === 'CALL') {
          const callAmt = callNeeded
          runningPot += callAmt
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            bankroll: Math.max(0, b.bankroll - callAmt),
            currentBet: b.currentBet + callAmt,
            isThinking: false,
            lastAction: `✓ CALL $${callAmt.toLocaleString()}`,
            actionType: 'call'
          } : b)
          SoundEngine.playChipClink()
          triggerToast(bot.name, `CALLED $${callAmt.toLocaleString()} ✓`, '#00FFA3', '🪙')
        } else if (decision.action === 'RAISE') {
          const raiseAmt = decision.amount
          runningPot += (callNeeded + raiseAmt)
          highBet += raiseAmt
          bots = bots.map((b, i) => i === botIndex ? {
            ...b,
            bankroll: Math.max(0, b.bankroll - (callNeeded + raiseAmt)),
            currentBet: b.currentBet + (callNeeded + raiseAmt),
            isThinking: false,
            lastAction: `🔥 RAISED +$${raiseAmt.toLocaleString()}`,
            actionType: 'raise'
          } : b)
          SoundEngine.playChipsStack()
          triggerToast(bot.name, `RAISED +$${raiseAmt.toLocaleString()} 🔥`, '#FF3333', '🔥')
        }

        setPot(runningPot)
        setCurrentRoundHighBet(highBet)
        setActiveBots([...bots])

        botIndex++
        setTimeout(processNextBot, 400)
      }, thinkDuration)
    }

    processNextBot()
  }

  // Advance Board Street
  const advanceBoardStreet = (deckSource, botsState, currentPotVal, currentHighBetVal) => {
    const currentDeck = deckSource || [...deck]
    const activeBotsList = botsState || activeBots

    setPlayerRoundBet(0)
    setCurrentRoundHighBet(0)
    setActiveBots(activeBotsList.map(b => ({ ...b, currentBet: 0 })))

    if (stage === 'preflop') {
      const c1 = currentDeck.pop()
      const c2 = currentDeck.pop()
      const c3 = currentDeck.pop()
      setCommunityCards([c1, c2, c3])
      setDeck(currentDeck)
      setStage('flop')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'FLOP IS DEALT! 🃏', '#FFDE59', '🃏')
    } else if (stage === 'flop') {
      const turnCard = currentDeck.pop()
      setCommunityCards(prev => [...prev, turnCard])
      setDeck(currentDeck)
      setStage('turn')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'TURN IS DEALT! 🃏', '#FFDE59', '🃏')
    } else if (stage === 'turn') {
      const riverCard = currentDeck.pop()
      setCommunityCards(prev => [...prev, riverCard])
      setDeck(currentDeck)
      setStage('river')
      SoundEngine.playCardFlip()
      triggerToast('DEALER', 'RIVER IS DEALT! 🃏', '#FFDE59', '🃏')
    } else if (stage === 'river') {
      triggerMultiShowdown(activeBotsList, currentPotVal)
    }
  }

  // Showdown Evaluation
  const triggerMultiShowdown = (botsState, potVal) => {
    setStage('showdown')
    setCurrentTurnActor('SHOWDOWN')
    setActiveTurnName('SHOWDOWN 🏆')
    SoundEngine.playCardFlip()

    const finalPot = potVal || pot
    const playerEval = evaluateHand([...playerCards, ...communityCards])
    setPlayerHandName(playerEval.name)

    let bestScore = playerEval.score
    let winner = 'PLAYER'
    let bestHandName = playerEval.name

    const revealedBots = (botsState || activeBots).map(bot => {
      if (bot.folded) return bot
      const bEval = evaluateHand([...bot.cards, ...communityCards])
      if (bEval.score > bestScore) {
        bestScore = bEval.score
        winner = bot.name
        bestHandName = bEval.name
      }
      return { ...bot, handName: bEval.name }
    })

    setActiveBots(revealedBots)
    setWinnerName(winner)

    if (winner === 'PLAYER') {
      setGameResult('win')
      setBankroll(b => b + finalPot)
      SoundEngine.playJackpot()
    } else {
      setGameResult('lose')
      SoundEngine.playCardSwoosh()
    }
  }

  // Player Actions
  const handlePlayerCheck = () => {
    SoundEngine.playClick()
    triggerToast('YOU', 'CHECKED ✓', '#00F0FF', '✓')
    runSequentialBotTurns(deck, true)
  }

  const handlePlayerCall = () => {
    const callAmt = playerCallAmount || 500
    SoundEngine.playChipClink()
    setBankroll(b => Math.max(0, b - callAmt))
    setPot(p => p + callAmt)
    setPlayerRoundBet(b => b + callAmt)
    triggerToast('YOU', `CALLED $${callAmt.toLocaleString()} ✓`, '#00FFA3', '🪙')
    runSequentialBotTurns(deck, true)
  }

  const handlePlayerRaise = (amount) => {
    const finalRaise = amount || raiseAmount
    const totalToPutIn = playerCallAmount + finalRaise
    SoundEngine.playChipsStack()
    setBankroll(b => Math.max(0, b - totalToPutIn))
    setPot(p => p + totalToPutIn)
    setPlayerRoundBet(b => b + totalToPutIn)
    setCurrentRoundHighBet(b => b + finalRaise)
    triggerToast('YOU', `RAISED +$${finalRaise.toLocaleString()} 🔥`, '#FF3333', '🔥')
    runSequentialBotTurns(deck, true)
  }

  const handlePlayerAllIn = () => {
    const allInAmt = Math.max(bankroll, 2000)
    setBankroll(0)
    setPot(p => p + allInAmt)
    setPlayerRoundBet(b => b + allInAmt)
    SoundEngine.playChipsStack()
    triggerToast('YOU', `ALL-IN $${allInAmt.toLocaleString()}! 🚀`, '#FF3333', '🚀')

    const currentDeck = [...deck]
    const needed = 5 - communityCards.length
    const dealt = []
    for (let i = 0; i < needed; i++) {
      if (currentDeck.length > 0) dealt.push(currentDeck.pop())
    }
    const finalBoard = [...communityCards, ...dealt]
    setCommunityCards(finalBoard)
    setDeck(currentDeck)

    setTimeout(() => {
      setStage('showdown')
      const playerEval = evaluateHand([...playerCards, ...finalBoard])
      setPlayerHandName(playerEval.name)

      let bestScore = playerEval.score
      let winner = 'PLAYER'
      let bestHandName = playerEval.name

      const revealedBots = activeBots.map(bot => {
        if (bot.folded) return bot
        const bEval = evaluateHand([...bot.cards, ...finalBoard])
        if (bEval.score > bestScore) {
          bestScore = bEval.score
          winner = bot.name
          bestHandName = bEval.name
        }
        return { ...bot, handName: bEval.name }
      })

      setActiveBots(revealedBots)
      setWinnerName(winner)

      if (winner === 'PLAYER') {
        setGameResult('win')
        setBankroll(b => b + pot + allInAmt)
        SoundEngine.playJackpot()
      } else {
        setGameResult('lose')
      }
    }, 600)
  }

  const handlePlayerFold = () => {
    SoundEngine.playCardSwoosh()
    triggerToast('YOU', 'FOLDED 🏳️', '#e5e7eb', '🏳️')
    setGameResult('fold')
    setStage('showdown')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-true-black/80 backdrop-blur-sm select-none animate-fadeIn overflow-y-auto">
      {/* Neo-Brutalist Main App Window */}
      <div className="relative w-full max-w-4xl bg-[#fdfaf7] border-[4px] border-true-black rounded-2xl shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Retro Window Title Bar */}
        <div className="bg-[#FF90E8] border-b-[4px] border-true-black px-4 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF3333] border-[2px] border-true-black inline-block shadow-[1px_1px_0px_#000000]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFDE59] border-[2px] border-true-black inline-block shadow-[1px_1px_0px_#000000]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#00FFA3] border-[2px] border-true-black inline-block shadow-[1px_1px_0px_#000000]" />
            <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-true-black ml-2">
              TEXAS_HOLDEM.EXE
            </span>
          </div>

          {/* Table Size Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-pixel text-[8px] sm:text-[9px] bg-white border-[2px] border-true-black px-1.5 py-0.5 font-black hidden sm:inline-block shadow-[1px_1px_0px_#000000]">
              OPPONENTS:
            </span>
            {[1, 2, 3, 5].map(count => (
              <button
                key={count}
                onClick={() => {
                  SoundEngine.playClick()
                  setBotCount(count)
                  setStage('idle')
                }}
                className={`font-display text-[10px] sm:text-xs font-black px-2 py-0.5 border-[2px] border-true-black transition-all cursor-pointer ${
                  botCount === count
                    ? 'bg-[#FFDE59] text-true-black shadow-[2px_2px_0px_#000000] scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-[1px_1px_0px_#000000]'
                }`}
                title={`Play with ${count} AI Bots`}
              >
                {count === 1 ? '1v1' : `${count} BOTS`}
              </button>
            ))}

            <button
              onClick={onClose}
              className="w-7 h-7 ml-1 sm:ml-2 bg-white hover:bg-[#FF3333] hover:text-white text-true-black border-[2px] border-true-black font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Inner Canvas Area (Cream Background + Retro Grid) */}
        <div
          className="p-3 sm:p-4 flex flex-col gap-2.5 relative overflow-y-auto"
          style={{
            backgroundColor: '#fdfaf7',
            backgroundImage:
              'linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
          
          {/* Top Status Bar: Turn Spotlight & Pot */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-[2px] border-true-black shadow-[2px_2px_0px_#000000] ${
                currentTurnActor === 'PLAYER' ? 'bg-[#00FFA3] animate-pulse' : 'bg-[#FFDE59]'
              }`}>
                <span className="w-2 h-2 rounded-full bg-true-black inline-block animate-ping" />
                <span className="font-display font-black text-xs uppercase text-true-black">
                  {activeTurnName}
                </span>
              </div>
              <span className="font-pixel text-[8px] sm:text-[9px] bg-white border-[2px] border-true-black px-2 py-1 font-bold">
                STAGE: {stage.toUpperCase()}
              </span>
            </div>

            {/* Mega Pot Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFDE59] border-[3px] border-true-black px-4 py-1 rounded-full shadow-[3px_3px_0px_#000000] -rotate-1">
              <span className="font-display text-[10px] font-black uppercase text-true-black">POT:</span>
              <span className="font-display text-base sm:text-lg font-black text-true-black tracking-tight">
                ${pot.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* NEO-BRUTALIST POKER TABLE */}
          {/* ======================================================== */}
          <div className="relative w-full rounded-3xl bg-[#FFDE59] border-[4px] border-true-black shadow-[6px_6px_0px_#000000] p-3 sm:p-4 flex flex-col justify-between min-h-[350px] sm:min-h-[380px] overflow-hidden">
            
            {/* Halftone Pattern Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* FLOATING ACTION TOAST BANNER (Appears when someone bets/raises/folds) */}
            {actionToast && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounce">
                <div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-[3px] border-true-black shadow-[6px_6px_0px_#000000] -rotate-1 font-display font-black text-sm sm:text-base uppercase text-true-black"
                  style={{ backgroundColor: actionToast.color }}
                >
                  <span className="text-xl">{actionToast.icon}</span>
                  <span><strong>{actionToast.actor}:</strong> {actionToast.actionText}</span>
                </div>
              </div>
            )}

            {/* AI BOTS SEATS (TOP) */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full">
              {activeBots.map((bot) => {
                const isActive = currentTurnActor === bot.id
                return (
                  <div
                    key={bot.id}
                    className={`flex flex-col items-center bg-white border-[3px] border-true-black p-1.5 rounded-xl transition-all relative ${
                      isActive
                        ? 'ring-4 ring-[#00FFA3] shadow-[5px_5px_0px_#000000] -translate-y-1 scale-105'
                        : 'shadow-[3px_3px_0px_#000000]'
                    } ${bot.folded ? 'opacity-40 grayscale' : ''}`}
                  >
                    {/* Thinking Alert (2-4s) */}
                    {bot.isThinking && (
                      <span className="absolute -top-3 bg-[#FF90E8] border-[2px] border-true-black font-pixel text-[7px] px-1.5 py-0.2 font-black shadow-[2px_2px_0px_#000000] animate-bounce z-20">
                        ⏳ THINKING...
                      </span>
                    )}

                    <div className="flex items-center gap-1 w-full justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{bot.avatar}</span>
                        <span className="font-display font-black text-[9px] sm:text-[10px] text-true-black truncate max-w-[55px]">
                          {bot.name}
                        </span>
                      </div>
                      
                      {/* Action Pill */}
                      <span
                        className={`font-pixel text-[7px] px-1 py-0.5 border-[1.5px] border-true-black font-black uppercase truncate max-w-[65px] ${
                          bot.actionType === 'raise'
                            ? 'bg-[#FF3333] text-white animate-pulse'
                            : bot.actionType === 'call'
                            ? 'bg-[#00FFA3] text-true-black'
                            : bot.actionType === 'fold'
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-[#FFDE59] text-true-black'
                        }`}
                      >
                        {bot.lastAction}
                      </span>
                    </div>

                    {/* Bot Cards */}
                    <div className="flex gap-1 my-1 relative">
                      <BrutalistCard card={bot.cards[0]} hidden={stage !== 'showdown' || bot.folded} small />
                      <BrutalistCard card={bot.cards[1]} hidden={stage !== 'showdown' || bot.folded} small />
                      {bot.folded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 rounded">
                          <span className="font-display font-black text-[10px] text-white bg-red-600 px-1 border border-black rotate-12">
                            FOLD
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Showdown Hand Rank or Table Bet */}
                    {stage === 'showdown' && bot.handName && !bot.folded ? (
                      <span className="font-pixel text-[7px] bg-[#FF90E8] border-[1px] border-true-black px-1 font-bold text-true-black truncate max-w-full">
                        {bot.handName}
                      </span>
                    ) : (
                      <span className="font-mono-nb text-[8px] font-bold text-gray-700">
                        BET: ${bot.currentBet.toLocaleString()}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* COMMUNITY CARDS AREA (CENTER BOARD) */}
            <div className="relative z-10 my-auto flex flex-col items-center py-1">
              <div className="flex gap-1.5 sm:gap-2.5 justify-center items-center">
                {[0, 1, 2, 3, 4].map(idx => (
                  <BrutalistCard
                    key={idx}
                    card={communityCards[idx]}
                    hidden={!communityCards[idx]}
                    delay={idx * 100}
                    highlighted={stage === 'showdown'}
                  />
                ))}
              </div>
            </div>

            {/* PLAYER AREA (BOTTOM) */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Hand Rank & Turn Badge */}
              <div className="mb-1 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-0.5 border-[2px] border-true-black shadow-[2px_2px_0px_#000000] ${
                  currentTurnActor === 'PLAYER' && stage !== 'showdown'
                    ? 'bg-[#00FFA3] animate-pulse -rotate-1'
                    : 'bg-white'
                }`}>
                  <span className="font-pixel text-[8px] font-bold text-true-black">
                    {currentTurnActor === 'PLAYER' && stage !== 'showdown' ? '▶ YOUR MOVE' : 'YOUR HAND'}
                  </span>
                  <span className="font-display text-xs font-black text-true-black">
                    [{playerHandName || 'CALCULATING...'}]
                  </span>
                </div>

                <div className="bg-[#FF90E8] border-[2px] border-true-black px-2 py-0.5 shadow-[2px_2px_0px_#000000] font-mono-nb text-[9px] font-black text-true-black">
                  BET: ${playerRoundBet.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <BrutalistCard card={playerCards[0]} />
                <BrutalistCard card={playerCards[1]} />
              </div>
            </div>

            {/* ======================================================== */}
            {/* SHOWDOWN RESULT OVERLAY */}
            {/* ======================================================== */}
            {stage === 'showdown' && (
              <div className="absolute inset-0 z-30 bg-true-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                {gameResult === 'win' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl animate-bounce">🏆</span>
                    <div className="bg-[#00FFA3] border-[4px] border-true-black px-6 py-1.5 shadow-[6px_6px_0px_#FFDE59] -rotate-2">
                      <h3 className="font-display text-2xl sm:text-4xl font-black text-true-black uppercase tracking-tight">
                        YOU WON THE POT!
                      </h3>
                    </div>
                    <p className="font-mono-nb text-xs sm:text-sm font-bold text-white mt-1">
                      {playerHandName} OUTPLAYED ALL OPPONENTS
                    </p>
                    <div className="bg-[#FFDE59] border-[3px] border-true-black px-4 py-1 shadow-[4px_4px_0px_#000000] font-display text-lg sm:text-xl font-black text-true-black">
                      +${pot.toLocaleString()} CHIPS COLLECTED
                    </div>
                  </div>
                ) : gameResult === 'fold' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">🏳️</span>
                    <div className="bg-white border-[4px] border-true-black px-6 py-1.5 shadow-[6px_6px_0px_#000000]">
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-true-black uppercase">
                        YOU FOLDED THE HAND
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">💀</span>
                    <div className="bg-[#FF3333] border-[4px] border-true-black px-6 py-1.5 shadow-[6px_6px_0px_#000000] rotate-2">
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                        {winnerName} WINS!
                      </h3>
                    </div>
                    <p className="font-mono-nb text-xs font-bold text-gray-200">
                      WINNING HAND: {playerHandName}
                    </p>
                  </div>
                )}

                <button
                  onClick={startNewHand}
                  className="brutal-btn mt-4 px-8 py-2.5 bg-[#FFDE59] text-true-black font-display text-sm sm:text-base font-black uppercase tracking-wider hover:bg-[#00FFA3] cursor-pointer shadow-[5px_5px_0px_#000000]"
                >
                  DEAL NEXT HAND →
                </button>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* INTERACTIVE CHIP SELECTOR */}
          {/* ======================================================== */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border-[3px] border-true-black p-2 rounded-xl shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-pixel text-[8px] bg-[#FF90E8] border-[1.5px] border-true-black px-2 py-0.5 font-black text-true-black">
                CHIPS:
              </span>
              <BrutalistChip
                value={100}
                label="$100"
                color="#FFDE59"
                onClick={() => {
                  SoundEngine.playChipClink()
                  setRaiseAmount(r => r + 100)
                }}
              />
              <BrutalistChip
                value={500}
                label="$500"
                color="#FF90E8"
                onClick={() => {
                  SoundEngine.playChipClink()
                  setRaiseAmount(r => r + 500)
                }}
              />
              <BrutalistChip
                value={1000}
                label="$1K"
                color="#00FFA3"
                onClick={() => {
                  SoundEngine.playChipClink()
                  setRaiseAmount(r => r + 1000)
                }}
              />
              <BrutalistChip
                value={5000}
                label="$5K"
                color="#FF3333"
                textColor="#FFFFFF"
                onClick={() => {
                  SoundEngine.playChipClink()
                  setRaiseAmount(r => r + 5000)
                }}
              />
              <BrutalistChip
                value={10000}
                label="$10K"
                color="#00F0FF"
                onClick={() => {
                  SoundEngine.playChipsStack()
                  setRaiseAmount(r => r + 10000)
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono-nb text-[11px] font-bold text-gray-700">
                RAISE: <strong className="text-true-black">+${raiseAmount.toLocaleString()}</strong>
              </span>
              <button
                onClick={() => setRaiseAmount(500)}
                className="font-pixel text-[7px] bg-gray-200 border-[1.5px] border-true-black px-1.5 py-0.5 font-bold hover:bg-gray-300 cursor-pointer"
                title="Reset Raise to $500"
              >
                RESET
              </button>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[8px] bg-white border-[2px] border-true-black px-2 py-1 font-bold shadow-[2px_2px_0px_#000000]">
                YOUR CHIPS: <strong className="text-[#FF3333]">${bankroll.toLocaleString()}</strong>
              </span>
              {playerCallAmount > 0 && stage !== 'showdown' && (
                <span className="font-pixel text-[8px] bg-[#FF3333] text-white border-[2px] border-true-black px-2 py-1 font-bold animate-pulse shadow-[2px_2px_0px_#000000]">
                  CALL: ${playerCallAmount.toLocaleString()}
                </span>
              )}
            </div>

            {stage !== 'showdown' ? (
              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  disabled={isProcessingBot || currentTurnActor !== 'PLAYER'}
                  onClick={handlePlayerFold}
                  className="brutal-btn px-3 py-1.5 bg-white text-true-black font-display text-xs font-black uppercase hover:bg-[#FF3333] hover:text-white transition-colors disabled:opacity-50"
                  title="Surrender this hand"
                >
                  🏳️ FOLD
                </button>

                {playerCallAmount === 0 ? (
                  <button
                    disabled={isProcessingBot || currentTurnActor !== 'PLAYER'}
                    onClick={handlePlayerCheck}
                    className="brutal-btn px-4 py-1.5 bg-[#00F0FF] text-true-black font-display text-xs font-black uppercase hover:bg-[#00d8e6] disabled:opacity-50"
                    title="Pass action for free"
                  >
                    ✓ CHECK (FREE)
                  </button>
                ) : (
                  <button
                    disabled={isProcessingBot || currentTurnActor !== 'PLAYER'}
                    onClick={handlePlayerCall}
                    className="brutal-btn px-4 py-1.5 bg-[#00FFA3] text-true-black font-display text-xs font-black uppercase hover:bg-[#00e693] disabled:opacity-50"
                    title={`Match bet of $${playerCallAmount.toLocaleString()}`}
                  >
                    ✓ CALL ${playerCallAmount.toLocaleString()}
                  </button>
                )}

                <button
                  disabled={isProcessingBot || currentTurnActor !== 'PLAYER'}
                  onClick={() => handlePlayerRaise(raiseAmount)}
                  className="brutal-btn px-4 py-1.5 bg-[#FFDE59] text-true-black font-display text-xs font-black uppercase hover:bg-[#f5d045] disabled:opacity-50"
                  title={`Raise bet by +$${raiseAmount.toLocaleString()}`}
                >
                  RAISE +${raiseAmount.toLocaleString()}
                </button>

                <button
                  disabled={isProcessingBot || currentTurnActor !== 'PLAYER'}
                  onClick={handlePlayerAllIn}
                  className="brutal-btn px-4 py-1.5 bg-[#FF3333] text-white font-display text-xs font-black uppercase hover:bg-[#e62020] animate-pulse disabled:opacity-50"
                  title="Bet entire bankroll!"
                >
                  🚀 ALL-IN
                </button>
              </div>
            ) : (
              <button
                onClick={startNewHand}
                className="brutal-btn ml-auto px-6 py-2 bg-[#FFDE59] text-true-black font-display text-xs font-black uppercase hover:bg-[#00FFA3]"
              >
                DEAL NEXT HAND →
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
