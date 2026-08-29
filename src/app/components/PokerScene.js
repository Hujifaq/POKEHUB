"use client"

import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ProceduralCard from './ProceduralCard'
import Chips3D from './Chips3D'
import GoldenParticles from './GoldenParticles'

// Dynamic mouse spotlight
function MouseSpotlight({ color = '#fff5d6', intensity = 2.5 }) {
  const lightRef = useRef()

  useFrame((state) => {
    if (!lightRef.current) return
    const x = state.pointer.x * 7
    const y = state.pointer.y * 5
    lightRef.current.position.set(x, y + 4, 6)
  })

  return (
    <spotLight
      ref={lightRef}
      position={[0, 4, 6]}
      intensity={intensity}
      angle={0.7}
      penumbra={0.8}
      color={color}
      castShadow
      shadow-bias={-0.0001}
    />
  )
}

// Royal Flush Card definitions for Fan-out mode
const ROYAL_FLUSH_CARDS = [
  { rank: '10', suit: 'hearts' },
  { rank: 'J', suit: 'hearts' },
  { rank: 'Q', suit: 'hearts' },
  { rank: 'K', suit: 'hearts' },
  { rank: 'A', suit: 'hearts' }
]

// Animated card container: bouncy scale-down to 0 on scroll, spring back to 1 ONLY at top of page
function ScalableCardGroup({
  isScrolled = false,
  isFanMode = false,
  activeSuit = 'hearts',
  deckSkin = 'classic',
  isFlipped = false,
  isHolo = true,
  isReady = true,
  onTelemetry
}) {
  const groupRef = useRef()
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!groupRef.current) return

    if (!hasMounted.current) {
      hasMounted.current = true
      if (isScrolled) {
        groupRef.current.scale.set(0, 0, 0)
        groupRef.current.visible = false
      } else {
        groupRef.current.scale.set(1, 1, 1)
        groupRef.current.visible = true
      }
      return
    }

    if (isScrolled) {
      // Smooth scale down when scrolling away from top
      gsap.to(groupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        overwrite: 'auto',
        onComplete: () => {
          if (groupRef.current) groupRef.current.visible = false
        }
      })
    } else {
      // Spring scale back up ONLY when at top of website
      if (groupRef.current) {
        groupRef.current.visible = true
      }
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.75,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      })
    }
  }, [isScrolled])


  return (
    <group ref={groupRef}>
      {isFanMode ? (
        // 5-Card Royal Flush Fan
        <group position={[0, 0, 0]}>
          {ROYAL_FLUSH_CARDS.map((card, idx) => (
            <ProceduralCard
              key={card.rank}
              rank={card.rank}
              suit={activeSuit}
              skin={deckSkin}
              isFlipped={isFlipped}
              isHolo={isHolo}
              isReady={isReady}
              fanIndex={idx}
              fanTotal={ROYAL_FLUSH_CARDS.length}
              onTelemetry={idx === 4 ? onTelemetry : undefined}
            />
          ))}
        </group>
      ) : (
        // Single Main Showcase Card (Ace)
        <ProceduralCard
          rank="A"
          suit={activeSuit}
          skin={deckSkin}
          isFlipped={isFlipped}
          isHolo={isHolo}
          isReady={isReady}
          fanIndex={0}
          fanTotal={1}
          onTelemetry={onTelemetry}
        />
      )}
    </group>
  )
}

export default function PokerScene({
  isReady = true,
  isFlipped = false,
  isHolo = true,
  isFanMode = false,
  deckSkin = 'classic',
  activeSuit = 'hearts',
  theme = 'macau',
  tossSignal = 0,
  isScrolled = false,
  onTelemetry
}) {
  // Theme color settings
  const themeConfig = {
    macau: {
      spotlight: '#fff2cf',
      rimLight: '#d4af37',
      ambientIntensity: 0.7,
      particleColor: '#d4af37',
      shadowColor: '#1a1105'
    },
    vegas: {
      spotlight: '#ffdddd',
      rimLight: '#ff4d6d',
      ambientIntensity: 0.6,
      particleColor: '#ff6b81',
      shadowColor: '#120508'
    },
    cyber: {
      spotlight: '#80f0ff',
      rimLight: '#ff007f',
      ambientIntensity: 0.5,
      particleColor: '#00f0ff',
      shadowColor: '#030511'
    },
    emerald: {
      spotlight: '#e0ffe8',
      rimLight: '#2ecc71',
      ambientIntensity: 0.65,
      particleColor: '#f1c40f',
      shadowColor: '#03140a'
    }
  }[theme] || {
    spotlight: '#fff2cf',
    rimLight: '#d4af37',
    ambientIntensity: 0.7,
    particleColor: '#d4af37',
    shadowColor: '#1a1105'
  }

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.8], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={1.8} />
      <directionalLight position={[10, 12, 6]} intensity={3.0} color="#ffffff" castShadow />
      <directionalLight position={[-10, -5, -4]} intensity={2.0} color={themeConfig.rimLight} />
      <MouseSpotlight color={themeConfig.spotlight} intensity={4.5} />

      {/* Floating Golden Particles */}
      <GoldenParticles count={140} color={themeConfig.particleColor} />

      {/* 3D Casino Chips and Dealer Button */}
      <Chips3D tossSignal={tossSignal} isReady={isReady} />

      {/* 3D Cards with Bouncy Spring Scale Down/Up */}
      <ScalableCardGroup
        isScrolled={isScrolled}
        isFanMode={isFanMode}
        activeSuit={activeSuit}
        deckSkin={deckSkin}
        isFlipped={isFlipped}
        isHolo={isHolo}
        isReady={isReady}
        onTelemetry={onTelemetry}
      />
    </Canvas>
  )
}

