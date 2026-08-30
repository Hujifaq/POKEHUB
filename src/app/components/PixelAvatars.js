"use client"

import React from 'react'

const _ = null
const K = '#0D0D0D' // Black Outline
const W = '#FFFFFF' // White
const C = '#00F5FF' // Electric Cyan
const Y = '#FFE500' // Gold / Yellow
const P = '#FF70A6' // Neon Pink
const R = '#FF3333' // Red
const G = '#22C55E' // Emerald Green
const B = '#3B82F6' // Sapphire Blue
const D = '#4B5563' // Dark Grey
const L = '#E5E7EB' // Light Grey
const O = '#F97316' // Orange
const S = '#FDE047' // Skin / Warm Cream
const T = '#A855F7' // Purple

// 1. HERO (Cyber Crown Legend) - 14x14
export const PIX_HERO = [
  [_, _, _, Y, _, _, Y, _, _, Y, _, _, _, _],
  [_, _, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _, _],
  [_, Y, Y, Y, R, Y, Y, Y, R, Y, Y, Y, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, K, _, _],
  [K, C, C, C, C, C, C, C, C, C, C, C, K, _],
  [K, C, S, S, S, S, S, S, S, S, S, C, K, _],
  [K, S, K, K, S, S, S, S, K, K, S, S, K, _],
  [K, S, K, W, K, S, S, K, W, K, S, S, K, _],
  [K, S, S, S, S, S, S, S, S, S, S, S, K, _],
  [_, K, S, S, P, P, P, P, S, S, S, K, _, _],
  [_, K, S, S, S, K, K, S, S, S, S, K, _, _],
  [_, _, K, K, S, S, S, S, K, K, K, _, _, _],
  [_, K, C, C, K, K, K, K, C, C, K, _, _, _],
  [K, C, C, C, C, Y, Y, C, C, C, C, K, _, _]
]

// 2. CYBER SAMURAI (Cute Cyber Ninja Cat) - 14x14
export const PIX_SAMURAI = [
  [K, C, _, _, _, _, _, _, _, _, _, C, K, _],
  [K, C, C, _, _, _, _, _, _, _, C, C, K, _],
  [K, K, C, C, K, K, K, K, K, C, C, K, K, _],
  [_, K, K, K, D, D, D, D, D, K, K, K, _, _],
  [K, D, D, D, D, D, D, D, D, D, D, D, K, _],
  [K, R, R, R, R, R, R, R, R, R, R, R, K, _],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, _],
  [K, C, C, C, K, K, K, K, K, C, C, C, K, _],
  [K, C, W, C, K, K, K, K, K, C, W, C, K, _],
  [K, K, K, K, D, D, D, D, D, K, K, K, K, _],
  [_, K, D, D, D, P, D, P, D, D, D, K, _, _],
  [_, K, D, D, D, D, K, D, D, D, D, K, _, _],
  [_, _, K, K, D, D, D, D, D, K, K, _, _, _],
  [_, K, C, C, K, K, K, K, K, C, C, K, _, _]
]

// 3. LUCKY NEKO (Cute Golden Maneki-Neko) - 14x14
export const PIX_NEKO = [
  [K, P, _, _, _, _, _, _, _, _, _, P, K, _],
  [K, W, P, _, _, _, _, _, _, _, P, W, K, _],
  [K, W, W, K, K, K, K, K, K, K, W, W, K, _],
  [K, W, W, W, W, W, W, W, W, W, W, W, K, _],
  [K, W, W, W, Y, Y, Y, Y, W, W, W, W, K, _],
  [K, W, W, W, Y, K, Y, Y, W, W, W, W, K, _],
  [K, W, K, K, W, Y, Y, W, K, K, W, W, K, _],
  [K, W, K, W, W, W, W, W, K, W, W, W, K, _],
  [K, P, W, W, W, P, W, W, W, W, P, W, K, _],
  [K, W, W, W, W, K, W, W, W, W, W, W, K, _],
  [_, K, W, W, K, K, K, W, W, W, W, K, _, _],
  [_, K, R, R, R, Y, R, R, R, R, R, K, _, _],
  [_, K, R, R, Y, Y, Y, R, R, R, R, K, _, _],
  [_, _, K, K, K, Y, K, K, K, K, K, _, _, _]
]

// 4. PIXEL PUNK (Cyberpunk Robot with Visor & Antenna) - 14x14
export const PIX_PUNK = [
  [_, _, _, _, _, K, C, K, _, _, _, _, _, _],
  [_, _, _, _, _, K, C, K, _, _, _, _, _, _],
  [_, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, K, T, T, T, T, T, T, T, T, T, K, _, _],
  [K, T, T, T, T, T, T, T, T, T, T, T, K, _],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, _],
  [K, P, P, P, P, P, P, P, P, P, P, P, K, _],
  [K, P, W, P, P, P, P, P, P, W, P, P, K, _],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, _],
  [K, T, T, T, T, T, T, T, T, T, T, T, K, _],
  [K, T, T, C, C, C, C, C, C, C, T, T, K, _],
  [_, K, T, T, K, K, K, K, K, T, T, K, _, _],
  [_, _, K, K, T, T, T, T, T, K, K, _, _, _],
  [_, K, P, P, K, K, K, K, K, P, P, K, _, _]
]

// 5. HIGH ROLLER (VIP Shark with Shades & Bowtie) - 14x14
export const PIX_ROLLER = [
  [_, _, _, _, _, K, B, K, _, _, _, _, _, _],
  [_, _, _, _, K, B, B, K, _, _, _, _, _, _],
  [_, _, K, K, B, B, B, B, K, K, _, _, _, _],
  [_, K, B, B, B, B, B, B, B, B, K, _, _, _],
  [K, B, B, B, B, B, B, B, B, B, B, K, _, _],
  [K, B, K, K, K, K, K, K, K, K, B, B, K, _],
  [K, B, K, C, C, K, K, C, C, K, B, B, K, _],
  [K, W, K, C, W, K, K, C, W, K, W, W, K, _],
  [K, W, W, K, K, K, K, K, K, W, W, W, K, _],
  [K, W, W, W, W, W, W, W, W, W, W, W, K, _],
  [_, K, W, K, W, K, W, K, W, K, W, K, _, _],
  [_, K, W, W, K, K, K, W, W, W, W, K, _, _],
  [_, K, R, R, K, R, K, R, R, R, R, K, _, _],
  [_, _, K, K, K, Y, K, K, K, K, K, _, _, _]
]

// 6. NEON QUEEN (Cyber Princess with Tiara & Starry Eyes) - 14x14
export const PIX_QUEEN = [
  [_, _, Y, _, Y, Y, Y, Y, _, Y, _, _, _, _],
  [_, Y, Y, Y, Y, P, Y, Y, Y, Y, Y, _, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, _, _, _],
  [K, P, P, P, P, P, P, P, P, P, P, K, _, _],
  [K, P, P, S, S, S, S, S, S, P, P, K, _, _],
  [K, P, S, S, S, S, S, S, S, S, P, K, _, _],
  [K, P, S, C, C, S, S, C, C, S, P, K, _, _],
  [K, S, S, C, W, S, S, C, W, S, S, K, _, _],
  [K, S, P, S, S, S, S, S, S, P, S, K, _, _],
  [_, K, S, S, S, R, R, S, S, S, K, _, _, _],
  [_, K, S, S, S, S, S, S, S, S, K, _, _, _],
  [_, _, K, K, S, S, S, S, K, K, _, _, _, _],
  [_, K, P, P, K, K, K, K, P, P, K, _, _, _],
  [K, P, P, P, P, Y, Y, P, P, P, P, K, _, _]
]

// 7. KAWAII GHOST SKULL (Cute Eliminated State) - 14x14
export const PIX_SKULL = [
  [_, _, _, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, K, W, W, W, W, W, W, K, _, _, _, _],
  [_, K, W, W, W, W, W, W, W, W, K, _, _, _],
  [K, W, W, W, W, W, W, W, W, W, W, K, _, _],
  [K, W, R, _, R, W, W, R, _, R, W, K, _, _],
  [K, W, _, R, _, W, W, _, R, _, W, K, _, _],
  [K, W, R, _, R, W, W, R, _, R, W, K, _, _],
  [K, W, P, P, W, W, W, W, P, P, W, K, _, _],
  [K, W, W, W, W, K, K, W, W, W, W, K, _, _],
  [_, K, W, W, K, W, W, K, W, W, K, _, _, _],
  [_, K, W, W, K, K, K, K, W, W, K, _, _, _],
  [_, _, K, K, K, W, W, K, K, K, _, _, _, _],
  [_, _, _, _, K, K, K, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _]
]

// 8. PIXEL HOURGLASS (Queued Re-entry state) - 14x14
export const PIX_HOURGLASS = [
  [_, K, K, K, K, K, K, K, K, K, K, K, _, _],
  [_, K, Y, Y, Y, Y, Y, Y, Y, Y, Y, K, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, K, _, _],
  [_, _, K, C, C, Y, Y, C, C, C, K, _, _, _],
  [_, _, _, K, C, Y, Y, Y, C, K, _, _, _, _],
  [_, _, _, _, K, C, Y, C, K, _, _, _, _, _],
  [_, _, _, _, _, K, Y, K, _, _, _, _, _, _],
  [_, _, _, _, K, C, Y, C, K, _, _, _, _, _],
  [_, _, _, K, C, C, Y, C, C, K, _, _, _, _],
  [_, _, K, C, C, Y, Y, Y, C, C, K, _, _, _],
  [_, K, C, Y, Y, Y, Y, Y, Y, C, C, K, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, K, _, _],
  [_, K, Y, Y, Y, Y, Y, Y, Y, Y, Y, K, _, _],
  [_, K, K, K, K, K, K, K, K, K, K, K, _, _]
]

export const AVATAR_MATRICES = {
  hero: PIX_HERO,
  samurai: PIX_SAMURAI,
  neko: PIX_NEKO,
  punk: PIX_PUNK,
  roller: PIX_ROLLER,
  queen: PIX_QUEEN,
  skull: PIX_SKULL,
  hourglass: PIX_HOURGLASS
}

// Reusable SVG Pixel Avatar Component
export function PixelAvatar({
  avatarKey = 'hero',
  size = 3.2,
  isBusted = false,
  isQueued = false,
  className = ''
}) {
  const resolvedKey = isQueued
    ? 'hourglass'
    : isBusted
    ? 'skull'
    : (AVATAR_MATRICES[avatarKey] ? avatarKey : 'samurai')

  const matrix = AVATAR_MATRICES[resolvedKey] || PIX_SAMURAI
  const height = matrix.length
  const width = matrix[0].length

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={width * size}
        height={height * size}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-contain filter drop-shadow-[1px_1px_0px_#000]"
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      >
        {matrix.map((row, r) =>
          row.map((val, c) => {
            if (!val) return null
            return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={val} />
          })
        )}
      </svg>
    </div>
  )
}
