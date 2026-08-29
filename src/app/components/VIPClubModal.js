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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-true-black/60">
      <div className="relative w-full max-w-2xl brutal-window flex flex-col overflow-hidden">
        
        {/* Title Bar */}
        <div className="bg-ui-blue border-b-[4px] border-true-black p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-true-black font-bold text-xs uppercase">VIP_CLUB.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 brutal-btn bg-ui-pink text-true-black flex items-center justify-center font-pixel text-[10px] font-bold"
          >
            X
          </button>
        </div>

        <div className="p-6 bg-primary-base">
          {/* Header */}
          <div className="bg-white border-[4px] border-true-black p-4 brutal-shadow-sm mb-6 text-center">
            <div className="text-4xl mb-2">🏛️</div>
            <h2 className="text-2xl font-display uppercase text-true-black mb-1">
              POKEHUB VIP HIGH ROLLER CLUB
            </h2>
            <p className="font-pixel text-[10px] text-gray-600 uppercase">Exclusive 3D Casino Membership & Invitational Tournaments</p>
          </div>

          {/* Tiers */}
          <div className="space-y-4 mb-6">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className={`p-4 border-[4px] border-true-black brutal-shadow-sm flex items-center gap-4 ${
                  t.active ? 'bg-accent-yellow' : 'bg-white'
                }`}
              >
                <div className="text-3xl bg-white border-[4px] border-true-black w-14 h-14 flex items-center justify-center brutal-shadow-sm shrink-0">{t.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                    <h3 className="font-display text-lg uppercase text-true-black">{t.name}</h3>
                    <span className="text-[10px] font-pixel bg-true-black text-white px-2 py-1 uppercase">{t.stakes}</span>
                  </div>
                  <p className="text-[10px] font-pixel text-true-black uppercase leading-relaxed">{t.perk}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact info / specs */}
          <div className="p-4 bg-ui-pink border-[4px] border-true-black brutal-shadow-sm font-pixel text-[10px] uppercase text-true-black space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-bold">VIP Concierge Telegram:</span>
              <span className="bg-white px-2 py-1 border-[2px] border-true-black">@PokeHubHighRoller</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-bold">Daily Tournament:</span>
              <span className="bg-white px-2 py-1 border-[2px] border-true-black">Macau Midnight ($1,000,000)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="brutal-btn w-full py-4 bg-accent-cyan text-true-black font-display text-xl uppercase tracking-wider"
          >
            CLOSE VIP SUITE
          </button>
        </div>
      </div>
    </div>
  )
}
