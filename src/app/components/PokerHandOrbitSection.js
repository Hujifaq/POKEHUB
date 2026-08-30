"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SoundEngine } from './SoundEngine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ----------------------------------------------------------------------
// STREET PHASES DATA (BIG BOLD ENGLISH CONTENT)
// ----------------------------------------------------------------------
const STREET_PHASES = [
  {
    id: 0,
    tag: 'THE FLOP',
    headline: '03 / THE FLOP',
    description: '3 community cards are revealed. Connect them with your hand.',
    accentColor: '#FF70A6'
  },
  {
    id: 1,
    tag: 'TURN & RIVER',
    headline: '04 / TURN & RIVER',
    description: 'The 4th and 5th cards drop to complete the final board.',
    accentColor: '#00F5FF'
  },
  {
    id: 2,
    tag: 'BETTING ACTION',
    headline: '05 / MAKE YOUR MOVE',
    description: 'Check, raise to apply pressure, or fold to protect your chips.',
    accentColor: '#FFE500'
  },
  {
    id: 3,
    tag: 'THE SHOWDOWN',
    headline: '06 / THE SHOWDOWN',
    description: 'Reveal hands. The best 5-card combination takes the entire pot.',
    accentColor: '#00FFA3'
  }
]

// ----------------------------------------------------------------------
// PROCEDURAL CANVAS GENERATORS (FELT TABLE, CARDS, CHIPS)
// ----------------------------------------------------------------------

function createTableFeltCanvas() {
  const W = 1024
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = '#F4F3F8'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 1, H)
  for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 1)

  ctx.beginPath()
  ctx.ellipse(W / 2, H / 2, 420, 260, 0, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#050505'
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(W / 2, H / 2, 408, 248, 0, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#FFE500'
  ctx.stroke()

  ctx.fillStyle = '#050505'
  ctx.font = 'bold 26px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('★ POKEHUB NO-LIMIT CASINO ★', W / 2, H / 2 - 130)

  const slotW = 76
  const slotH = 110
  const slotY = H / 2 - 20
  const startX = W / 2 - 180

  for (let i = 0; i < 5; i++) {
    const slotX = startX + i * 90
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.fillRect(slotX - slotW / 2, slotY - slotH / 2, slotW, slotH)
    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 2
    ctx.strokeRect(slotX - slotW / 2, slotY - slotH / 2, slotW, slotH)

    ctx.fillStyle = '#666666'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(i < 3 ? `FLOP ${i + 1}` : i === 3 ? 'TURN' : 'RIVER', slotX, slotY + slotH / 2 + 16)
  }

  ctx.fillStyle = '#FFE500'
  ctx.fillRect(W / 2 - 80, H / 2 - 190, 160, 24)
  ctx.strokeStyle = '#050505'
  ctx.lineWidth = 3
  ctx.strokeRect(W / 2 - 80, H / 2 - 190, 160, 24)
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 11px monospace'
  ctx.fillText('MAIN POT ZONE', W / 2, H / 2 - 178)

  return canvas
}

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
  ctx.fillText('3D SHOWCASE CARD', W / 2, H - 62)

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

  return canvas
}

function createChipTexture(denom) {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const cx = S / 2
  const cy = S / 2
  const r = S / 2 - 6

  let baseColor = '#00F5FF'
  let stripeColor = '#FFFFFF'
  let textVal = '$100'

  if (denom === 500) {
    baseColor = '#FF70A6'
    stripeColor = '#FFE500'
    textVal = '$500'
  } else if (denom === 1000) {
    baseColor = '#FFE500'
    stripeColor = '#050505'
    textVal = '$1K'
  } else if (denom === 5000) {
    baseColor = '#0D0D0D'
    stripeColor = '#FFE500'
    textVal = '$5K'
  }

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = baseColor
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#050505'
  ctx.stroke()

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.fillStyle = stripeColor
    ctx.fillRect(r - 28, -8, 26, 16)
    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 3
    ctx.strokeRect(r - 28, -8, 26, 16)
    ctx.restore()
  }

  ctx.beginPath()
  ctx.arc(cx, cy, r - 36, 0, Math.PI * 2)
  ctx.fillStyle = '#FAF7F2'
  ctx.fill()
  ctx.lineWidth = 6
  ctx.strokeStyle = '#050505'
  ctx.stroke()

  ctx.fillStyle = '#050505'
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(textVal, cx, cy)

  return canvas
}

// ----------------------------------------------------------------------
// MAIN REACT COMPONENT: FIRST-PERSON POV POKER TABLE (BOTTOM-LEFT HUD)
// ----------------------------------------------------------------------

export default function PokerHandOrbitSection({ onOpenDuel }) {
  const containerRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const timelineRef = useRef(null)

  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const [showFinalCTA, setShowFinalCTA] = useState(false)

  // Sound feedback on street change
  const prevPhaseRef = useRef(0)
  useEffect(() => {
    if (prevPhaseRef.current !== activePhaseIndex) {
      prevPhaseRef.current = activePhaseIndex
      SoundEngine.playCardFlip()
    }
  }, [activePhaseIndex])

  const holeCardsRef = useRef([])
  const communityCardsRef = useRef([])
  const playerChipsRef = useRef([])
  const potChipsRef = useRef([])
  const cameraRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const pinWrapper = pinWrapperRef.current
    const canvas = canvasRef.current
    if (!container || !pinWrapper || !canvas) return

    // 1. Scene & Camera Setup (Panoramic POV Player Perspective)
    const scene = new THREE.Scene()
    const width = pinWrapper.clientWidth || window.innerWidth
    const height = pinWrapper.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.set(0, 3.4, 5.0)
    camera.lookAt(0, 0.15, 0.0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // ------------------------------------------------------------------
    // 2. REAL POKER TABLE GEOMETRY
    // ------------------------------------------------------------------
    const tableGroup = new THREE.Group()

    const feltTexture = new THREE.CanvasTexture(createTableFeltCanvas())
    feltTexture.colorSpace = THREE.SRGBColorSpace
    feltTexture.needsUpdate = true

    const feltGeo = new THREE.PlaneGeometry(12.5, 8.5, 1, 1)
    const feltMat = new THREE.MeshBasicMaterial({ map: feltTexture })
    const feltMesh = new THREE.Mesh(feltGeo, feltMat)
    feltMesh.rotation.x = -Math.PI / 2
    feltMesh.position.set(0, 0, 0)
    tableGroup.add(feltMesh)

    // Outer Padded Leather Rail
    const railShape = new THREE.Shape()
    railShape.absellipse(0, 0, 6.6, 4.6, 0, Math.PI * 2)
    const holePath = new THREE.Path()
    holePath.absellipse(0, 0, 6.0, 4.1, 0, Math.PI * 2)
    railShape.holes.push(holePath)

    const railGeo = new THREE.ShapeGeometry(railShape, 48)
    const railMat = new THREE.MeshBasicMaterial({ color: 0x0a0c10 })
    const railMesh = new THREE.Mesh(railGeo, railMat)
    railMesh.rotation.x = -Math.PI / 2
    railMesh.position.set(0, 0.04, 0)
    tableGroup.add(railMesh)

    // Wood Trim Outer Border
    const trimShape = new THREE.Shape()
    trimShape.absellipse(0, 0, 6.75, 4.75, 0, Math.PI * 2)
    const trimHole = new THREE.Path()
    trimHole.absellipse(0, 0, 6.6, 4.6, 0, Math.PI * 2)
    trimShape.holes.push(trimHole)

    const trimGeo = new THREE.ShapeGeometry(trimShape, 48)
    const trimMat = new THREE.MeshBasicMaterial({ color: 0xffe500 })
    const trimMesh = new THREE.Mesh(trimGeo, trimMat)
    trimMesh.rotation.x = -Math.PI / 2
    trimMesh.position.set(0, 0.035, 0)
    tableGroup.add(trimMesh)

    scene.add(tableGroup)

    // ------------------------------------------------------------------
    // 3. CARD GEOMETRIES & MESH BUILDERS
    // ------------------------------------------------------------------
    const BOARD_CARD_W = 1.15
    const BOARD_CARD_H = 1.65
    const boardCardGeo = new THREE.PlaneGeometry(BOARD_CARD_W, BOARD_CARD_H)

    const HOLE_CARD_W = 0.85
    const HOLE_CARD_H = 1.22
    const holeCardGeo = new THREE.PlaneGeometry(HOLE_CARD_W, HOLE_CARD_H)

    const backTexture = new THREE.CanvasTexture(createCardBackCanvas())
    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.needsUpdate = true

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.FrontSide
    })

    const createSolidCardMesh = (rank, suit, isHole = false) => {
      const geo = isHole ? holeCardGeo : boardCardGeo
      const faceTex = new THREE.CanvasTexture(createCardFaceCanvas(rank, suit))
      faceTex.colorSpace = THREE.SRGBColorSpace
      faceTex.needsUpdate = true

      const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, side: THREE.FrontSide })
      const group = new THREE.Group()

      const front = new THREE.Mesh(geo, faceMat)
      const back = new THREE.Mesh(geo, backMaterial)
      back.rotation.y = Math.PI

      group.add(front)
      group.add(back)
      return group
    }

    // ------------------------------------------------------------------
    // 4. PLAYER'S 2 HOLE CARDS (FOREGROUND POV: A♠ & K♠)
    // ------------------------------------------------------------------
    const holeCard1 = createSolidCardMesh('A', '♠', true)
    holeCard1.position.set(-0.35, 0.65, 3.4)
    holeCard1.rotation.set(-1.05, 0.10, 0.12)
    scene.add(holeCard1)

    const holeCard2 = createSolidCardMesh('K', '♠', true)
    holeCard2.position.set(0.35, 0.65, 3.35)
    holeCard2.rotation.set(-1.05, -0.10, -0.10)
    scene.add(holeCard2)

    const holeCards = [
      {
        group: holeCard1,
        basePos: [-0.35, 0.65, 3.4],
        baseRot: [-1.05, 0.10, 0.12],
        posX: -0.35,
        posY: 0.65,
        posZ: 3.4,
        rotX: -1.05,
        rotY: 0.10,
        rotZ: 0.12
      },
      {
        group: holeCard2,
        basePos: [0.35, 0.65, 3.35],
        baseRot: [-1.05, -0.10, -0.10],
        posX: 0.35,
        posY: 0.65,
        posZ: 3.35,
        rotX: -1.05,
        rotY: -0.10,
        rotZ: -0.10
      }
    ]
    holeCardsRef.current = holeCards

    // ------------------------------------------------------------------
    // 5. 5 COMMUNITY BOARD CARDS (DEDICATED ZONE: Z = -0.2)
    // ------------------------------------------------------------------
    const BOARD_DATA = [
      { rank: 'Q', suit: '♠', slotX: -1.8, slotZ: -0.2 },
      { rank: 'J', suit: '♠', slotX: -0.9, slotZ: -0.2 },
      { rank: '10', suit: '♦', slotX: 0.0, slotZ: -0.2 },
      { rank: '4', suit: '♥', slotX: 0.9, slotZ: -0.2 },
      { rank: '10', suit: '♠', slotX: 1.8, slotZ: -0.2 }
    ]

    const communityCards = []
    BOARD_DATA.forEach((b) => {
      const mesh = createSolidCardMesh(b.rank, b.suit, false)
      mesh.position.set(0, 1.2, -2.8)
      mesh.rotation.set(Math.PI / 2, 0, 0)
      mesh.visible = false
      scene.add(mesh)

      communityCards.push({
        group: mesh,
        slotX: b.slotX,
        slotZ: b.slotZ,
        posX: 0,
        posY: 1.2,
        posZ: -2.8,
        rotX: Math.PI / 2,
        rotY: 0,
        rotZ: 0,
        visible: false
      })
    })
    communityCardsRef.current = communityCards

    // ------------------------------------------------------------------
    // 6. 3D POKER CHIP STACKS (SEPARATED ZONES)
    // ------------------------------------------------------------------
    const chipGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 24)
    const chipTex100 = new THREE.CanvasTexture(createChipTexture(100))
    const chipTex500 = new THREE.CanvasTexture(createChipTexture(500))
    const chipTex1000 = new THREE.CanvasTexture(createChipTexture(1000))
    const chipTex5000 = new THREE.CanvasTexture(createChipTexture(5000))

    chipTex100.colorSpace = THREE.SRGBColorSpace
    chipTex500.colorSpace = THREE.SRGBColorSpace
    chipTex1000.colorSpace = THREE.SRGBColorSpace
    chipTex5000.colorSpace = THREE.SRGBColorSpace

    const chipMat100 = new THREE.MeshBasicMaterial({ map: chipTex100 })
    const chipMat500 = new THREE.MeshBasicMaterial({ map: chipTex500 })
    const chipMat1000 = new THREE.MeshBasicMaterial({ map: chipTex1000 })
    const chipMat5000 = new THREE.MeshBasicMaterial({ map: chipTex5000 })

    const playerChips = []
    for (let i = 0; i < 8; i++) {
      const mat = i < 3 ? chipMat100 : i < 6 ? chipMat500 : chipMat1000
      const mesh = new THREE.Mesh(chipGeo, mat)
      const restY = 0.04 + i * 0.085
      mesh.position.set(1.9, restY, 1.8)
      scene.add(mesh)

      playerChips.push({
        mesh,
        posX: 1.9,
        posY: restY,
        posZ: 1.8,
        rotX: 0,
        rotY: i * 0.4,
        rotZ: 0
      })
    }
    playerChipsRef.current = playerChips

    const potChips = []
    for (let i = 0; i < 14; i++) {
      const mat = i < 4 ? chipMat100 : i < 8 ? chipMat500 : i < 12 ? chipMat1000 : chipMat5000
      const mesh = new THREE.Mesh(chipGeo, mat)
      const col = i % 3
      const row = Math.floor(i / 3)
      const restX = (col - 1) * 0.75
      const restY = 0.04 + row * 0.085
      const restZ = -1.35 + (col === 1 ? 0.18 : -0.08)

      mesh.position.set(restX, restY, restZ)
      mesh.visible = i < 4
      scene.add(mesh)

      potChips.push({
        mesh,
        baseX: restX,
        baseY: restY,
        baseZ: restZ,
        posX: restX,
        posY: restY,
        posZ: restZ,
        visible: i < 4,
        streetThreshold: i < 4 ? 0 : i < 8 ? 1 : i < 11 ? 2 : 3
      })
    }
    potChipsRef.current = potChips

    const syncScene = () => {
      holeCards.forEach((hc) => {
        hc.group.position.set(hc.posX, hc.posY, hc.posZ)
        hc.group.rotation.set(hc.rotX, hc.rotY, hc.rotZ)
      })

      communityCards.forEach((cc) => {
        cc.group.visible = cc.visible
        cc.group.position.set(cc.posX, cc.posY, cc.posZ)
        cc.group.rotation.set(cc.rotX, cc.rotY, cc.rotZ)
      })

      playerChips.forEach((pc) => {
        pc.mesh.position.set(pc.posX, pc.posY, pc.posZ)
        pc.mesh.rotation.set(pc.rotX, pc.rotY, pc.rotZ)
      })

      potChips.forEach((pc) => {
        pc.mesh.visible = pc.visible
        pc.mesh.position.set(pc.posX, pc.posY, pc.posZ)
      })
    }

    // ------------------------------------------------------------------
    // 7. GSAP SCROLLTRIGGER TIMELINE
    // ------------------------------------------------------------------
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: pinWrapper,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 6.0}`,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            if (p < 0.24) {
              setActivePhaseIndex(0)
              setShowFinalCTA(false)
            } else if (p < 0.50) {
              setActivePhaseIndex(1)
              setShowFinalCTA(false)
            } else if (p < 0.76) {
              setActivePhaseIndex(2)
              setShowFinalCTA(false)
            } else if (p < 0.90) {
              setActivePhaseIndex(3)
              setShowFinalCTA(false)
            } else {
              setActivePhaseIndex(3)
              setShowFinalCTA(true)
            }
          }
        },
        onUpdate: () => {
          syncScene()
        }
      })
      timelineRef.current = tl

      // ================================================================
      // SCENE 03: THE FLOP (0.0s -> 1.8s)
      // ================================================================
      tl.to(
        camera.position,
        {
          y: 3.1,
          z: 4.7,
          duration: 1.2,
          ease: 'power2.inOut'
        },
        0.2
      )

      // Deal Flop Card 1 (Q♠)
      tl.call(() => { communityCards[0].visible = true }, null, 0.2)
      tl.fromTo(
        communityCards[0],
        { posX: 0, posY: 1.2, posZ: -2.8, rotX: Math.PI / 2, rotY: 0 },
        {
          posX: -1.8,
          posY: 1.05,
          posZ: -0.2,
          rotX: -Math.PI / 2,
          rotY: 0,
          duration: 0.40,
          ease: 'power1.out'
        },
        0.2
      ).to(
        communityCards[0],
        {
          posY: 0.02,
          duration: 0.25,
          ease: 'power2.inOut'
        },
        0.60
      )

      // Deal Flop Card 2 (J♠)
      tl.call(() => { communityCards[1].visible = true }, null, 0.4)
      tl.fromTo(
        communityCards[1],
        { posX: 0, posY: 1.2, posZ: -2.8, rotX: Math.PI / 2, rotY: 0 },
        {
          posX: -0.9,
          posY: 1.05,
          posZ: -0.2,
          rotX: -Math.PI / 2,
          rotY: 0,
          duration: 0.40,
          ease: 'power1.out'
        },
        0.4
      ).to(
        communityCards[1],
        {
          posY: 0.02,
          duration: 0.25,
          ease: 'power2.inOut'
        },
        0.80
      )

      // Deal Flop Card 3 (10♦)
      tl.call(() => { communityCards[2].visible = true }, null, 0.6)
      tl.fromTo(
        communityCards[2],
        { posX: 0, posY: 1.2, posZ: -2.8, rotX: Math.PI / 2, rotY: 0 },
        {
          posX: 0.0,
          posY: 1.05,
          posZ: -0.2,
          rotX: -Math.PI / 2,
          rotY: 0,
          duration: 0.40,
          ease: 'power1.out'
        },
        0.6
      ).to(
        communityCards[2],
        {
          posY: 0.02,
          duration: 0.25,
          ease: 'power2.inOut'
        },
        1.0
      )

      // Pot chips build
      tl.call(() => {
        potChips.forEach((pc) => {
          if (pc.streetThreshold <= 1) pc.visible = true
        })
      }, null, 1.2)

      // ================================================================
      // SCENE 04: TURN & RIVER (1.8s -> 3.6s)
      // ================================================================
      tl.call(() => { communityCards[3].visible = true }, null, 1.8)
      tl.fromTo(
        communityCards[3],
        { posX: 0, posY: 1.2, posZ: -2.8, rotX: Math.PI / 2, rotY: 0 },
        {
          posX: 0.9,
          posY: 1.05,
          posZ: -0.2,
          rotX: -Math.PI / 2,
          rotY: 0,
          duration: 0.40,
          ease: 'power1.out'
        },
        1.8
      ).to(
        communityCards[3],
        {
          posY: 0.02,
          duration: 0.25,
          ease: 'power2.inOut'
        },
        2.2
      )

      // Deal River Card (10♠)
      tl.call(() => { communityCards[4].visible = true }, null, 2.4)
      tl.fromTo(
        communityCards[4],
        { posX: 0, posY: 1.2, posZ: -2.8, rotX: Math.PI / 2, rotY: 0 },
        {
          posX: 1.8,
          posY: 1.05,
          posZ: -0.2,
          rotX: -Math.PI / 2,
          rotY: 0,
          duration: 0.40,
          ease: 'power1.out'
        },
        2.4
      ).to(
        communityCards[4],
        {
          posY: 0.02,
          duration: 0.25,
          ease: 'power2.inOut'
        },
        2.8
      )

      // ================================================================
      // SCENE 05: BETTING ACTION (3.6s -> 5.0s)
      // ================================================================
      tl.to(
        playerChips[0],
        {
          posX: 1.6,
          posZ: 0.6,
          duration: 0.65,
          ease: 'power2.inOut'
        },
        3.6
      )
      tl.to(
        playerChips[1],
        {
          posX: 1.6,
          posZ: 0.6,
          duration: 0.65,
          ease: 'power2.inOut'
        },
        3.7
      )
      tl.to(
        playerChips[2],
        {
          posX: 1.6,
          posZ: 0.6,
          duration: 0.65,
          ease: 'power2.inOut'
        },
        3.8
      )

      tl.call(() => {
        potChips.forEach((pc) => {
          if (pc.streetThreshold <= 2) pc.visible = true
        })
      }, null, 4.0)

      // ================================================================
      // SCENE 06: THE SHOWDOWN (5.0s -> 6.5s)
      // ================================================================
      tl.to(
        holeCards[0],
        {
          posX: -0.55,
          posY: 0.85,
          posZ: 1.1,
          rotX: -Math.PI / 2,
          rotY: 0,
          rotZ: 0.06,
          duration: 0.45,
          ease: 'power1.out'
        },
        5.0
      ).to(
        holeCards[0],
        {
          posY: 0.03,
          duration: 0.30,
          ease: 'power2.inOut'
        },
        5.45
      )

      tl.to(
        holeCards[1],
        {
          posX: 0.55,
          posY: 0.85,
          posZ: 1.1,
          rotX: -Math.PI / 2,
          rotY: 0,
          rotZ: -0.06,
          duration: 0.45,
          ease: 'power1.out'
        },
        5.0
      ).to(
        holeCards[1],
        {
          posY: 0.03,
          duration: 0.30,
          ease: 'power2.inOut'
        },
        5.45
      )

      tl.call(() => {
        potChips.forEach((pc) => {
          pc.visible = true
        })
      }, null, 5.4)

      potChips.forEach((pc, idx) => {
        const targetWinX = 1.7 + (idx % 3 - 1) * 0.35
        const targetWinZ = 1.1 + Math.floor(idx / 3) * 0.25

        tl.to(
          pc,
          {
            posX: targetWinX,
            posZ: targetWinZ,
            duration: 0.75,
            ease: 'bounce.out'
          },
          5.5 + (idx % 3) * 0.03
        )
      })
    }, container)

    // 8. Render Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const render = () => {
      const elapsed = clock.getElapsedTime()
      camera.position.x = Math.sin(elapsed * 0.35) * 0.04

      syncScene()
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    // 9. Resize Handler
    const handleResize = () => {
      if (!pinWrapperRef.current) return
      const w = pinWrapperRef.current.clientWidth || window.innerWidth
      const h = pinWrapperRef.current.clientHeight || window.innerHeight
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

  // Jump to specific street
  const handleJumpToPhase = useCallback((phaseIdx) => {
    SoundEngine.playCardFlip()
    if (!timelineRef.current?.scrollTrigger) {
      setActivePhaseIndex(phaseIdx)
      return
    }
    const targetProgress = phaseIdx === 0 ? 0.05 : phaseIdx === 1 ? 0.35 : phaseIdx === 2 ? 0.65 : 0.92
    const st = timelineRef.current.scrollTrigger
    const targetScroll = st.start + (st.end - st.start) * targetProgress
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }, [])

  const currentPhase = STREET_PHASES[activePhaseIndex]

  return (
    <div ref={containerRef} className="relative w-full">
      <section
        ref={pinWrapperRef}
        className="relative w-full h-screen bg-[#F6F5FA] overflow-hidden border-t-[4px] border-b-[4px] border-true-black select-none z-30 flex items-center justify-between"
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

        {/* 2. Pure Clean WebGL 3D Canvas (POV View) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

        {/* ------------------------------------------------------------- */}
        {/* 3. 3D CARD-FLIP KINETIC HERO HUD (BOTTOM-LEFT)                */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute bottom-6 sm:bottom-10 lg:bottom-12 left-6 sm:left-10 lg:left-14 z-20 pointer-events-none max-w-sm sm:max-w-md lg:max-w-lg [perspective:1200px]">
          <div
            key={currentPhase.id}
            className="animate-card-flip-3d"
          >
            {/* Tag Badge */}
            <div className="mb-2 sm:mb-3">
              <span
                className="font-pixel text-[10px] sm:text-xs font-black uppercase px-3 py-1 border-[3px] border-true-black shadow-[3px_3px_0px_#000] inline-block -rotate-1 transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: currentPhase.accentColor }}
              >
                {currentPhase.tag}
              </span>
            </div>

            {/* Giant Chunky Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-true-black tracking-tight leading-[0.94] mb-3 sm:mb-4 drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]">
              {currentPhase.headline}
            </h2>

            {/* Neo-Brutalist Description Card with Accent Line */}
            <div className="brutal-window bg-white p-4 sm:p-5 border-[4px] border-true-black shadow-[8px_8px_0px_#000] max-w-md pointer-events-auto relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                style={{ backgroundColor: currentPhase.accentColor }}
              />
              <p className="font-mono-nb text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-snug pt-1">
                {currentPhase.description}
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. FINAL CTA MODAL OVERLAY (READY TO PLAY?)                   */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 max-w-sm w-[90%] pointer-events-auto ${
            showFinalCTA
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <div className="brutal-window p-6 sm:p-8 bg-white border-[4px] border-true-black shadow-[10px_10px_0px_#000] text-center">
            <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-true-black tracking-tight leading-none mb-6">
              READY TO PLAY?
            </h3>

            <button
              onClick={() => {
                SoundEngine.playJackpot()
                if (onOpenDuel) onOpenDuel()
              }}
              className="brutal-btn w-full py-4 px-6 bg-[#00FFA3] hover:bg-[#33ffb5] text-true-black font-display text-lg sm:text-xl font-black uppercase tracking-wider border-[3px] border-black shadow-[5px_5px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>JOIN TABLE</span>
              <span className="font-mono-nb text-2xl">→</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 5. INTERACTIVE STREET SELECTOR (BOTTOM-RIGHT PILL BAR)        */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute bottom-6 right-6 sm:right-10 z-20 pointer-events-auto flex items-center gap-2 flex-wrap justify-end">
          {STREET_PHASES.map((p, idx) => {
            const isActive = activePhaseIndex === idx
            return (
              <button
                key={p.id}
                onClick={() => handleJumpToPhase(idx)}
                className={`brutal-btn px-2.5 sm:px-3.5 py-1.5 font-pixel text-[9px] sm:text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0D0D0D] text-white shadow-[3px_3px_0px_#FFE500] -translate-y-1'
                    : 'bg-white text-true-black hover:bg-gray-100 shadow-[3px_3px_0px_#000]'
                }`}
              >
                <span
                  className="w-2 h-2 inline-block rounded-full mr-1.5 border border-black"
                  style={{ backgroundColor: p.accentColor }}
                />
                {p.tag}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
