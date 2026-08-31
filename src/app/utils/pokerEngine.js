

export const GamePhase = {
  IDLE: 'IDLE',
  PRE_FLOP: 'PRE_FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN',
  HAND_RESOLVED: 'HAND_RESOLVED'
}

export const PlayerActionType = {
  CHECK: 'CHECK',
  CALL: 'CALL',
  BET: 'BET',
  RAISE: 'RAISE',
  ALL_IN: 'ALL_IN',
  FOLD: 'FOLD'
}

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

/**
 * Creates and cryptographically shuffles a 52-card standard deck
 */
export function createShuffledDeck() {
  const deck = []
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({
        id: `${r}_${s.key}`,
        suit: s.symbol,
        symbol: s.symbol,
        suitKey: s.key,
        suitName: s.name,
        rank: r,
        val: RANK_VALUES[r],
        color: s.color
      })
    }
  }

  // Cryptographically Secure Fisher-Yates Shuffle
  const getRandomInt = (max) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1)
      window.crypto.getRandomValues(arr)
      return arr[0] % max
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      const arr = new Uint32Array(1)
      globalThis.crypto.getRandomValues(arr)
      return arr[0] % max
    }
    return Math.floor(Math.random() * max)
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1)
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }
  return deck
}

export const RANK_NAMES = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace'
}

export const RANK_PLURALS = {
  2: '2s', 3: '3s', 4: '4s', 5: '5s', 6: '6s', 7: '7s', 8: '8s', 9: '9s', 10: '10s',
  11: 'Jacks', 12: 'Queens', 13: 'Kings', 14: 'Aces', 1: 'Aces'
}

export const SUIT_NAMES = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  spades: 'Spades',
  clubs: 'Clubs',
  '♥': 'Hearts',
  '♦': 'Diamonds',
  '♠': 'Spades',
  '♣': 'Clubs'
}

export function getCardRankName(val) {
  return RANK_NAMES[val] || String(val)
}

export function getCardRankPlural(val) {
  return RANK_PLURALS[val] || `${val}s`
}

export function getSuitName(suitKeyOrSymbol) {
  return SUIT_NAMES[suitKeyOrSymbol] || 'Cards'
}

export function describePreflopHand(card1, card2) {
  if (!card1 || !card2) return 'High Card'
  const isPair = card1.val === card2.val
  const highVal = Math.max(card1.val, card2.val)
  const lowVal = Math.min(card1.val, card2.val)
  const isSuited = card1.suitKey === card2.suitKey || (card1.suit && card1.suit === card2.suit)

  if (isPair) {
    return `Pocket ${getCardRankPlural(highVal)}`
  }

  const highName = getCardRankName(highVal)
  const lowName = getCardRankName(lowVal)
  const suitedLabel = isSuited ? 'Suited' : 'Offsuit'

  return `${highName}-${lowName} ${suitedLabel}`
}

/**
 * Evaluates best 5-card combination from up to 7 cards
 */
export function evaluate7CardHand(cards) {
  if (!cards || cards.length === 0) {
    return { score: 0, name: 'NO CARDS', rank: 0, bestFiveCards: [] }
  }

  // Pre-flop: 2 Hole Cards evaluation
  if (cards.length === 2) {
    const isPair = cards[0].val === cards[1].val
    const highVal = Math.max(cards[0].val, cards[1].val)
    const lowVal = Math.min(cards[0].val, cards[1].val)
    const score = isPair ? 1e10 + highVal * 1e8 : highVal * 1e8 + lowVal * 1e6
    return {
      score,
      name: describePreflopHand(cards[0], cards[1]),
      rank: isPair ? 1 : 0,
      matchingCards: isPair ? cards : [],
      bestFiveCards: cards
    }
  }

  if (cards.length < 5) {
    const sortedSmall = [...cards].sort((a, b) => b.val - a.val)
    return {
      score: sortedSmall[0].val * 1e8,
      name: `High Card ${getCardRankName(sortedSmall[0].val)}`,
      rank: 0,
      matchingCards: [],
      bestFiveCards: sortedSmall
    }
  }

  const sorted = [...cards].sort((a, b) => b.val - a.val)

  // 1. Check Flush
  const suitGroups = {}
  for (const c of sorted) {
    suitGroups[c.suitKey] = suitGroups[c.suitKey] || []
    suitGroups[c.suitKey].push(c)
  }

  let flushSuit = null
  for (const [sk, sCards] of Object.entries(suitGroups)) {
    if (sCards.length >= 5) {
      flushSuit = sk
      break
    }
  }

  // Helper for straight check
  const getStraight = (cardList) => {
    const uniqueVals = []
    const valMap = {}
    for (const c of cardList) {
      if (!valMap[c.val]) {
        uniqueVals.push(c.val)
        valMap[c.val] = c
      }
    }
    // Ace-low support
    if (valMap[14]) {
      uniqueVals.push(1)
      valMap[1] = valMap[14]
    }

    uniqueVals.sort((a, b) => b - a)

    for (let i = 0; i <= uniqueVals.length - 5; i++) {
      const top = uniqueVals[i]
      if (
        uniqueVals[i + 1] === top - 1 &&
        uniqueVals[i + 2] === top - 2 &&
        uniqueVals[i + 3] === top - 3 &&
        uniqueVals[i + 4] === top - 4
      ) {
        return {
          topVal: top,
          cards: [valMap[top], valMap[top - 1], valMap[top - 2], valMap[top - 3], valMap[top - 4]]
        }
      }
    }
    return null
  }

  // Check Straight Flush & Royal Flush
  if (flushSuit) {
    const flushCards = suitGroups[flushSuit].sort((a, b) => b.val - a.val)
    const straightFlush = getStraight(flushCards)
    if (straightFlush) {
      const suitName = getSuitName(flushSuit)
      if (straightFlush.topVal === 14) {
        return {
          score: 9e10,
          name: `Royal Flush (${suitName})`,
          rank: 9,
          matchingCards: straightFlush.cards,
          bestFiveCards: straightFlush.cards
        }
      }
      const topName = straightFlush.topVal === 5 ? '5' : getCardRankName(straightFlush.topVal)
      const specialName = straightFlush.topVal === 5 ? ' (Steel Wheel)' : ''
      return {
        score: 8e10 + straightFlush.topVal * 1e8,
        name: `Straight Flush, ${topName} High (${suitName})${specialName}`,
        rank: 8,
        matchingCards: straightFlush.cards,
        bestFiveCards: straightFlush.cards
      }
    }
  }

  // Count Value Frequencies
  const valCounts = {}
  for (const c of sorted) {
    valCounts[c.val] = (valCounts[c.val] || 0) + 1
  }

  const counts = Object.entries(valCounts).map(([v, count]) => ({
    val: Number(v),
    count
  }))

  // Sort by count desc, then val desc
  counts.sort((a, b) => b.count - a.count || b.val - a.val)

  // 2. Four of a Kind
  if (counts[0].count === 4) {
    const quadVal = counts[0].val
    const quadCards = sorted.filter(c => c.val === quadVal)
    const kicker = sorted.find(c => c.val !== quadVal)
    return {
      score: 7e10 + quadVal * 1e8 + (kicker ? kicker.val * 1e6 : 0),
      name: `Four of a Kind, ${getCardRankPlural(quadVal)}`,
      rank: 7,
      matchingCards: quadCards,
      bestFiveCards: [...quadCards, kicker].filter(Boolean)
    }
  }

  // 3. Full House
  if (counts[0].count === 3 && counts[1] && counts[1].count >= 2) {
    const tripleVal = counts[0].val
    const pairVal = counts[1].val
    const tripCards = sorted.filter(c => c.val === tripleVal).slice(0, 3)
    const pairCards = sorted.filter(c => c.val === pairVal).slice(0, 2)
    return {
      score: 6e10 + tripleVal * 1e8 + pairVal * 1e6,
      name: `Full House, ${getCardRankPlural(tripleVal)} full of ${getCardRankPlural(pairVal)}`,
      rank: 6,
      matchingCards: [...tripCards, ...pairCards],
      bestFiveCards: [...tripCards, ...pairCards]
    }
  }

  // 4. Flush
  if (flushSuit) {
    const top5Flush = suitGroups[flushSuit].slice(0, 5)
    let score = 5e10
    top5Flush.forEach((c, idx) => {
      score += c.val * Math.pow(10, 8 - idx * 2)
    })
    const suitName = getSuitName(flushSuit)
    return {
      score,
      name: `${getCardRankName(top5Flush[0].val)}-High Flush (${suitName})`,
      rank: 5,
      matchingCards: top5Flush,
      bestFiveCards: top5Flush
    }
  }

  // 5. Straight
  const straight = getStraight(sorted)
  if (straight) {
    let straightDesc = ''
    if (straight.topVal === 14) {
      straightDesc = 'Broadway Straight (10 to Ace)'
    } else if (straight.topVal === 5) {
      straightDesc = 'Wheel Straight (Ace to 5)'
    } else {
      straightDesc = `Straight, ${getCardRankName(straight.topVal - 4)} to ${getCardRankName(straight.topVal)}`
    }
    return {
      score: 4e10 + straight.topVal * 1e8,
      name: straightDesc,
      rank: 4,
      matchingCards: straight.cards,
      bestFiveCards: straight.cards
    }
  }

  // 6. Three of a Kind
  if (counts[0].count === 3) {
    const tripVal = counts[0].val
    const tripCards = sorted.filter(c => c.val === tripVal).slice(0, 3)
    const kickers = sorted.filter(c => c.val !== tripVal).slice(0, 2)
    let score = 3e10 + tripVal * 1e8
    kickers.forEach((c, idx) => {
      score += c.val * Math.pow(10, 6 - idx * 2)
    })
    return {
      score,
      name: `Three of a Kind, ${getCardRankPlural(tripVal)}`,
      rank: 3,
      matchingCards: tripCards,
      bestFiveCards: [...tripCards, ...kickers]
    }
  }

  // 7. Two Pair
  if (counts[0].count === 2 && counts[1] && counts[1].count === 2) {
    const highPair = counts[0].val
    const lowPair = counts[1].val
    const pair1 = sorted.filter(c => c.val === highPair).slice(0, 2)
    const pair2 = sorted.filter(c => c.val === lowPair).slice(0, 2)
    const kicker = sorted.find(c => c.val !== highPair && c.val !== lowPair)
    const score = 2e10 + highPair * 1e8 + lowPair * 1e6 + (kicker ? kicker.val * 1e4 : 0)
    return {
      score,
      name: `Two Pair, ${getCardRankPlural(highPair)} and ${getCardRankPlural(lowPair)}`,
      rank: 2,
      matchingCards: [...pair1, ...pair2],
      bestFiveCards: [...pair1, ...pair2, kicker].filter(Boolean)
    }
  }

  // 8. One Pair
  if (counts[0].count === 2) {
    const pairVal = counts[0].val
    const pairCards = sorted.filter(c => c.val === pairVal).slice(0, 2)
    const kickers = sorted.filter(c => c.val !== pairVal).slice(0, 3)
    let score = 1e10 + pairVal * 1e8
    kickers.forEach((c, idx) => {
      score += c.val * Math.pow(10, 6 - idx * 2)
    })
    return {
      score,
      name: `Pair of ${getCardRankPlural(pairVal)}`,
      rank: 1,
      matchingCards: pairCards,
      bestFiveCards: [...pairCards, ...kickers]
    }
  }

  // 9. High Card
  const top5 = sorted.slice(0, 5)
  let score = 0
  top5.forEach((c, idx) => {
    score += c.val * Math.pow(10, 8 - idx * 2)
  })
  return {
    score,
    name: `High Card ${getCardRankName(top5[0].val)}`,
    rank: 0,
    matchingCards: [],
    bestFiveCards: top5
  }
}

/**
 * Returns index of next active player who can take action (not folded, not busted, not all-in)
 */
export function getNextActionablePlayerIndex(players, startIndex) {
  const total = players.length
  if (total === 0) return -1

  for (let i = 1; i <= total; i++) {
    const idx = (startIndex + i) % total
    const p = players[idx]
    if (p && p.isSeated && !p.folded && !p.isBusted && !p.isSittingOut && !p.isAllIn && p.bankroll > 0) {
      return idx
    }
  }
  return -1
}

/**
 * Determines starting action position for a street
 */
export function getStartingPlayerIndex(state, phase) {
  const total = state.players.length
  const activeCount = state.players.filter(p => p.isSeated && !p.isBusted && !p.isSittingOut).length
  const isHeadsUp = activeCount === 2

  if (phase === GamePhase.PRE_FLOP) {
    if (isHeadsUp) {
      // In Heads-up: Dealer Button is SB and acts FIRST pre-flop
      return state.dealerButtonIndex
    }
    // In 3+ Players: Action starts at UTG (Left of BB = bbIndex + 1)
    const bbIndex = state.bbIndex
    return getNextActionablePlayerIndex(state.players, bbIndex)
  } else {
    // Post-Flop: Action starts at first active player to the left of the Button
    return getNextActionablePlayerIndex(state.players, state.dealerButtonIndex)
  }
}

/**
 * Determines if the current betting round is settled
 */
export function isBettingRoundComplete(state) {
  const activePlayers = state.players.filter(
    p => p.isSeated && !p.folded && !p.isBusted && !p.isSittingOut
  )

  // 1. Single survivor left (everyone else folded)
  if (activePlayers.length <= 1) {
    return true
  }

  // Actionable players (can still bet/call/check)
  const actionablePlayers = activePlayers.filter(p => !p.isAllIn && p.bankroll > 0)

  // 2. All active players are All-In or only 1 actionable player left who has matched the highest bet
  if (actionablePlayers.length === 0) {
    return true
  }

  if (actionablePlayers.length === 1 && activePlayers.some(p => p.isAllIn)) {
    const p = actionablePlayers[0]
    if (p.hasActed && p.roundBet >= state.currentRoundHighBet) {
      return true
    }
  }

  // 3. Normal betting completion:
  // Every actionable player must have acted at least once AND their round bet must equal the current round high bet
  return actionablePlayers.every(
    p => p.hasActed && p.roundBet === state.currentRoundHighBet
  )
}

/**
 * Calculates Main Pot and Side Pots with eligible contenders for all-in scenarios
 */
export function calculateSidePots(players) {
  const contributors = players
    .filter(p => p.isSeated && p.totalHandBet > 0)
    .map(p => ({
      id: p.id,
      name: p.name,
      totalBet: p.totalHandBet,
      folded: p.folded,
      isAllIn: p.isAllIn
    }))

  if (contributors.length === 0) return []

  const pots = []
  let currentCovered = 0

  // Unique bet levels from all players sorted ascending
  const betLevels = [...new Set(contributors.map(c => c.totalBet))].sort((a, b) => a - b)

  for (const level of betLevels) {
    const potContributionPerPlayer = level - currentCovered
    if (potContributionPerPlayer <= 0) continue

    const eligibleContributors = contributors.filter(c => c.totalBet >= level)
    const potAmount = eligibleContributors.length * potContributionPerPlayer

    const eligibleWinners = contributors
      .filter(c => !c.folded && c.totalBet >= level)
      .map(c => c.id)

    if (potAmount > 0) {
      pots.push({
        amount: potAmount,
        eligibleWinnerIds: eligibleWinners,
        isSidePot: pots.length > 0
      })
    }

    currentCovered = level
  }

  return pots
}

/**
 * Initializes a new hand with Button rotation and Blinds posting
 */
export function startNewHand(prevState, customDeck = null) {
  const totalPlayers = prevState.players.length
  const seatedPlayers = prevState.players.filter(p => p.isSeated && !p.isSittingOut && (p.bankroll >= prevState.bbAmount || p.bankroll > 0))

  if (seatedPlayers.length < 2) {
    return {
      ...prevState,
      phase: GamePhase.IDLE,
      statusMessage: 'WAITING FOR PLAYERS (MIN 2)'
    }
  }

  // Rotate Dealer Button to next seated, eligible player
  let nextButton = (prevState.dealerButtonIndex + 1) % totalPlayers
  while (!prevState.players[nextButton]?.isSeated || prevState.players[nextButton]?.isSittingOut || prevState.players[nextButton]?.bankroll <= 0) {
    nextButton = (nextButton + 1) % totalPlayers
  }

  const isHeadsUp = seatedPlayers.length === 2

  // Determine SB and BB positions
  let sbIndex = nextButton
  let bbIndex = nextButton

  if (isHeadsUp) {
    // Heads-up: Dealer Button = SB
    sbIndex = nextButton
    bbIndex = (nextButton + 1) % totalPlayers
    while (!prevState.players[bbIndex]?.isSeated || prevState.players[bbIndex]?.isSittingOut || prevState.players[bbIndex]?.bankroll <= 0) {
      bbIndex = (bbIndex + 1) % totalPlayers
    }
  } else {
    // 3+ Players: SB = Button + 1, BB = Button + 2
    sbIndex = (nextButton + 1) % totalPlayers
    while (!prevState.players[sbIndex]?.isSeated || prevState.players[sbIndex]?.isSittingOut || prevState.players[sbIndex]?.bankroll <= 0) {
      sbIndex = (sbIndex + 1) % totalPlayers
    }

    bbIndex = (sbIndex + 1) % totalPlayers
    while (!prevState.players[bbIndex]?.isSeated || prevState.players[bbIndex]?.isSittingOut || prevState.players[bbIndex]?.bankroll <= 0 || bbIndex === sbIndex) {
      bbIndex = (bbIndex + 1) % totalPlayers
    }
  }

  const sbAmt = prevState.sbAmount || 250
  const bbAmt = prevState.bbAmount || 500

  const deck = customDeck || createShuffledDeck()

  // Reset players and post blinds
  const updatedPlayers = prevState.players.map((p, idx) => {
    if (!p.isSeated || p.isSittingOut || p.bankroll <= 0) {
      return {
        ...p,
        cards: [],
        roundBet: 0,
        totalHandBet: 0,
        folded: true,
        isBusted: p.bankroll <= 0,
        isAllIn: false,
        hasActed: true,
        lastAction: p.bankroll <= 0 ? 'BUSTED' : 'WAITING'
      }
    }

    let blindDeducted = 0
    let lastAction = ''
    if (idx === sbIndex) {
      blindDeducted = Math.min(p.bankroll, sbAmt)
      lastAction = `SB $${blindDeducted}`
    } else if (idx === bbIndex) {
      blindDeducted = Math.min(p.bankroll, bbAmt)
      lastAction = `BB $${blindDeducted}`
    }

    const isAllIn = blindDeducted > 0 && p.bankroll - blindDeducted === 0
    const holeCards = [deck.pop(), deck.pop()]

    return {
      ...p,
      cards: holeCards,
      bankroll: p.bankroll - blindDeducted,
      roundBet: blindDeducted,
      totalHandBet: blindDeducted,
      folded: false,
      isBusted: false,
      isAllIn,
      hasActed: false,
      lastAction
    }
  })

  const startPot = updatedPlayers.reduce((sum, p) => sum + p.roundBet, 0)
  const highBet = bbAmt

  // Pre-flop Starting Turn:
  // Heads-up: SB (Dealer Button)
  // 3+ Players: UTG (Player after BB)
  const utgIndex = isHeadsUp
    ? sbIndex
    : getNextActionablePlayerIndex(updatedPlayers, bbIndex)

  return {
    ...prevState,
    phase: GamePhase.PRE_FLOP,
    deck,
    communityCards: [],
    dealerButtonIndex: nextButton,
    sbIndex,
    bbIndex,
    currentRoundHighBet: highBet,
    minRaise: bbAmt,
    totalPot: startPot,
    currentTurnIndex: utgIndex,
    players: updatedPlayers,
    sidePots: [],
    winners: [],
    winningHandName: '',
    showdownPotsSummary: []
  }
}

/**
 * Executes a player action (CHECK, CALL, BET, RAISE, ALL_IN, FOLD)
 */
export function executePlayerAction(state, playerIndex, actionType, amount = 0) {
  if (state.phase === GamePhase.SHOWDOWN || state.phase === GamePhase.HAND_RESOLVED) {
    return state
  }

  const player = state.players[playerIndex]
  if (!player || player.folded || player.isAllIn || player.bankroll <= 0) {
    const nextTurnIndex = getNextActionablePlayerIndex(state.players, playerIndex)
    if (isBettingRoundComplete(state)) {
      return advanceStreet(state)
    }
    return { ...state, currentTurnIndex: nextTurnIndex }
  }

  let newRoundBet = player.roundBet
  let newBankroll = player.bankroll
  let newTotalHandBet = player.totalHandBet
  let newHighBet = state.currentRoundHighBet
  let newMinRaise = state.minRaise
  let isAllIn = player.isAllIn
  let isFolded = player.folded
  let lastAction = ''

  const callNeeded = Math.max(0, state.currentRoundHighBet - player.roundBet)

  switch (actionType) {
    case PlayerActionType.FOLD: {
      isFolded = true
      lastAction = 'FOLD'
      break
    }

    case PlayerActionType.CHECK: {
      if (callNeeded > 0) {
        // Fallback: If cannot check due to facing a bet, fold
        isFolded = true
        lastAction = 'FOLD'
      } else {
        lastAction = 'CHECK'
      }
      break
    }

    case PlayerActionType.CALL: {
      const toAdd = Math.min(newBankroll, callNeeded)
      newBankroll -= toAdd
      newRoundBet += toAdd
      newTotalHandBet += toAdd
      if (newBankroll === 0) isAllIn = true
      lastAction = isAllIn ? `CALL $${toAdd} (ALL-IN)` : `CALL $${toAdd}`
      break
    }

    case PlayerActionType.BET:
    case PlayerActionType.RAISE: {
      const targetRaiseTotal = Math.max(state.currentRoundHighBet + state.minRaise, amount)
      const toAdd = targetRaiseTotal - player.roundBet

      if (toAdd > newBankroll) {
        // Player doesn't have enough for full raise -> Convert to All-In
        const allInAdd = newBankroll
        const finalBet = player.roundBet + allInAdd
        newBankroll = 0
        newRoundBet = finalBet
        newTotalHandBet += allInAdd
        isAllIn = true
        lastAction = `ALL-IN $${finalBet}`

        if (finalBet > newHighBet) {
          const diff = finalBet - newHighBet
          const isFullRaise = diff >= state.minRaise
          if (isFullRaise) {
            newMinRaise = diff
          }
          newHighBet = finalBet

          // Full Bet Rule: Re-open action for active players facing the new bet
          state.players.forEach((p, idx) => {
            if (idx !== playerIndex && !p.folded && !p.isAllIn) {
              if (isFullRaise || p.roundBet < newHighBet) {
                p.hasActed = false
              }
            }
          })
        }
      } else {
        const raiseDiff = targetRaiseTotal - state.currentRoundHighBet
        newMinRaise = Math.max(state.minRaise, raiseDiff)
        newHighBet = targetRaiseTotal

        newBankroll -= toAdd
        newRoundBet = targetRaiseTotal
        newTotalHandBet += toAdd
        if (newBankroll === 0) isAllIn = true
        lastAction = isAllIn ? `ALL-IN $${targetRaiseTotal}` : `RAISE TO $${targetRaiseTotal}`

        // Re-open action for all other active players
        state.players.forEach((p, idx) => {
          if (idx !== playerIndex && !p.folded && !p.isAllIn) {
            p.hasActed = false
          }
        })
      }
      break
    }

    case PlayerActionType.ALL_IN: {
      const allInAdd = newBankroll
      const finalBet = player.roundBet + allInAdd
      newBankroll = 0
      newRoundBet = finalBet
      newTotalHandBet += allInAdd
      isAllIn = true
      lastAction = `ALL-IN $${finalBet}`

      if (finalBet > newHighBet) {
        const diff = finalBet - newHighBet
        const isFullRaise = diff >= state.minRaise
        if (isFullRaise) {
          newMinRaise = diff
        }
        newHighBet = finalBet

        // Full Bet Rule: Re-open action for active players facing the new bet
        state.players.forEach((p, idx) => {
          if (idx !== playerIndex && !p.folded && !p.isAllIn) {
            if (isFullRaise || p.roundBet < newHighBet) {
              p.hasActed = false
            }
          }
        })
      }
      break
    }

    default:
      return state
  }

  // Update acting player
  const updatedPlayers = state.players.map((p, idx) => {
    if (idx === playerIndex) {
      return {
        ...p,
        bankroll: newBankroll,
        roundBet: newRoundBet,
        totalHandBet: newTotalHandBet,
        isAllIn,
        folded: isFolded,
        hasActed: true,
        lastAction
      }
    }
    return p
  })

  const updatedPot = updatedPlayers.reduce((sum, p) => sum + p.totalHandBet, 0)
  const currentSidePots = calculateSidePots(updatedPlayers)

  const nextState = {
    ...state,
    players: updatedPlayers,
    currentRoundHighBet: newHighBet,
    minRaise: newMinRaise,
    totalPot: updatedPot,
    sidePots: currentSidePots
  }

  // Check if only 1 survivor left (everyone else folded)
  const activeUnfolded = updatedPlayers.filter(p => p.isSeated && !p.folded)
  if (activeUnfolded.length === 1) {
    const survivor = activeUnfolded[0]
    const resolvedPlayers = updatedPlayers.map(p => {
      if (p.id === survivor.id) {
        return {
          ...p,
          bankroll: p.bankroll + updatedPot
        }
      }
      return p
    })

    return {
      ...nextState,
      phase: GamePhase.HAND_RESOLVED,
      players: resolvedPlayers,
      currentTurnIndex: -1,
      winners: [{
        id: survivor.id,
        name: survivor.name,
        payout: updatedPot,
        handName: 'ALL OPPONENTS FOLDED'
      }],
      winningHandName: 'UNCONTESTED'
    }
  }

  // Check if betting round is complete
  if (isBettingRoundComplete(nextState)) {
    return advanceStreet(nextState)
  }

  // Otherwise, advance turn clockwise to next active player
  const nextTurnIndex = getNextActionablePlayerIndex(updatedPlayers, playerIndex)
  return {
    ...nextState,
    currentTurnIndex: nextTurnIndex
  }
}

/**
 * Advances the street (PRE_FLOP -> FLOP -> TURN -> RIVER -> SHOWDOWN)
 */
export function advanceStreet(state) {
  const deck = state.deck ? [...state.deck] : []
  const community = state.communityCards ? [...state.communityCards] : []

  // Reset street round bets
  const resetPlayers = state.players.map(p => ({
    ...p,
    roundBet: 0,
    hasActed: p.folded || p.isAllIn || p.bankroll <= 0
  }))

  let nextPhase = state.phase

  if (state.phase === GamePhase.PRE_FLOP) {
    nextPhase = GamePhase.FLOP
    deck.pop() // Burn
    community.push(deck.pop(), deck.pop(), deck.pop()) // Deal 3 Flop cards
  } else if (state.phase === GamePhase.FLOP) {
    nextPhase = GamePhase.TURN
    deck.pop() // Burn
    community.push(deck.pop()) // Deal Turn card
  } else if (state.phase === GamePhase.TURN) {
    nextPhase = GamePhase.RIVER
    deck.pop() // Burn
    community.push(deck.pop()) // Deal River card
  } else if (state.phase === GamePhase.RIVER) {
    nextPhase = GamePhase.SHOWDOWN
  }

  // If players are all-in and no further betting can happen, auto-runout remaining board cards
  const actionablePlayers = resetPlayers.filter(p => p.isSeated && !p.folded && !p.isAllIn && p.bankroll > 0)
  if (actionablePlayers.length <= 1 && nextPhase !== GamePhase.SHOWDOWN) {
    while (community.length < 5 && deck.length > 0) {
      deck.pop() // Burn
      community.push(deck.pop())
    }
    nextPhase = GamePhase.SHOWDOWN
  }

  const updatedSidePots = calculateSidePots(resetPlayers)

  if (nextPhase === GamePhase.SHOWDOWN) {
    return evaluateShowdownAndDistributePots({
      ...state,
      phase: GamePhase.SHOWDOWN,
      deck,
      communityCards: community,
      currentRoundHighBet: 0,
      minRaise: state.bbAmount,
      players: resetPlayers,
      sidePots: updatedSidePots,
      currentTurnIndex: -1
    })
  }

  // Determine starting player for post-flop street (first active left of Button)
  const nextTurnIndex = getStartingPlayerIndex(
    { ...state, players: resetPlayers },
    nextPhase
  )

  return {
    ...state,
    phase: nextPhase,
    deck,
    communityCards: community,
    currentRoundHighBet: 0,
    minRaise: state.bbAmount,
    players: resetPlayers,
    sidePots: updatedSidePots,
    currentTurnIndex: nextTurnIndex
  }
}

/**
 * Resolves Showdown, evaluates all eligible 7-card hands, and distributes Main & Side Pots
 */
export function evaluateShowdownAndDistributePots(state) {
  const community = state.communityCards
  const evaluatedPlayers = state.players.map(p => {
    if (!p.isSeated || p.folded || !p.cards || p.cards.length < 2) {
      return { ...p, handEval: null }
    }
    const evalResult = evaluate7CardHand([...p.cards, ...community])
    return {
      ...p,
      handEval: evalResult,
      handName: evalResult.name
    }
  })

  const sidePots = state.sidePots.length > 0 ? state.sidePots : calculateSidePots(evaluatedPlayers)
  const payouts = {}
  const potSummaries = []
  const totalSeats = state.players.length

  // Helper to compute order clockwise starting from first seat left of dealer button
  const getClockwiseOrderFromLeftOfButton = (playerIndex) => {
    const btn = state.dealerButtonIndex !== undefined ? state.dealerButtonIndex : 0
    return (playerIndex - (btn + 1) + totalSeats) % totalSeats
  }

  // Distribute each side pot / main pot to highest hand among eligible contenders
  sidePots.forEach((pot, potIdx) => {
    let eligibleContenders = evaluatedPlayers.filter(
      p => pot.eligibleWinnerIds.includes(p.id) && p.handEval
    )

    // Fallback if all contenders in this tier folded: roll down to active evaluated players
    if (eligibleContenders.length === 0) {
      eligibleContenders = evaluatedPlayers.filter(p => !p.folded && p.handEval)
    }

    if (eligibleContenders.length === 0) return

    const maxScore = Math.max(...eligibleContenders.map(c => c.handEval.score))
    const potWinners = eligibleContenders.filter(c => c.handEval.score === maxScore)

    // Odd Chip Rule (TDA / WSOP):
    // Distribute floor amount to each winner, then award remaining odd chips (1 chip each)
    // to winners starting from the player closest to the left of the button.
    const baseSplit = Math.floor(pot.amount / potWinners.length)
    const remainder = pot.amount % potWinners.length

    // Sort pot winners by clockwise order from left of button (closest to button+1 receives first)
    const sortedPotWinners = [...potWinners].sort((a, b) => {
      const idxA = evaluatedPlayers.findIndex(p => p.id === a.id)
      const idxB = evaluatedPlayers.findIndex(p => p.id === b.id)
      return getClockwiseOrderFromLeftOfButton(idxA) - getClockwiseOrderFromLeftOfButton(idxB)
    })

    sortedPotWinners.forEach((w, wIdx) => {
      const oddChip = wIdx < remainder ? 1 : 0
      const winAmount = baseSplit + oddChip
      payouts[w.id] = (payouts[w.id] || 0) + winAmount
    })

    potSummaries.push({
      potIndex: potIdx,
      isSidePot: pot.isSidePot,
      amount: pot.amount,
      winners: potWinners.map(w => ({ id: w.id, name: w.name, handName: w.handEval.name })),
      splitPayout: baseSplit
    })
  })

  // Update bankrolls with payouts
  const finalPlayers = evaluatedPlayers.map(p => {
    const payout = payouts[p.id] || 0
    return {
      ...p,
      bankroll: p.bankroll + payout,
      isBusted: (p.bankroll + payout) < (state.bbAmount || 500)
    }
  })

  // Format global winners list
  const winnerEntries = Object.entries(payouts).map(([pId, payoutAmt]) => {
    const p = finalPlayers.find(x => x.id === pId)
    return {
      id: pId,
      name: p?.name || 'PLAYER',
      payout: payoutAmt,
      handName: p?.handEval?.name || 'WINNER'
    }
  })

  const topWinningHand = winnerEntries[0]?.handName || 'SHOWDOWN COMPLETE'

  return {
    ...state,
    phase: GamePhase.HAND_RESOLVED,
    players: finalPlayers,
    winners: winnerEntries,
    winningHandName: topWinningHand,
    showdownPotsSummary: potSummaries,
    currentTurnIndex: -1
  }
}
