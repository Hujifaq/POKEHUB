"use client"

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Draws a high-res neo-brutalist "Ace of Spades" face onto a canvas → used as a texture map.
function makeCardFaceTexture() {
  const W = 520
  const H = 760
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return c

  // Base + thick brutalist double frame
  ctx.fillStyle = '#FFDE59'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 34
  ctx.strokeRect(17, 17, W - 34, H - 34)
  ctx.lineWidth = 8
  ctx.strokeRect(54, 54, W - 108, H - 108)

  // Spade pip drawer with hard offset shadow
  const spade = (cx, cy, s, fill, outline = false) => {
    const path = () => {
      ctx.beginPath()
      ctx.moveTo(0, -1)
      ctx.bezierCurveTo(0.9, -0.1, 1.1, 0.7, 0.4, 1.0)
      ctx.bezierCurveTo(0.1, 1.12, 0.02, 0.9, 0, 0.72)
      ctx.bezierCurveTo(-0.02, 0.9, -0.1, 1.12, -0.4, 1.0)
      ctx.bezierCurveTo(-1.1, 0.7, -0.9, -0.1, 0, -1)
      ctx.closePath()
      ctx.moveTo(-0.28, 1.28)
      ctx.lineTo(0.28, 1.28)
      ctx.lineTo(0.08, 0.72)
      ctx.lineTo(-0.08, 0.72)
      ctx.closePath()
    }
    const draw = (ox, oy, color, stroke = false) => {
      ctx.save()
      ctx.translate(cx + ox, cy + oy)
      ctx.scale(s, s)
      path()
      ctx.fillStyle = color
      ctx.fill()
      if (stroke) {
        ctx.lineWidth = 8 / s
        ctx.strokeStyle = '#000000'
        ctx.stroke()
      }
      ctx.restore()
    }
    draw(10, 12, '#000000') // offset shadow
    draw(0, 0, fill, outline)
  }

  // Center hero spade pip
  spade(W / 2, H / 2, 150, '#FF90E8', true)

  // Corner index marks (top-left + bottom-right rotated)
  const corner = (x, y, flip) => {
    ctx.save()
    ctx.translate(x, y)
    if (flip) ctx.rotate(Math.PI)
    ctx.fillStyle = '#000000'
    ctx.font = "900 92px 'Archivo Black', 'Bungee', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('A', 0, 0)
    spade(0, 52, 30, '#000000')
    ctx.restore()
  }
  corner(104, 150, false)
  corner(W - 104, H - 150, true)

  return c
}

// Rounded-rectangle shape used to extrude the playing-card body
function roundedCardShape(w, h, r) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  return shape
}

export default function NeoBrutalistHero({ onOpenDuel, onScrollToGallery, containerRefProp }) {
  const localContainerRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const textRef = useRef(null)
  const cardGroupRef = useRef(null)
  const secondRevealRef = useRef(null)
  const badgesRef = useRef(null)
  const portalOverlayRef = useRef(null)
  const vaultCueRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const pinWrapper = pinWrapperRef.current
    const container = containerRef.current
    if (!canvas || !pinWrapper || !container) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(pinWrapper.clientWidth || window.innerWidth, pinWrapper.clientHeight || window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      (pinWrapper.clientWidth || window.innerWidth) / (pinWrapper.clientHeight || window.innerHeight),
      0.05,
      100
    )
    camera.position.set(0, 0, 8)

    // Extruded rounded playing card mesh with metallic/foil finish
    const shape = roundedCardShape(2.6, 3.8, 0.28)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 5,
      curveSegments: 32,
    })
    geometry.center()

    // Remap UVs so the canvas texture maps cleanly onto front & back faces
    geometry.computeBoundingBox()
    const bb = geometry.boundingBox
    if (bb) {
      const uv = geometry.attributes.uv
      const pos = geometry.attributes.position
      const sx = bb.max.x - bb.min.x
      const sy = bb.max.y - bb.min.y
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy)
      }
      uv.needsUpdate = true
    }

    const faceTexture = new THREE.CanvasTexture(makeCardFaceTexture())
    faceTexture.colorSpace = THREE.SRGBColorSpace
    faceTexture.anisotropy = 8

    // Foil material with metallic iridescence sheen (supports smooth transparency for zoom-through)
    const foilMaterial = new THREE.MeshPhysicalMaterial({
      map: faceTexture,
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      reflectivity: 1,
      iridescence: 0.65,
      iridescenceIOR: 1.5,
      envMapIntensity: 1.25,
      transparent: true,
      opacity: 1,
    })

    // Solid black extruded edge
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.1,
      roughness: 0.7,
      transparent: true,
      opacity: 1,
    })

    // PMREM environment for dynamic gradient reflections
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    const gradTex = (() => {
      const c = document.createElement('canvas')
      c.width = 4
      c.height = 256
      const ctx = c.getContext('2d')
      if (ctx) {
        const g = ctx.createLinearGradient(0, 0, 0, 256)
        g.addColorStop(0, '#ff90e8')
        g.addColorStop(0.5, '#ffffff')
        g.addColorStop(1, '#ffde59')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 4, 256)
      }
      const t = new THREE.CanvasTexture(c)
      t.mapping = THREE.EquirectangularReflectionMapping
      return t
    })()
    envScene.background = gradTex
    const envRT = pmrem.fromScene(envScene)
    scene.environment = envRT.texture

    const card = new THREE.Mesh(geometry, [foilMaterial, edgeMaterial])

    const cardGroup = new THREE.Group()
    cardGroup.add(card)
    // Start position: centered in depth with subtle tilt for seamless handoff from Section 1
    cardGroup.position.set(0, -0.1, -1.2)
    cardGroup.rotation.set(-0.08, -0.35, 0.04)
    cardGroup.scale.set(0.88, 0.88, 0.88)
    scene.add(cardGroup)
    cardGroupRef.current = cardGroup

    // Lighting setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(4, 6, 6)
    scene.add(key)

    const pink = new THREE.PointLight(0xff90e8, 3.5, 30)
    pink.position.set(-5, 2, 4)
    scene.add(pink)

    const yellow = new THREE.PointLight(0xffde59, 3.5, 30)
    yellow.position.set(5, -3, 4)
    scene.add(yellow)

    // Gentle idle floating loop
    let raf = 0
    const start = performance.now()
    const animate = () => {
      const t = (performance.now() - start) / 1000
      if (cardGroup.scale.x < 3) {
        card.position.y = Math.sin(t * 1.2) * 0.06
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    // Scrollytelling Timeline: Complete Zoom-Through -> Spacious Dedicated Buffer -> Section 3 Handoff
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.6}`, // Generous 460vh scroll track
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // ==========================================
      // STAGE 1: SEAMLESS ENTRY & FOCUS (0.0 -> 0.8s)
      // Card steps forward from depth to dead center with smooth 360 spin
      // ==========================================
      tl.to(
        cardGroup.position,
        { x: 0, y: 0, z: 0, ease: 'power2.out', duration: 0.8 },
        0
      )
      .to(
        cardGroup.scale,
        { x: 1, y: 1, z: 1, ease: 'power2.out', duration: 0.8 },
        0
      )
      .to(
        cardGroup.rotation,
        { y: Math.PI * 2, x: 0, z: 0, ease: 'power2.out', duration: 0.8 },
        0
      )

      // Initial Hero Text fades out and slides up
      if (textRef.current) {
        tl.to(
          textRef.current,
          { autoAlpha: 0, y: -70, ease: 'power2.in', duration: 0.45 },
          0
        )
      }

      // ==========================================
      // STAGE 2: SHOWCASE & FOIL HIGHLIGHT (0.8 -> 1.5s)
      // ==========================================
      if (secondRevealRef.current) {
        tl.fromTo(
          secondRevealRef.current,
          { autoAlpha: 0, y: 60, scale: 0.88 },
          { autoAlpha: 1, y: 0, scale: 1, ease: 'back.out(1.4)', duration: 0.5 },
          0.8
        )
      }

      // Subtle metallic foil shine tilt
      tl.to(
        cardGroup.rotation,
        { y: Math.PI * 2 + 0.12, x: 0.05, ease: 'power1.inOut', duration: 0.5 },
        0.85
      )

      // ==========================================
      // STAGE 3: LOCK ON CENTER & CLEAR UI (1.5 -> 1.9s)
      // ==========================================
      // Straighten card perfectly facing camera
      tl.to(
        cardGroup.rotation,
        { y: Math.PI * 2, x: 0, z: 0, ease: 'power2.inOut', duration: 0.4 },
        1.5
      )

      // Secondary Reveal Banner drops down and disappears
      if (secondRevealRef.current) {
        tl.to(
          secondRevealRef.current,
          { autoAlpha: 0, y: 50, scale: 0.85, ease: 'power2.in', duration: 0.35 },
          1.5
        )
      }

      // Corner badges fade out
      if (badgesRef.current) {
        tl.to(
          badgesRef.current,
          { autoAlpha: 0, duration: 0.3, ease: 'power1.out' },
          1.55
        )
      }

      // ==========================================
      // STAGE 4: CINEMATIC ZOOM-THROUGH (1.9s -> 2.7s)
      // (Card is 100% penetrated & vanished by 2.7s!)
      // ==========================================
      // Camera plunges directly into center spade
      tl.to(
        camera.position,
        { z: 0.1, ease: 'power3.in', duration: 0.8 },
        1.9
      )
      // Card expands exponentially into a giant flying portal
      .to(
        cardGroup.scale,
        { x: 48, y: 48, z: 48, ease: 'power3.in', duration: 0.8 },
        1.9
      )
      .to(
        cardGroup.position,
        { z: 2.0, ease: 'power2.in', duration: 0.8 },
        1.9
      )

      // Portal warp flare expands and dissolves
      if (portalOverlayRef.current) {
        tl.fromTo(
          portalOverlayRef.current,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 0.95, scale: 2.8, ease: 'power2.out', duration: 0.4 },
          2.05
        )
        .to(
          portalOverlayRef.current,
          { autoAlpha: 0, scale: 5.0, ease: 'power2.in', duration: 0.35 },
          2.45
        )
      }

      // Materials dissolve smoothly as camera passes through
      tl.to(
        foilMaterial,
        { opacity: 0, duration: 0.3, ease: 'power2.out' },
        2.4
      )
      .to(
        edgeMaterial,
        { opacity: 0, duration: 0.3, ease: 'power2.out' },
        2.4
      )

      // ==========================================
      // STAGE 5: DEDICATED POST-ZOOM BUFFER (2.7s -> 3.7s)
      // (Card is 100% GONE; spacious, comfortable transition bridge!)
      // ==========================================
      if (vaultCueRef.current) {
        // Vault title cue emerges smoothly from the penetrated portal
        tl.fromTo(
          vaultCueRef.current,
          { autoAlpha: 0, scale: 0.88, y: 40 },
          { autoAlpha: 1, scale: 1, y: 0, ease: 'power2.out', duration: 0.4 },
          2.7
        )
        // User comfortably reads / scrolls through the generous buffer
        .to({}, { duration: 0.6 }, 3.1)
        // Bridge cue lifts gracefully as Section 3 approaches top of view
        .to(
          vaultCueRef.current,
          { autoAlpha: 0, y: -60, scale: 1.05, ease: 'power2.in', duration: 0.35 },
          3.7
        )
      }

      // ==========================================
      // STAGE 6: FINAL UNPIN BUFFER (3.85s -> 4.0s)
      // ==========================================
      tl.to({}, { duration: 0.15 }, 3.85)

    }, containerRef)

    // Force ScrollTrigger to refresh and recalculate all down-page section start offsets
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    const onResize = () => {
      if (!pinWrapper || !renderer || !camera) return
      const width = pinWrapper.clientWidth || window.innerWidth
      const height = pinWrapper.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshTimer)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      ctx.revert()
      geometry.dispose()
      foilMaterial.dispose()
      edgeMaterial.dispose()
      faceTexture.dispose()
      gradTex.dispose()
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [])

  // Interactive draw card handler
  const handleDrawCard = () => {
    SoundEngine.playCardSwoosh()
    SoundEngine.playCardFlip()
    if (cardGroupRef.current) {
      gsap.to(cardGroupRef.current.rotation, {
        y: '+=6.283', // Full 360 spin
        x: '+=0.2',
        duration: 0.9,
        ease: 'power3.out',
        onComplete: () => {
          gsap.to(cardGroupRef.current.rotation, { x: 0, duration: 0.4 })
        }
      })
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden select-none z-20 bg-transparent"
      >
        {/* Decorative Corner Badges */}
        <div ref={badgesRef} className="contents">
          <div className="absolute top-6 left-6 z-20 hidden sm:flex items-center gap-2 pointer-events-none">
            <span className="font-pixel text-[9px] bg-accent-yellow border-[2px] border-true-black px-2 py-1 brutal-shadow-sm font-bold text-true-black">
              STAGE 02
            </span>
            <span className="font-pixel text-[9px] bg-white border-[2px] border-true-black px-2 py-1 brutal-shadow-sm font-bold text-true-black">
              FOIL ARCHIVES
            </span>
          </div>

          <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 pointer-events-none">
            <span className="font-display text-base text-true-black bg-ui-pink border-[2px] border-true-black px-2.5 py-0.5 brutal-shadow-sm font-black">
              ♠ ACE EDITION
            </span>
          </div>
        </div>

        {/* Portal Warp Flare on Zoom-Through */}
        <div
          ref={portalOverlayRef}
          className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center opacity-0 will-change-transform"
        >
          <div className="w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] rounded-full bg-gradient-to-tr from-[#ff90e8] via-[#fffb00] to-[#00f0ff] blur-3xl opacity-90" />
        </div>

        {/* Three.js canvas overlaid behind the UI */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full z-10"
        />

        {/* Main Hero UI Layer */}
        <div
          ref={textRef}
          className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          {/* Retro Badge */}
          <div
            className="font-mono-nb mb-6 inline-flex items-center gap-2 border-[3px] border-true-black bg-ui-pink px-4 py-1.5 text-xs font-bold tracking-widest text-true-black uppercase brutal-shadow-sm"
          >
            <span className="inline-block h-2.5 w-2.5 bg-true-black animate-ping" />
            <span>Deck v2.0 — Now Shuffling</span>
          </div>

          {/* Headline */}
          <h1 className="font-display max-w-4xl text-4xl leading-[1.05] text-true-black uppercase sm:text-6xl lg:text-7xl drop-shadow-[3px_3px_0px_rgba(0,0,0,0.15)]">
            Play your{' '}
            <span
              className="inline-block -rotate-2 border-[4px] border-true-black bg-accent-yellow px-4 py-1 text-true-black brutal-shadow transition-transform hover:rotate-0"
            >
              winning
            </span>{' '}
            hand
          </h1>

          {/* Subtitle */}
          <p className="font-mono-nb mt-6 max-w-xl text-xs sm:text-sm text-true-black/80 font-bold leading-relaxed">
            Scroll to deal. A brutally honest deck engine built for players who hate losing more than they love winning.
          </p>

          {/* Interactive Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDrawCard}
              className="brutal-btn bg-true-black text-white px-7 py-3.5 font-display text-sm sm:text-base font-black uppercase tracking-wider cursor-pointer hover:bg-ui-pink hover:text-true-black transition-colors"
            >
              Draw a card →
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick()
                if (onScrollToGallery) {
                  onScrollToGallery()
                } else if (containerRef.current) {
                  window.scrollBy({ top: window.innerHeight * 2.5, behavior: 'smooth' })
                }
              }}
              className="brutal-btn bg-white text-true-black px-5 py-3.5 font-pixel text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-accent-yellow"
            >
              Explore Decks ↓
            </button>
          </div>

          {/* Scroll Cue */}
          <div className="font-mono-nb absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold tracking-widest text-true-black/60 uppercase flex flex-col items-center gap-1">
            <span className="animate-bounce">↓</span>
            <span>Scroll to plunge into 3D Card</span>
          </div>
        </div>

        {/* Secondary Scrollytelling Reveal Banner (Revealed on Scroll) */}
        <div
          ref={secondRevealRef}
          className="pointer-events-auto absolute bottom-12 left-1/2 -translate-x-1/2 z-20 opacity-0 will-change-transform flex flex-col items-center gap-3 w-[90vw] max-w-md"
        >
          <div className="brutal-window w-full p-4 sm:p-5 text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] bg-accent-cyan border-[2px] border-true-black px-2 py-0.5 font-black text-true-black uppercase">
                PROCEDURAL FOIL
              </span>
              <span className="font-pixel text-[9px] bg-accent-yellow border-[2px] border-true-black px-2 py-0.5 font-black text-true-black">
                100% 3D EXTENSION
              </span>
            </div>
            <h4 className="font-display text-lg sm:text-xl font-black text-true-black">
              MYTHIC ACE OF SPADES
            </h4>
            <p className="font-mono-nb text-[10px] sm:text-xs text-gray-700 font-bold">
              Full 360° reflective canvas texture with extruded brutalist edges.
            </p>
            <button
              onClick={() => {
                SoundEngine.playCardSwoosh()
                if (onOpenDuel) onOpenDuel()
              }}
              className="brutal-btn w-full mt-2 py-2.5 bg-ui-pink text-true-black font-display text-xs uppercase font-black cursor-pointer hover:bg-[#ff8cb8]"
            >
              ⚔️ CHALLENGE IN 3D DUEL
            </button>
          </div>
        </div>

        {/* Seamless Transition Bridge to Section 3 (Appears AFTER card is completely traversed!) */}
        <div
          ref={vaultCueRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center opacity-0 will-change-transform px-4 select-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-cyan border-[3px] border-true-black brutal-shadow-sm mb-4">
            <span className="text-xs">🎴</span>
            <span className="font-pixel text-[10px] sm:text-xs font-black uppercase text-true-black">
              ENTERING POKERHUB VAULT
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-true-black uppercase tracking-tight drop-shadow-[4px_4px_0px_#ffa6c9] leading-tight max-w-3xl">
            ACCESSING 6 ELITE DECKS
          </h2>
          <p className="font-mono-nb text-xs sm:text-sm font-bold text-gray-700 mt-4 max-w-lg">
            (COLLECTIBLE HIGH-ROLLER ARCHIVES &amp; HOLOGRAPHIC FOIL EDITIONS)
          </p>
          <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-white border-[2px] border-true-black brutal-shadow-sm font-pixel text-[9px] text-true-black font-bold animate-pulse">
            ↓ SCROLL TO EXPLORE SHOWCASE
          </div>
        </div>
      </section>
    </div>
  )
}
