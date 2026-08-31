"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ----------------------------------------------------------------------
// SCRIPT DATA: 2-STEP CASINO RIFFLE & BRIDGE WATERFALL
// ----------------------------------------------------------------------
const SCENES = [
  {
    id: 0,
    tag: 'INTRO',
    headline: 'HOW TO PLAY',
    description: 'Master the table in 6 essential steps.',
    accentColor: '#FFE500'
  },
  {
    id: 1,
    tag: 'STEP 01: THE RIFFLE',
    headline: '01 / RIFFLE INTERLOCK',
    description: 'Split the deck and interleave cards edge-to-edge into a woven mesh.',
    accentColor: '#00F5FF'
  },
  {
    id: 2,
    tag: 'STEP 02: THE BRIDGE',
    headline: '02 / BRIDGE WATERFALL',
    description: 'Squeeze the arch and cascade the cards with that iconic money-counting flutter.',
    accentColor: '#FF70A6'
  }
]

// ----------------------------------------------------------------------
// PROCEDURAL TEXTURE GENERATORS (FLAT NEO-BRUTALIST / 8-BIT SUITE)
// ----------------------------------------------------------------------

const PIXEL_SUITS = {
  hearts: [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0]
  ],
  spades: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0]
  ],
  diamonds: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0]
  ],
  clubs: [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0]
  ]
}

const PIXEL_LETTERS = {
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1]
  ],
  K: [
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1]
  ],
  Q: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 1, 1]
  ],
  J: [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0]
  ],
  '10': [
    [1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1]
  ],
  10: [
    [1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1]
  ],
  '9': [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1]
  ],
  '8': [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
  ],
  '7': [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]
  ],
  '6': [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
  ],
  '5': [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1]
  ],
  '4': [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1]
  ],
  '3': [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1]
  ],
  '2': [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1]
  ]
}

const DEFAULT_GRAFFITI_MATRIX = [
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
]

const DEFAULT_FRONT_MOTIF = [
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
]

function drawPixelMatrix(ctx, startX, startY, size, matrix, color) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return
  ctx.fillStyle = color
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (row[c] === 1 || row[c] === true) {
        ctx.fillRect(Math.floor(startX + c * size), Math.floor(startY + r * size), Math.ceil(size), Math.ceil(size))
      }
    }
  }
}

function normalizeSuit(suit) {
  if (suit === '♥' || suit === 'hearts' || suit === 'heart') return 'hearts'
  if (suit === '♦' || suit === 'diamonds' || suit === 'diamond') return 'diamonds'
  if (suit === '♣' || suit === 'clubs' || suit === 'club') return 'clubs'
  return 'spades'
}

function roundedCardShape(w, h, r) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  return shape
}

function createRoundedCardGeometry(w, h, r, segments = 16) {
  const shape = roundedCardShape(w, h, r)
  const geom = new THREE.ShapeGeometry(shape, segments)
  geom.center()
  const uv = geom.attributes.uv
  const pos = geom.attributes.position
  geom.computeBoundingBox()
  const bb = geom.boundingBox
  if (bb) {
    const sx = bb.max.x - bb.min.x
    const sy = bb.max.y - bb.min.y
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy)
    }
    uv.needsUpdate = true
  }
  return geom
}

function createCardFaceCanvas(rank = 'A', rawSuit = 'spades') {
  const W = 512
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false

  const suitKey = normalizeSuit(rawSuit)
  const isRed = suitKey === 'hearts' || suitKey === 'diamonds'
  const rankColor = isRed ? '#D61F3D' : '#050505'
  const accentColor = '#B84A4A' // Default bot skin accent
  const cornerR = 28

  ctx.save()
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, W, H, cornerR)
  } else {
    ctx.rect(0, 0, W, H)
  }
  ctx.clip()

  // 1. Warm Creamy Porcelain Base (#FAF7F2)
  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, W, H)

  // 2. Faint Retro 8-Bit Dither Grid
  ctx.fillStyle = 'rgba(0, 0, 0, 0.035)'
  for (let y = 0; y < H; y += 8) {
    for (let x = (y % 16 === 0 ? 0 : 4); x < W; x += 8) {
      ctx.fillRect(x, y, 4, 4)
    }
  }

  // 4. Stepped Corner Accent Notches in default accent (#B84A4A)
  ctx.fillStyle = accentColor
  ctx.fillRect(14, 14, 24, 8)
  ctx.fillRect(14, 14, 8, 24)
  ctx.fillRect(W - 38, 14, 24, 8)
  ctx.fillRect(W - 22, 14, 8, 24)
  ctx.fillRect(14, H - 22, 24, 8)
  ctx.fillRect(14, H - 38, 8, 24)
  ctx.fillRect(W - 38, H - 22, 24, 8)
  ctx.fillRect(W - 22, H - 38, 8, 24)

  const suitMatrix = PIXEL_SUITS[suitKey] || PIXEL_SUITS.spades
  const rankMatrix = PIXEL_LETTERS[rank] || PIXEL_LETTERS['A']

  // 5. Top-Left Index (Rank & Suit)
  drawPixelMatrix(ctx, 36, 36, 9, rankMatrix, rankColor)
  drawPixelMatrix(ctx, 36, 92, 8, suitMatrix, rankColor)

  // 6. Bottom-Right Inverted Index
  ctx.save()
  ctx.translate(W, H)
  ctx.rotate(Math.PI)
  drawPixelMatrix(ctx, 36, 36, 9, rankMatrix, rankColor)
  drawPixelMatrix(ctx, 36, 92, 8, suitMatrix, rankColor)
  ctx.restore()

  // 7. Central Pixel Art Motif Box (Exact 1:1 match with Bot/Default Gameplay Card)
  const boxW = 230
  const boxH = 230
  const boxX = Math.floor((W - boxW) / 2)
  const boxY = Math.floor((H - boxH) / 2)

  // Hard drop shadow
  ctx.fillStyle = '#050505'
  ctx.fillRect(boxX + 10, boxY + 10, boxW, boxH)

  // White motif container body
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(boxX, boxY, boxW, boxH)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 8
  ctx.strokeRect(boxX, boxY, boxW, boxH)

  // Subtle interior glow
  ctx.fillStyle = `${accentColor}18`
  ctx.fillRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12)

  // Render centered motif matrix
  const pSize = 12.5
  const matW = DEFAULT_FRONT_MOTIF[0].length * pSize
  const matH = DEFAULT_FRONT_MOTIF.length * pSize
  const matX = Math.floor((W - matW) / 2)
  const matY = Math.floor((H - matH) / 2)
  drawPixelMatrix(ctx, matX, matY, pSize, DEFAULT_FRONT_MOTIF, accentColor)

  ctx.restore()

  // 3. Thick Neo-Brutalist Outer Rounded Border (14px)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 14
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(7, 7, W - 14, H - 14, cornerR - 4)
  } else {
    ctx.strokeRect(7, 7, W - 14, H - 14)
  }
  ctx.stroke()

  return canvas
}

function createCardBackCanvas() {
  const W = 512
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false
  const cornerR = 28

  ctx.save()
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, W, H, cornerR)
  } else {
    ctx.rect(0, 0, W, H)
  }
  ctx.clip()

  // 1. Classic Ivory Card Base (#FFF8EE)
  ctx.fillStyle = '#FFF8EE'
  ctx.fillRect(0, 0, W, H)

  // 3. Inner Coral/Rose Rectangular Field (#E58383) with rounded corners
  ctx.fillStyle = '#E58383'
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(24, 24, W - 48, H - 48, 16)
  } else {
    ctx.rect(24, 24, W - 48, H - 48)
  }
  ctx.fill()
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 8
  ctx.stroke()

  // 4. Stepped Corner Accents
  ctx.fillStyle = '#B84A4A'
  ctx.fillRect(24, 24, 28, 8)
  ctx.fillRect(24, 24, 8, 28)
  ctx.fillRect(W - 52, 24, 28, 8)
  ctx.fillRect(W - 32, 24, 8, 28)
  ctx.fillRect(24, H - 32, 28, 8)
  ctx.fillRect(24, H - 52, 8, 28)
  ctx.fillRect(W - 52, H - 32, 28, 8)
  ctx.fillRect(W - 32, H - 52, 8, 28)

  // 5. Classic 8-bit Lattice Matrix (Default Bot Pattern in #B84A4A)
  const pSize = 17
  const matW = DEFAULT_GRAFFITI_MATRIX[0].length * pSize
  const matH = DEFAULT_GRAFFITI_MATRIX.length * pSize
  const matX = Math.floor((W - matW) / 2)
  const matY = Math.floor((H - matH) / 2)

  drawPixelMatrix(ctx, matX, matY, pSize, DEFAULT_GRAFFITI_MATRIX, '#B84A4A')

  ctx.restore()

  // 2. Thick Outer Brutalist Rounded Border
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 14
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(7, 7, W - 14, H - 14, cornerR - 4)
  } else {
    ctx.strokeRect(7, 7, W - 14, H - 14)
  }
  ctx.stroke()

  return canvas
}

// ----------------------------------------------------------------------
// MAIN REACT COMPONENT: 2-STEP RIFFLE & BRIDGE (3/4 SIDEWAYS PERSPECTIVE)
// ----------------------------------------------------------------------

export default function RiffleShuffleSection({ containerRefProp }) {
  const localContainerRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)

  // Sound feedback on scene change
  const prevSceneRef = useRef(0)
  useEffect(() => {
    if (prevSceneRef.current !== activeSceneIndex) {
      prevSceneRef.current = activeSceneIndex
      SoundEngine.playCardFlip()
    }
  }, [activeSceneIndex])

  useEffect(() => {
    const container = containerRef.current
    const pinWrapper = pinWrapperRef.current
    const canvas = canvasRef.current
    if (!container || !pinWrapper || !canvas) return

    // 1. Scene & Camera Setup (3/4 SIDEWAYS ANGLE FOR ZERO-OCCLUSION 3D VIEW)
    const scene = new THREE.Scene()
    const width = pinWrapper.clientWidth || window.innerWidth
    const height = pinWrapper.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.set(0, 6.8, 10.8)
    camera.lookAt(0, 0.35, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // ------------------------------------------------------------------
    // 2. Physical Parameters for Full 52 Cards (Dynamic 3/4 Sideways Angle)
    // ------------------------------------------------------------------
    const CARD_W = 2.2
    const CARD_H = 3.2
    const STACK_GAP = 0.026 // Clear vertical separation between card layers
    const TOTAL_CARDS = 52
    const HALF_COUNT = 26

    const cardGeometry = createRoundedCardGeometry(CARD_W, CARD_H, 0.16, 16)

    const SUITS = ['♠', '♥', '♦', '♣']
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const FULL_DECK_DATA = []

    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        FULL_DECK_DATA.push({ rank, suit })
      })
    })

    // Sideways 3/4 angled deck group (Turned sideways from original orientation)
    const deckRootGroup = new THREE.Group()
    deckRootGroup.rotation.set(0.18, 0.38, -0.06) // 3/4 perspective angle
    scene.add(deckRootGroup)

    const cards = []

    const backCanvas = createCardBackCanvas()
    const backTexture = new THREE.CanvasTexture(backCanvas)
    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.magFilter = THREE.NearestFilter
    backTexture.minFilter = THREE.NearestFilter
    backTexture.needsUpdate = true

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.FrontSide
    })

    for (let i = 0; i < TOTAL_CARDS; i++) {
      const isLeft = i < HALF_COUNT
      const stackIndex = isLeft ? i : (i - HALF_COUNT)
      const cardData = FULL_DECK_DATA[i] || { rank: 'A', suit: '♠' }

      const faceCanvas = createCardFaceCanvas(cardData.rank, cardData.suit)
      const faceTexture = new THREE.CanvasTexture(faceCanvas)
      faceTexture.colorSpace = THREE.SRGBColorSpace
      faceTexture.magFilter = THREE.NearestFilter
      faceTexture.minFilter = THREE.NearestFilter
      faceTexture.needsUpdate = true

      const faceMaterial = new THREE.MeshBasicMaterial({
        map: faceTexture,
        side: THREE.FrontSide
      })

      const cardGroup = new THREE.Group()

      const frontMesh = new THREE.Mesh(cardGeometry.clone(), faceMaterial)
      const backMesh = new THREE.Mesh(cardGeometry.clone(), backMaterial)
      backMesh.rotation.y = Math.PI

      cardGroup.add(frontMesh)
      cardGroup.add(backMesh)

      const initY = i * STACK_GAP
      cardGroup.position.set(0, initY, 0)
      cardGroup.rotation.set(-Math.PI / 2, 0, 0)

      deckRootGroup.add(cardGroup)

      cards.push({
        group: cardGroup,
        isLeft,
        order: i,
        stackIndex,
        posX: 0,
        posY: initY,
        posZ: 0,
        rotX: -Math.PI / 2,
        rotY: 0,
        rotZ: 0
      })
    }

    // ------------------------------------------------------------------
    // 3. Rigid-Body Card Sync (100% Flat & Non-Intersecting Layers)
    // ------------------------------------------------------------------
    const syncAllCards = () => {
      cards.forEach((c) => {
        c.group.position.set(c.posX, c.posY, c.posZ)
        c.group.rotation.set(c.rotX, c.rotY, c.rotZ)
      })
    }

    // ------------------------------------------------------------------
    // 5. GSAP SCROLLTRIGGER TIMELINE: 2-STEP RIFFLE & BRIDGE WATERFALL
    // ------------------------------------------------------------------
    let lastCardIndex = -1
    let lastFlutterTime = 0
    let squareUpPlayed = false

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5.2}`,
          scrub: 1.0,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            const scrollVel = Math.abs(self.getVelocity() / 1000)

            if (p < 0.28) setActiveSceneIndex(0)
            else if (p < 0.58) setActiveSceneIndex(1)
            else setActiveSceneIndex(2)

            // STEP 1: Riffle Interlock (Cards interleaving and weaving into mesh, p in [0.28, 0.58])
            if (p >= 0.28 && p < 0.58) {
              squareUpPlayed = false
              const weaveProgress = (p - 0.28) / (0.58 - 0.28)
              const currentCardIdx = Math.min(27, Math.max(0, Math.floor(weaveProgress * 28)))

              if (currentCardIdx !== lastCardIndex) {
                const side = currentCardIdx % 2 === 0 ? 'left' : 'right'
                const normVel = Math.min(2.5, Math.max(0.4, scrollVel || 1.0))
                SoundEngine.playRiffleCardSnap({
                  cardIndex: currentCardIdx,
                  side,
                  velocity: normVel,
                  intensity: 1.0
                })
                lastCardIndex = currentCardIdx
              }
            }
            // STEP 2: Bridge Waterfall Cascade (Fluttering money count sound, p in [0.68, 0.90])
            else if (p >= 0.68 && p <= 0.90) {
              squareUpPlayed = false
              const now = performance.now()
              if (now - lastFlutterTime > 85) {
                SoundEngine.playWaterfallFlutter(Math.min(2.0, Math.max(0.6, scrollVel || 1.0)))
                lastFlutterTime = now
              }
            }
            // Final Square-up (p > 0.91)
            else if (p > 0.91) {
              if (!squareUpPlayed && self.direction > 0) {
                SoundEngine.playRiffleDeckSquare(Math.min(2.0, Math.max(0.5, scrollVel || 1.0)))
                squareUpPlayed = true
              }
            } else if (p < 0.25) {
              lastCardIndex = -1
              squareUpPlayed = false
            }
          }
        },
        onUpdate: () => {
          syncAllCards()
        }
      })

      // STAGE 0: GENTLE DECK EMERGENCE FROM HERO PORTAL (0.0 -> 0.45s)
      tl.fromTo(
        deckRootGroup.position,
        { y: -0.6 },
        { y: 0, duration: 0.45, ease: 'power2.out' },
        0
      )
      tl.fromTo(
        canvasRef.current,
        { opacity: 0.3 },
        { opacity: 1, duration: 0.45, ease: 'power2.out' },
        0
      )

      // STAGE 1: CUT & SPLIT (0.45 -> 1.4s)
      cards.forEach((c) => {
        const targetX = c.isLeft ? -2.75 : 2.75
        const targetY = 0.15 + c.stackIndex * STACK_GAP
        const targetRotZ = c.isLeft ? 0.06 : -0.06
        const targetRotY = c.isLeft ? -0.04 : 0.04

        if (c.isLeft) {
          tl.to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 0.95,
              ease: 'power2.inOut'
            },
            0.45
          )
        } else {
          tl.to(
            c,
            {
              posY: c.posY + 1.25, // Higher, majestic cut lift
              duration: 0.45,
              ease: 'power2.out'
            },
            0.45
          ).to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 0.50,
              ease: 'power2.inOut'
            },
            0.90
          )
        }
      })

      // ==================================================================
      // STEP 1: THE RIFFLE INTERLOCK (1.4 -> 4.2s)
      // Hands hold remaining cards high above the growing center stack.
      // Hand stacks rise continuously so the pile never penetrates the held cards!
      // ==================================================================
      const weaveStart = 1.4
      const weaveStepInterval = 0.09
      const weaveDropDuration = 0.12

      for (let p = 0; p < HALF_COUNT; p++) {
        const leftCard = cards[p]
        const leftStartTime = weaveStart + (p * 2) * weaveStepInterval
        const leftWeaveY = 0.10 + (p * 2) * STACK_GAP
        const leftHandHoldY = 0.35 + (p * 2) * STACK_GAP + 0.28 // Always elevated above center stack!

        // Lift held card smoothly in hand prior to its drop
        if (leftStartTime > weaveStart) {
          tl.to(
            leftCard,
            {
              posX: -2.10,
              posY: leftHandHoldY,
              rotZ: 0.09,
              rotY: -0.03,
              rotX: -Math.PI / 2 + 0.08,
              duration: leftStartTime - weaveStart,
              ease: 'none'
            },
            weaveStart
          )
        }

        // Card drops down from elevated hand into center weave
        tl.to(
          leftCard,
          {
            posX: -0.90,
            posY: leftWeaveY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: -0.02,
            rotZ: 0.04,
            duration: weaveDropDuration,
            ease: 'power2.out'
          },
          leftStartTime
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightStartTime = weaveStart + (p * 2 + 1) * weaveStepInterval
        const rightWeaveY = 0.10 + (p * 2 + 1) * STACK_GAP
        const rightHandHoldY = leftHandHoldY + STACK_GAP

        // Lift held card smoothly in hand prior to its drop
        if (rightStartTime > weaveStart) {
          tl.to(
            rightCard,
            {
              posX: 2.10,
              posY: rightHandHoldY,
              rotZ: -0.09,
              rotY: 0.03,
              rotX: -Math.PI / 2 + 0.08,
              duration: rightStartTime - weaveStart,
              ease: 'none'
            },
            weaveStart
          )
        }

        // Card drops down from elevated hand into center weave
        tl.to(
          rightCard,
          {
            posX: 0.90,
            posY: rightWeaveY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0.02,
            rotZ: -0.04,
            duration: weaveDropDuration,
            ease: 'power2.out'
          },
          rightStartTime
        )
      }

      // ==================================================================
      // STEP 2A: THE BRIDGE ARCH DOME (4.2 -> 5.2s)
      // Cards arch higher into the air (baseArch lifted up to 2.1+ units)
      // ==================================================================
      const bridgeStart = weaveStart + TOTAL_CARDS * weaveStepInterval + 0.15

      for (let p = 0; p < HALF_COUNT; p++) {
        const tNorm = p / (HALF_COUNT - 1)
        const baseArch = 0.52 + Math.sin(tNorm * Math.PI * 0.85 + 0.15) * 1.55 // Higher arch dome!

        const leftCard = cards[p]
        const leftArchY = baseArch + (p * 2) * STACK_GAP

        tl.to(
          leftCard,
          {
            posX: -0.68,
            posY: leftArchY,
            rotZ: 0.22,
            rotX: -Math.PI / 2 + 0.14,
            rotY: 0,
            duration: 0.85,
            ease: 'power2.inOut'
          },
          bridgeStart
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightArchY = baseArch + (p * 2 + 1) * STACK_GAP + 0.015 // Strictly offset above left!

        tl.to(
          rightCard,
          {
            posX: 0.68,
            posY: rightArchY,
            rotZ: -0.22,
            rotX: -Math.PI / 2 + 0.14,
            rotY: 0,
            duration: 0.85,
            ease: 'power2.inOut'
          },
          bridgeStart
        )
      }

      // ==================================================================
      // STEP 2B: THE WATERFALL CASCADE / MONEY COUNT FLUTTER (5.2 -> 6.8s)
      // Cards release from the dome and slide into the central stack with money-count flutter!
      // ==================================================================
      const waterfallStart = bridgeStart + 0.95
      const waterfallStep = 0.055
      const slideDuration = 0.14

      for (let p = 0; p < HALF_COUNT; p++) {
        const leftCard = cards[p]
        const leftFinalY = (p * 2) * STACK_GAP
        const leftDropTime = waterfallStart + (p * 2) * waterfallStep

        tl.to(
          leftCard,
          {
            posX: 0,
            posY: leftFinalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: slideDuration,
            ease: 'power2.in'
          },
          leftDropTime
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightFinalY = (p * 2 + 1) * STACK_GAP
        const rightDropTime = waterfallStart + (p * 2 + 1) * waterfallStep

        tl.to(
          rightCard,
          {
            posX: 0,
            posY: rightFinalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: slideDuration,
            ease: 'power2.in'
          },
          rightDropTime
        )
      }

      // ==================================================================
      // STAGE 5: FINAL CLEAN SQUARE-UP (6.8 -> 7.4s)
      // Final solid tap & flush alignment of the 52-card deck
      // ==================================================================
      const finalizeStart = waterfallStart + TOTAL_CARDS * waterfallStep + 0.12

      cards.forEach((c) => {
        const finalY = (c.isLeft ? (c.stackIndex * 2) : (c.stackIndex * 2 + 1)) * STACK_GAP

        tl.to(
          c,
          {
            posX: 0,
            posY: finalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: 0.55,
            ease: 'bounce.out'
          },
          finalizeStart
        )
      })
    }, container)

    // 5. Render Loop (Fixed Camera, 3/4 Angled Deck)
    let animationFrameId

    const render = () => {
      syncAllCards()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    // 7. Resize Handler
    const handleResize = () => {
      if (!pinWrapperRef.current) return
      const w = pinWrapperRef.current.clientWidth || window.innerWidth
      const h = pinWrapperRef.current.clientHeight || window.innerHeight
      camera.position.set(0, 6.8, 10.8)
      camera.lookAt(0, 0.35, 0)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    const refreshTimer1 = setTimeout(() => ScrollTrigger.refresh(), 150)
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(), 600)
    const refreshTimer3 = setTimeout(() => ScrollTrigger.refresh(), 1400)

    return () => {
      clearTimeout(refreshTimer1)
      clearTimeout(refreshTimer2)
      clearTimeout(refreshTimer3)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      ctx.revert()
      renderer.dispose()
    }
  }, [])

  const currentScene = SCENES[activeSceneIndex]

  return (
    <div ref={containerRef} id="how-to-play" className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen bg-transparent overflow-hidden select-none z-20 flex items-center justify-start px-6 sm:px-12 lg:px-20"
      >
        {/* Pure Clean Flat 3D Canvas (100% CENTERED on Seamless Global Grid) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

        {/* ------------------------------------------------------------- */}
        {/* 3D CARD-FLIP KINETIC HERO TYPOGRAPHY                          */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-20 pointer-events-none max-w-lg lg:max-w-xl [perspective:1200px]">
          <div
            key={currentScene.id}
            className="animate-card-flip-3d"
          >
            {/* Tag Badge */}
            <div className="mb-3 sm:mb-4">
              <span
                className="font-pixel text-[11px] sm:text-xs font-black uppercase px-3.5 py-1.5 border-[3px] border-true-black shadow-[3px_3px_0px_#000] inline-block -rotate-1 transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: currentScene.accentColor }}
              >
                {currentScene.tag}
              </span>
            </div>

            {/* Giant Chunky Headline */}
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-true-black tracking-tight leading-[0.92] mb-4 sm:mb-5 drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]">
              {currentScene.headline}
            </h2>

            {/* Neo-Brutalist Description Card with Accent Line */}
            <div className="brutal-window bg-white p-4 sm:p-5 border-[4px] border-true-black shadow-[8px_8px_0px_#000] max-w-md pointer-events-auto relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                style={{ backgroundColor: currentScene.accentColor }}
              />
              <p className="font-mono-nb text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-snug pt-1">
                {currentScene.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
