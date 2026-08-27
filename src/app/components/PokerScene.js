"use client"

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
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

export default function PokerScene({
  isReady = true,
  isFlipped = false,
  isHolo = true,
  isFanMode = false,
  deckSkin = 'classic',
  activeSuit = 'hearts',
  theme = 'macau',
  tossSignal = 0,
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
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.8], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={themeConfig.ambientIntensity} />
      <directionalLight position={[10, 12, 6]} intensity={1.8} color="#ffffff" castShadow />
      <directionalLight position={[-10, -5, -4]} intensity={0.8} color={themeConfig.rimLight} />
      <MouseSpotlight color={themeConfig.spotlight} intensity={2.8} />

      {/* Floating Golden Particles */}
      <GoldenParticles count={140} color={themeConfig.particleColor} />

      {/* 3D Casino Chips and Dealer Button */}
      <Chips3D tossSignal={tossSignal} isReady={isReady} />

      {/* 3D Cards */}
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

      {/* Contact Shadows on Table Felt */}
      <ContactShadows
        position={[0, -3.2, 0]}
        opacity={0.65}
        scale={22}
        blur={2.4}
        far={10}
        color={themeConfig.shadowColor}
      />
    </Canvas>
  )
}
