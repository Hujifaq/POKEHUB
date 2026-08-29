"use client"

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PIN_BOX_ITEMS = [
  {
    id: 'pin-box-1',
    title: 'PROVABLY FAIR',
    bg: 'bg-[#ba7f4e]',
    textColor: 'text-white',
    rotation: '-rotate-[2deg]',
    clipPath: 'polygon(1% 0%, 100% 2%, 99% 100%, 0% 98%)',
    padding: 'px-8 sm:px-14 md:px-20 py-3.5 sm:py-5 md:py-6',
    zIndex: 'z-10'
  },
  {
    id: 'pin-box-2',
    title: 'CARDS+PHYSICS',
    bg: 'bg-[#fcf5e6]',
    textColor: 'text-[#191816]',
    rotation: 'rotate-[2.2deg]',
    clipPath: 'polygon(0% 2%, 99% 0%, 100% 98%, 1% 100%)',
    padding: 'px-10 sm:px-16 md:px-24 py-3.5 sm:py-5 md:py-6',
    zIndex: 'z-20'
  },
  {
    id: 'pin-box-3',
    title: 'INFINITELY PLAYABLE',
    bg: 'bg-[#8a3727]',
    textColor: 'text-white',
    rotation: '-rotate-[1.2deg]',
    clipPath: 'polygon(1% 0%, 100% 1%, 98% 100%, 0% 99%)',
    padding: 'px-8 sm:px-14 md:px-24 py-3.5 sm:py-5 md:py-6',
    zIndex: 'z-30'
  },
  {
    id: 'pin-box-4',
    title: 'HIGH ROLLER',
    bg: 'bg-[#f3cb56]',
    textColor: 'text-[#191816]',
    rotation: 'rotate-[2.5deg]',
    clipPath: 'polygon(0% 1%, 100% 0%, 99% 99%, 1% 100%)',
    padding: 'px-10 sm:px-16 md:px-20 py-3.5 sm:py-5 md:py-6',
    zIndex: 'z-40'
  }
]

export default function RetroFeatureStack() {
  const pinSectionRef = useRef(null)
  const pinContainerRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = pinSectionRef.current
      const container = pinContainerRef.current
      const boxes = gsap.utils.toArray('.pin-box-strip')

      if (!section || !container || boxes.length === 0) return

      // Pinned timeline replicating the Spylt pin-box sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=1600',
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      })

      // Background color transition during pinned scroll
      if (bgRef.current) {
        tl.to(
          bgRef.current,
          {
            backgroundColor: '#1c1512',
            ease: 'none'
          },
          0
        )
      }

      // Staggered bouncy scale-up and tilt entrance for each box
      boxes.forEach((box, i) => {
        tl.fromTo(
          box,
          {
            scale: 0.2,
            y: 120,
            opacity: 0,
            rotate: i % 2 === 0 ? -12 : 12
          },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            rotate: i === 0 ? -2 : i === 1 ? 2.2 : i === 2 ? -1.2 : 2.5,
            duration: 0.8,
            ease: 'back.out(2.2)'
          },
          i * 0.45
        )
      })

      // Subtle resting bounce hold before unpin
      tl.to({}, { duration: 0.5 })

    }, pinSectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={pinSectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none z-30"
    >
      {/* Background Color Transition Layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[#141312] transition-colors duration-500 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Main Pinned Stack Container */}
      <div
        ref={pinContainerRef}
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl -space-y-2 sm:-space-y-3 md:-space-y-4 px-4 will-change-transform"
      >
        {PIN_BOX_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{ clipPath: item.clipPath }}
            className={`pin-box-strip ${item.bg} ${item.textColor} ${item.rotation} ${item.padding} ${item.zIndex} inline-block rounded-xs sm:rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.5)] md:shadow-[8px_8px_0px_rgba(0,0,0,0.6)] hover:scale-[1.03] transition-transform duration-200 cursor-default will-change-transform`}
          >
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-center whitespace-nowrap">
              {item.title}
            </h2>
          </div>
        ))}
      </div>
    </section>
  )
}
