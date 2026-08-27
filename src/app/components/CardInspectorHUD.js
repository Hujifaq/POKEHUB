"use client"

import React, { useState } from 'react'

export default function CardInspectorHUD({
  telemetry = { pitch: 0, yaw: 0, roll: 0, velX: 0, velY: 0, speed: 0 },
  deckSkin = 'classic',
  activeSuit = 'hearts',
  isHolo = true,
  isFanMode = false
}) {
  const [isMinimized, setIsMinimized] = useState(false)

  const suitSymbols = {
    hearts: '♥ Hearts',
    diamonds: '♦ Diamonds',
    spades: '♠ Spades',
    clubs: '♣ Clubs'
  }

  return (
    <div className="fixed top-24 left-6 z-[800] pointer-events-auto hidden md:block select-none animate-fadeIn">
      <div className="w-64 rounded-2xl bg-[#10121a]/75 backdrop-blur-xl border border-[#d4af37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#181a24] to-[#10121a] border-b border-[#d4af37]/20 flex items-center justify-between cursor-pointer hover:bg-[#202330] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-xs font-black text-gray-200 tracking-wider uppercase">3D Card Telemetry</span>
          </div>
          <span className="text-xs text-gray-400 font-bold">{isMinimized ? '▼' : '▲'}</span>
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-3 text-xs text-gray-300">
            {/* 3D Angles */}
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
                <span>Euler Angles</span>
                <span className="text-[#d4af37]">Real-time (deg)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <span className="text-[9px] text-gray-500 block">PITCH</span>
                  <span className="font-bold text-white">{telemetry.pitch || 0}°</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <span className="text-[9px] text-gray-500 block">YAW</span>
                  <span className="font-bold text-white">{telemetry.yaw || 0}°</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <span className="text-[9px] text-gray-500 block">ROLL</span>
                  <span className="font-bold text-white">{telemetry.roll || 0}°</span>
                </div>
              </div>
            </div>

            {/* Velocity / Speed meter */}
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
                <span>Inertia & Speed</span>
                <span className="font-mono text-emerald-400">{telemetry.speed || 0} px/s</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(5, (telemetry.speed || 0) * 1.5))}%` }}
                />
              </div>
            </div>

            {/* Spec details */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Card Edition:</span>
                <span className="font-bold text-white uppercase">{deckSkin} Foil</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Suit / Type:</span>
                <span className="font-bold text-[#d4af37]">{suitSymbols[activeSuit] || activeSuit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Display Mode:</span>
                <span className="font-bold text-white">{isFanMode ? '5-Card Royal Flush' : '1-Card Showcase'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shimmer Foil:</span>
                <span className={`font-bold ${isHolo ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {isHolo ? 'Active (Prismatic)' : 'Off'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rarity Tier:</span>
                <span className="font-black text-amber-300">MYTHIC ★★★★★</span>
              </div>
            </div>

            {/* Quick hotkeys */}
            <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 space-y-0.5">
              <div className="flex justify-between">
                <span className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">Space</span>
                <span>Flip Card</span>
              </div>
              <div className="flex justify-between">
                <span className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">C</span>
                <span>Toss 3D Chip</span>
              </div>
              <div className="flex justify-between">
                <span className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">H</span>
                <span>Toggle Holo</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
