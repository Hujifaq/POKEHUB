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

      gsap.set(cardRefs.current, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        rotate: (i) => CARD_ROTATIONS[i],
        clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
      })

      gsap.set(chars, {
        yPercent: 100,
        rotation: 10,
        transformOrigin: '0% 100%',
      })

      gsap.set(counter, { yPercent: 100 })
      gsap.set(brandRef.current, { visibility: 'hidden' })

      const tl = gsap.timeline({ delay: 0.1, onComplete })

      tl.to(cardRefs.current, {
        scale: 1,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.8,
        ease: 'power3.inOut',
        stagger: 0.12,
      })

      tl.set(brandRef.current, { visibility: 'visible' }, 0.25)

      tl.to(chars, {
        yPercent: 0,
        rotation: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.03,
      }, 0.25)

      tl.to(counter, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, '<')

      tl.to({ value: 0 }, {
        value: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate() {
          if (counter) {
            counter.textContent = String(Math.round(this.targets()[0].value)).padStart(3, '0')
          }
        },
      }, '<0.2')

      tl.to(chars, {
        yPercent: -100,
        rotation: -10,
        duration: 0.55,
        ease: 'power3.in',
        stagger: 0.02,
      }, 2.2)

      tl.to(counter, { yPercent: -100, duration: 0.55, ease: 'power3.in' }, 2.2)

      tl.to(cardRefs.current, {
        scale: 0,
        clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
        duration: 0.65,
        ease: 'power3.inOut',
        stagger: -0.05,
      }, 2.4)

      tl.to(loaderRef.current, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.7,
        ease: 'power3.inOut',
      }, 2.9)
    })

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[2000] overflow-hidden select-none cursor-pointer"
      onClick={onComplete}
      style={{
        background: '#14161c',
        color: '#e8e2d6',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      }}
    >
      {/* Poker card images */}
      {CARD_IMAGES.map((src, i) => (
        <div
          key={i}
          ref={el => cardRefs.current[i] = el}
          className="absolute top-1/2 left-1/2 overflow-hidden rounded-lg shadow-2xl"
          style={{
            width: '220px',
            height: '300px',
            transform: 'translate(-50%, -50%)',
            clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      ))}

      {/* Brand: POKERHUB + counter */}
      <div
        ref={brandRef}
        className="absolute top-1/2 left-1/2"
        style={{ transform: 'translate(-50%, -50%)', visibility: 'hidden', textAlign: 'center' }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: 'clamp(3rem, 10vw, 12rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            color: '#e8e2d6',
            whiteSpace: 'nowrap',
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          {BRAND_LETTERS.map((letter, i) => (
            <span
              key={i}
              ref={el => charRefs.current[i] = el}
              style={{ display: 'inline-block' }}
            >
              {letter}
            </span>
          ))}
        </h1>

        <div
          className="overflow-hidden"
          style={{
            position: 'absolute',
            top: '-1.5rem',
            left: 'calc(100% + 1rem)',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)',
            fontWeight: 700,
          }}
        >
          <p ref={counterRef} style={{ color: '#e8e2d6' }}>000</p>
        </div>
      </div>

      {/* Skip Button */}
      <div className="absolute bottom-8 right-8 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onComplete()
          }}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 border border-white/20 transition-all cursor-pointer"
        >
          SKIP INTRO ➔
        </button>
      </div>
    </div>
  )
}
