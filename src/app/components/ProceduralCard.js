"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DECK_SKIN_THEMES,
  PIXEL_GRAFFITI,
  PIXEL_FRONTS,
  THEME_FIRE_PALETTES
} from './PixelDeckAssets'

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
  10: [
    [1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1]
  ]
}

// Crisp integer-pixel drawing helper
function drawPixelMatrix(ctx, startX, startY, size, matrix, color) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return
  ctx.fillStyle = color
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      const val = row[c]
      if (val === 1 || val === true) {
        ctx.fillStyle = color
        ctx.fillRect(Math.floor(startX + c * size), Math.floor(startY + r * size), Math.ceil(size), Math.ceil(size))
      } else if (typeof val === 'string') {
        ctx.fillStyle = val
        ctx.fillRect(Math.floor(startX + c * size), Math.floor(startY + r * size), Math.ceil(size), Math.ceil(size))
      }
    }
  }
}

// Generate luxury high-definition pixel front texture matching HorizontalShowcase 1:1
function createCardFrontTexture(rank = 'A', suit = 'hearts', skin = 'obsidian') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const W = 512
  const H = 768
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false

  const skinTheme = DECK_SKIN_THEMES[skin] || DECK_SKIN_THEMES.obsidian
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const rankColor = isRed ? '#ef4444' : '#050505'
  const accentColor = skinTheme.accentColor || '#b388ff'

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

  // 3. Thick Neo-Brutalist Outer Border (14px)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 14
  ctx.strokeRect(7, 7, W - 14, H - 14)

  // 4. Stepped Corner Accent Notches
  ctx.fillStyle = accentColor
  ctx.fillRect(14, 14, 24, 8)
  ctx.fillRect(14, 14, 8, 24)
  ctx.fillRect(W - 38, 14, 24, 8)
  ctx.fillRect(W - 22, 14, 8, 24)
  ctx.fillRect(14, H - 22, 24, 8)
  ctx.fillRect(14, H - 38, 8, 24)
  ctx.fillRect(W - 38, H - 22, 24, 8)
  ctx.fillRect(W - 22, H - 38, 8, 24)

  const suitMatrix = PIXEL_SUITS[suit] || PIXEL_SUITS.hearts
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

  // 7. Central Pixel Art Motif Box (Exact 1:1 match with HorizontalShowcase)
  const motif = PIXEL_FRONTS[skinTheme.themeStyle] || PIXEL_FRONTS.obsidian
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
  if (motif && motif.length > 0) {
    const pSize = 12.5
    const matW = motif[0].length * pSize
    const matH = motif.length * pSize
    const matX = Math.floor((W - matW) / 2)
    const matY = Math.floor((H - matH) / 2)
    drawPixelMatrix(ctx, matX, matY, pSize, motif, accentColor)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.anisotropy = 1
  texture.needsUpdate = true
  return texture
}

// Generate luxury high-definition pixel back texture matching HorizontalShowcase 1:1
function createCardBackTexture(skin = 'obsidian') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const W = 512
  const H = 768
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false

  const isDefault = skin === 'classic' || skin === 'default'
  const skinTheme = isDefault
    ? (DECK_SKIN_THEMES.default || {
        accentColor: '#B84A4A',
        cardBackBg: '#FFF8EE',
        themeStyle: 'default'
      })
    : (DECK_SKIN_THEMES[skin] || DECK_SKIN_THEMES.obsidian)

  const accentColor = skinTheme.accentColor || '#b388ff'
  const graffitiMat = PIXEL_GRAFFITI[skinTheme.themeStyle] || PIXEL_GRAFFITI.default || PIXEL_GRAFFITI.obsidian

  if (isDefault) {
    // CLASSIC RETRO LATTICE DESIGN
    ctx.fillStyle = '#FFF8EE'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, W - 14, H - 14)

    ctx.fillStyle = '#E58383'
    ctx.fillRect(24, 24, W - 48, H - 48)
    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 8
    ctx.strokeRect(24, 24, W - 48, H - 48)

    if (PIXEL_GRAFFITI.default) {
      const pSize = 17
      const matW = PIXEL_GRAFFITI.default[0].length * pSize
      const matH = PIXEL_GRAFFITI.default.length * pSize
      const matX = Math.floor((W - matW) / 2)
      const matY = Math.floor((H - matH) / 2)
      drawPixelMatrix(ctx, matX, matY, pSize, PIXEL_GRAFFITI.default, '#B84A4A')
    }
  } else {
    // EXACT FULL-CARD OUTLINE PIXEL GRAFFITI PIECE FROM HORIZONTAL SHOWCASE
    ctx.fillStyle = '#07080d'
    ctx.fillRect(0, 0, W, H)

    // Outer and Inner Brutalist Frames
    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, W - 14, H - 14)

    ctx.strokeStyle = accentColor
    ctx.lineWidth = 6
    ctx.strokeRect(24, 24, W - 48, H - 48)

    // Stepped Corner Accent Notches
    ctx.fillStyle = accentColor
    ctx.fillRect(24, 24, 28, 8)
    ctx.fillRect(24, 24, 8, 28)
    ctx.fillRect(W - 52, 24, 28, 8)
    ctx.fillRect(W - 32, 24, 8, 28)
    ctx.fillRect(24, H - 32, 28, 8)
    ctx.fillRect(24, H - 52, 8, 28)
    ctx.fillRect(W - 52, H - 32, 28, 8)
    ctx.fillRect(W - 32, H - 52, 8, 28)

    // Edge-to-Edge Full-Card Outline Pixel Graffiti Artwork (24x34)
    if (graffitiMat && graffitiMat.length > 0) {
      const pSize = 17.5
      const matW = graffitiMat[0].length * pSize
      const matH = graffitiMat.length * pSize
      const matX = Math.floor((W - matW) / 2)
      const matY = Math.floor((H - matH) / 2)
      drawPixelMatrix(ctx, matX, matY, pSize, graffitiMat, accentColor)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.anisotropy = 1
  texture.needsUpdate = true
  return texture
}

export default function ProceduralCard({
  rank = 'A',
  suit = 'hearts',
  skin = 'obsidian',
  isFlipped = false,
  isHolo = true,
  isReady = true,
  fanIndex = 0,
  fanTotal = 1,
  onTelemetry,
  targetOffset = [0, 0, 0],
  ...props
}) {
  const innerGroup = useRef()
  const velocity = useRef({ x: 0, y: 0 })
  const position = useRef({ x: 0, y: 0, z: 0 })

  const [frontTexture, setFrontTexture] = useState(null)
  const [backTexture, setBackTexture] = useState(null)

  // ----------------------------------------------------
  // FLUSH ZERO-GAP 3D PIXEL FIRE AURA SIMULATION
  // ----------------------------------------------------
  const fireCanvasRef = useRef(null)
  const fireTextureRef = useRef(null)
  const fireBufferRef = useRef(null)
  const lastFireTimeRef = useRef(0)

  const skinTheme = useMemo(() => {
    return DECK_SKIN_THEMES[skin] || DECK_SKIN_THEMES.obsidian
  }, [skin])

  // Dimensions of the Fire Buffer (Calibrated exactly for 0.00 Gap to 3D Card Edge)
  const FW = 64
  const FH = 90
  const cardLeft = 7
  const cardRight = 57
  const cardTop = 9
  const cardBottom = 81

  useEffect(() => {
    if (typeof document === 'undefined') return
    const fCanvas = document.createElement('canvas')
    fCanvas.width = FW
    fCanvas.height = FH
    const fCtx = fCanvas.getContext('2d')
    if (!fCtx) return
    fCtx.imageSmoothingEnabled = false

    fireCanvasRef.current = fCanvas
    fireBufferRef.current = new Uint8Array(FW * FH)

    const fTex = new THREE.CanvasTexture(fCanvas)
    fTex.magFilter = THREE.NearestFilter
    fTex.minFilter = THREE.NearestFilter
    fTex.needsUpdate = true
    fireTextureRef.current = fTex

    return () => {
      fTex.dispose()
    }
  }, [])

  // Regenerate Card Front and Back Textures on Skin/Rank/Suit change
  useEffect(() => {
    const ft = createCardFrontTexture(rank, suit, skin)
    const bt = createCardBackTexture(skin)
    setFrontTexture(ft)
    setBackTexture(bt)

    return () => {
      if (ft) ft.dispose()
      if (bt) bt.dispose()
    }
  }, [rank, suit, skin])

  const fanConfig = useMemo(() => {
    if (fanTotal <= 1) {
      return { x: 0, y: 0, rotZ: 0, zIndex: 0 }
    }
    const spreadAngle = 0.12
    const centerIdx = (fanTotal - 1) / 2
    const offsetIdx = fanIndex - centerIdx

    const xOffset = offsetIdx * 1.35
    const yOffset = -Math.abs(offsetIdx) * 0.18 + Math.cos(offsetIdx * 0.4) * 0.1
    const rotZ = -offsetIdx * spreadAngle
    const zIndex = fanIndex * 0.05

    return { x: xOffset, y: yOffset, rotZ, zIndex }
  }, [fanIndex, fanTotal])

  // 3D Embers Particle State
  const emberPointsRef = useRef()
  const emberData = useMemo(() => {
    const count = 30
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.3
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.15
      velocities.push({
        vx: (Math.random() - 0.5) * 0.012,
        vy: 0.025 + Math.random() * 0.035,
        life: Math.random() * 50,
        maxLife: 50 + Math.random() * 30
      })
    }
    return { positions, velocities, count }
  }, [])

  useFrame((state, delta) => {
    if (!innerGroup.current) return

    if (!isReady) {
      innerGroup.current.rotation.y += delta * 0.9
      innerGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.15
      return
    }

    const targetX = state.pointer.x * (fanTotal > 1 ? 2.5 : 4.5) + fanConfig.x + targetOffset[0]
    const targetY = state.pointer.y * (fanTotal > 1 ? 1.5 : 2.5) + fanConfig.y + targetOffset[1]
    const targetZ = fanConfig.zIndex + targetOffset[2]

    const tension = 0.035
    const friction = 0.86

    const dx = targetX - position.current.x
    const dy = targetY - position.current.y

    velocity.current.x += dx * tension
    velocity.current.y += dy * tension

    velocity.current.x *= friction
    velocity.current.y *= friction

    position.current.x += velocity.current.x
    position.current.y += velocity.current.y
    position.current.z = THREE.MathUtils.lerp(position.current.z, targetZ, 0.1)

    innerGroup.current.position.set(position.current.x, position.current.y, position.current.z)

    const swingX = -velocity.current.y * 3.8
    const swingY = velocity.current.x * 3.8
    const swingZ = -velocity.current.x * 1.2

    const baseRotX = -(state.pointer.y * Math.PI) / 9
    const baseRotY = (state.pointer.x * Math.PI) / 9
    const targetFlipY = isFlipped ? Math.PI : 0

    const idleRotX = Math.cos(state.clock.elapsedTime * 1.2 + fanIndex * 0.5) * 0.04

    innerGroup.current.rotation.x = THREE.MathUtils.lerp(
      innerGroup.current.rotation.x,
      baseRotX + swingX + idleRotX,
      0.14
    )
    innerGroup.current.rotation.y = THREE.MathUtils.lerp(
      innerGroup.current.rotation.y,
      baseRotY + swingY + targetFlipY,
      0.12
    )
    innerGroup.current.rotation.z = THREE.MathUtils.lerp(
      innerGroup.current.rotation.z,
      fanConfig.rotZ + swingZ,
      0.14
    )

    // --------------------------------------------------
    // STEP REAL-TIME PIXEL FLAME BUFFER FOR EQUIPPED SKIN (ZERO GAP)
    // --------------------------------------------------
    const now = state.clock.elapsedTime * 1000
    if (now - lastFireTimeRef.current > 33 && fireCanvasRef.current && fireBufferRef.current) {
      lastFireTimeRef.current = now
      const ctx = fireCanvasRef.current.getContext('2d')
      const fireBuffer = fireBufferRef.current
      const palette = THEME_FIRE_PALETTES[skinTheme.themeStyle] || THEME_FIRE_PALETTES.obsidian

      const moveSpeed = Math.hypot(velocity.current.x, velocity.current.y)
      const intensity = 1.0 + Math.min(1.4, moveSpeed * 8)

      // 1. Bottom flush perimeter flame injection
      for (let x = cardLeft; x <= cardRight; x++) {
        if (Math.random() > 0.06) {
          const heat = Math.min(palette.length - 1, Math.floor((Math.random() * 4 + 4) * intensity))
          fireBuffer[cardBottom * FW + x] = heat
          fireBuffer[(cardBottom - 1) * FW + x] = heat
        }
      }

      // 2. Top flush perimeter flame injection
      for (let x = cardLeft; x <= cardRight; x++) {
        if (Math.random() > 0.12) {
          const heat = Math.min(palette.length - 1, Math.floor((Math.random() * 3 + 3) * intensity))
          fireBuffer[cardTop * FW + x] = heat
          fireBuffer[(cardTop + 1) * FW + x] = heat
        }
      }

      // 3. Side flush perimeter flame injection
      for (let y = cardTop; y <= cardBottom; y++) {
        if (Math.random() > 0.18) {
          const heat = Math.min(palette.length - 1, Math.floor((Math.random() * 3 + 4) * intensity))
          fireBuffer[y * FW + cardLeft] = heat
          fireBuffer[y * FW + cardRight] = heat
        }
      }

      // Propagate flame upward with dynamic wind decay
      const windX = Math.round(-velocity.current.x * 22)
      for (let y = 1; y < FH; y++) {
        for (let x = 0; x < FW; x++) {
          const srcIdx = y * FW + x
          const pixelHeat = fireBuffer[srcIdx]
          if (pixelHeat === 0) {
            fireBuffer[(y - 1) * FW + x] = 0
          } else {
            const decay = Math.random() < 0.45 ? 0 : 1
            const spread = Math.floor(Math.random() * 3) - 1 + windX
            const dstX = Math.max(0, Math.min(FW - 1, x + spread))
            const dstY = y - 1
            const newHeat = pixelHeat > decay ? pixelHeat - decay : 0
            fireBuffer[dstY * FW + dstX] = newHeat
          }
        }
      }

      // Draw flames to canvas
      ctx.clearRect(0, 0, FW, FH)
      for (let y = 0; y < FH; y++) {
        for (let x = 0; x < FW; x++) {
          const val = fireBuffer[y * FW + x]
          if (val > 0) {
            ctx.fillStyle = palette[Math.min(palette.length - 1, val)] || palette[palette.length - 1]
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }

      if (fireTextureRef.current) {
        fireTextureRef.current.needsUpdate = true
      }
    }

    // --------------------------------------------------
    // UPDATE 3D FLOATING FIRE EMBERS
    // --------------------------------------------------
    if (emberPointsRef.current) {
      const posAttr = emberPointsRef.current.geometry.attributes.position
      const arr = posAttr.array
      const { velocities, count } = emberData

      for (let i = 0; i < count; i++) {
        const vel = velocities[i]
        vel.life++
        arr[i * 3 + 1] += vel.vy
        arr[i * 3] += vel.vx - velocity.current.x * 0.35

        if (vel.life > vel.maxLife || arr[i * 3 + 1] > 2.2) {
          arr[i * 3] = (Math.random() - 0.5) * 2.2
          arr[i * 3 + 1] = -1.55 + Math.random() * 0.3
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.15
          vel.life = 0
          vel.maxLife = 40 + Math.random() * 30
        }
      }
      posAttr.needsUpdate = true
    }

    if (fanIndex === 0 && onTelemetry) {
      onTelemetry({
        pitch: (innerGroup.current.rotation.x * (180 / Math.PI)).toFixed(1),
        yaw: (innerGroup.current.rotation.y * (180 / Math.PI)).toFixed(1),
        roll: (innerGroup.current.rotation.z * (180 / Math.PI)).toFixed(1),
        velX: (velocity.current.x * 100).toFixed(1),
        velY: (velocity.current.y * 100).toFixed(1),
        speed: (Math.hypot(velocity.current.x, velocity.current.y) * 100).toFixed(1)
      })
    }
  })

  // Card geometry: width 2.2, height 3.1
  const cardGeometry = useMemo(() => new THREE.BoxGeometry(2.2, 3.1, 0.035, 1, 1, 1), [])

  // Flame plane: exact proportional scale so (cardLeft..cardRight) = 2.2 and (cardTop..cardBottom) = 3.1 -> ZERO GAP!
  const flamePlaneGeo = useMemo(() => new THREE.PlaneGeometry(2.816, 3.875), [])

  const cardMaterials = useMemo(() => {
    const accentColor = skinTheme.accentColor || '#b388ff'

    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.88,
      roughness: 0.22
    })

    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture || null,
      color: '#ffffff',
      roughness: isHolo ? 0.3 : 0.45,
      metalness: isHolo ? 0.15 : 0.05
    })

    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture || null,
      color: '#ffffff',
      roughness: isHolo ? 0.3 : 0.45,
      metalness: isHolo ? 0.15 : 0.05
    })

    return [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, frontMat, backMat]
  }, [frontTexture, backTexture, skinTheme, isHolo])

  const emberColor = useMemo(() => {
    return skinTheme.accentColor || '#b388ff'
  }, [skinTheme])

  return (
    <group {...props} dispose={null}>
      <group ref={innerGroup}>
        {/* Main 3D Card Box with Custom Front & Back Textures */}
        <mesh
          geometry={cardGeometry}
          material={cardMaterials}
          castShadow
          receiveShadow
        />

        {/* Dynamic 3D Pixel Fire Aura Plane (Flush Zero-Gap against 3D card borders) */}
        {fireTextureRef.current && (
          <mesh
            geometry={flamePlaneGeo}
            position={[0, 0, 0]}
          >
            <meshBasicMaterial
              map={fireTextureRef.current}
              transparent
              opacity={0.96}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 3D Rising Fire Ember Particle Sparkles */}
        <points ref={emberPointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={emberData.count}
              array={emberData.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color={emberColor}
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  )
}
