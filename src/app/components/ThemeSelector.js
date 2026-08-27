"use client"

import React from 'react'
import { SoundEngine } from './SoundEngine'

export const THEMES = [
  {
    key: 'macau',
    name: 'Macau Imperial',
    bg: '#14110b',
    surface: '#e8e2d6',
    text: '#14161c',
    primary: '#d4af37',
    icon: '👑',
    gradient: 'from-[#2b2010] via-[#17120a] to-[#0d0905]'
  },
  {
    key: 'vegas',
    name: 'Vegas Velvet Noir',
    bg: '#0f0507',
    surface: '#1c0e12',
    text: '#ffffff',
    primary: '#ff4d6d',
    icon: '🍷',
    gradient: 'from-[#380e16] via-[#1c080b] to-[#080203]'
  },
  {
    key: 'cyber',
    name: 'Cyberpunk Neon',
    bg: '#050711',
    surface: '#0d1124',
    text: '#00f0ff',
    primary: '#00f0ff',
    icon: '⚡',
    gradient: 'from-[#0d1b3e] via-[#080d1e] to-[#03050c]'
  },
  {
    key: 'emerald',
    name: 'Monte Carlo VIP',
    bg: '#05140b',
    surface: '#0d2817',
    text: '#f1c40f',
    primary: '#2ecc71',
    icon: '🌲',
    gradient: 'from-[#0e3d23] via-[#092214] to-[#030c07]'
  }
]

export default function ThemeSelector({ activeTheme, onThemeChange, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0b10] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">CASINO ATMOSPHERE & FELT</h2>
              <p className="text-xs text-gray-400">Change 3D lighting, table felt & ambience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Theme Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.key}
              onClick={() => {
                SoundEngine.playClick()
                onThemeChange(theme.key)
                onClose()
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 cursor-pointer relative overflow-hidden group ${
                activeTheme === theme.key
                  ? 'border-[#d4af37] bg-gradient-to-br ' + theme.gradient + ' shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-[1.02]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.08]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {theme.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  {theme.name}
                  {activeTheme === theme.key && (
                    <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{theme.key} ambiance</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
