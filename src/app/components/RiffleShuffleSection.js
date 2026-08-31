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
// SCRIPT DATA: 2-STEP CASINO RIFFLE & BRIDGE WATERFALL
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
    tag: 'STEP 01: THE RIFFLE',
    headline: '01 / RIFFLE INTERLOCK',
    description: 'Split the deck and interleave cards edge-to-edge into a woven mesh.',
    accentColor: '#00F5FF'
  },
  {
    id: 2,
    tag: 'STEP 02: THE BRIDGE',
    headline: '02 / BRIDGE WATERFALL',
    description: 'Squeeze the arch and cascade the cards with that iconic money-counting flutter.',
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
// MAIN REACT COMPONENT: 2-STEP RIFFLE & BRIDGE (3/4 SIDEWAYS PERSPECTIVE)
// ----------------------------------------------------------------------

export default function RiffleShuffleSection({ containerRefProp }) {
  const localContainerRef = useRef(null)
  const containerRef = containerRefProp || localContainerRef
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
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

    // 1. Scene & Camera Setup (3/4 SIDEWAYS ANGLE FOR ZERO-OCCLUSION 3D VIEW)
    const scene = new THREE.Scene()
    const width = pinWrapper.clientWidth || window.innerWidth
    const height = pinWrapper.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.set(0, 6.8, 10.8)
    camera.lookAt(0, 0.35, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // ------------------------------------------------------------------
    // 2. Physical Parameters for Full 52 Cards (Dynamic 3/4 Sideways Angle)
    // ------------------------------------------------------------------
    const CARD_W = 2.2
    const CARD_H = 3.2
    const STACK_GAP = 0.026 // Clear vertical separation between card layers
    const TOTAL_CARDS = 52
    const HALF_COUNT = 26

    const cardGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 1, 1)

    const SUITS = ['♠', '♥', '♦', '♣']
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const FULL_DECK_DATA = []

    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        FULL_DECK_DATA.push({ rank, suit })
      })
    })

    // Sideways 3/4 angled deck group (Turned sideways from original orientation)
    const deckRootGroup = new THREE.Group()
    deckRootGroup.rotation.set(0.18, 0.38, -0.06) // 3/4 perspective angle
    scene.add(deckRootGroup)

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

      deckRootGroup.add(cardGroup)

      cards.push({
        group: cardGroup,
        isLeft,
        order: i,
        stackIndex,
        posX: 0,
        posY: initY,
        posZ: 0,
        rotX: -Math.PI / 2,
        rotY: 0,
        rotZ: 0
      })
    }

    // ------------------------------------------------------------------
    // 3. 3D RETRO 8-BIT DARK SMOKE AURA (SUBTLE, CLEAN & DISCREET)
    // ------------------------------------------------------------------
    const smokeCount = 30
    const smokeGeo = new THREE.PlaneGeometry(0.16, 0.16)
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    })
    const smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, smokeCount)
    smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const smokeColors = [
      new THREE.Color(0x050508),
      new THREE.Color(0x0a0b10),
      new THREE.Color(0x12141c),
      new THREE.Color(0x1b1d28),
      new THREE.Color(0x282b3a)
    ]

    const smokeDummy = new THREE.Object3D()
    const smokeParticles = Array.from({ length: smokeCount }, (_, i) => {
      const isLeft = i < smokeCount / 2
      const baseCenterX = isLeft ? -2.6 : 2.6
      const x = baseCenterX + (Math.random() - 0.5) * 1.6
      const y = (Math.random() * 0.8)
      const z = (Math.random() - 0.5) * 2.4

      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)]
      smokeMesh.setColorAt(i, color)

      return {
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.003,
        vy: 0.006 + Math.random() * 0.008,
        rot: Math.floor(Math.random() * 4) * (Math.PI / 2),
        scale: 0.35 + Math.random() * 0.35,
        life: Math.random() * 60,
        maxLife: 60 + Math.random() * 40,
        isLeft
      }
    })
    if (smokeMesh.instanceColor) smokeMesh.instanceColor.needsUpdate = true
    deckRootGroup.add(smokeMesh)

    // ------------------------------------------------------------------
    // 4. Rigid-Body Card Sync (100% Flat & Non-Intersecting Layers)
    // ------------------------------------------------------------------
    const syncAllCards = () => {
      cards.forEach((c) => {
        c.group.position.set(c.posX, c.posY, c.posZ)
        c.group.rotation.set(c.rotX, c.rotY, c.rotZ)
      })
    }

    // ------------------------------------------------------------------
    // 5. GSAP SCROLLTRIGGER TIMELINE: 2-STEP RIFFLE & BRIDGE WATERFALL
    // ------------------------------------------------------------------
    let lastCardIndex = -1
    let lastFlutterTime = 0
    let squareUpPlayed = false

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5.2}`,
          scrub: 1.0,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            const scrollVel = Math.abs(self.getVelocity() / 1000)

            if (p < 0.28) setActiveSceneIndex(0)
            else if (p < 0.58) setActiveSceneIndex(1)
            else setActiveSceneIndex(2)

            // STEP 1: Riffle Interlock (Cards interleaving and weaving into mesh, p in [0.28, 0.58])
            if (p >= 0.28 && p < 0.58) {
              squareUpPlayed = false
              const weaveProgress = (p - 0.28) / (0.58 - 0.28)
              const currentCardIdx = Math.min(27, Math.max(0, Math.floor(weaveProgress * 28)))

              if (currentCardIdx !== lastCardIndex) {
                const side = currentCardIdx % 2 === 0 ? 'left' : 'right'
                const normVel = Math.min(2.5, Math.max(0.4, scrollVel || 1.0))
                SoundEngine.playRiffleCardSnap({
                  cardIndex: currentCardIdx,
                  side,
                  velocity: normVel,
                  intensity: 1.0
                })
                lastCardIndex = currentCardIdx
              }
            }
            // STEP 2: Bridge Waterfall Cascade (Fluttering money count sound, p in [0.68, 0.90])
            else if (p >= 0.68 && p <= 0.90) {
              squareUpPlayed = false
              const now = performance.now()
              if (now - lastFlutterTime > 85) {
                SoundEngine.playWaterfallFlutter(Math.min(2.0, Math.max(0.6, scrollVel || 1.0)))
                lastFlutterTime = now
              }
            }
            // Final Square-up (p > 0.91)
            else if (p > 0.91) {
              if (!squareUpPlayed && self.direction > 0) {
                SoundEngine.playRiffleDeckSquare(Math.min(2.0, Math.max(0.5, scrollVel || 1.0)))
                squareUpPlayed = true
              }
            } else if (p < 0.25) {
              lastCardIndex = -1
              squareUpPlayed = false
            }
          }
        },
        onUpdate: () => {
          syncAllCards()
        }
      })

      // STAGE 0: GENTLE DECK EMERGENCE FROM HERO PORTAL (0.0 -> 0.45s)
      tl.fromTo(
        deckRootGroup.position,
        { y: -0.6 },
        { y: 0, duration: 0.45, ease: 'power2.out' },
        0
      )
      tl.fromTo(
        canvasRef.current,
        { opacity: 0.3 },
        { opacity: 1, duration: 0.45, ease: 'power2.out' },
        0
      )

      // STAGE 1: CUT & SPLIT (0.45 -> 1.4s)
      cards.forEach((c) => {
        const targetX = c.isLeft ? -2.75 : 2.75
        const targetY = 0.15 + c.stackIndex * STACK_GAP
        const targetRotZ = c.isLeft ? 0.06 : -0.06
        const targetRotY = c.isLeft ? -0.04 : 0.04

        if (c.isLeft) {
          tl.to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 0.95,
              ease: 'power2.inOut'
            },
            0.45
          )
        } else {
          tl.to(
            c,
            {
              posY: c.posY + 1.25, // Higher, majestic cut lift
              duration: 0.45,
              ease: 'power2.out'
            },
            0.45
          ).to(
            c,
            {
              posX: targetX,
              posY: targetY,
              rotZ: targetRotZ,
              rotY: targetRotY,
              duration: 0.50,
              ease: 'power2.inOut'
            },
            0.90
          )
        }
      })

      // ==================================================================
      // STEP 1: THE RIFFLE INTERLOCK (1.4 -> 4.2s)
      // Hands hold remaining cards high above the growing center stack.
      // Hand stacks rise continuously so the pile never penetrates the held cards!
      // ==================================================================
      const weaveStart = 1.4
      const weaveStepInterval = 0.09
      const weaveDropDuration = 0.12

      for (let p = 0; p < HALF_COUNT; p++) {
        const leftCard = cards[p]
        const leftStartTime = weaveStart + (p * 2) * weaveStepInterval
        const leftWeaveY = 0.10 + (p * 2) * STACK_GAP
        const leftHandHoldY = 0.35 + (p * 2) * STACK_GAP + 0.28 // Always elevated above center stack!

        // Lift held card smoothly in hand prior to its drop
        if (leftStartTime > weaveStart) {
          tl.to(
            leftCard,
            {
              posX: -2.10,
              posY: leftHandHoldY,
              rotZ: 0.09,
              rotY: -0.03,
              rotX: -Math.PI / 2 + 0.08,
              duration: leftStartTime - weaveStart,
              ease: 'none'
            },
            weaveStart
          )
        }

        // Card drops down from elevated hand into center weave
        tl.to(
          leftCard,
          {
            posX: -0.90,
            posY: leftWeaveY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: -0.02,
            rotZ: 0.04,
            duration: weaveDropDuration,
            ease: 'power2.out'
          },
          leftStartTime
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightStartTime = weaveStart + (p * 2 + 1) * weaveStepInterval
        const rightWeaveY = 0.10 + (p * 2 + 1) * STACK_GAP
        const rightHandHoldY = leftHandHoldY + STACK_GAP

        // Lift held card smoothly in hand prior to its drop
        if (rightStartTime > weaveStart) {
          tl.to(
            rightCard,
            {
              posX: 2.10,
              posY: rightHandHoldY,
              rotZ: -0.09,
              rotY: 0.03,
              rotX: -Math.PI / 2 + 0.08,
              duration: rightStartTime - weaveStart,
              ease: 'none'
            },
            weaveStart
          )
        }

        // Card drops down from elevated hand into center weave
        tl.to(
          rightCard,
          {
            posX: 0.90,
            posY: rightWeaveY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0.02,
            rotZ: -0.04,
            duration: weaveDropDuration,
            ease: 'power2.out'
          },
          rightStartTime
        )
      }

      // ==================================================================
      // STEP 2A: THE BRIDGE ARCH DOME (4.2 -> 5.2s)
      // Cards arch higher into the air (baseArch lifted up to 2.1+ units)
      // ==================================================================
      const bridgeStart = weaveStart + TOTAL_CARDS * weaveStepInterval + 0.15

      for (let p = 0; p < HALF_COUNT; p++) {
        const tNorm = p / (HALF_COUNT - 1)
        const baseArch = 0.52 + Math.sin(tNorm * Math.PI * 0.85 + 0.15) * 1.55 // Higher arch dome!

        const leftCard = cards[p]
        const leftArchY = baseArch + (p * 2) * STACK_GAP

        tl.to(
          leftCard,
          {
            posX: -0.68,
            posY: leftArchY,
            rotZ: 0.22,
            rotX: -Math.PI / 2 + 0.14,
            rotY: 0,
            duration: 0.85,
            ease: 'power2.inOut'
          },
          bridgeStart
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightArchY = baseArch + (p * 2 + 1) * STACK_GAP + 0.015 // Strictly offset above left!

        tl.to(
          rightCard,
          {
            posX: 0.68,
            posY: rightArchY,
            rotZ: -0.22,
            rotX: -Math.PI / 2 + 0.14,
            rotY: 0,
            duration: 0.85,
            ease: 'power2.inOut'
          },
          bridgeStart
        )
      }

      // ==================================================================
      // STEP 2B: THE WATERFALL CASCADE / MONEY COUNT FLUTTER (5.2 -> 6.8s)
      // Cards release from the dome and slide into the central stack with money-count flutter!
      // ==================================================================
      const waterfallStart = bridgeStart + 0.95
      const waterfallStep = 0.055
      const slideDuration = 0.14

      for (let p = 0; p < HALF_COUNT; p++) {
        const leftCard = cards[p]
        const leftFinalY = (p * 2) * STACK_GAP
        const leftDropTime = waterfallStart + (p * 2) * waterfallStep

        tl.to(
          leftCard,
          {
            posX: 0,
            posY: leftFinalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: slideDuration,
            ease: 'power2.in'
          },
          leftDropTime
        )

        const rightCard = cards[HALF_COUNT + p]
        const rightFinalY = (p * 2 + 1) * STACK_GAP
        const rightDropTime = waterfallStart + (p * 2 + 1) * waterfallStep

        tl.to(
          rightCard,
          {
            posX: 0,
            posY: rightFinalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: slideDuration,
            ease: 'power2.in'
          },
          rightDropTime
        )
      }

      // ==================================================================
      // STAGE 5: FINAL CLEAN SQUARE-UP (6.8 -> 7.4s)
      // Final solid tap & flush alignment of the 52-card deck
      // ==================================================================
      const finalizeStart = waterfallStart + TOTAL_CARDS * waterfallStep + 0.12

      cards.forEach((c) => {
        const finalY = (c.isLeft ? (c.stackIndex * 2) : (c.stackIndex * 2 + 1)) * STACK_GAP

        tl.to(
          c,
          {
            posX: 0,
            posY: finalY,
            posZ: 0,
            rotX: -Math.PI / 2,
            rotY: 0,
            rotZ: 0,
            duration: 0.55,
            ease: 'bounce.out'
          },
          finalizeStart
        )
      })
    }, container)

    // 6. Render Loop (Fixed Camera, 3/4 Angled Deck, Subtle Dark Smoke)
    let animationFrameId
    const start = performance.now()

    const render = () => {
      const t = (performance.now() - start) / 1000

      // Update discreet 3D dark smoke particles
      const leftWingX = cards[0] ? cards[0].posX : -2.6
      const leftWingY = cards[0] ? cards[0].posY : 0.2
      const rightWingX = cards[26] ? cards[26].posX : 2.6
      const rightWingY = cards[26] ? cards[26].posY : 0.2

      for (let i = 0; i < smokeCount; i++) {
        const p = smokeParticles[i]
        p.life++
        p.y += p.vy
        p.x += p.vx + Math.sin(t * 2 + i) * 0.002
        p.scale += 0.002

        const baseCenterX = p.isLeft ? leftWingX : rightWingX
        const baseCenterY = p.isLeft ? leftWingY : rightWingY

        if (p.life >= p.maxLife || p.y > baseCenterY + 1.8) {
          p.x = baseCenterX + (Math.random() - 0.5) * 1.6
          p.z = (Math.random() - 0.5) * 2.4
          p.y = baseCenterY + (Math.random() - 0.2) * 0.2
          p.vy = 0.005 + Math.random() * 0.008
          p.scale = 0.30 + Math.random() * 0.25
          p.life = 0
          p.maxLife = 50 + Math.random() * 40
        }

        smokeDummy.position.set(p.x, p.y, p.z)
        smokeDummy.rotation.set(0, 0, p.rot)
        smokeDummy.scale.set(p.scale, p.scale, 1)
        smokeDummy.updateMatrix()
        smokeMesh.setMatrixAt(i, smokeDummy.matrix)
      }
      smokeMesh.instanceMatrix.needsUpdate = true

      syncAllCards()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    // 7. Resize Handler
    const handleResize = () => {
      if (!pinWrapperRef.current) return
      const w = pinWrapperRef.current.clientWidth || window.innerWidth
      const h = pinWrapperRef.current.clientHeight || window.innerHeight
      camera.position.set(0, 6.8, 10.8)
      camera.lookAt(0, 0.35, 0)
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
        className="relative w-full h-screen bg-transparent overflow-hidden select-none z-20 flex items-center justify-start px-6 sm:px-12 lg:px-20"
      >
        {/* Pure Clean Flat 3D Canvas (100% CENTERED on Seamless Global Grid) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

        {/* ------------------------------------------------------------- */}
        {/* 3D CARD-FLIP KINETIC HERO TYPOGRAPHY                          */}
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
