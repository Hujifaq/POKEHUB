"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ----------------------------------------------------------------------
// SCRIPT DATA (BIG BOLD CONTENT)
// ----------------------------------------------------------------------
const SCENES = [
  {
    id: 0,
    tag: 'INTRO',
    headline: 'HOW TO PLAY',
    description: 'Master the table in 6 essential steps.',
    accentColor: '#FFE500'
  },
  {
    id: 1,
    tag: 'THE BLINDS',
    headline: '01 / POST THE BLINDS',
    description: 'Place forced bets to kick off the pot before cards are dealt.',
    accentColor: '#00F5FF'
  },
  {
    id: 2,
    tag: 'PRE-FLOP',
    headline: '02 / GET HOLE CARDS',
    description: 'Receive your 2 private cards and plan your opening strategy.',
    accentColor: '#FF70A6'
  }
]

// ----------------------------------------------------------------------
// PROCEDURAL TEXTURE GENERATORS (FLAT NEO-BRUTALIST / 8-BIT SUITE)
// ----------------------------------------------------------------------

function createCardFaceCanvas(rank, suit) {
  const W = 512
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
  for (let x = 0; x < W; x += 16) ctx.fillRect(x, 0, 1, H)
  for (let y = 0; y < H; y += 16) ctx.fillRect(0, y, W, 1)

  const P = 8
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, W, P * 3)
  ctx.fillRect(0, H - P * 3, W, P * 3)
  ctx.fillRect(0, 0, P * 3, H)
  ctx.fillRect(W - P * 3, 0, P * 3, H)

  ctx.fillStyle = '#050505'
  for (let x = P * 5; x < W - P * 5; x += P * 2) {
    ctx.fillRect(x, P * 4.5, P, P)
    ctx.fillRect(x, H - P * 5.5, P, P)
  }
  for (let y = P * 5; y < H - P * 5; y += P * 2) {
    ctx.fillRect(P * 4.5, y, P, P)
    ctx.fillRect(W - P * 5.5, y, P, P)
  }

  const isRed = suit === '♥' || suit === '♦'
  const mainColor = isRed ? '#D61F3D' : '#050505'
  const badgeColor = isRed ? '#FFE8EE' : '#F0F2F5'

  ctx.fillStyle = badgeColor
  ctx.fillRect(P * 6, P * 6, 84, 114)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 4
  ctx.strokeRect(P * 6, P * 6, 84, 114)

  ctx.fillStyle = mainColor
  ctx.font = 'bold 44px monospace, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(rank, P * 6 + 42, P * 6 + 40)
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(suit, P * 6 + 42, P * 6 + 85)

  ctx.save()
  ctx.translate(W - P * 6, H - P * 6)
  ctx.rotate(Math.PI)
  ctx.fillStyle = badgeColor
  ctx.fillRect(0, 0, 84, 114)
  ctx.strokeRect(0, 0, 84, 114)
  ctx.fillStyle = mainColor
  ctx.font = 'bold 44px monospace, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(rank, 42, 40)
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(suit, 42, 85)
  ctx.restore()

  ctx.fillStyle = '#050505'
  ctx.fillRect(W / 2 - 130, H / 2 - 170, 260, 340)
  ctx.fillStyle = isRed ? '#FFF0F3' : '#FFFFFF'
  ctx.fillRect(W / 2 - 124, H / 2 - 164, 248, 328)

  ctx.fillStyle = mainColor
  ctx.font = 'bold 130px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(suit, W / 2, H / 2 - 20)

  ctx.fillStyle = '#050505'
  ctx.font = 'bold 18px monospace'
  ctx.fillText(`POKERHUB • ${rank} OF ${suit === '♠' ? 'SPADES' : suit === '♥' ? 'HEARTS' : suit === '♦' ? 'DIAMONDS' : 'CLUBS'}`, W / 2, H / 2 + 105)

  ctx.fillStyle = '#FFE500'
  ctx.fillRect(W / 2 - 110, H - 75, 220, 26)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 3
  ctx.strokeRect(W / 2 - 110, H - 75, 220, 26)
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 12px monospace'
  ctx.fillText('3D 52-CARD CASINO DECK', W / 2, H - 62)

  return canvas
}

function createCardBackCanvas() {
  const W = 512
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#11141a'
  ctx.fillRect(0, 0, W, H)

  const P = 8
  ctx.fillStyle = '#FFE500'
  ctx.fillRect(0, 0, W, P * 3)
  ctx.fillRect(0, H - P * 3, W, P * 3)
  ctx.fillRect(0, 0, P * 3, H)
  ctx.fillRect(W - P * 3, 0, P * 3, H)

  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 6
  ctx.strokeRect(P * 3, P * 3, W - P * 6, H - P * 6)

  const cellSize = 32
  for (let y = P * 4; y < H - P * 4; y += cellSize) {
    for (let x = P * 4; x < W - P * 4; x += cellSize) {
      const isEven = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0
      ctx.strokeStyle = isEven ? 'rgba(255, 229, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, cellSize, cellSize)
      if (isEven) {
        ctx.fillStyle = '#FFE500'
        ctx.fillRect(x + cellSize / 2 - 2, y + cellSize / 2 - 2, 4, 4)
      }
    }
  }

  const cx = W / 2
  const cy = H / 2
  const mw = 220
  const mh = 220

  ctx.fillStyle = '#050505'
  ctx.fillRect(cx - mw / 2, cy - mh / 2, mw, mh)
  ctx.fillStyle = '#FFE500'
  ctx.fillRect(cx - mw / 2 + 6, cy - mh / 2 + 6, mw - 12, mh - 12)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 6
  ctx.strokeRect(cx - mw / 2 + 6, cy - mh / 2 + 6, mw - 12, mh - 12)

  ctx.fillStyle = '#050505'
  ctx.font = 'bold 42px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('777', cx, cy - 20)
  ctx.font = 'bold 16px monospace'
  ctx.fillText('★ POKEHUB ★', cx, cy + 32)
  ctx.font = 'bold 11px monospace'
  ctx.fillText('52-CARD FULL DECK', cx, cy + 56)

  return canvas
}

// ----------------------------------------------------------------------
// MAIN REACT COMPONENT: 3D 52-CARD RIFFLE
// ----------------------------------------------------------------------

export default function RiffleShuffleSection() {
  const containerRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const soundThrottleRef = useRef(0)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)

  // Sound feedback on scene change
  const prevSceneRef = useRef(0)
  useEffect(() => {
    if (prevSceneRef.current !== activeSceneIndex) {
      prevSceneRef.current = activeSceneIndex
      SoundEngine.playCardFlip()
    }
  }, [activeSceneIndex])

  useEffect(() => {
    const container = containerRef.current
    const pinWrapper = pinWrapperRef.current
    const canvas = canvasRef.current
    if (!container || !pinWrapper || !canvas) return

    // 1. Scene & Camera Setup (100% CENTERED ON SCREEN)
    const scene = new THREE.Scene()
    const width = pinWrapper.clientWidth || window.innerWidth
    const height = pinWrapper.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000)
    camera.position.set(0, 7.5, 11.2)
    camera.lookAt(0, 0.4, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // 2. Physical Parameters for Full 52 Cards
    const CARD_W = 2.2
    const CARD_H = 3.2
    const CARD_THICKNESS = 0.004
    const STACK_GAP = 0.016
    const TOTAL_CARDS = 52
    const HALF_COUNT = 26

    const cardGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 36, 14)

    const SUITS = ['♠', '♥', '♦', '♣']
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const FULL_DECK_DATA = []

    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        FULL_DECK_DATA.push({ rank, suit })
      })
    })

    const cards = []

    const backCanvas = createCardBackCanvas()
    const backTexture = new THREE.CanvasTexture(backCanvas)
    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.needsUpdate = true

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.FrontSide
    })

    for (let i = 0; i < TOTAL_CARDS; i++) {
      const isLeft = i < HALF_COUNT
      const stackIndex = isLeft ? i : (i - HALF_COUNT)
      const cardData = FULL_DECK_DATA[i] || { rank: 'A', suit: '♠' }

      const faceCanvas = createCardFaceCanvas(cardData.rank, cardData.suit)
      const faceTexture = new THREE.CanvasTexture(faceCanvas)
      faceTexture.colorSpace = THREE.SRGBColorSpace
      faceTexture.needsUpdate = true

      const faceMaterial = new THREE.MeshBasicMaterial({
        map: faceTexture,
        side: THREE.FrontSide
      })

      const cardGroup = new THREE.Group()

      const frontMesh = new THREE.Mesh(cardGeometry.clone(), faceMaterial)
      const backMesh = new THREE.Mesh(cardGeometry.clone(), backMaterial)
      backMesh.rotation.y = Math.PI

      cardGroup.add(frontMesh)
      cardGroup.add(backMesh)

      const initY = i * STACK_GAP
      cardGroup.position.set(0, initY, 0)
      cardGroup.rotation.set(-Math.PI / 2, 0, 0)

      scene.add(cardGroup)

      cards.push({
        group: cardGroup,
        frontMesh,
        backMesh,
        isLeft,
        order: i,
        stackIndex,
        posX: 0,
        posY: initY,
        posZ: 0,
        rotX: -Math.PI / 2,
        rotY: 0,
        rotZ: 0,
        bend: 0
      })
    }

    // 3. Curvature Calculation
    const computeCurvatureZ = (x, bend, isLeft) => {
      const normX = x / CARD_W + 0.5
      if (isLeft) {
        const t = Math.max(0, (normX - 0.25) / 0.75)
        return (t * t) * bend
      } else {
        const t = Math.max(0, (0.75 - normX) / 0.75)
        return (t * t) * bend
      }
    }

    const applyCurvatureToCard = (card) => {
      const { frontMesh, backMesh, bend, isLeft } = card
      const basePos = cardGeometry.attributes.position
      const halfThick = CARD_THICKNESS / 2

      const frontPos = frontMesh.geometry.attributes.position
      for (let j = 0; j < frontPos.count; j++) {
        const x = basePos.getX(j)
        const y = basePos.getY(j)
        const curveZ = computeCurvatureZ(x, bend, isLeft)
        frontPos.setXYZ(j, x, y, curveZ + halfThick)
      }
      frontPos.needsUpdate = true

      const backPos = backMesh.geometry.attributes.position
      for (let j = 0; j < backPos.count; j++) {
        const localX = basePos.getX(j)
        const y = basePos.getY(j)
        const worldX = -localX
        const curveZ = computeCurvatureZ(worldX, bend, isLeft)
        backPos.setXYZ(j, localX, y, -(curveZ - halfThick))
      }
      backPos.needsUpdate = true
    }

    const syncAllCards = () => {
      cards.forEach((c) => {
        c.group.position.set(c.posX, c.posY, c.posZ)
        c.group.rotation.set(c.rotX, c.rotY, c.rotZ)
        applyCurvatureToCard(c)
      })
    }

    // 4. GSAP ScrollTrigger Timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5.0}`,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            if (p < 0.33) setActiveSceneIndex(0)
            else if (p < 0.68) setActiveSceneIndex(1)
            else setActiveSceneIndex(2)

            if (p >= 0.28 && p <= 0.85) {
              const now = Date.now()
              if (now - soundThrottleRef.current > 55) {
                soundThrottleRef.current = now
                SoundEngine.playCardSwoosh()
              }
            }
          }
        },
        onUpdate: () => {
          syncAllCards()
        }
      })

      // STAGE 1: CUT & SPLIT (0.0 -> 1.2s)
      cards.forEach((c) => {
        const targetX = c.isLeft ? -2.6 : 2.6
        const targetY = 0.15 + c.stackIndex * STACK_GAP
        const targetRotZ = c.isLeft ? 0.10 : -0.10
        const targetRotY = c.isLeft ? -0.04 : 0.04

        if (c.isLeft) {
          tl.to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 1.2,
              ease: 'power2.inOut'
            },
            0
          )
        } else {
          tl.to(
            c,
            {
              posY: c.posY + 0.7,
              duration: 0.55,
              ease: 'power2.out'
            },
            0
          ).to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 0.65,
              ease: 'power2.inOut'
            },
            0.55
          )
        }
      })

      // STAGE 2: THUMB BEND IN HANDS (1.2 -> 2.2s)
      cards.forEach((c) => {
        const handX = c.isLeft ? -2.6 : 2.6
        const stackElevation = (c.stackIndex / HALF_COUNT)
        const targetBend = 0.65 + stackElevation * 0.25
        const archLiftY = 0.15 + c.stackIndex * STACK_GAP + stackElevation * 0.3 + 0.15

        tl.to(
          c,
          {
            posX: handX,
            posY: archLiftY,
            bend: targetBend,
            rotZ: c.isLeft ? 0.06 : -0.06,
            rotY: 0,
            duration: 1.0,
            ease: 'power1.inOut'
          },
          1.2
        )
      })

      // STAGE 3: SEQUENTIAL ONE-BY-ONE DROP (2.2 -> 6.5s)
      const cascadeStart = 2.2
      const dropDuration = 0.075
      const stepInterval = 0.085

      for (let p = 0; p < HALF_COUNT; p++) {
        const leftCard = cards[p]
        const leftStartTime = cascadeStart + (p * 2) * stepInterval
        const leftSettledY = (p * 2) * STACK_GAP

        tl.to(
          leftCard,
          {
            posX: 0,
            posY: leftSettledY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            bend: 0,
            duration: dropDuration,
            ease: 'power2.inOut'
          },
          leftStartTime
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightStartTime = cascadeStart + (p * 2 + 1) * stepInterval
        const rightSettledY = (p * 2 + 1) * STACK_GAP

        tl.to(
          rightCard,
          {
            posX: 0,
            posY: rightSettledY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            bend: 0,
            duration: dropDuration,
            ease: 'power2.inOut'
          },
          rightStartTime
        )
      }

      // STAGE 4: CLEAN FINAL SQUARE-UP (6.5 -> 7.2s)
      const finalizeStart = cascadeStart + TOTAL_CARDS * stepInterval + 0.15

      cards.forEach((c) => {
        const finalY = (c.isLeft ? (c.stackIndex * 2) : (c.stackIndex * 2 + 1)) * (STACK_GAP * 0.85)

        tl.to(
          c,
          {
            posX: 0,
            posY: finalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            bend: 0,
            duration: 0.65,
            ease: 'bounce.out'
          },
          finalizeStart
        )
      })
    }, container)

    // 5. Render Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const render = () => {
      const elapsed = clock.getElapsedTime()
      camera.position.x = Math.sin(elapsed * 0.35) * 0.06
      camera.lookAt(0, 0.4, 0)

      syncAllCards()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    // 6. Resize Handler
    const handleResize = () => {
      if (!pinWrapperRef.current) return
      const w = pinWrapperRef.current.clientWidth || window.innerWidth
      const h = pinWrapperRef.current.clientHeight || window.innerHeight
      camera.position.set(0, 7.5, 11.2)
      camera.lookAt(0, 0.4, 0)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    const refreshTimer1 = setTimeout(() => ScrollTrigger.refresh(), 150)
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(), 600)
    const refreshTimer3 = setTimeout(() => ScrollTrigger.refresh(), 1400)

    return () => {
      clearTimeout(refreshTimer1)
      clearTimeout(refreshTimer2)
      clearTimeout(refreshTimer3)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      ctx.revert()
      renderer.dispose()
    }
  }, [])

  const currentScene = SCENES[activeSceneIndex]

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen bg-[#F6F5FA] overflow-hidden border-t-[4px] border-b-[4px] border-true-black select-none z-30 flex items-center justify-start px-6 sm:px-12 lg:px-20"
      >
        {/* 1. Seamless Fixed Graph Paper Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* 2. Pure Clean Flat 3D Canvas (100% CENTERED) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

        {/* ------------------------------------------------------------- */}
        {/* 3. 3D CARD-FLIP KINETIC HERO TYPOGRAPHY                       */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-20 pointer-events-none max-w-lg lg:max-w-xl [perspective:1200px]">
          <div
            key={currentScene.id}
            className="animate-card-flip-3d"
          >
            {/* Tag Badge */}
            <div className="mb-3 sm:mb-4">
              <span
                className="font-pixel text-[11px] sm:text-xs font-black uppercase px-3.5 py-1.5 border-[3px] border-true-black shadow-[3px_3px_0px_#000] inline-block -rotate-1 transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: currentScene.accentColor }}
              >
                {currentScene.tag}
              </span>
            </div>

            {/* Giant Chunky Headline */}
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-true-black tracking-tight leading-[0.92] mb-4 sm:mb-5 drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]">
              {currentScene.headline}
            </h2>

            {/* Neo-Brutalist Description Card with Accent Line */}
            <div className="brutal-window bg-white p-4 sm:p-5 border-[4px] border-true-black shadow-[8px_8px_0px_#000] max-w-md pointer-events-auto relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                style={{ backgroundColor: currentScene.accentColor }}
              />
              <p className="font-mono-nb text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-snug pt-1">
                {currentScene.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
