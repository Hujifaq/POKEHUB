"use client"

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

// 6 poker-themed card images (public domain / royalty free)
const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&q=80', // poker chips
  'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&q=80', // cards hand
  'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80', // playing cards
  'https://images.unsplash.com/photo-1522054963843-05a7af7e8c53?w=400&q=80', // casino
  'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80', // cards on table
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80', // green felt
]

const CARD_ROTATIONS = [8, -3, -10, 10, -7, 5]

export default function Preloader({ onComplete }) {
  const loaderRef = useRef(null)
  const brandRef = useRef(null)
  const titleRef = useRef(null)
  const counterRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = new SplitText(titleRef.current, { type: 'chars', mask: 'chars' })
      const counter = counterRef.current

      // ── Set initial states ──────────────────────────────────────────────
      gsap.set(cardRefs.current, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        rotate: (i) => CARD_ROTATIONS[i],
        clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
      })

      gsap.set(title.chars, {
        yPercent: 100,
        rotation: 10,
        transformOrigin: '0% 100%',
      })

      gsap.set(counter, { yPercent: 100 })
      gsap.set(brandRef.current, { visibility: 'hidden' })

      // ── Master timeline ─────────────────────────────────────────────────
      const tl = gsap.timeline({ delay: 0.3, onComplete })

      // Cards scale in and clip-path opens
      tl.to(cardRefs.current, {
        scale: 1,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1,
        ease: 'power3.inOut',
        stagger: 0.2,
      })

      // Brand becomes visible at 0.35
      tl.set(brandRef.current, { visibility: 'visible' }, 0.35)

      // Title chars rotate up
      tl.to(title.chars, {
        yPercent: 0,
        rotation: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.04,
      }, 0.35)

      // Counter slides in
      tl.to(counter, { yPercent: 0, duration: 1, ease: 'power3.out' }, '<')

      // Number counts 000 → 100
      tl.to({ value: 0 }, {
        value: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate() {
          if (counter) {
            counter.textContent = String(Math.round(this.targets()[0].value)).padStart(3, '0')
          }
        },
      }, '<0.5')

      // Title chars rotate out
      tl.to(title.chars, {
        yPercent: -100,
        rotation: -10,
        duration: 0.75,
        ease: 'power3.in',
        stagger: 0.04,
      }, 3.25)

      // Counter slides out
      tl.to(counter, { yPercent: -100, duration: 0.75, ease: 'power3.in' }, 3.25)

      // Cards collapse
      tl.to(cardRefs.current, {
        scale: 0,
        clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
        duration: 1,
        ease: 'power3.inOut',
        stagger: -0.075,
      }, 3.5)

      // Loader wipes up
      tl.to(loaderRef.current, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 1,
        ease: 'power3.inOut',
      }, 4.35)
    })

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 overflow-hidden"
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
          className="absolute top-1/2 left-1/2 overflow-hidden rounded-lg"
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
          ref={titleRef}
          style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: 'clamp(3rem, 10vw, 12rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            color: '#e8e2d6',
            whiteSpace: 'nowrap',
          }}
        >
          POKERHUB
        </h1>
        {/* Counter — positioned top-right of brand, like source */}
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
    </div>
  )
}
