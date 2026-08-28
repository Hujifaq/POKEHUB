"use client"

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&q=80',
  'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&q=80',
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80',
  'https://images.unsplash.com/photo-1522054963843-05a7af7e8c53?w=400&q=80',
  'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
]

const CARD_ROTATIONS = [8, -3, -10, 10, -7, 5]
const BRAND_LETTERS = "POKERHUB".split('')

export default function Preloader({ onComplete }) {
  const loaderRef = useRef(null)
  const brandRef = useRef(null)
  const counterRef = useRef(null)
  const cardRefs = useRef([])
  const charRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars = charRefs.current.filter(Boolean)
      const counter = counterRef.current

      const tl = gsap.timeline({ delay: 0.1, onComplete })
      const progressBar = document.getElementById('progress-bar')

      tl.to({ value: 0 }, {
        value: 100,
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate() {
          const val = Math.round(this.targets()[0].value)
          if (counter) counter.textContent = `${val}%`
          if (progressBar) gsap.set(progressBar, { width: `${val}%` })
        },
      })

      tl.to(loaderRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      }, '+=0.2')
    })

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[2000] overflow-hidden select-none cursor-pointer flex items-center justify-center bg-true-black"
      onClick={onComplete}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      }}
    >
      {/* Retro OS Loading Dialog */}
      <div className="brutal-window w-[400px] max-w-[90vw] flex flex-col pointer-events-auto shadow-[12px_12px_0px_#ffa6c9]">
        {/* Title Bar */}
        <div className="bg-ui-blue border-b-[4px] border-true-black p-2 flex items-center justify-between">
          <span className="font-pixel text-true-black font-bold text-xs uppercase">POKERHUB_BOOT.EXE</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 border-[2px] border-true-black bg-white"></div>
            <div className="w-4 h-4 border-[2px] border-true-black bg-white"></div>
            <div className="w-4 h-4 border-[2px] border-true-black bg-white flex items-center justify-center font-pixel text-[8px]">X</div>
          </div>
        </div>
        
        {/* Dialog Content */}
        <div className="p-6 bg-primary-base flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⚠️</span>
            <div className="font-pixel text-true-black text-[10px] uppercase leading-relaxed flex flex-col gap-2">
              <p>INITIALIZING Y2K CASINO ENGINE...</p>
              <p>LOADING TEXTURES................OK</p>
              <p>CONNECTING TO MAINFRAME.........OK</p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-8 border-[4px] border-true-black bg-white relative overflow-hidden p-1 flex">
            {/* The progress bar will be updated via GSAP */}
            <div className="h-full bg-accent-cyan border-[2px] border-true-black w-0" id="progress-bar"></div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="font-pixel text-true-black text-[10px] uppercase" ref={counterRef}>0%</span>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onComplete()
              }}
              className="brutal-btn bg-ui-pink text-true-black font-pixel text-[10px] px-4 py-2 uppercase font-bold"
            >
              SKIP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
