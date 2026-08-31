"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { SoundEngine } from './SoundEngine'

const anim = {
  initial: {
    opacity: 1
  },
  open: (i) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.015 * i }
  }),
  closed: (i) => ({
    opacity: 0,
    transition: { duration: 0.38, delay: 0.02 * i, ease: [0.25, 1, 0.5, 1] }
  })
}

const BRAND_LETTERS = "POKERHUB".split('')

export default function Preloader({ onComplete }) {
  const [isActive, setIsActive] = useState(true)
  const [columnsData, setColumnsData] = useState([])
  const [mounted, setMounted] = useState(false)

  const counterRef = useRef(null)
  const containerRef = useRef(null)
  const isFinishedRef = useRef(false)

  /**
   * Shuffles array in place (Fisher–Yates shuffle).
   */
  const shuffle = useCallback((a) => {
    const arr = [...a]
    let j, x, i
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = arr[i]
      arr[i] = arr[j]
      arr[j] = x
    }
    return arr
  }, [])

  // Calculate blocks per column based on screen dimensions
  useEffect(() => {
    const calculateBlocks = () => {
      const { innerWidth, innerHeight } = window
      const blockSize = innerWidth * 0.05
      const nbOfBlocks = Math.ceil(innerHeight / blockSize)

      const cols = Array.from({ length: 20 }).map(() =>
        shuffle(Array.from({ length: nbOfBlocks }).map((_, i) => i))
      )

      setColumnsData(cols)
      setMounted(true)
    }

    calculateBlocks()
    window.addEventListener('resize', calculateBlocks)
    return () => window.removeEventListener('resize', calculateBlocks)
  }, [shuffle])

  // GSAP: Reveal POKERHUB letter by letter, 0-100 counting, and exit trigger
  useEffect(() => {
    if (!mounted || columnsData.length === 0) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // 1. Letters of POKERHUB slide up with crisp energy
      tl.fromTo(
        '.brand-letter',
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.52,
          ease: 'power3.out',
          stagger: 0.045
        }
      )

      // 2. 0-100 count up in pixel font (Balanced & Snappy: 1.35s)
      const progressObj = { value: 0 }
      let lastTick = 0

      tl.to(
        progressObj,
        {
          value: 100,
          duration: 1.35,
          ease: 'power2.inOut',
          onUpdate: () => {
            const val = Math.round(progressObj.value)
            if (counterRef.current) {
              counterRef.current.textContent = `${val}%`
            }
            if (val - lastTick >= 25) {
              lastTick = val
              SoundEngine.playClick()
            }
          }
        },
        '-=0.08'
      )

      // 3. Slide letters and counter up and out after brief 100% pause (0.18s)
      tl.to(
        ['.brand-letter', counterRef.current],
        {
          yPercent: -120,
          opacity: 0,
          duration: 0.32,
          ease: 'power3.inOut',
          onComplete: () => {
            if (isFinishedRef.current) return
            isFinishedRef.current = true

            SoundEngine.playCardSwoosh()
            setIsActive(false)

            // Balanced pixel curtain dissolve transition
            const maxBlocks = columnsData[0]?.length || 15
            const totalDelay = maxBlocks * 0.02 + 0.4
            setTimeout(() => {
              if (onComplete) onComplete()
            }, totalDelay * 1000)
          }
        },
        '+=0.18'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [mounted, columnsData, onComplete])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[2000] overflow-hidden select-none pointer-events-auto transition-colors duration-500 ${
        isActive ? 'bg-[#ff6b00]' : 'bg-transparent pointer-events-none'
      }`}
    >
      {/* 20 Columns of Orange Pixel Blocks (Olivier Larose Architecture) */}
      <div className="fixed inset-0 h-screen w-screen flex overflow-hidden z-10">
        {mounted &&
          columnsData.map((shuffledIndexes, colIndex) => (
            <div key={colIndex} className="w-[5vw] h-full flex flex-col">
              {shuffledIndexes.map((randomIndex, blockIndex) => (
                <motion.div
                  key={blockIndex}
                  className="w-full bg-[#ff6b00]"
                  style={{ height: '5vw' }}
                  variants={anim}
                  initial="initial"
                  animate={isActive ? 'open' : 'closed'}
                  custom={randomIndex}
                />
              ))}
            </div>
          ))}
      </div>

      {/* Minimalist Centered POKERHUB Title & 0-100 Pixel Counter */}
      <div className="fixed inset-0 z-20 flex flex-col items-center justify-center">
        {/* POKERHUB letter-by-letter reveal container */}
        <div className="flex overflow-hidden">
          {BRAND_LETTERS.map((char, index) => (
            <span
              key={index}
              className="brand-letter inline-block font-pixel text-4xl sm:text-6xl md:text-7xl font-black text-true-black tracking-tight"
            >
              {char}
            </span>
          ))}
        </div>

        {/* 0-100% Download / Progress Counter */}
        <div
          ref={counterRef}
          className="mt-6 font-pixel text-sm sm:text-base text-true-black font-bold tracking-widest"
        >
          0%
        </div>
      </div>
    </div>
  )
}
