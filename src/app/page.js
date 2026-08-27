"use client"

import { useState, useRef, useCallback } from 'react'
import gsap from 'gsap'
import Scene from "./components/Scene"
import BubbleMenu from "./components/BubbleMenu"
import Preloader from "./components/Preloader"

// P=0, O=1, K=2, E=3, R=4, H=5, U=6, B=7
const topLetters = ['P', 'K', 'H', 'B']
const text = "POKERHUB"

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true)
  const contentRef = useRef(null)

  const handleNavToggle = useCallback((isOpen) => {
    if (!contentRef.current) return
    gsap.to(contentRef.current, {
      filter: isOpen ? 'blur(18px) brightness(0.7)' : 'blur(0px) brightness(1)',
      scale: isOpen ? 0.97 : 1,
      duration: 0.6,
      ease: 'power3.out',
    })
  }, [])

  return (
    <main className="w-full h-screen relative bg-[#e8e2d6] overflow-hidden flex items-center justify-center">

      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Bubble Navbar — fixed so it floats above everything */}
      <BubbleMenu
        logo={
          <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.04em', fontFamily: 'var(--font-geist-sans)' }}>
            PH
          </span>
        }
        useFixedPosition={true}
        menuBg="#e8e2d6"
        menuContentColor="#14161c"
        menuAriaLabel="Toggle navigation"
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.12}
        onMenuClick={handleNavToggle}
      />

      {/* All content layers wrapped — blur target */}
      <div ref={contentRef} className="absolute inset-0" style={{ willChange: 'filter, transform' }}>

        {/* Bottom Text Layer — behind the 3D card */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
          <h1
            className="text-[15vw] font-black tracking-tighter leading-none text-[#14161c] scale-y-[1.8]"
            style={{ whiteSpace: 'nowrap' }}
          >
            {text}
          </h1>
        </div>

        {/* 3D Scene Layer — middle */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Scene isReady={!showPreloader} />
        </div>

        {/* Top Text Layer — in front of card (P K H B only) */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none">
          <h1
            className="text-[15vw] font-black tracking-tighter leading-none text-[#14161c] flex scale-y-[1.8]"
            style={{ whiteSpace: 'nowrap' }}
          >
            {text.split('').map((char, i) => (
              <span
                key={i}
                style={{ visibility: topLetters.includes(char) ? 'visible' : 'hidden' }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

      </div>

    </main>
  )
}
