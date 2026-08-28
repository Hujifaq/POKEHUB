"use client"

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 1. Faceted 3D Gold & Crystal Floating Gem Orbs (Instanced 3D Geometries with PBR lighting)
function FacetedGemOrbs({ count = 45, color = '#d4af37' }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Initialize random particle data
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6 - 0.5
      ),
      rot: new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.5
      ),
      scale: Math.random() * 0.12 + 0.06,
      speedY: Math.random() * 0.25 + 0.15,
      wobbleSpeed: Math.random() * 1.5 + 0.5,
      wobbleAmp: Math.random() * 0.006 + 0.002,
      phase: Math.random() * Math.PI * 2
    }))
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const pointer = state.pointer

    particles.forEach((p, i) => {
      // Upward floating motion with gentle harmonic bobbing
      p.pos.y += p.speedY * delta
      p.pos.x += Math.sin(time * p.wobbleSpeed + p.phase) * p.wobbleAmp
      p.pos.z += Math.cos(time * p.wobbleSpeed + p.phase) * p.wobbleAmp

      // Subtle mouse parallax influence
      const mouseDist = Math.hypot(p.pos.x - pointer.x * 5, p.pos.y - pointer.y * 3)
      if (mouseDist < 2.5) {
        const angle = Math.atan2(p.pos.y - pointer.y * 3, p.pos.x - pointer.x * 5)
        p.pos.x += Math.cos(angle) * delta * 0.8
        p.pos.y += Math.sin(angle) * delta * 0.8
      }

      // Reset when floating above view
      if (p.pos.y > 5.5) {
        p.pos.y = -5.5
        p.pos.x = (Math.random() - 0.5) * 14
        p.pos.z = (Math.random() - 0.5) * 6 - 0.5
      }

      // 3D tumble rotation to catch light on facets
      p.rot.x += p.rotSpeed.x * delta
      p.rot.y += p.rotSpeed.y * delta
      p.rot.z += p.rotSpeed.z * delta

      // Update instanced matrix
      dummy.position.copy(p.pos)
      dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()

      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Geometry: Faceted Octahedron / Icosahedron (luxury gem facets)
  const gemGeo = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])
  const gemMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.95,
    roughness: 0.15,
    flatShading: true,
    envMapIntensity: 3.0
  }), [color])

  return (
    <instancedMesh
      ref={meshRef}
      args={[gemGeo, gemMat, count]}
      castShadow
    />
  )
}

// 2. Crisp 4-Point Diamond Sparkles & Casino Star Glints
function StarGlints({ count = 50, color = '#fff5d6' }) {
  const pointsRef = useRef()

  const [positions, scales, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sca = new Float32Array(count)
    const spd = new Float32Array(count * 3)
    const pha = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7

      sca[i] = Math.random() * 0.18 + 0.1
      pha[i] = Math.random() * Math.PI * 2

      spd[i * 3] = (Math.random() - 0.5) * 0.004
      spd[i * 3 + 1] = Math.random() * 0.008 + 0.003
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.004
    }

    return [pos, sca, spd, pha]
  }, [count])

  // Precision 4-Point Diamond Star Glint Texture (needle-sharp luxury specular glint)
  const starTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 128, 128)

    const cx = 64
    const cy = 64

    // Central bright core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
    coreGrad.addColorStop(0, '#ffffff')
    coreGrad.addColorStop(0.4, 'rgba(255, 240, 180, 0.95)')
    coreGrad.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = coreGrad
    ctx.beginPath()
    ctx.arc(cx, cy, 12, 0, Math.PI * 2)
    ctx.fill()

    // 4-point Diamond Needles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    
    // Vertical beam
    ctx.beginPath()
    ctx.moveTo(cx, 4)
    ctx.bezierCurveTo(cx - 3, cy - 10, cx - 10, cy - 3, 4, cy)
    ctx.bezierCurveTo(cx - 10, cy + 3, cx - 3, cy + 10, cx, 124)
    ctx.bezierCurveTo(cx + 3, cy + 10, cx + 10, cy + 3, 124, cy)
    ctx.bezierCurveTo(cx + 10, cy - 3, cx + 3, cy - 10, cx, 4)
    ctx.closePath()
    ctx.fill()

    // 45-degree micro diagonal glints
    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'rgba(255, 240, 180, 0.5)'
    ctx.beginPath()
    ctx.moveTo(cx - 24, cy - 24)
    ctx.lineTo(cx + 24, cy + 24)
    ctx.moveTo(cx + 24, cy - 24)
    ctx.lineTo(cx - 24, cy + 24)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      pos[idx] += speeds[idx] + Math.sin(time * 0.8 + phases[i]) * 0.002
      pos[idx + 1] += speeds[idx + 1]
      pos[idx + 2] += speeds[idx + 2]

      if (pos[idx + 1] > 5.5) {
        pos[idx + 1] = -5.5
        pos[idx] = (Math.random() - 0.5) * 15
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
        size={0.35}
        color={color}
        map={starTexture}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function GoldenParticles({ count = 120, color = "#d4af37" }) {
  return (
    <group>
      {/* 3D Faceted Real Gold / Crystal Gem Orbs */}
      <FacetedGemOrbs count={Math.min(45, Math.floor(count * 0.4))} color={color} />

      {/* Needle-Sharp Luxury 4-Point Star Glints */}
      <StarGlints count={Math.min(55, Math.floor(count * 0.5))} color="#fff8e7" />
    </group>
  )
}
