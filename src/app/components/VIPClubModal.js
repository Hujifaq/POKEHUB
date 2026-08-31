"use client"

import React from 'react'

export default function VIPClubModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const tiers = [
    {
      name: 'ROYAL OBSIDIAN',
      badge: 'TIER 1',
      stakes: '$100K+ Stakes',
      perk: 'Private Macau Penthouse Tables & Instant Chip Credit',
      active: true
    },
    {
      name: 'DIAMOND ELITE',
      badge: 'TIER 2',
      stakes: '$25K+ Stakes',
      perk: 'Custom 3D Holographic Card Skins & Rakeback 45%',
      active: false
    },
    {
      name: 'PLATINUM HIGH ROLLER',
      badge: 'TIER 3',
      stakes: '$5K+ Stakes',
      perk: 'Priority Heads-up Tournaments & Audio Customizer',
      active: false
    }
  ]

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-true-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] brutal-window flex flex-col overflow-hidden shadow-[6px_6px_0px_#000]">
        
        {/* Title Bar */}
        <div className="bg-ui-blue border-b-[3px] sm:border-b-[4px] border-true-black p-2.5 sm:p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-true-black animate-pulse" />
            <span className="font-pixel text-true-black font-bold text-[10px] sm:text-xs uppercase">VIP_CLUB.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 brutal-btn bg-ui-pink text-true-black flex items-center justify-center font-pixel text-[10px] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-3 sm:p-6 bg-primary-base overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="bg-white border-[3px] sm:border-[4px] border-true-black p-3 sm:p-4 brutal-shadow-sm mb-3 sm:mb-6 text-center">
            <h2 className="text-lg sm:text-2xl font-display uppercase text-true-black mb-0.5 sm:mb-1">
              POKEHUB VIP HIGH ROLLER CLUB
            </h2>
            <p className="font-pixel text-[8.5px] sm:text-[10px] text-gray-600 uppercase">Exclusive 3D Casino Membership & Invitational Tournaments</p>
          </div>

          {/* Tiers */}
          <div className="space-y-2.5 sm:space-y-4 mb-3 sm:mb-6">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 sm:p-4 border-[3px] sm:border-[4px] border-true-black brutal-shadow-sm flex items-start sm:items-center gap-2.5 sm:gap-4 ${
                  t.active ? 'bg-accent-yellow' : 'bg-white'
                }`}
              >
                <div className="font-mono-nb font-black text-xs sm:text-sm bg-white border-[2.5px] sm:border-[3px] border-true-black w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center brutal-shadow-sm shrink-0">{t.badge}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-0.5 sm:mb-1 gap-1">
                    <h3 className="font-display text-base sm:text-lg uppercase text-true-black">{t.name}</h3>
                    <span className="text-[8px] sm:text-[10px] font-pixel bg-true-black text-white px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase w-fit">{t.stakes}</span>
                  </div>
                  <p className="text-[8.5px] sm:text-[10px] font-pixel text-true-black uppercase leading-relaxed">{t.perk}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact info / specs */}
          <div className="p-3 sm:p-4 bg-ui-pink border-[3px] sm:border-[4px] border-true-black brutal-shadow-sm font-pixel text-[8.5px] sm:text-[10px] uppercase text-true-black space-y-2 sm:space-y-3 mb-3 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-bold">VIP Concierge Telegram:</span>
              <span className="bg-white px-2 py-0.5 sm:py-1 border-[1.5px] sm:border-[2px] border-true-black">@PokeHubHighRoller</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-bold">Daily Tournament:</span>
              <span className="bg-white px-2 py-0.5 sm:py-1 border-[1.5px] sm:border-[2px] border-true-black">Macau Midnight ($1,000,000)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="brutal-btn w-full py-2.5 sm:py-4 bg-accent-cyan text-true-black font-display text-base sm:text-xl uppercase tracking-wider cursor-pointer"
          >
            CLOSE VIP SUITE
          </button>
        </div>
      </div>
    </div>
  )
}
