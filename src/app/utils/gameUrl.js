// Utility to generate and parse rich URL slugs and query URIs for PokerHub

export function getOrCreateUserId() {
  if (typeof window === 'undefined') return 'usr_highroller_99'
  let id = null
  try {
    id = localStorage.getItem('pokehub_user_id')
  } catch {
    // ignore
  }
  if (!id) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase()
    id = `usr_${randomHex}`
    try {
      localStorage.setItem('pokehub_user_id', id)
    } catch {
      // localStorage may fail in private mode
    }
  }
  return id
}

export function generateGameId(prefix = 'holdem') {
  const timestamp = Date.now().toString(36).slice(-4)
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${prefix}_${timestamp}${randomSuffix}`
}

export function generateGameUrl(params = {}) {
  const userId = params.userId || getOrCreateUserId()
  const gameId = params.gameId || generateGameId()
  const table = params.table || 'macau_nlh_500'
  const stakes = params.stakes || '250-500'
  let skin = params.skin
  if (!skin && typeof window !== 'undefined') {
    try {
      skin = localStorage.getItem('pokehub_equipped_deck') || 'obsidian'
    } catch {
      skin = 'obsidian'
    }
  } else if (!skin) {
    skin = 'obsidian'
  }
  const mode = params.mode || 'texas_holdem'
  const duel = params.duel !== undefined ? params.duel : null

  const searchParams = new URLSearchParams()
  searchParams.set('userId', userId)
  searchParams.set('gameId', gameId)
  searchParams.set('table', table)
  searchParams.set('stakes', stakes)
  searchParams.set('skin', skin === 'classic' ? 'gold' : skin)
  searchParams.set('mode', mode)
  if (duel) {
    searchParams.set('duel', String(duel))
  }

  // Support any extra query parameters
  Object.entries(params).forEach(([key, val]) => {
    if (!['userId', 'gameId', 'table', 'stakes', 'skin', 'mode', 'duel'].includes(key) && val !== undefined && val !== null) {
      searchParams.set(key, String(val))
    }
  })

  return `/game?${searchParams.toString()}`
}

export function parseGameUrlParams(searchString) {
  if (typeof window === 'undefined' && !searchString) {
    return {
      userId: 'usr_highroller_99',
      gameId: 'holdem_session_01',
      table: 'macau_nlh_500',
      stakes: '250-500',
      skin: 'obsidian',
      mode: 'texas_holdem',
      duel: null,
      hand: '1'
    }
  }

  const query = searchString !== undefined ? searchString : (typeof window !== 'undefined' ? window.location.search : '')
  const params = new URLSearchParams(query)

  const userId = params.get('userId') || getOrCreateUserId()
  const gameId = params.get('gameId') || generateGameId()
  const table = params.get('table') || 'macau_nlh_500'
  const stakes = params.get('stakes') || '250-500'
  const rawSkin = params.get('skin') || 'obsidian'
  const skin = rawSkin === 'classic' ? 'gold' : rawSkin
  const mode = params.get('mode') || 'texas_holdem'
  const duel = params.get('duel') || null
  const hand = params.get('hand') || '1'

  return {
    userId,
    gameId,
    table,
    stakes,
    skin,
    mode,
    duel,
    hand
  }
}
