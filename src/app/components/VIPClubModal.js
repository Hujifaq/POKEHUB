"use client"

import React from 'react'

export default function VIPClubModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const tiers = [
    {
      name: 'ROYAL OBSIDIAN',
      icon: '👑',
      stakes: '$100K+ Stakes',
      perk: 'Private Macau Penthouse Tables & Instant Chip Credit',
      active: true
    },
    {
      name: 'DIAMOND ELITE',
      icon: '💎',
      stakes: '$25K+ Stakes',
      perk: 'Custom 3D Holographic Card Skins & Rakeback 45%',
      active: false
    },
    {
      name: 'PLATINUM HIGH ROLLER',
      icon: '⚡',
      stakes: '$5K+ Stakes',
      perk: 'Priority Heads-up Tournaments & Audio Customizer',
      active: false
    }
  ]

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0b10] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] p-6 md:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                POKEHUB VIP HIGH ROLLER CLUB
              </h2>
              <p className="text-xs text-[#d4af37]">Exclusive 3D Casino Membership & Invitational Tournaments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tiers */}
        <div className="space-y-3 mb-6">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                t.active
                  ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="text-3xl">{t.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-sm">{t.name}</h3>
                  <span className="text-xs font-mono font-bold text-[#f1c40f]">{t.stakes}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t.perk}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact info / specs */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>VIP Concierge Telegram:</span>
            <span className="text-white font-mono font-bold">@PokeHubHighRoller</span>
          </div>
          <div className="flex justify-between">
            <span>Daily Tournament:</span>
            <span className="text-[#2ecc71] font-bold">Macau Midnight 3D Showdown ($1,000,000 GTD)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f39c12] text-black font-black text-sm tracking-wider hover:from-[#f1c40f] hover:to-[#e67e22] shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
        >
          CLOSE VIP SUITE
        </button>

      </div>
    </div>
  )
}
