"use client"

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GoldenParticles({ count = 120, color = "#d4af37" }) {
  const pointsRef = useRef()

  const [positions, scales, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sca = new Float32Array(count)
    const spd = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8

      sca[i] = Math.random() * 0.08 + 0.03

      spd[i * 3] = (Math.random() - 0.5) * 0.005
      spd[i * 3 + 1] = Math.random() * 0.008 + 0.002
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.005
    }

    return [pos, sca, spd]
  }, [count])

  // Create circular soft particle texture
  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 220, 120, 0.9)')
    gradient.addColorStop(0.6, 'rgba(212, 175, 55, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const idx = i * 3

      // Gentle floating motion
      pos[idx] += speeds[idx] + Math.sin(time + i) * 0.002
      pos[idx + 1] += speeds[idx + 1]
      pos[idx + 2] += speeds[idx + 2] + Math.cos(time + i) * 0.002

      // Reset when floating out of view
      if (pos[idx + 1] > 5) {
        pos[idx + 1] = -5
        pos[idx] = (Math.random() - 0.5) * 14
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color={color}
        map={particleTexture}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
