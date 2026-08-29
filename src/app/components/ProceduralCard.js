"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PIXEL_SUITS = {
  hearts: [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0]
  ],
  spades: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0]
  ],
  diamonds: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
  ],
  clubs: [
    [0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,0,1,1,0],
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0]
  ]
}

const PIXEL_LETTERS = {
  A: [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1]
  ],
  K: [
    [1,0,0,1],
    [1,0,1,0],
    [1,1,0,0],
    [1,0,1,0],
    [1,0,0,1]
  ],
  Q: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,1,0],
    [0,1,1,1]
  ],
  J: [
    [0,0,0,1],
    [0,0,0,1],
    [0,0,0,1],
    [1,0,0,1],
    [0,1,1,0]
  ],
  10: [
    [1,0,1,1,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,1,1]
  ]
}

function drawPixelMatrix(ctx, x, y, size, matrix, color) {
  ctx.fillStyle = color
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        ctx.fillRect(x + c * size, y + r * size, size, size)
      }
    }
  }
}

// Generate luxury high-res front texture
function createCardFrontTexture(rank = 'A', suit = 'hearts', skin = 'classic') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  // We'll use 64 x 96 base resolution for true chunky pixels
  canvas.width = 64
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false

  const isRed = suit === 'hearts' || suit === 'diamonds'
  const color = isRed ? '#ef4444' : '#333333' // flat colors for true pixel art

  // Background
  ctx.fillStyle = '#f8f8f8'
  ctx.fillRect(0, 0, 64, 96)

  // 1px Border
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 2 // 2px drawn on the edge means 1px inside
  ctx.strokeRect(1, 1, 62, 94)

  const suitMatrix = PIXEL_SUITS[suit] || PIXEL_SUITS.hearts
  const rankMatrix = PIXEL_LETTERS[rank] || PIXEL_LETTERS['A']

  // Draw Top Left (rank + suit)
  drawPixelMatrix(ctx, 4, 4, 1, rankMatrix, color)
  drawPixelMatrix(ctx, 3, 11, 1, suitMatrix, color)

  // Draw Bottom Right (inverted)
  ctx.save()
  ctx.translate(64, 96)
  ctx.rotate(Math.PI)
  drawPixelMatrix(ctx, 4, 4, 1, rankMatrix, color)
  drawPixelMatrix(ctx, 3, 11, 1, suitMatrix, color)
  ctx.restore()

  // Draw Big Center Suit
  drawPixelMatrix(ctx, 32 - (suitMatrix[0].length * 4) / 2, 48 - (suitMatrix.length * 4) / 2, 4, suitMatrix, color)

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.anisotropy = 1
  texture.needsUpdate = true
  return texture
}

// Generate luxury back texture
function createCardBackTexture(skin = 'classic') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false

  // Background
  ctx.fillStyle = '#f8f8f8'
  ctx.fillRect(0, 0, 64, 96)
  
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 62, 94)

  // Inner border
  ctx.strokeStyle = '#ef4444' // Red pixel back
  ctx.strokeRect(4, 4, 56, 88)

  // Checkerboard pixel pattern
  ctx.fillStyle = '#ef4444'
  for (let y = 6; y < 90; y += 4) {
    for (let x = 6; x < 58; x += 4) {
      if ((x / 4 + y / 4) % 2 === 0) {
        ctx.fillRect(x, y, 4, 4)
      }
    }
  }

  // White box in middle
  ctx.fillStyle = '#f8f8f8'
  ctx.fillRect(16, 36, 32, 24)
  ctx.strokeStyle = '#555555'
  ctx.strokeRect(16, 36, 32, 24)

  // Letter P
  drawPixelMatrix(ctx, 22, 42, 2, [
    [1,1,1],
    [1,0,1],
    [1,1,1],
    [1,0,0],
    [1,0,0]
  ], '#333333')

  // Letter H
  drawPixelMatrix(ctx, 32, 42, 2, [
    [1,0,1],
    [1,0,1],
    [1,1,1],
    [1,0,1],
    [1,0,1]
  ], '#333333')

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
  skin = 'classic',
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

  const cardGeometry = useMemo(() => new THREE.BoxGeometry(2.2, 3.1, 0.035, 1, 1, 1), [])

  const cardMaterials = useMemo(() => {
    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: skin === 'cyber' ? '#00f0ff' : '#d4af37',
      metalness: 0.85,
      roughness: 0.25
    })

    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture || null,
      color: frontTexture ? '#ffffff' : '#f9f6ed',
      roughness: isHolo ? 0.25 : 0.4,
      metalness: isHolo ? 0.35 : 0.1
    })

    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture || null,
      color: backTexture ? '#ffffff' : '#8b151b',
      roughness: isHolo ? 0.28 : 0.45,
      metalness: isHolo ? 0.3 : 0.15
    })

    return [goldEdgeMat, goldEdgeMat, goldEdgeMat, goldEdgeMat, frontMat, backMat]
  }, [frontTexture, backTexture, skin, isHolo])

  return (
    <group {...props} dispose={null}>
      <group ref={innerGroup}>
        <mesh
          geometry={cardGeometry}
          material={cardMaterials}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  )
}
