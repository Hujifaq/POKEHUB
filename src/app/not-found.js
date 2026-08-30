"use client"

import React from 'react'
import Link from 'next/link'
import { SoundEngine } from './components/SoundEngine'

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-[#f4f0ff] text-[#050505] relative flex flex-col items-center justify-center p-4 select-none font-display">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #050505 1px, transparent 1px), linear-gradient(to bottom, #050505 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Centered Minimal Neo-Brutalist Card */}
      <div className="relative z-10 w-full max-w-lg bg-white border-[4px] border-[#050505] shadow-[8px_8px_0px_#050505] p-6 sm:p-10 text-center">
        
        {/* Status Tag */}
        <div className="inline-block bg-[#ffa6c9] border-[2px] border-[#050505] px-3 py-1 font-pixel text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#050505] mb-4">
          ERROR 404
        </div>

        {/* Huge Bold 404 */}
        <div className="font-display font-black text-7xl sm:text-9xl text-[#050505] leading-none tracking-tight my-2">
          404
        </div>

        {/* Short, dry message */}
        <h1 className="font-display text-lg sm:text-xl uppercase font-black text-[#050505] mt-2 mb-1">
          PAGE NOT FOUND
        </h1>

        <p className="font-pixel text-[9px] sm:text-[10px] text-gray-600 uppercase mb-8">
          The requested table or page does not exist.
        </p>

        {/* Two clean action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            onClick={() => SoundEngine.playClick()}
            className="brutal-btn w-full sm:w-auto px-6 py-3 bg-[#fffb00] hover:bg-[#00f0ff] text-[#050505] font-display text-xs sm:text-sm font-black uppercase text-center cursor-pointer shadow-[4px_4px_0px_#050505] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            RETURN HOME
          </Link>

          <Link
            href="/game"
            onClick={() => SoundEngine.playCardSwoosh()}
            className="brutal-btn w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#ffa6c9] text-[#050505] font-display text-xs sm:text-sm font-black uppercase text-center cursor-pointer shadow-[4px_4px_0px_#050505] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            POKER DUEL
          </Link>
        </div>

      </div>

    </main>
  )
}
