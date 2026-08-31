"use client"

import React from 'react'
import { TABLE_THEMES } from '../utils/themeConfig'
import { SoundEngine } from './SoundEngine'

export default function TableThemeModal({ isOpen, onClose, activeThemeKey, onSelectTheme }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn select-none font-display">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border-[3px] sm:border-[4px] border-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_#0D0D0D] sm:shadow-[10px_10px_0px_#0D0D0D] p-4 sm:p-6 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-[3px] border-[#0D0D0D] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#FFE500] border-[2px] border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]" />
            <h2 className="text-sm sm:text-lg font-black text-[#0D0D0D] tracking-wide uppercase">
              TABLE THEMES
            </h2>
          </div>
          <button
            onClick={() => {
              SoundEngine.playClick()
              onClose()
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F6F5FA] hover:bg-[#FF3333] hover:text-white text-[#0D0D0D] border-[2px] border-[#0D0D0D] font-display font-black text-xs sm:text-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_#0D0D0D] transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 6 Theme Grid Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-h-[65vh] overflow-y-auto pr-0.5">
          {TABLE_THEMES.map(t => {
            const isActive = activeThemeKey === t.key
            return (
              <button
                key={t.key}
                onClick={() => {
                  SoundEngine.playClick()
                  onSelectTheme(t.key)
                }}
                className={`group relative p-2.5 sm:p-3.5 rounded-xl border-[2px] sm:border-[2.5px] border-[#0D0D0D] text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isActive
                    ? 'bg-[#FFE500] shadow-[3px_3px_0px_#0D0D0D] scale-[1.02]'
                    : 'bg-[#FFFFFF] hover:bg-[#F6F5FA] shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D]'
                }`}
              >
                {/* Active Indicator Badge */}
                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#0D0D0D] text-[#FFE500] border border-[#FFE500] font-pixel text-[7px] font-black px-1.5 py-0.2 rounded-full shadow-[1px_1px_0px_#0D0D0D]">
                    EQUIPPED
                  </span>
                )}

                {/* Theme Icon & Title */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-[1.5px] sm:border-[2px] border-[#0D0D0D] flex items-center justify-center font-display font-black text-sm sm:text-base shrink-0 shadow-[1.5px_1.5px_0px_#0D0D0D]"
                    style={{ backgroundColor: t.headerBg, color: t.headerText }}
                  >
                    {t.icon}
                  </div>
                  <h3 className="font-display text-[11px] sm:text-xs font-black text-[#0D0D0D] uppercase truncate leading-tight">
                    {t.name}
                  </h3>
                </div>

                {/* Color Swatch Dots */}
                <div className="flex items-center justify-end -space-x-1 pt-1 border-t border-[#0D0D0D]/15">
                  {t.swatches.map((col, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-[1.5px] border-[#0D0D0D] shadow-[0.5px_0.5px_0px_#0D0D0D]"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
