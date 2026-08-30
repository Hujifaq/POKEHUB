"use client"

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Reusable SVG Pixel Matrix Renderer (Crisp, true 8-bit integer pixel art)
function PixelArt({ matrix, size = 4, defaultColor = '#050505', className = '' }) {
  if (!matrix || matrix.length === 0) return null
  const height = matrix.length
  const width = matrix[0].length
  return (
    <svg
      width={width * size}
      height={height * size}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {matrix.map((row, r) =>
        row.map((val, c) => {
          if (!val) return null
          const fill = typeof val === 'string' ? val : defaultColor
          return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fill} />
        })
      )}
    </svg>
  )
}

// ----------------------------------------------------
// THEMED ANIMATED PIXEL FIRE EFFECT (AROUND THE CARDS)
// ----------------------------------------------------
const THEME_FIRE_PALETTES = {
  obsidian: ['transparent', '#15092a', '#380f5c', '#5f1e94', '#8a2be2', '#b388ff', '#d8b4fe', '#ffffff'],
  gold: ['transparent', '#261a00', '#593e00', '#8a6200', '#c29200', '#ffd700', '#fff4a3', '#ffffff'],
  cyber: ['transparent', '#001a24', '#004760', '#007e9e', '#00a8b5', '#00f0ff', '#ff80bf', '#ffffff'],
  emerald: ['transparent', '#041f11', '#0b4d29', '#146939', '#1e824c', '#2ecc71', '#85ffaa', '#ffffff'],
  sakura: ['transparent', '#26000f', '#590022', '#99003a', '#cc004e', '#ff2a6d', '#ffa6c9', '#ffffff'],
  // Special Inky Black Dark Smoke & Void Plume Palette
  retro: ['transparent', '#050508', '#0a0b10', '#12141c', '#1b1d28', '#282b3a', '#3c4155', '#161720']
}

function PixelFireAura({ themeStyle = 'retro', isHovered = false }) {
  const canvasRef = useRef(null)
  const isDarkSmoke = themeStyle === 'retro'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 56
    const H = 76
    canvas.width = W
    canvas.height = H

    const palette = THEME_FIRE_PALETTES[themeStyle] || THEME_FIRE_PALETTES.retro
    const fireBuffer = new Uint8Array(W * H)
    let animationFrameId
    let lastTime = 0
    let tick = 0
    const fps = isDarkSmoke ? 20 : 24
    const interval = 1000 / fps

    // Card boundary box inside low-res grid (flush with card perimeter)
    const cardLeft = 4
    const cardRight = W - 4
    const cardTop = 7
    const cardBottom = H - 4

    // Floating dark soot / smoke & ember particles
    const embers = Array.from({ length: isDarkSmoke ? 26 : 22 }, () => ({
      x: cardLeft + Math.random() * (cardRight - cardLeft),
      y: cardBottom - Math.random() * (H * 0.85),
      vy: isDarkSmoke ? 0.25 + Math.random() * 0.5 : 0.45 + Math.random() * 0.85,
      vx: (Math.random() - 0.5) * (isDarkSmoke ? 0.6 : 0.4),
      size: isDarkSmoke ? Math.floor(Math.random() * 2) + 1 : 1,
      life: Math.random() * 25 + 15,
      maxLife: 40
    }))

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render)
      if (time - lastTime < interval) return
      lastTime = time
      tick++

      const intensityMultiplier = isHovered ? 1.4 : 1.1

      if (isDarkSmoke) {
        // ==========================================
        // BLACK DARK SHADOW SMOKE / VOID ENGINE
        // ==========================================
        // 1. Bottom edge smoke injection
        for (let x = cardLeft - 1; x <= cardRight + 1; x++) {
          if (x >= 0 && x < W) {
            const wave = Math.sin(x * 0.4 + tick * 0.14)
            const baseSmoke = wave > -0.3 && Math.random() > 0.12
              ? Math.floor((Math.random() * 3 + 4) * intensityMultiplier)
              : 0
            fireBuffer[(H - 2) * W + x] = Math.min(palette.length - 1, baseSmoke)
            fireBuffer[(H - 1) * W + x] = Math.min(palette.length - 1, baseSmoke)
          }
        }

        // 2. Top edge smoke injection (billowing off card top)
        for (let x = cardLeft - 1; x <= cardRight + 1; x++) {
          if (x >= 0 && x < W) {
            if (Math.random() > 0.2) {
              const topSmoke = Math.floor((Math.random() * 3 + 3) * intensityMultiplier)
              fireBuffer[cardTop * W + x] = Math.min(palette.length - 1, topSmoke)
              fireBuffer[(cardTop + 1) * W + x] = Math.min(palette.length - 1, topSmoke)
            }
          }
        }

        // 3. Side dark smoke plumes directly on card edges
        for (let y = cardTop; y <= cardBottom; y++) {
          if (Math.random() > 0.25) {
            const sideSmoke = Math.floor((Math.random() * 3 + 4) * intensityMultiplier)
            fireBuffer[y * W + cardLeft - 1] = Math.min(palette.length - 1, sideSmoke)
            fireBuffer[y * W + cardRight + 1] = Math.min(palette.length - 1, sideSmoke)
          }
        }

        // Propagate black smoke upwards
        for (let y = 1; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const srcIdx = y * W + x
            const pixel = fireBuffer[srcIdx]
            if (pixel === 0) {
              fireBuffer[(y - 1) * W + x] = 0
            } else {
              const decay = Math.random() < 0.4 ? 0 : 1
              const spread = Math.floor(Math.random() * 3) - 1
              const dstX = Math.max(0, Math.min(W - 1, x + spread))
              const dstY = y - 1
              const newPixel = pixel > decay ? pixel - decay : 0
              fireBuffer[dstY * W + dstX] = newPixel
            }
          }
        }
      } else {
        // ==========================================
        // THEMED PIXEL FIRE (ALL 4 CARD BORDERS)
        // ==========================================
        // 1. Bottom edge flame injection
        for (let x = cardLeft - 1; x <= cardRight + 1; x++) {
          if (x >= 0 && x < W) {
            const baseHeat = Math.random() > 0.08 ? Math.floor((Math.random() * 3 + 5) * intensityMultiplier) : 0
            fireBuffer[(H - 2) * W + x] = Math.min(palette.length - 1, baseHeat)
            fireBuffer[(H - 1) * W + x] = Math.min(palette.length - 1, baseHeat)
          }
        }

        // 2. Top edge flame injection (dancing flames crowning the card)
        for (let x = cardLeft - 1; x <= cardRight + 1; x++) {
          if (x >= 0 && x < W) {
            if (Math.random() > 0.15) {
              const topHeat = Math.floor((Math.random() * 3 + 4) * intensityMultiplier)
              fireBuffer[cardTop * W + x] = Math.min(palette.length - 1, topHeat)
              fireBuffer[(cardTop + 1) * W + x] = Math.min(palette.length - 1, topHeat)
            }
          }
        }

        // 3. Side flames shooting directly from left & right card borders
        for (let y = cardTop; y <= cardBottom; y++) {
          if (Math.random() > 0.22) {
            const sideHeat = Math.floor((Math.random() * 3 + 4) * intensityMultiplier)
            fireBuffer[y * W + cardLeft - 1] = Math.min(palette.length - 1, sideHeat)
            fireBuffer[y * W + cardRight + 1] = Math.min(palette.length - 1, sideHeat)
          }
        }

        // Propagate heat upwards (rising flame tongues)
        for (let y = 1; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const srcIdx = y * W + x
            const pixel = fireBuffer[srcIdx]
            if (pixel === 0) {
              fireBuffer[(y - 1) * W + x] = 0
            } else {
              const decay = Math.random() < 0.26 ? 0 : 1
              const spread = Math.floor(Math.random() * 3) - 1
              const dstX = Math.max(0, Math.min(W - 1, x + spread))
              const dstY = y - 1
              const newPixel = pixel > decay ? pixel - decay : 0
              fireBuffer[dstY * W + dstX] = newPixel
            }
          }
        }
      }

      // Clear canvas & draw pixel smoke / fire
      ctx.clearRect(0, 0, W, H)

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const val = fireBuffer[y * W + x]
          if (val > 0) {
            ctx.fillStyle = palette[val] || palette[palette.length - 1]
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }

      // Update and draw floating particles / embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.y -= e.vy * intensityMultiplier
        e.x += e.vx + (Math.random() - 0.5) * (isDarkSmoke ? 0.4 : 0.3)
        e.life--

        if (e.y < 2 || e.life <= 0 || e.x < 0 || e.x >= W) {
          e.x = cardLeft - 2 + Math.random() * (cardRight - cardLeft + 4)
          e.y = cardBottom + Math.random() * 3
          e.life = Math.random() * (isDarkSmoke ? 30 : 20) + 15
          e.vy = isDarkSmoke ? 0.3 + Math.random() * 0.5 : 0.5 + Math.random() * 0.8
        }

        const smokeLevel = Math.min(palette.length - 1, Math.floor((e.life / e.maxLife) * 5) + 2)
        ctx.fillStyle = palette[smokeLevel] || palette[palette.length - 1]
        const pSize = isDarkSmoke ? (e.size || 1) : 1
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), pSize, pSize)
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [themeStyle, isHovered, isDarkSmoke])

  return (
    <div className="absolute -inset-4 sm:-inset-5 pointer-events-none z-0 flex items-center justify-center overflow-visible select-none [transform:translateZ(-1px)]">
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-fill ${isDarkSmoke ? 'opacity-100 filter drop-shadow-[0_0_14px_rgba(0,0,0,0.95)]' : 'opacity-95 filter drop-shadow-[0_0_14px_rgba(0,0,0,0.8)]'}`}
        style={{
          imageRendering: 'pixelated'
        }}
      />
    </div>
  )
}

// ----------------------------------------------------
// PIXEL MATRICES (8-bit Suits, Motifs & Graffiti Tags)
// ----------------------------------------------------
const PIX_SUITS = {
  spade: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0]
  ],
  heart: [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0]
  ],
  diamond: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0]
  ],
  club: [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0]
  ],
  star: [
    [0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1]
  ]
}

// ----------------------------------------------------
// THEMED FRONT CENTERPIECE PIXEL ARTWORKS (16x16 / 18x18)
// ----------------------------------------------------
const PIXEL_FRONTS = {
  obsidian: [
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
  ],
  gold: [
    [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0]
  ],
  cyber: [
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]
  ],
  emerald: [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]
  ],
  sakura: [
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0]
  ],
  retro: [
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
}

// ----------------------------------------------------
// THEMED FULL-CARD OUTLINE PIXEL GRAFFITI ARTWORKS (24x34)
// ----------------------------------------------------
const PIXEL_GRAFFITI = {
  obsidian: [
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
  ],
  gold: [
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  cyber: [
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0]
  ],
  emerald: [
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0]
  ],
  sakura: [
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  retro: [
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
}

const SHOWCASE_EDITIONS = [
  {
    id: '01',
    name: 'OBSIDIAN FOIL',
    subtitle: 'THE MIDNIGHT ACE OF SPADES',
    tag: 'MYTHIC CLASS',
    bgGradient: 'from-[#121420] via-[#1a1c2b] to-[#0d0e17]',
    accentColor: '#b388ff',
    borderColor: '#050505',
    pillBg: 'bg-accent-cyan',
    rotation: '-rotate-[4deg]',
    cardSuit: '♠',
    suitKey: 'spade',
    cardRank: 'A',
    cardSkin: 'obsidian',
    badgeText: 'BLACK CHROME FOIL',
    stats: { rarity: '0.1% DROP', chips: '$10,000 CHIP', finish: 'VAPOR DEPOSITED' },
    chipColor: 'bg-[#181824] text-[#b388ff] border-[#b388ff]',
    decorTokens: ['♠', '★', '💎', '🪙'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'obsidian',
    graffitiTitle: 'POKERHUB',
    graffitiSub: 'MIDNIGHT TAG #01'
  },
  {
    id: '02',
    name: 'IVORY GOLD',
    subtitle: '24K ROYAL KING OF HEARTS',
    tag: 'VIP HIGH ROLLER',
    bgGradient: 'from-[#fbf5e8] via-[#f3e7cb] to-[#e8d5af]',
    accentColor: '#d4af37',
    borderColor: '#050505',
    pillBg: 'bg-accent-yellow',
    rotation: 'rotate-[5deg]',
    cardSuit: '♥',
    suitKey: 'heart',
    cardRank: 'K',
    cardSkin: 'gold',
    badgeText: '24K MIRROR FINISH',
    stats: { rarity: 'ROYAL TIED', chips: '$25,000 CHIP', finish: 'HAND-ENGRAVED' },
    chipColor: 'bg-[#ffd700] text-[#050505] border-true-black',
    decorTokens: ['♥', '👑', '✨', '⚜️'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'gold',
    graffitiTitle: 'ROYAL FLUSH',
    graffitiSub: '24K DRIP // $$$'
  },
  {
    id: '03',
    name: 'CYBER NEON',
    subtitle: 'HOLOGRAPHIC QUEEN OF DIAMONDS',
    tag: 'SYNTHWAVE 2099',
    bgGradient: 'from-[#081a2e] via-[#0f2d4a] to-[#1e0d2d]',
    accentColor: '#00a8b5',
    borderColor: '#050505',
    pillBg: 'bg-ui-pink',
    rotation: '-rotate-[3deg]',
    cardSuit: '♦',
    suitKey: 'diamond',
    cardRank: 'Q',
    cardSkin: 'cyber',
    badgeText: 'PRISM GLITCH FOIL',
    stats: { rarity: 'CYBER VAULT', chips: '$5,000 CHIP', finish: 'LASER DIFFRACTION' },
    chipColor: 'bg-[#00f0ff] text-[#050505] border-true-black',
    decorTokens: ['♦', '⚡', '💾', '🎲'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'cyber',
    graffitiTitle: 'NEON VAULT',
    graffitiSub: 'SHIBUYA 2099'
  },
  {
    id: '04',
    name: 'EMERALD SUITE',
    subtitle: 'CASINO FELT JACK OF CLUBS',
    tag: 'MONTE CARLO',
    bgGradient: 'from-[#0a2717] via-[#0f3d23] to-[#06180e]',
    accentColor: '#1e824c',
    borderColor: '#050505',
    pillBg: 'bg-accent-yellow',
    rotation: 'rotate-[6deg]',
    cardSuit: '♣',
    suitKey: 'club',
    cardRank: 'J',
    cardSkin: 'emerald',
    badgeText: 'BAIZE FELT WEAVE',
    stats: { rarity: 'DEALER EXCLUSIVE', chips: '$50,000 CHIP', finish: 'WATERPROOF PVC' },
    chipColor: 'bg-[#2ecc71] text-[#050505] border-true-black',
    decorTokens: ['♣', '🍀', '🎲', '🪙'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'emerald',
    graffitiTitle: 'ALL IN',
    graffitiSub: 'CASINO ROYALE'
  },
  {
    id: '05',
    name: 'SAKURA RUBY',
    subtitle: 'ARCADE ACE OF HEARTS',
    tag: 'AKIHABARA SPECIAL',
    bgGradient: 'from-[#ffe0ea] via-[#ffb8ce] to-[#ffa6c9]',
    accentColor: '#d6336c',
    borderColor: '#050505',
    pillBg: 'bg-accent-cyan',
    rotation: '-rotate-[5deg]',
    cardSuit: '♥',
    suitKey: 'heart',
    cardRank: 'A',
    cardSkin: 'sakura',
    badgeText: 'CHERRY FOIL EMBOSS',
    stats: { rarity: 'LIMITED 1/100', chips: '$1,000 CHIP', finish: 'VELVET SOFT-TOUCH' },
    chipColor: 'bg-[#ffa6c9] text-[#050505] border-true-black',
    decorTokens: ['♥', '🌸', '✨', '🍒'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'sakura',
    graffitiTitle: 'KAWAII ACE',
    graffitiSub: 'HARAJUKU TAG'
  },
  {
    id: '06',
    name: 'RETRO 8-BIT',
    subtitle: 'PIXEL ARCADE JOKER WILD',
    tag: 'GENESIS EDITION',
    bgGradient: 'from-[#fff4a3] via-[#ffdf6d] to-[#ffbe3b]',
    accentColor: '#e65100',
    borderColor: '#050505',
    pillBg: 'bg-ui-blue',
    rotation: 'rotate-[4deg]',
    cardSuit: '★',
    suitKey: 'star',
    cardRank: '777',
    cardSkin: 'retro',
    badgeText: 'CRT SCANLINE PHOSPHOR',
    stats: { rarity: 'SECRET UNLOCK', chips: '$100,000 CHIP', finish: 'CHIP TUNE AUDIO' },
    chipColor: 'bg-[#ff6b00] text-white border-true-black',
    decorTokens: ['★', '🕹️', '🪙', '⭐'],
    frontBg: 'bg-[#FAF7F2]',
    frontBorder: 'border-true-black/30',
    rankColor: 'text-true-black',
    themeStyle: 'retro',
    graffitiTitle: 'GAME OVER',
    graffitiSub: '1UP // INSERT COIN'
  }
]

// ----------------------------------------------------
// PIXEL CARD FRONT COMPONENT
// ----------------------------------------------------
function PixelCardFront({ item }) {
  const isRed = ['♥', '♦'].includes(item.cardSuit)
  const suitColor = isRed ? '#d6336c' : '#050505'
  const motif = PIXEL_FRONTS[item.themeStyle] || PIXEL_FRONTS.obsidian
  const suitMat = PIX_SUITS[item.suitKey] || PIX_SUITS.spade

  return (
    <div
      className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-xl ${item.frontBg} border-[2px] ${item.frontBorder} p-3 flex flex-col justify-between overflow-hidden select-none`}
    >
      {/* Subtle CRT / Hologram Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />

      {/* Top-Left Index (Rank + Pixel Suit) */}
      <div className="flex flex-col items-center leading-none z-10 self-start">
        <span className={`font-pixel text-lg sm:text-xl font-black ${item.rankColor} drop-shadow-[1px_1px_0px_#fff]`}>
          {item.cardRank}
        </span>
        <div className="mt-1">
          <PixelArt matrix={suitMat} size={2.5} defaultColor={suitColor} />
        </div>
      </div>

      {/* Central Pixel Art Motif (Clean, no text badge below logo) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="p-3 rounded-xl border-[3px] border-true-black bg-white shadow-[4px_4px_0px_#050505] flex items-center justify-center">
          <PixelArt matrix={motif} size={7.5} defaultColor={item.accentColor} />
        </div>
      </div>

      {/* Bottom-Right Inverted Index */}
      <div className="flex flex-col items-center leading-none self-end rotate-180 z-10">
        <span className={`font-pixel text-lg sm:text-xl font-black ${item.rankColor} drop-shadow-[1px_1px_0px_#fff]`}>
          {item.cardRank}
        </span>
        <div className="mt-1">
          <PixelArt matrix={suitMat} size={2.5} defaultColor={suitColor} />
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// PIXEL CARD BACK COMPONENT (FULL-CARD OUTLINE PIXEL GRAFFITI)
// ----------------------------------------------------
function PixelCardBack({ item }) {
  const graffitiMat = PIXEL_GRAFFITI[item.themeStyle] || PIXEL_GRAFFITI.obsidian

  return (
    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-[3px] border-true-black bg-[#07080d] p-2 flex items-center justify-center overflow-hidden select-none">
      {/* Edge-to-Edge Full-Card Outline Pixel Graffiti Piece */}
      <div className="w-full h-full flex items-center justify-center p-1">
        <PixelArt
          matrix={graffitiMat}
          size={9}
          defaultColor={item.accentColor}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}

// ----------------------------------------------------
// SINGLE INTERACTIVE SHOWCASE CARD FRAME WITH 3D FLIP
// ----------------------------------------------------
function InteractiveShowcaseCard({ item, onSelectDeck, isEquipped }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardFrameRef = useRef(null)
  const cardBodyRef = useRef(null)
  const chipRef = useRef(null)
  const token1Ref = useRef(null)
  const token2Ref = useRef(null)
  const watermarkRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardFrameRef.current) return
    const rect = cardFrameRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5

    // Smooth mouse tracking on central card with 3D tilt
    if (cardBodyRef.current) {
      gsap.to(cardBodyRef.current, {
        x: px * 32,
        y: py * 24,
        rotationY: px * 18,
        rotationX: -py * 18,
        rotationZ: px * 3,
        transformPerspective: 1000,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // Floating chip tracks with dynamic counter-motion
    if (chipRef.current) {
      gsap.to(chipRef.current, {
        x: -px * 48,
        y: -py * 38,
        rotation: px * 35,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // Floating tokens track mouse at varying depths
    if (token1Ref.current) {
      gsap.to(token1Ref.current, {
        x: px * 22,
        y: py * 18,
        rotation: -px * 25,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (token2Ref.current) {
      gsap.to(token2Ref.current, {
        x: px * 28,
        y: py * 22,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: px * 16,
        y: py * 12,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }
  }

  const handleMouseLeave = () => {
    setIsFlipped(false)

    // Smoothly spring back to rest position on mouse leave
    if (cardBodyRef.current) {
      gsap.to(cardBodyRef.current, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.7,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      })
    }

    if (chipRef.current) {
      gsap.to(chipRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      })
    }

    if (token1Ref.current) {
      gsap.to(token1Ref.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (token2Ref.current) {
      gsap.to(token2Ref.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }
  }

  return (
    <div
      ref={cardFrameRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-[85vw] sm:w-[520px] md:w-[580px] lg:w-[640px] h-[520px] sm:h-[580px] md:h-[620px] shrink-0 relative flex flex-col justify-between p-6 sm:p-8 rounded-[32px] border-[4px] border-true-black shadow-[10px_10px_0px_#050505] overflow-hidden bg-gradient-to-br ${item.bgGradient} ${item.rotation} transition-transform duration-300 hover:scale-[1.01]`}
      style={{ perspective: 1200 }}
    >
      {/* Background Watermark Number */}
      <div
        ref={watermarkRef}
        className="absolute -bottom-10 -right-6 font-display text-[180px] sm:text-[240px] font-black text-black/10 select-none pointer-events-none leading-none z-0 will-change-transform"
      >
        {item.id}
      </div>

      {/* Faint Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Frame Top Header */}
      <div className="relative z-10 flex items-start justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] font-bold px-2 py-0.5 bg-white border-[2px] border-true-black brutal-shadow-sm text-true-black">
              EDITION {item.id}/06
            </span>
            <span
              className={`font-pixel text-[9px] font-bold px-2 py-0.5 ${item.pillBg} border-[2px] border-true-black brutal-shadow-sm text-true-black uppercase`}
            >
              {item.tag}
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[2px_2px_0px_#050505] tracking-tight">
            {item.name}
          </h3>
          <p className="font-pixel text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider mt-0.5">
            {item.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="w-10 h-10 rounded-full border-[3px] border-true-black bg-white flex items-center justify-center font-display text-lg font-black brutal-shadow-sm text-true-black">
            {item.cardSuit}
          </div>
          <span className="font-pixel text-[7px] text-white/90 bg-black/50 px-1.5 py-0.5 rounded border border-white/20 uppercase">
            ↻ FLIP ON HOVER
          </span>
        </div>
      </div>

      {/* Frame Center: 3D Pixel Playing Card with 3D Flip to Pixel Graffiti on Hover */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        {/* Background Floating Token 1 */}
        <div
          ref={token1Ref}
          className="absolute top-2 left-6 text-3xl sm:text-4xl drop-shadow-[2px_2px_0px_#000] select-none pointer-events-none will-change-transform"
        >
          {item.decorTokens[1]}
        </div>

        {/* Background Floating Token 2 */}
        <div
          ref={token2Ref}
          className="absolute bottom-8 right-10 text-2xl sm:text-3xl drop-shadow-[2px_2px_0px_#000] select-none pointer-events-none will-change-transform"
        >
          {item.decorTokens[3]}
        </div>

        {/* Main 3D Card Container (Tracks Mouse & Flips in 3D on Hover) */}
        <div
          ref={cardBodyRef}
          onMouseEnter={() => {
            SoundEngine.playCardFlip()
            setIsFlipped(true)
          }}
          onMouseLeave={() => {
            setIsFlipped(false)
          }}
          onClick={() => setIsFlipped(f => !f)}
          className="relative w-[210px] sm:w-[240px] md:w-[270px] h-[300px] sm:h-[340px] md:h-[380px] cursor-pointer will-change-transform select-none flex items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Inner 3D Flipping Card Body */}
          <div
            className={`w-full h-full relative rounded-2xl border-[4px] border-true-black shadow-[8px_8px_0px_#050505] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
          >
            {/* Animated Themed Pixel Fire Effect (Flips seamlessly in 3D with the card) */}
            <PixelFireAura themeStyle={item.themeStyle} isHovered={isFlipped} />

            {/* FRONT FACE OF PIXEL PLAYING CARD */}
            <PixelCardFront item={item} />

            {/* BACK FACE OF PIXEL PLAYING CARD (AUTHENTIC RETRO GRAFFITI) */}
            <PixelCardBack item={item} />
          </div>
        </div>

        {/* Foreground Floating Casino Chip */}
        <div
          ref={chipRef}
          className={`absolute -bottom-3 -left-4 sm:-left-6 w-16 sm:w-20 h-16 sm:h-20 rounded-full border-[3px] border-true-black ${item.chipColor} flex flex-col items-center justify-center font-pixel text-[7px] sm:text-[8px] font-black shadow-[4px_4px_0px_#050505] z-20 pointer-events-none will-change-transform`}
        >
          <span>{item.stats.chips.split(' ')[0]}</span>
          <span className="text-[6px]">CHIP</span>
        </div>

        {/* Foreground Floating Token 2 */}
        <div className="absolute -top-4 -right-2 sm:-right-4 text-4xl sm:text-5xl drop-shadow-[4px_4px_0px_#000] z-20 select-none pointer-events-none">
          {item.decorTokens[0]}
        </div>
      </div>

      {/* Frame Bottom Bar: Stats and Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t-[3px] border-black/20">
        <div className="flex items-center gap-2 text-white">
          <span className="font-pixel text-[8px] sm:text-[9px] bg-black/40 border border-white/20 px-2 py-1 rounded">
            {item.stats.rarity}
          </span>
          <span className="font-pixel text-[8px] sm:text-[9px] bg-black/40 border border-white/20 px-2 py-1 rounded hidden sm:inline">
            {item.stats.finish}
          </span>
        </div>

        <button
          onClick={() => {
            SoundEngine.playCardFlip()
            if (onSelectDeck) onSelectDeck(item.cardSkin)
          }}
          className={`brutal-btn px-4 py-1.5 font-display text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ml-auto transition-all ${
            isEquipped
              ? 'bg-[#00FFA3] text-true-black shadow-[2px_2px_0px_#000000] scale-105'
              : 'bg-white hover:bg-accent-yellow text-true-black'
          }`}
          title={`Equip ${item.name} skin for 3D Duel`}
        >
          <span>{isEquipped ? '✓' : '🎴'}</span>
          <span>{isEquipped ? 'EQUIPPED' : 'EQUIP DECK'}</span>
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// MAIN HORIZONTAL SHOWCASE CONTAINER
// ----------------------------------------------------
export default function HorizontalShowcase({ onSelectDeck, onOpenDuel, containerRefProp }) {
  const localContainerRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const trackRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef

  const [equippedSkin, setEquippedSkin] = useState('obsidian')
  const [equipToast, setEquipToast] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokehub_equipped_deck')
      if (saved) setEquippedSkin(saved)
    }
  }, [])

  const handleEquip = (skinKey, skinName) => {
    SoundEngine.playCardFlip()
    setEquippedSkin(skinKey)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokehub_equipped_deck', skinKey)
    }
    if (onSelectDeck) onSelectDeck(skinKey)

    setEquipToast(`✨ EQUIPPED [${skinName}] FOR 3D DUEL!`)
    setTimeout(() => {
      setEquipToast(null)
    }, 2400)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      const container = containerRef.current
      const pinWrapper = pinWrapperRef.current
      if (!track || !container || !pinWrapper) return

      // Calculate total horizontal scroll distance
      const getScrollDistance = () => track.scrollWidth - window.innerWidth

      // Main pinned horizontal scroll tween
      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Floating Equip Toast */}
      {equipToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1050] pointer-events-none animate-bounce">
          <div className="bg-[#00FFA3] border-[3px] border-true-black px-6 py-2.5 rounded-xl shadow-[5px_5px_0px_#000000] font-display font-black text-xs sm:text-sm uppercase text-true-black -rotate-1">
            {equipToast}
          </div>
        </div>
      )}

      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden select-none z-30 rounded-t-[36px] sm:rounded-t-[48px] md:rounded-t-[60px] border-t-[4px] border-true-black bg-transparent"
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="flex items-center h-full w-max px-8 md:px-20 gap-10 md:gap-16 will-change-transform"
        >
          {/* SLIDE 1: Hero Typography Headline */}
          <div className="w-[88vw] sm:w-[620px] lg:w-[680px] shrink-0 flex flex-col justify-center pr-4">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan border-[3px] border-true-black brutal-shadow-sm w-max mb-6">
              <span className="text-xs">🎴</span>
              <span className="font-pixel text-[10px] sm:text-xs font-black uppercase text-true-black">
                POKERHUB VAULT
              </span>
            </div>

            {/* Main Huge Punchy Title */}
            <div className="font-display tracking-tight text-true-black leading-[0.95]">
              <span className="block text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-[4px_4px_0px_#ffa6c9]">
                WE HAVE 6
              </span>

              {/* FREAKING Boxed Highlight Badge */}
              <div className="my-2 sm:my-3 inline-block transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="bg-accent-yellow border-[4px] border-true-black px-4 sm:px-6 py-1.5 sm:py-2 brutal-shadow">
                  <span className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-true-black tracking-tight">
                    FREAKING
                  </span>
                </div>
              </div>

              <span className="block text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-[4px_4px_0px_#a6d8ff]">
                ELITE DECKS
              </span>
            </div>

            {/* Subtitle description */}
            <p className="font-pixel text-xs sm:text-sm text-gray-700 mt-6 leading-relaxed max-w-lg">
              (COLLECTIBLE HIGH-ROLLER ARCHIVES, HOLOGRAPHIC FOILS &amp; PROCEDURAL 3D FINISHES)
            </p>

            {/* Action Button & Scroll Indicator */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  SoundEngine.playClick()
                  if (onOpenDuel) onOpenDuel()
                }}
                className="brutal-btn bg-ui-pink hover:bg-[#ff8cb8] text-true-black px-6 py-3 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <span>⚔️</span>
                <span>PLAY IN 3D ARENA</span>
              </button>

              <div className="brutal-window px-4 py-2.5 bg-white flex items-center gap-2">
                <span className="font-pixel text-[9px] sm:text-[10px] font-bold text-true-black animate-pulse">
                  SCROLL RIGHT ►
                </span>
              </div>
            </div>
          </div>

          {/* SLIDES 2 to 7: The 6 Tilted Product Showcase Frames */}
          {SHOWCASE_EDITIONS.map((item) => (
            <InteractiveShowcaseCard
              key={item.id}
              item={item}
              isEquipped={equippedSkin === item.cardSkin}
              onSelectDeck={() => handleEquip(item.cardSkin, item.name)}
            />
          ))}

          {/* SLIDE 8: Outro Call-To-Action Finale Frame */}
          <div className="w-[85vw] sm:w-[480px] h-[520px] sm:h-[580px] md:h-[620px] shrink-0 relative flex flex-col justify-between p-8 rounded-[32px] border-[4px] border-true-black shadow-[10px_10px_0px_#050505] bg-gradient-to-br from-[#ffa6c9] via-[#ffbed3] to-[#a6d8ff] -rotate-[2deg]">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] font-black uppercase px-2 py-1 bg-white border-[2px] border-true-black brutal-shadow-sm text-true-black">
                GAME READY
              </span>
              <span className="text-3xl">🎰</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-4xl sm:text-5xl font-black text-true-black leading-tight">
                TEST YOUR HAND IN 3D
              </h3>
              <p className="font-pixel text-xs text-true-black/90 leading-relaxed">
                Step into the high-roller table. Challenge dealer AI, double down on your bankroll, and climb the royal flush rankings.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  SoundEngine.playCardSwoosh()
                  if (onOpenDuel) onOpenDuel()
                }}
                className="brutal-btn w-full py-4 bg-accent-yellow text-true-black font-display text-base font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚔️</span>
                <span>START TEXAS HOLD'EM</span>
              </button>

              <button
                onClick={() => {
                  SoundEngine.playClick()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="brutal-btn w-full py-2.5 bg-white text-true-black font-pixel text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>▲</span>
                <span>BACK TO 3D ARENA</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
