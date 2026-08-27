"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Suit symbols & colors
const SUIT_DATA = {
  hearts: { symbol: '♥', color: '#d91b2b', name: 'Hearts' },
  diamonds: { symbol: '♦', color: '#c0392b', name: 'Diamonds' },
  spades: { symbol: '♠', color: '#1a1c23', name: 'Spades' },
  clubs: { symbol: '♣', color: '#1a1c23', name: 'Clubs' }
}

// Generate luxury high-res front texture
function createCardFrontTexture(rank = 'A', suit = 'hearts', skin = 'classic') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1440
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const suitInfo = SUIT_DATA[suit] || SUIT_DATA.hearts
  const isRed = suit === 'hearts' || suit === 'diamonds'

  // Card background based on skin
  if (skin === 'obsidian') {
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440)
    bgGrad.addColorStop(0, '#15161a')
    bgGrad.addColorStop(0.5, '#1e2029')
    bgGrad.addColorStop(1, '#0e0f12')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1024, 1440)

    // Gold foil border
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 16
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72)

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
    ctx.lineWidth = 4
    ctx.strokeRect(56, 56, 1024 - 112, 1440 - 112)
  } else if (skin === 'cyber') {
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440)
    bgGrad.addColorStop(0, '#090a10')
    bgGrad.addColorStop(1, '#131524')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1024, 1440)

    ctx.strokeStyle = isRed ? '#ff007f' : '#00f0ff'
    ctx.lineWidth = 14
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72)

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(54, 54, 1024 - 108, 1440 - 108)
  } else if (skin === 'emerald') {
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440)
    bgGrad.addColorStop(0, '#f9f6ed')
    bgGrad.addColorStop(1, '#ebe4d3')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1024, 1440)

    ctx.strokeStyle = '#1b4d3e'
    ctx.lineWidth = 18
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72)

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 6
    ctx.strokeRect(58, 58, 1024 - 116, 1440 - 116)
  } else {
    // Classic Luxury Cream Ivory
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440)
    bgGrad.addColorStop(0, '#fffef8')
    bgGrad.addColorStop(0.5, '#fcf7ec')
    bgGrad.addColorStop(1, '#f5ecd6')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1024, 1440)

    // Subtle luxury linen pattern
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < 1024; x += 14) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1440)
      ctx.stroke()
    }

    // Gold foil border
    ctx.strokeStyle = '#c5a059'
    ctx.lineWidth = 16
    ctx.strokeRect(36, 36, 1024 - 72, 1440 - 72)

    ctx.strokeStyle = '#e6c875'
    ctx.lineWidth = 4
    ctx.strokeRect(56, 56, 1024 - 112, 1440 - 112)
  }

  // Corner indices
  const drawCorner = (x, y, isFlipped = false) => {
    ctx.save()
    ctx.translate(x, y)
    if (isFlipped) {
      ctx.rotate(Math.PI)
    }

    let textColor = suitInfo.color
    if (skin === 'obsidian') {
      textColor = isRed ? '#ff4d6d' : '#d4af37'
    } else if (skin === 'cyber') {
      textColor = isRed ? '#ff007f' : '#00f0ff'
    }

    ctx.fillStyle = textColor
    ctx.font = 'bold 110px "Geist", "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(rank, 0, 0)

    ctx.font = '90px "Segoe UI Symbol", Arial'
    ctx.fillText(suitInfo.symbol, 0, 100)
    ctx.restore()
  }

  drawCorner(130, 140, false)
  drawCorner(1024 - 130, 1440 - 140, true)

  // Center Art
  ctx.save()
  ctx.translate(512, 720)

  let mainColor = suitInfo.color
  if (skin === 'obsidian') {
    mainColor = isRed ? '#ff3366' : '#e6c875'
  } else if (skin === 'cyber') {
    mainColor = isRed ? '#ff007f' : '#00f0ff'
  }

  if (rank === 'A') {
    const aura = ctx.createRadialGradient(0, 0, 50, 0, 0, 360)
    aura.addColorStop(0, skin === 'obsidian' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(217, 27, 43, 0.15)')
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(0, 0, 360, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = mainColor
    ctx.font = '480px "Segoe UI Symbol", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(suitInfo.symbol, 0, 15)

    ctx.font = 'bold 36px "Geist", sans-serif'
    ctx.fillStyle = skin === 'obsidian' ? '#ffffff' : '#14161c'
    ctx.fillText('POKEHUB ROYALTY', 0, 320)
  } else {
    ctx.fillStyle = mainColor
    ctx.font = '320px "Segoe UI Symbol", Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(suitInfo.symbol, 0, -30)

    ctx.font = 'bold 160px "Geist", sans-serif'
    ctx.fillText(rank, 0, 240)
  }

  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

// Generate luxury back texture
function createCardBackTexture(skin = 'classic') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1440
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let primary = '#a61c24'
  let secondary = '#730d14'
  let gold = '#d4af37'

  if (skin === 'obsidian') {
    primary = '#121318'
    secondary = '#08080a'
    gold = '#c5a059'
  } else if (skin === 'cyber') {
    primary = '#0a0d1a'
    secondary = '#04050a'
    gold = '#00f0ff'
  } else if (skin === 'emerald') {
    primary = '#0f382c'
    secondary = '#071f18'
    gold = '#e6c875'
  }

  const bgGrad = ctx.createRadialGradient(512, 720, 100, 512, 720, 800)
  bgGrad.addColorStop(0, primary)
  bgGrad.addColorStop(1, secondary)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1440)

  ctx.strokeStyle = gold
  ctx.lineWidth = 20
  ctx.strokeRect(40, 40, 1024 - 80, 1440 - 80)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(65, 65, 1024 - 130, 1440 - 130)

  ctx.save()
  ctx.translate(512, 720)
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)'
  ctx.lineWidth = 2

  for (let i = 0; i < 36; i++) {
    ctx.rotate((Math.PI * 2) / 36)
    ctx.beginPath()
    ctx.ellipse(0, 0, 180, 420, Math.PI / 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = secondary
  ctx.beginPath()
  ctx.arc(0, 0, 170, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.lineWidth = 10
  ctx.stroke()

  ctx.fillStyle = gold
  ctx.font = 'bold 90px "Geist", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PH', 0, -10)

  ctx.font = 'bold 22px "Geist", sans-serif'
  ctx.fillText('EST. 2026', 0, 60)

  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
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
