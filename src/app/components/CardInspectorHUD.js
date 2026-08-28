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
    <div className="hidden">
      <div className="w-64 brutal-window flex flex-col transition-all duration-300">
        
        {/* Title Bar */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-ui-blue border-b-[4px] border-true-black px-2 py-1 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-true-black font-bold text-[10px] uppercase">Telemetry.dll</span>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 border-[2px] border-true-black bg-white flex items-center justify-center font-pixel text-[8px] font-bold">
              {isMinimized ? '+' : '-'}
            </div>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-4 bg-primary-base">
            {/* 3D Angles */}
            <div>
              <div className="font-pixel text-[8px] uppercase font-bold text-true-black mb-2 flex justify-between">
                <span>Euler Angles</span>
                <span className="text-ui-pink drop-shadow-[1px_1px_0px_#050505]">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-pixel text-[10px]">
                <div className="bg-white border-[2px] border-true-black p-2 brutal-shadow-sm flex flex-col items-center">
                  <span className="text-[7px] text-gray-500 mb-1">PITCH</span>
                  <span className="font-bold text-true-black">{telemetry.pitch || 0}°</span>
                </div>
                <div className="bg-white border-[2px] border-true-black p-2 brutal-shadow-sm flex flex-col items-center">
                  <span className="text-[7px] text-gray-500 mb-1">YAW</span>
                  <span className="font-bold text-true-black">{telemetry.yaw || 0}°</span>
                </div>
                <div className="bg-white border-[2px] border-true-black p-2 brutal-shadow-sm flex flex-col items-center">
                  <span className="text-[7px] text-gray-500 mb-1">ROLL</span>
                  <span className="font-bold text-true-black">{telemetry.roll || 0}°</span>
                </div>
              </div>
            </div>

            {/* Velocity / Speed meter */}
            <div>
              <div className="font-pixel text-[8px] uppercase font-bold text-true-black mb-2 flex justify-between">
                <span>Inertia</span>
                <span className="text-accent-cyan drop-shadow-[1px_1px_0px_#050505]">{telemetry.speed || 0} px/s</span>
              </div>
              <div className="w-full bg-white h-3 border-[2px] border-true-black brutal-shadow-sm overflow-hidden p-0.5">
                <div
                  className="bg-ui-pink h-full border-[1px] border-true-black"
                  style={{ width: `${Math.min(100, Math.max(5, (telemetry.speed || 0) * 1.5))}%` }}
                />
              </div>
            </div>

            {/* Spec details */}
            <div className="pt-3 border-t-[4px] border-true-black space-y-2 font-pixel text-[8px] uppercase font-bold text-true-black">
              <div className="flex justify-between">
                <span className="text-gray-600">Edition:</span>
                <span className="text-true-black bg-accent-yellow px-1">{deckSkin} Foil</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Suit:</span>
                <span className="text-true-black">{suitSymbols[activeSuit] || activeSuit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="text-true-black">{isFanMode ? '5-Card Fan' : '1-Card'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Holo:</span>
                <span className={`${isHolo ? 'text-accent-cyan drop-shadow-[1px_1px_0px_#050505]' : 'text-gray-500'}`}>
                  {isHolo ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Quick hotkeys */}
            <div className="pt-3 border-t-[4px] border-true-black font-pixel text-[8px] uppercase font-bold text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="bg-white border-[2px] border-true-black px-1 text-true-black">Space</span>
                <span>Flip Card</span>
              </div>
              <div className="flex justify-between">
                <span className="bg-white border-[2px] border-true-black px-1 text-true-black">C</span>
                <span>Toss Chip</span>
              </div>
              <div className="flex justify-between">
                <span className="bg-white border-[2px] border-true-black px-1 text-true-black">H</span>
                <span>Toggle Holo</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
