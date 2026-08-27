"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SoundEngine } from './SoundEngine'

const SUITS = [
  { key: 'hearts', symbol: '♥', color: '#e74c3c' },
  { key: 'diamonds', symbol: '♦', color: '#e74c3c' },
  { key: 'spades', symbol: '♠', color: '#2c3e50' },
  { key: 'clubs', symbol: '♣', color: '#2c3e50' }
]

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
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
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Simplified 7-card Poker Hand Evaluator
function evaluateHand(cards) {
  if (!cards || cards.length < 5) return { score: 0, name: 'High Card', rank: 0 }

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
  // Ace low straight: 5, 4, 3, 2, A
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
          return { score: 9000, name: 'Royal Flush 👑', rank: 9 }
        }
        return { score: 8000 + flushUnique[i], name: 'Straight Flush 🔥', rank: 8 }
      }
    }
  }

  // 2. Four of a Kind
  if (counts[0].count === 4) {
    return { score: 7000 + counts[0].val * 10 + (counts[1]?.val || 0), name: `Four of a Kind (${counts[0].val})`, rank: 7 }
  }

  // 3. Full House
  if (counts[0].count === 3 && counts[1] && counts[1].count >= 2) {
    return { score: 6000 + counts[0].val * 10 + counts[1].val, name: `Full House (${counts[0].val}s over ${counts[1].val}s)`, rank: 6 }
  }

  // 4. Flush
  if (flushSuit) {
    const flushCards = sorted.filter(c => c.suit === flushSuit)
    return { score: 5000 + flushCards[0].val, name: `Flush (${flushSuit.toUpperCase()})`, rank: 5 }
  }

  // 5. Straight
  if (isStraight) {
    return { score: 4000 + straightHigh, name: `Straight (${straightHigh} High)`, rank: 4 }
  }

  // 6. Three of a Kind
  if (counts[0].count === 3) {
    return { score: 3000 + counts[0].val * 10 + (counts[1]?.val || 0), name: `Three of a Kind (${counts[0].val}s)`, rank: 3 }
  }

  // 7. Two Pair
  if (counts[0].count === 2 && counts[1] && counts[1].count === 2) {
    return { score: 2000 + counts[0].val * 15 + counts[1].val * 2, name: `Two Pair (${counts[0].val}s & ${counts[1].val}s)`, rank: 2 }
  }

  // 8. One Pair
  if (counts[0].count === 2) {
    return { score: 1000 + counts[0].val * 10 + sorted[0].val, name: `One Pair of ${counts[0].val}s`, rank: 1 }
  }

  // 9. High Card
  return { score: sorted[0].val, name: `High Card (${sorted[0].rank})`, rank: 0 }
}

// Visual Card Render Component
function MiniCard({ card, hidden = false, delay = 0, highlighted = false }) {
  if (hidden || !card) {
    return (
      <div
        className="w-16 h-24 md:w-20 md:h-30 rounded-xl bg-gradient-to-br from-[#8b151b] via-[#5c0e12] to-[#2b0507] border-2 border-[#d4af37]/60 shadow-xl flex items-center justify-center relative transform transition-all duration-500 hover:scale-105 select-none"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="w-10 h-16 rounded-md border border-[#d4af37]/30 flex items-center justify-center">
          <span className="text-[#d4af37] font-black text-sm tracking-tighter">PH</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`w-16 h-24 md:w-20 md:h-30 rounded-xl bg-gradient-to-b from-[#ffffff] to-[#f5f1e8] border-2 ${
        highlighted ? 'border-[#f1c40f] ring-4 ring-[#f1c40f]/50 scale-105' : 'border-[#d4af37]/50'
      } shadow-2xl flex flex-col justify-between p-2 relative transform transition-all duration-500 hover:-translate-y-2 select-none`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-center leading-none">
        <span className="font-black text-sm md:text-base" style={{ color: card.color }}>
          {card.rank}
        </span>
        <span className="text-sm md:text-base" style={{ color: card.color }}>
          {card.symbol}
        </span>
      </div>
      <div className="text-center text-2xl md:text-3xl font-bold leading-none" style={{ color: card.color }}>
        {card.symbol}
      </div>
      <div className="flex justify-between items-center leading-none rotate-180">
        <span className="font-black text-sm md:text-base" style={{ color: card.color }}>
          {card.rank}
        </span>
        <span className="text-sm md:text-base" style={{ color: card.color }}>
          {card.symbol}
        </span>
      </div>
    </div>
  )
}

export default function PokerDuelGame({ isOpen, onClose, bankroll, setBankroll }) {
  const [deck, setDeck] = useState([])
  const [stage, setStage] = useState('idle') // 'idle', 'deal', 'preflop', 'flop', 'turn', 'river', 'showdown'
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [playerHandName, setPlayerHandName] = useState('')
  const [dealerHandName, setDealerHandName] = useState('')
  const [gameResult, setGameResult] = useState(null) // 'win', 'lose', 'tie', 'fold'
  const [dealerThinking, setDealerThinking] = useState(false)
  const [historyLog, setHistoryLog] = useState([])

  const addLog = (msg) => setHistoryLog(prev => [msg, ...prev.slice(0, 5)])

  // Start a new duel hand
  const startNewHand = useCallback(() => {
    if (bankroll < 500) {
      alert('Your bankroll is below $500! Refilling with $5,000 High Roller chips.')
      setBankroll(prev => prev + 5000)
    }

    const newDeck = createDeck()
    const pCards = [newDeck.pop(), newDeck.pop()]
    const dCards = [newDeck.pop(), newDeck.pop()]

    const ante = 500
    setBankroll(b => Math.max(0, b - ante))
    setPot(ante * 2)
    setCurrentBet(ante)

    setDeck(newDeck)
    setPlayerCards(pCards)
    setDealerCards(dCards)
    setCommunityCards([])
    setStage('preflop')
    setGameResult(null)
    setPlayerHandName('')
    setDealerHandName('')

    SoundEngine.playCardSwoosh()
    setTimeout(() => SoundEngine.playChipClink(), 300)
    addLog(`⚔️ New Hand started. $500 Ante placed.`)
  }, [bankroll, setBankroll])

  useEffect(() => {
    if (isOpen && stage === 'idle') {
      startNewHand()
    }
  }, [isOpen, stage, startNewHand])

  // Update player hand rank in real-time
  useEffect(() => {
    if (playerCards.length > 0) {
      const evalResult = evaluateHand([...playerCards, ...communityCards])
      setPlayerHandName(evalResult.name)
    }
  }, [playerCards, communityCards])

  // Advance to next stage (Deal Flop / Turn / River)
  const advanceStage = () => {
    if (stage === 'preflop') {
      // Deal Flop (3 cards)
      const c1 = deck.pop()
      const c2 = deck.pop()
      const c3 = deck.pop()
      setCommunityCards([c1, c2, c3])
      setStage('flop')
      SoundEngine.playCardFlip()
      addLog(`🃏 Flop dealt: [${c1.rank}${c1.symbol} ${c2.rank}${c2.symbol} ${c3.rank}${c3.symbol}]`)
    } else if (stage === 'flop') {
      // Deal Turn (1 card)
      const turnCard = deck.pop()
      setCommunityCards(prev => [...prev, turnCard])
      setStage('turn')
      SoundEngine.playCardFlip()
      addLog(`🃏 Turn dealt: [${turnCard.rank}${turnCard.symbol}]`)
    } else if (stage === 'turn') {
      // Deal River (1 card)
      const riverCard = deck.pop()
      setCommunityCards(prev => [...prev, riverCard])
      setStage('river')
      SoundEngine.playCardFlip()
      addLog(`🃏 River dealt: [${riverCard.rank}${riverCard.symbol}]`)
    } else if (stage === 'river') {
      // Showdown!
      triggerShowdown()
    }
  }

  // Trigger Showdown
  const triggerShowdown = () => {
    setStage('showdown')
    SoundEngine.playCardFlip()

    const pEval = evaluateHand([...playerCards, ...communityCards])
    const dEval = evaluateHand([...dealerCards, ...communityCards])

    setPlayerHandName(pEval.name)
    setDealerHandName(dEval.name)

    if (pEval.score > dEval.score) {
      setGameResult('win')
      setBankroll(b => b + pot)
      SoundEngine.playJackpot()
      addLog(`🏆 You WON with ${pEval.name}! Collected $${pot.toLocaleString()}`)
    } else if (pEval.score < dEval.score) {
      setGameResult('lose')
      SoundEngine.playChipClink()
      addLog(`💀 Dealer won with ${dEval.name}.`)
    } else {
      setGameResult('tie')
      setBankroll(b => b + Math.floor(pot / 2))
      addLog(`🤝 Split pot: Tie with ${pEval.name}.`)
    }
  }

  // Player Actions: Check, Call, Raise, All-in, Fold
  const handleCheck = () => {
    SoundEngine.playClick()
    advanceStage()
  }

  const handleCall = (amount = 500) => {
    SoundEngine.playChipClink()
    setBankroll(b => Math.max(0, b - amount))
    setPot(p => p + amount * 2)
    advanceStage()
  }

  const handleRaise = (raiseAmount = 1000) => {
    SoundEngine.playChipClink()
    setBankroll(b => Math.max(0, b - raiseAmount))
    setPot(p => p + raiseAmount * 2)
    addLog(`🔥 You raised $${raiseAmount.toLocaleString()}! Dealer calls.`)
    advanceStage()
  }

  const handleAllIn = () => {
    const allInAmount = Math.max(bankroll, 2000)
    setBankroll(0)
    setPot(p => p + allInAmount * 2)
    SoundEngine.playChipsStack()
    addLog(`🚀 ALL IN! Pot is now $${(pot + allInAmount * 2).toLocaleString()}!`)

    // Fast-forward remaining cards to showdown
    const remainingDeck = [...deck]
    const needed = 5 - communityCards.length
    const dealt = []
    for (let i = 0; i < needed; i++) {
      if (remainingDeck.length > 0) dealt.push(remainingDeck.pop())
    }
    const finalCommunity = [...communityCards, ...dealt]
    setCommunityCards(finalCommunity)
    setDeck(remainingDeck)

    setTimeout(() => {
      setStage('showdown')
      const pEval = evaluateHand([...playerCards, ...finalCommunity])
      const dEval = evaluateHand([...dealerCards, ...finalCommunity])
      setPlayerHandName(pEval.name)
      setDealerHandName(dEval.name)

      if (pEval.score > dEval.score) {
        setGameResult('win')
        setBankroll(b => b + pot + allInAmount * 2)
        SoundEngine.playJackpot()
      } else if (pEval.score < dEval.score) {
        setGameResult('lose')
      } else {
        setGameResult('tie')
        setBankroll(b => b + Math.floor((pot + allInAmount * 2) / 2))
      }
    }, 600)
  }

  const handleFold = () => {
    SoundEngine.playCardSwoosh()
    setGameResult('fold')
    setStage('showdown')
    addLog(`🏳️ You folded the hand.`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0b10] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col p-6 md:p-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f9e8a2] flex items-center justify-center font-black text-black text-lg shadow-md">
              👑
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                TEXAS HOLD'EM <span className="text-[#d4af37] text-sm md:text-base font-bold bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">3D HIGH STAKES</span>
              </h2>
              <p className="text-xs text-gray-400">Heads-up Showdown vs. The Macau Maestro</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black/60 px-4 py-2 rounded-2xl border border-[#d4af37]/30 flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold uppercase">Pot:</span>
              <span className="text-xl font-black text-[#f1c40f] tracking-tight">${pot.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Poker Felt Table Area */}
        <div className="relative w-full bg-gradient-to-b from-[#14482a] via-[#0d341e] to-[#071f12] rounded-2xl border-4 border-[#3c2a1e] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between min-h-[360px] md:min-h-[420px] overflow-hidden">
          
          {/* Dealer Area */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 bg-black/40 px-3 py-1 rounded-full border border-[#d4af37]/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">The Macau Maestro (AI Dealer)</span>
              {stage === 'showdown' && dealerHandName && (
                <span className="text-xs text-[#f1c40f] font-bold">[{dealerHandName}]</span>
              )}
            </div>

            <div className="flex gap-3">
              <MiniCard card={dealerCards[0]} hidden={stage !== 'showdown'} />
              <MiniCard card={dealerCards[1]} hidden={stage !== 'showdown'} />
            </div>
          </div>

          {/* Community Cards & Center Pot */}
          <div className="my-auto flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>Community Cards</span>
              <span className="bg-[#d4af37]/20 px-2 py-0.5 rounded text-[10px] text-white">Stage: {stage.toUpperCase()}</span>
            </div>

            <div className="flex gap-2 md:gap-4 justify-center items-center">
              {[0, 1, 2, 3, 4].map(idx => (
                <MiniCard
                  key={idx}
                  card={communityCards[idx]}
                  hidden={!communityCards[idx]}
                  delay={idx * 150}
                  highlighted={stage === 'showdown'}
                />
              ))}
            </div>
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center">
            <div className="flex gap-3 mb-2">
              <MiniCard card={playerCards[0]} />
              <MiniCard card={playerCards[1]} />
            </div>

            <div className="flex items-center gap-3 bg-black/50 px-4 py-1.5 rounded-full border border-[#d4af37]/30">
              <span className="text-xs font-bold text-gray-300">Your Hand:</span>
              <span className="text-sm font-black text-[#f1c40f]">{playerHandName || 'Calculating...'}</span>
            </div>
          </div>

          {/* Win / Loss Overlay */}
          {stage === 'showdown' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-scaleUp">
              {gameResult === 'win' && (
                <div className="text-center">
                  <div className="text-6xl mb-2 animate-bounce">🏆</div>
                  <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffe066] via-[#f1c40f] to-[#e67e22]">
                    VICTORY!
                  </h3>
                  <p className="text-lg text-white font-bold mt-1">You won with {playerHandName}</p>
                  <p className="text-2xl font-black text-[#2ecc71] mt-2">+${pot.toLocaleString()} Chips</p>
                </div>
              )}

              {gameResult === 'lose' && (
                <div className="text-center">
                  <div className="text-6xl mb-2">💀</div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#e74c3c]">DEALER WINS</h3>
                  <p className="text-lg text-gray-300 font-bold mt-1">Dealer had {dealerHandName}</p>
                </div>
              )}

              {gameResult === 'tie' && (
                <div className="text-center">
                  <div className="text-6xl mb-2">🤝</div>
                  <h3 className="text-4xl font-black text-[#3498db]">SPLIT POT (TIE)</h3>
                  <p className="text-lg text-gray-300 font-bold mt-1">Both held {playerHandName}</p>
                </div>
              )}

              {gameResult === 'fold' && (
                <div className="text-center">
                  <div className="text-6xl mb-2">🏳️</div>
                  <h3 className="text-3xl font-black text-gray-400">HAND FOLDED</h3>
                </div>
              )}

              <button
                onClick={startNewHand}
                className="mt-6 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#f39c12] to-[#d4af37] hover:from-[#f1c40f] hover:to-[#e67e22] text-black font-black text-lg tracking-wider shadow-[0_0_25px_rgba(241,196,15,0.5)] transform hover:scale-105 transition-all cursor-pointer"
              >
                PLAY NEXT HAND ➔
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-400 block font-medium">YOUR BANKROLL</span>
              <span className="text-lg font-black text-white">${bankroll.toLocaleString()}</span>
            </div>
            {historyLog[0] && (
              <span className="text-xs text-gray-400 italic hidden md:inline-block">
                {historyLog[0]}
              </span>
            )}
          </div>

          {stage !== 'showdown' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleFold}
                className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 font-bold text-sm transition-all cursor-pointer"
              >
                Fold
              </button>

              <button
                onClick={handleCheck}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Check
              </button>

              <button
                onClick={() => handleCall(500)}
                className="px-5 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Call $500
              </button>

              <button
                onClick={() => handleRaise(1000)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black text-sm transition-all shadow-md cursor-pointer"
              >
                Raise $1,000
              </button>

              <button
                onClick={handleAllIn}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-[0_0_15px_rgba(231,76,60,0.5)] transition-all cursor-pointer"
              >
                🚀 ALL-IN
              </button>
            </div>
          ) : (
            <button
              onClick={startNewHand}
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-black text-sm hover:bg-[#f1c40f] transition-all cursor-pointer"
            >
              Deal Next Hand
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
