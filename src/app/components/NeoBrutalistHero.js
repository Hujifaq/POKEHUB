"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Draws a high-definition pixel-art "Retro 8-Bit" playing card face onto a canvas → used as a texture map.
function makeCardFaceTexture() {
  const W = 512
  const H = 768
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.imageSmoothingEnabled = false

  // 1. Warm Creamy White Base (#FAF7F2 - 10% creamy white)
  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, W, H)

  // Faint Retro 8-bit Dither Grid Texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.025)'
  for (let y = 0; y < H; y += 4) {
    for (let x = (y % 8 === 0 ? 0 : 2); x < W; x += 4) {
      ctx.fillRect(x, y, 2, 2)
    }
  }

  // 2. Chunky Pixel Brutalist Border (Multiple stepped pixel frames)
  const P = 8 // Pixel grid unit size

  // Helper for drawing integer pixel rectangles
  const drawPixelRect = (x, y, w, h, color) => {
    ctx.fillStyle = color
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
  }

  // Outer thick pixel border
  drawPixelRect(0, 0, W, P * 3, '#050505')
  drawPixelRect(0, H - P * 3, W, P * 3, '#050505')
  drawPixelRect(0, 0, P * 3, H, '#050505')
  drawPixelRect(W - P * 3, 0, P * 3, H, '#050505')

  // Inset decorative pixel corner notches
  const notch = (x, y) => {
    drawPixelRect(x, y, P * 4, P * 4, '#050505')
    drawPixelRect(x + P, y + P, P * 2, P * 2, '#FAF7F2')
  }
  notch(P * 3, P * 3)
  notch(W - P * 7, P * 3)
  notch(P * 3, H - P * 7)
  notch(W - P * 7, H - P * 7)

  // Inner pixel stitch border (dashed pixel line)
  for (let x = P * 6; x < W - P * 6; x += P * 2) {
    drawPixelRect(x, P * 5, P, P, '#050505')
    drawPixelRect(x, H - P * 6, P, P, '#050505')
  }
  for (let y = P * 6; y < H - P * 6; y += P * 2) {
    drawPixelRect(P * 5, y, P, P, '#050505')
    drawPixelRect(W - P * 6, y, P, P, '#050505')
  }

  // Helper to draw pixel matrices
  const drawMatrix = (startX, startY, matrix, size, color) => {
    ctx.fillStyle = color
    for (let r = 0; r < matrix.length; r++) {
      for (let col = 0; col < matrix[r].length; col++) {
        if (matrix[r][col] === 1) {
          ctx.fillRect(startX + col * size, startY + r * size, size, size)
        }
      }
    }
  }

  // 3. Pixel Matrix Definitions
  // Authentic Retro 8-bit Wild 777 Crown Centerpiece Motif
  const RETRO_CROWN_777_MATRIX = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1]
  ]

  // Corner Pixel "7" (5x7)
  const PIXEL_7 = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0]
  ]

  // Corner Pixel Star Suit (7x7)
  const PIXEL_STAR = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1]
  ]

  // 4. Draw Center Hero 777 Crown (Size multiplier 20px per cell with hard pixel shadow)
  const motifSize = 20
  const motifW = RETRO_CROWN_777_MATRIX[0].length * motifSize
  const motifH = RETRO_CROWN_777_MATRIX.length * motifSize
  const centerX = Math.floor((W - motifW) / 2)
  const centerY = Math.floor((H - motifH) / 2)

  // Hard pixel offset drop-shadow (12px offset)
  drawMatrix(centerX + 12, centerY + 12, RETRO_CROWN_777_MATRIX, motifSize, 'rgba(5,5,5,0.18)')
  // Center 777 Crown in true black
  drawMatrix(centerX, centerY, RETRO_CROWN_777_MATRIX, motifSize, '#050505')

  // 5. Draw Top-Left Corner Index (7 + ★)
  drawMatrix(P * 7, P * 8, PIXEL_7, 8, '#050505')
  drawMatrix(P * 6, P * 17, PIXEL_STAR, 6, '#050505')

  // 6. Draw Bottom-Right Corner Index (7 + ★, Inverted)
  ctx.save()
  ctx.translate(W, H)
  ctx.rotate(Math.PI)
  drawMatrix(P * 7, P * 8, PIXEL_7, 8, '#050505')
  drawMatrix(P * 6, P * 17, PIXEL_STAR, 6, '#050505')
  ctx.restore()

  // 7. Retro 8-bit Micro Badges
  drawPixelRect(W / 2 - 64, P * 6, 128, 20, '#050505')
  ctx.fillStyle = '#FAF7F2'
  ctx.font = "900 11px 'Space Mono', monospace"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('POKERHUB • 8-BIT', W / 2, P * 6 + 10)

  drawPixelRect(W / 2 - 76, H - P * 6 - 20, 152, 20, '#050505')
  ctx.fillStyle = '#FAF7F2'
  ctx.font = "900 10px 'Space Mono', monospace"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('LIMITED EDITION 06/06', W / 2, H - P * 6 - 10)

  return c
}

// Full-card 24x34 outline pixel graffiti matrix for the card back
const RETRO_GRAFFITI_MATRIX = [
  [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
]

// Draws full-bleed outline pixel graffiti on an inky black canvas → used as card back texture.
function makeCardBackTexture() {
  const W = 512
  const H = 768
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.imageSmoothingEnabled = false

  // 1. Inky Black Background (#07080d)
  ctx.fillStyle = '#07080d'
  ctx.fillRect(0, 0, W, H)

  // 2. Symmetrical Pixel Dither Grid Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  for (let y = 0; y < H; y += 8) {
    for (let x = (y % 16 === 0 ? 0 : 4); x < W; x += 8) {
      ctx.fillRect(x, y, 4, 4)
    }
  }

  // 3. Thick Outer Brutalist Border
  const P = 8
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, W, P * 3)
  ctx.fillRect(0, H - P * 3, W, P * 3)
  ctx.fillRect(0, 0, P * 3, H)
  ctx.fillRect(W - P * 3, 0, P * 3, H)

  // 4. Draw Full-Bleed Outline Pixel Graffiti Art Piece (Vibrant Retro Orange)
  const cellSize = 19
  const matrixW = RETRO_GRAFFITI_MATRIX[0].length * cellSize
  const matrixH = RETRO_GRAFFITI_MATRIX.length * cellSize
  const startX = Math.floor((W - matrixW) / 2)
  const startY = Math.floor((H - matrixH) / 2)

  ctx.fillStyle = '#FF5500'
  for (let r = 0; r < RETRO_GRAFFITI_MATRIX.length; r++) {
    for (let col = 0; col < RETRO_GRAFFITI_MATRIX[r].length; col++) {
      if (RETRO_GRAFFITI_MATRIX[r][col] === 1) {
        ctx.fillRect(startX + col * cellSize, startY + r * cellSize, cellSize, cellSize)
      }
    }
  }

  return c
}

// Rounded-rectangle shape used to extrude the playing-card body
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

export default function NeoBrutalistHero({ onOpenDuel, onScrollToGallery, containerRefProp }) {
  const localContainerRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const textRef = useRef(null)
  const cardGroupRef = useRef(null)
  const secondRevealRef = useRef(null)
  const portalOverlayRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const pinWrapper = pinWrapperRef.current
    const container = containerRef.current
    if (!canvas || !pinWrapper || !container) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(pinWrapper.clientWidth || window.innerWidth, pinWrapper.clientHeight || window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      (pinWrapper.clientWidth || window.innerWidth) / (pinWrapper.clientHeight || window.innerHeight),
      0.05,
      100
    )
    camera.position.set(0, 0, 8)

    // 1. Solid Black Extruded Card Body with rounded bevel
    const shape = roundedCardShape(2.6, 3.8, 0.28)
    const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
      curveSegments: 32,
    })
    bodyGeometry.center()

    // 2. Front Face Shape Geometry & UV assignment
    const frontGeometry = new THREE.ShapeGeometry(shape, 32)
    frontGeometry.center()
    {
      const uv = frontGeometry.attributes.uv
      const pos = frontGeometry.attributes.position
      frontGeometry.computeBoundingBox()
      const bb = frontGeometry.boundingBox
      if (bb) {
        const sx = bb.max.x - bb.min.x
        const sy = bb.max.y - bb.min.y
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy)
        }
        uv.needsUpdate = true
      }
    }

    // 3. Back Face Shape Geometry & UV assignment
    const backGeometry = new THREE.ShapeGeometry(shape, 32)
    backGeometry.center()
    {
      const uv = backGeometry.attributes.uv
      const pos = backGeometry.attributes.position
      backGeometry.computeBoundingBox()
      const bb = backGeometry.boundingBox
      if (bb) {
        const sx = bb.max.x - bb.min.x
        const sy = bb.max.y - bb.min.y
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy)
        }
        uv.needsUpdate = true
      }
    }

    const frontTexture = new THREE.CanvasTexture(makeCardFaceTexture())
    frontTexture.colorSpace = THREE.SRGBColorSpace
    frontTexture.magFilter = THREE.NearestFilter
    frontTexture.minFilter = THREE.NearestFilter
    frontTexture.generateMipmaps = false

    const backTexture = new THREE.CanvasTexture(makeCardBackTexture())
    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.magFilter = THREE.NearestFilter
    backTexture.minFilter = THREE.NearestFilter
    backTexture.generateMipmaps = false

    // Front foil material with creamy white metallic iridescence sheen
    const frontFoilMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      metalness: 0.15,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.85,
      iridescence: 0.35,
      iridescenceIOR: 1.4,
      envMapIntensity: 1.1,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide,
    })

    // Solid black extruded edge
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 1,
    })

    // Back foil material with full-bleed outline graffiti (Vibrant Retro Orange)
    const backFoilMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      metalness: 0.25,
      roughness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      reflectivity: 0.9,
      iridescence: 0.45,
      iridescenceIOR: 1.45,
      envMapIntensity: 1.2,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide,
    })

    const bodyMesh = new THREE.Mesh(bodyGeometry, edgeMaterial)
    const frontMesh = new THREE.Mesh(frontGeometry, frontFoilMaterial)
    frontMesh.position.z = 0.101

    const backMesh = new THREE.Mesh(backGeometry, backFoilMaterial)
    backMesh.rotation.y = Math.PI
    backMesh.position.z = -0.101

    const card = new THREE.Group()
    card.add(bodyMesh)
    card.add(frontMesh)
    card.add(backMesh)

    const cardGroup = new THREE.Group()
    cardGroup.add(card)

    // ==========================================
    // 3D RETRO 8-BIT BLACK DARK SMOKE SYSTEM
    // ==========================================
    const smokeCount = 75
    const smokeGeo = new THREE.PlaneGeometry(0.22, 0.22)
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    })
    const smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, smokeCount)
    smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const smokeColors = [
      new THREE.Color(0x050508),
      new THREE.Color(0x0a0b10),
      new THREE.Color(0x12141c),
      new THREE.Color(0x1b1d28),
      new THREE.Color(0x282b3a),
      new THREE.Color(0x3c4155),
    ]

    const dummy = new THREE.Object3D()
    const smokeParticles = Array.from({ length: smokeCount }, (_, i) => {
      const isSide = Math.random() > 0.5
      let x = isSide ? (Math.random() > 0.5 ? 1.35 : -1.35) : (Math.random() - 0.5) * 2.7
      let y = isSide ? (Math.random() - 0.5) * 3.9 : (Math.random() > 0.5 ? 1.95 : -1.95)
      let z = (Math.random() - 0.5) * 0.15

      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)]
      smokeMesh.setColorAt(i, color)

      return {
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.006,
        vy: 0.008 + Math.random() * 0.012,
        rot: Math.floor(Math.random() * 4) * (Math.PI / 2),
        scale: 0.5 + Math.random() * 0.5,
        life: Math.random() * 60,
        maxLife: 60 + Math.random() * 40
      }
    })
    if (smokeMesh.instanceColor) smokeMesh.instanceColor.needsUpdate = true

    cardGroup.add(smokeMesh)

    // Start position: centered on load as the main Hero Section
    cardGroup.position.set(0, 0, 0)
    cardGroup.rotation.set(-0.06, -0.22, 0.02)
    cardGroup.scale.set(1, 1, 1)
    scene.add(cardGroup)
    cardGroupRef.current = cardGroup

    // Lighting setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(4, 6, 6)
    scene.add(key)

    const accentPurple = new THREE.PointLight(0xb388ff, 3.0, 30)
    accentPurple.position.set(-5, 2, 4)
    scene.add(accentPurple)

    const accentCyan = new THREE.PointLight(0x00f0ff, 2.5, 30)
    accentCyan.position.set(5, -3, 4)
    scene.add(accentCyan)

    // Gentle idle floating loop & 3D pixel smoke animation
    let raf = 0
    const start = performance.now()
    const animate = () => {
      const t = (performance.now() - start) / 1000
      if (cardGroup.scale.x < 3) {
        card.position.y = Math.sin(t * 1.2) * 0.06
      }

      // Update 3D pixel dark smoke particles
      for (let i = 0; i < smokeCount; i++) {
        const p = smokeParticles[i]
        p.life++
        p.y += p.vy
        p.x += p.vx + Math.sin(t * 2 + i) * 0.003
        p.scale += 0.006

        if (p.life >= p.maxLife || p.y > 2.6 || Math.abs(p.x) > 2.0) {
          const isSide = Math.random() > 0.5
          p.x = isSide ? (Math.random() > 0.5 ? 1.35 : -1.35) : (Math.random() - 0.5) * 2.7
          p.y = isSide ? (Math.random() - 0.5) * 3.9 : (Math.random() > 0.5 ? 1.95 : -1.95)
          p.z = (Math.random() - 0.5) * 0.15
          p.vy = 0.008 + Math.random() * 0.012
          p.scale = 0.4 + Math.random() * 0.4
          p.life = 0
          p.maxLife = 60 + Math.random() * 40
        }

        dummy.position.set(p.x, p.y, p.z)
        dummy.rotation.set(0, 0, p.rot)
        dummy.scale.set(p.scale, p.scale, 1)
        dummy.updateMatrix()
        smokeMesh.setMatrixAt(i, dummy.matrix)
      }
      smokeMesh.instanceMatrix.needsUpdate = true

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    // Scrollytelling Timeline: Complete Zoom-Through -> Seamless Transition into How To Play (Riffle Deck)
    let lastPlayTime = 0
    let lastRotationY = -0.22
    let portalSoundPlayed = false

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.6}`,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const now = performance.now()
            const progress = self.progress
            const currentRotY = cardGroup.rotation.y
            const rotDelta = Math.abs(currentRotY - lastRotationY)
            const scrollVel = Math.abs(self.getVelocity() / 1000)

            // STAGE 1 & 2: As the 3D card rotates / turns through space
            if (progress < 0.72) {
              if (progress < 0.6) {
                portalSoundPlayed = false
              }

              // Trigger on rotation delta with responsive throttling
              if (rotDelta > 0.32 && (now - lastPlayTime > 80)) {
                const direction = currentRotY >= lastRotationY ? 1 : -1
                const normVel = Math.min(2.5, Math.max(0.35, scrollVel || rotDelta * 2.2))
                const isMicro = normVel < 0.65 && rotDelta < 0.55

                SoundEngine.playHeroCardRotate({
                  velocity: normVel,
                  direction,
                  intensity: isMicro ? 0.75 : 1.0,
                  mode: isMicro ? 'micro' : 'rotate'
                })

                lastPlayTime = now
                lastRotationY = currentRotY
              }
            } else if (progress >= 0.74 && progress <= 0.95) {
              // STAGE 4: Climax Zoom-Through Portal Warp
              if (!portalSoundPlayed && self.direction > 0 && (now - lastPlayTime > 180)) {
                SoundEngine.playHeroCardPortalWarp()
                portalSoundPlayed = true
                lastPlayTime = now
              }
            }
          }
        },
      })

      // ==========================================
      // STAGE 1: SEAMLESS ENTRY & FOCUS (0.0 -> 0.8s)
      // Card steps forward from depth to dead center with smooth 360 spin
      // ==========================================
      tl.to(
        cardGroup.position,
        { x: 0, y: 0, z: 0, ease: 'power2.out', duration: 0.8 },
        0
      )
        .to(
          cardGroup.scale,
          { x: 1, y: 1, z: 1, ease: 'power2.out', duration: 0.8 },
          0
        )
        .to(
          cardGroup.rotation,
          { y: Math.PI * 2, x: 0, z: 0, ease: 'power2.out', duration: 0.8 },
          0
        )

      // Initial Hero Text fades out and slides up
      if (textRef.current) {
        tl.to(
          textRef.current,
          { autoAlpha: 0, y: -70, ease: 'power2.in', duration: 0.45 },
          0
        )
      }

      // ==========================================
      // STAGE 2: SHOWCASE & FOIL HIGHLIGHT (0.8 -> 1.5s)
      // ==========================================
      if (secondRevealRef.current) {
        tl.fromTo(
          secondRevealRef.current,
          { autoAlpha: 0, y: 60, scale: 0.88 },
          { autoAlpha: 1, y: 0, scale: 1, ease: 'back.out(1.4)', duration: 0.5 },
          0.8
        )
      }

      // Subtle metallic foil shine tilt
      tl.to(
        cardGroup.rotation,
        { y: Math.PI * 2 + 0.12, x: 0.05, ease: 'power1.inOut', duration: 0.5 },
        0.85
      )

      // ==========================================
      // STAGE 3: LOCK ON CENTER & CLEAR UI (1.5 -> 1.9s)
      // ==========================================
      // Straighten card perfectly facing camera
      tl.to(
        cardGroup.rotation,
        { y: Math.PI * 2, x: 0, z: 0, ease: 'power2.inOut', duration: 0.4 },
        1.5
      )

      // Secondary Reveal Banner drops down and disappears
      if (secondRevealRef.current) {
        tl.to(
          secondRevealRef.current,
          { autoAlpha: 0, y: 50, scale: 0.85, ease: 'power2.in', duration: 0.35 },
          1.5
        )
      }

      // ==========================================
      // STAGE 4: CINEMATIC ZOOM-THROUGH (1.9s -> 2.7s)
      // Card expands into flying portal & dissolves
      // ==========================================
      tl.to(
        camera.position,
        { z: 0.1, ease: 'power3.in', duration: 0.8 },
        1.9
      )
        .to(
          cardGroup.scale,
          { x: 48, y: 48, z: 48, ease: 'power3.in', duration: 0.8 },
          1.9
        )
        .to(
          cardGroup.position,
          { z: 2.0, ease: 'power2.in', duration: 0.8 },
          1.9
        )

      // Fade out 3D black smoke on penetration
      tl.to(
        smokeMat,
        { opacity: 0, duration: 0.5, ease: 'power2.in' },
        1.9
      )

      // Portal warp flare expands and dissolves
      if (portalOverlayRef.current) {
        tl.fromTo(
          portalOverlayRef.current,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 0.95, scale: 2.8, ease: 'power2.out', duration: 0.4 },
          2.05
        )
          .to(
            portalOverlayRef.current,
            { autoAlpha: 0, scale: 5.0, ease: 'power2.in', duration: 0.35 },
            2.45
          )
      }

      // Materials dissolve smoothly as camera passes through
      tl.to(
        frontFoilMaterial,
        { opacity: 0, duration: 0.3, ease: 'power2.out' },
        2.4
      )
        .to(
          backFoilMaterial,
          { opacity: 0, duration: 0.3, ease: 'power2.out' },
          2.4
        )
        .to(
          edgeMaterial,
          { opacity: 0, duration: 0.3, ease: 'power2.out' },
          2.4
        )

    }, containerRef)

    // Force ScrollTrigger to refresh and recalculate all down-page section start offsets
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    const onResize = () => {
      if (!pinWrapper || !renderer || !camera) return
      const width = pinWrapper.clientWidth || window.innerWidth
      const height = pinWrapper.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshTimer)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      ctx.revert()
      bodyGeometry.dispose()
      frontGeometry.dispose()
      backGeometry.dispose()
      frontFoilMaterial.dispose()
      backFoilMaterial.dispose()
      edgeMaterial.dispose()
      smokeMat.dispose()
      smokeGeo.dispose()
      frontTexture.dispose()
      backTexture.dispose()
      renderer.dispose()
    }
  }, [])

  // Interactive draw card handler
  const handleDrawCard = () => {
    SoundEngine.playHeroCardRotate({
      velocity: 1.5,
      direction: 1,
      intensity: 1.2,
      mode: 'rotate'
    })
    if (cardGroupRef.current) {
      gsap.to(cardGroupRef.current.rotation, {
        y: '+=6.283', // Full 360 spin
        x: '+=0.2',
        duration: 0.9,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(cardGroupRef.current.rotation, { x: 0, duration: 0.4 })
        }
      })
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden select-none z-20 bg-transparent"
      >
        {/* Portal Warp Flare on Zoom-Through */}
        <div
          ref={portalOverlayRef}
          className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center opacity-0 will-change-transform"
        >
          <div className="w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] rounded-full bg-gradient-to-tr from-[#ff90e8] via-[#fffb00] to-[#00f0ff] blur-3xl opacity-90" />
        </div>

        {/* Three.js canvas overlaid behind the UI */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full z-10"
        />

        {/* Main Hero UI Layer */}
        <div
          ref={textRef}
          className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          {/* Retro Badge */}
          <div
            className="font-mono-nb mb-6 inline-flex items-center gap-2 border-[3px] border-true-black bg-white px-4 py-1.5 text-xs font-bold tracking-widest text-true-black uppercase brutal-shadow-sm"
          >
            <span>Deck v2.0 — Now Shuffling</span>
          </div>

          {/* Headline */}
          <h1 className="font-display max-w-4xl text-4xl leading-[1.1] text-true-black uppercase sm:text-6xl lg:text-7xl">
            <span className="font-serif italic capitalize font-normal text-[1.18em] tracking-normal text-[#D6336C] drop-shadow-[3px_3px_0px_#050505] -rotate-3 inline-block mr-1 align-baseline select-none">
              Play
            </span>{' '}
            <span
              className="text-white drop-shadow-[4px_4px_0px_#050505]"
              style={{
                WebkitTextStroke: '3px #050505',
                paintOrder: 'stroke fill'
              }}
            >
              YOUR
            </span>{' '}
            <span
              className="inline-block -rotate-2 border-[4px] border-true-black bg-accent-yellow px-4 py-1 text-true-black brutal-shadow transition-transform hover:rotate-0"
            >
              winning
            </span>{' '}
            <span
              className="text-white drop-shadow-[4px_4px_0px_#050505]"
              style={{
                WebkitTextStroke: '3px #050505',
                paintOrder: 'stroke fill'
              }}
            >
              HAND
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-mono-nb mt-6 max-w-xl text-xs sm:text-sm text-accent-yellow font-black leading-relaxed drop-shadow-[2px_2px_0px_#050505]"
            style={{
              WebkitTextStroke: '1px #050505',
              paintOrder: 'stroke fill'
            }}
          >
            Scroll to deal. A brutally honest deck engine built for players who hate losing more than they love winning.
          </p>

          {/* Interactive Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDrawCard}
              className="brutal-btn bg-true-black text-white px-7 py-3.5 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer hover:bg-accent-yellow hover:text-true-black transition-colors"
            >
              Draw a card →
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick()
                if (onScrollToGallery) {
                  onScrollToGallery()
                } else if (containerRef.current) {
                  window.scrollBy({ top: window.innerHeight * 2.5, behavior: 'smooth' })
                }
              }}
              className="brutal-btn bg-white text-true-black px-5 py-3.5 font-pixel text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-accent-yellow"
            >
              Explore Decks ↓
            </button>
          </div>

          {/* Scroll Cue */}
          <div className="font-mono-nb absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold tracking-widest text-true-black/60 uppercase flex flex-col items-center gap-1">
            <span className="animate-bounce">↓</span>
            <span>Scroll to plunge into 3D Card</span>
          </div>
        </div>

        {/* Secondary Scrollytelling Reveal Banner (Revealed on Scroll) */}
        <div
          ref={secondRevealRef}
          className="pointer-events-auto absolute bottom-12 left-1/2 -translate-x-1/2 z-20 opacity-0 will-change-transform flex flex-col items-center gap-3 w-[90vw] max-w-md"
        >
          <div className="brutal-window w-full p-4 sm:p-5 text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] bg-accent-cyan border-[2px] border-true-black px-2 py-0.5 font-black text-true-black uppercase">
                RETRO 8-BIT
              </span>
              <span className="font-pixel text-[9px] bg-true-black text-white border-[2px] border-true-black px-2 py-0.5 font-black">
                DARK SMOKE AURA
              </span>
            </div>
            <h4 className="font-display text-lg sm:text-xl font-black text-true-black">
              LUCKY 777 RETRO EDITION
            </h4>
            <p className="font-mono-nb text-[10px] sm:text-xs text-gray-700 font-bold">
              Procedural creamy white finish with real-time 3D pixel dark smoke plumes.
            </p>
            <button
              onClick={() => {
                SoundEngine.playCardSwoosh()
                if (onOpenDuel) onOpenDuel()
              }}
              className="brutal-btn w-full mt-2 py-2.5 bg-ui-pink text-true-black font-display text-xs uppercase font-black cursor-pointer hover:bg-[#ff8cb8]"
            >
              ⚔️ CHALLENGE IN 3D DUEL
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
