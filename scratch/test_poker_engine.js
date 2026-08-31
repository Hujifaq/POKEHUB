import {
  GamePhase,
  PlayerActionType,
  createShuffledDeck,
  evaluate7CardHand,
  calculateSidePots,
  startNewHand,
  executePlayerAction,
  isBettingRoundComplete
} from '../src/app/utils/pokerEngine.js'

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message)
    process.exit(1)
  } else {
    console.log('✅ PASS:', message)
  }
}

console.log('--- TEST 1: Hand Evaluation ---')
const royalFlush = evaluate7CardHand([
  { val: 10, suitKey: 'hearts' },
  { val: 11, suitKey: 'hearts' },
  { val: 12, suitKey: 'hearts' },
  { val: 13, suitKey: 'hearts' },
  { val: 14, suitKey: 'hearts' },
  { val: 2, suitKey: 'spades' },
  { val: 3, suitKey: 'clubs' }
])
assert(royalFlush.name.includes('Royal Flush'), 'Royal flush evaluated correctly')

const fullHouse = evaluate7CardHand([
  { val: 14, suitKey: 'spades' },
  { val: 14, suitKey: 'hearts' },
  { val: 14, suitKey: 'diamonds' },
  { val: 13, suitKey: 'clubs' },
  { val: 13, suitKey: 'hearts' },
  { val: 2, suitKey: 'clubs' },
  { val: 5, suitKey: 'spades' }
])
assert(fullHouse.rank === 6, 'Full house rank is 6')

console.log('\n--- TEST 2: Side Pot Calculation ---')
// 3 players: Player A has $500 all-in, Player B has $1500 all-in, Player C has $3000 (calls/bets 1500)
const sidePotPlayers = [
  { id: 'A', name: 'Player A', totalHandBet: 500, isAllIn: true, folded: false, isSeated: true },
  { id: 'B', name: 'Player B', totalHandBet: 1500, isAllIn: true, folded: false, isSeated: true },
  { id: 'C', name: 'Player C', totalHandBet: 1500, isAllIn: false, folded: false, isSeated: true }
]
const pots = calculateSidePots(sidePotPlayers)
assert(pots.length === 2, 'Two pots created (Main Pot + Side Pot 1)')
assert(pots[0].amount === 1500, 'Main pot is $500 * 3 = $1500')
assert(pots[0].eligibleWinnerIds.length === 3, 'All 3 players eligible for Main Pot')
assert(pots[1].amount === 2000, 'Side Pot 1 is ($1500 - $500) * 2 = $2000')
assert(pots[1].eligibleWinnerIds.includes('B') && pots[1].eligibleWinnerIds.includes('C') && !pots[1].eligibleWinnerIds.includes('A'), 'Only B and C eligible for Side Pot 1')

console.log('\n--- TEST 3: Pre-Flop Game Flow & Turn Order (3 Players) ---')
// Setup 3-player table: 0: Hero, 1: Bot 1, 2: Bot 2
const initialState = {
  phase: GamePhase.IDLE,
  dealerButtonIndex: 2, // Button is at Index 2 (Bot 2) -> SB is Index 0 (Hero), BB is Index 1 (Bot 1)
  sbAmount: 250,
  bbAmount: 500,
  players: [
    { id: 'hero', name: 'Hero', bankroll: 10000, isSeated: true, folded: false, isBusted: false, isSittingOut: false },
    { id: 'bot1', name: 'Bot 1', bankroll: 10000, isSeated: true, folded: false, isBusted: false, isSittingOut: false },
    { id: 'bot2', name: 'Bot 2', bankroll: 10000, isSeated: true, folded: false, isBusted: false, isSittingOut: false }
  ]
}

// Start hand: Button rotates to 0 (Hero) -> SB is Index 1 (Bot 1), BB is Index 2 (Bot 2), UTG is Index 0 (Hero)
let state = startNewHand(initialState)
assert(state.phase === GamePhase.PRE_FLOP, 'Phase is PRE_FLOP')
assert(state.dealerButtonIndex === 0, 'Dealer Button rotated to 0 (Hero)')
assert(state.sbIndex === 1, 'SB is Index 1 (Bot 1)')
assert(state.bbIndex === 2, 'BB is Index 2 (Bot 2)')
assert(state.players[1].roundBet === 250, 'SB posted $250')
assert(state.players[2].roundBet === 500, 'BB posted $500')
assert(state.currentRoundHighBet === 500, 'High bet is $500')
assert(state.currentTurnIndex === 0, 'Action starts at UTG Index 0 (Hero)')

// 1. Hero calls $500
state = executePlayerAction(state, 0, PlayerActionType.CALL)
assert(state.players[0].roundBet === 500, 'Hero called $500')
assert(state.currentTurnIndex === 1, 'Turn advances to SB (Index 1)')

// 2. SB calls $250 more (to match $500)
state = executePlayerAction(state, 1, PlayerActionType.CALL)
assert(state.players[1].roundBet === 500, 'SB completed to $500')
assert(state.currentTurnIndex === 2, 'Turn advances to BB (Index 2)')

// 3. BB checks (BB Option) -> Betting round complete -> Advances to FLOP!
state = executePlayerAction(state, 2, PlayerActionType.CHECK)
assert(state.phase === GamePhase.FLOP, 'Phase advanced to FLOP')
assert(state.communityCards.length === 3, 'Flop dealt 3 community cards')
assert(state.currentRoundHighBet === 0, 'Flop high bet reset to 0')
assert(state.currentTurnIndex === 1, 'Flop action begins at first active left of Button (Index 1 - SB)')

console.log('\n--- TEST 4: Post-Flop Turn Order & Raise Re-Opening Action ---')
// On Flop:
// 1. SB checks
state = executePlayerAction(state, 1, PlayerActionType.CHECK)
assert(state.currentTurnIndex === 2, 'Turn advances to BB (Index 2)')

// 2. BB bets $1000 (Raise to 1000)
state = executePlayerAction(state, 2, PlayerActionType.BET, 1000)
assert(state.currentRoundHighBet === 1000, 'High bet is now $1000')
assert(state.players[1].hasActed === false, 'SB hasActed re-opened to false')
assert(state.currentTurnIndex === 0, 'Turn advances to Button (Hero - Index 0)')

// 3. Hero folds
state = executePlayerAction(state, 0, PlayerActionType.FOLD)
assert(state.players[0].folded === true, 'Hero folded')
assert(state.currentTurnIndex === 1, 'Turn loops back to SB (Index 1) to respond to BB bet')

// 4. SB calls $1000 -> Betting round complete -> Advances to TURN!
state = executePlayerAction(state, 1, PlayerActionType.CALL)
assert(state.phase === GamePhase.TURN, 'Phase advanced to TURN')
assert(state.communityCards.length === 4, 'Turn dealt 4th card')

console.log('\n--- TEST 5: Uncontested Fold Bankroll Payout ---')
const foldGameState = {
  phase: GamePhase.IDLE,
  dealerButtonIndex: 0,
  sbAmount: 250,
  bbAmount: 500,
  players: [
    { id: 'P0', name: 'Player 0', bankroll: 10000, isSeated: true, folded: false, isBusted: false, isSittingOut: false },
    { id: 'P1', name: 'Player 1', bankroll: 10000, isSeated: true, folded: false, isBusted: false, isSittingOut: false }
  ]
}
let fGame = startNewHand(foldGameState) // Button 1, SB 1 (posted 250, bankroll 9750), BB 0 (posted 500, bankroll 9500), Pot = 750
// SB (Player 1) folds preflop
fGame = executePlayerAction(fGame, 1, PlayerActionType.FOLD)
assert(fGame.phase === GamePhase.HAND_RESOLVED, 'Game resolved on fold')
assert(fGame.players[0].bankroll === 10250, 'BB received full pot ($9,500 + $750 = $10,250)')

console.log('\n--- TEST 6: Odd Chip Distribution in Split Pot ---')
import { evaluateShowdownAndDistributePots } from '../src/app/utils/pokerEngine.js'
// 2 players tie for an odd pot of $751. Button is at 0.
// SB is Player 1 (left of button -> distance 1). BB is Player 0 (button -> distance 0).
// Player 1 (SB) is closest to left of button, so Player 1 gets the odd chip ($376) and Player 0 gets ($375).
const splitState = {
  phase: GamePhase.SHOWDOWN,
  dealerButtonIndex: 0,
  communityCards: [
    { val: 14, suitKey: 'spades' }, { val: 13, suitKey: 'hearts' }, { val: 12, suitKey: 'diamonds' }, { val: 11, suitKey: 'clubs' }, { val: 9, suitKey: 'spades' }
  ],
  sidePots: [{ amount: 751, eligibleWinnerIds: ['p0', 'p1'], isSidePot: false }],
  players: [
    { id: 'p0', name: 'P0', bankroll: 0, cards: [{ val: 2, suitKey: 'c' }, { val: 3, suitKey: 'd' }], folded: false, isSeated: true },
    { id: 'p1', name: 'P1', bankroll: 0, cards: [{ val: 4, suitKey: 'c' }, { val: 5, suitKey: 'd' }], folded: false, isSeated: true }
  ]
}
const showdownResult = evaluateShowdownAndDistributePots(splitState)
assert(showdownResult.players[1].bankroll === 376, 'Odd chip ($1) awarded to P1 (first seat left of button)')
assert(showdownResult.players[0].bankroll === 375, 'P0 received base split ($375)')

console.log('\n--- ALL UNIT TESTS PASSED PERFECTLY! ---')
