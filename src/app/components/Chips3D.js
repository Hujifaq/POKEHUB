"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SoundEngine } from './SoundEngine'

// Generate casino chip face texture (aesthetic pixel art, highly detailed)
function createChipTexture(value = '$1K', color = '#e74c3c', textColor = '#000000') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  // Double resolution (64x64) for intricate pixel details
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // Clear background
  ctx.clearRect(0, 0, 64, 64)

  const CREAM = '#fcf4e8'
  const BLACK = '#181920'
  const GOLD = '#f1c40f'

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      let dx = Math.abs(x - 31.5)
      let dy = Math.abs(y - 31.5)
      let dist = Math.sqrt(dx * dx + dy * dy)
      
      // Black border
      if (dist <= 31.5) {
        ctx.fillStyle = BLACK
        ctx.fillRect(x, y, 1, 1)
      }
      
      // Main color
      if (dist <= 29.5) {
        ctx.fillStyle = color
        ctx.fillRect(x, y, 1, 1)
      }
      
      // 8 Notches (Top, Bottom, Left, Right + Diagonals)
      if (dist > 21.5 && dist <= 29.5) {
        // Orthogonal notches
        if (dx <= 4 || dy <= 4) { 
          ctx.fillStyle = CREAM
          ctx.fillRect(x, y, 1, 1)
        }
        // Diagonal notches
        if (Math.abs(dx - dy) <= 3 && dist > 23.5) {
          ctx.fillStyle = CREAM
          ctx.fillRect(x, y, 1, 1)
        }
      }
      
      // Inner black ring
      if (dist <= 21.5 && dist > 19.5) {
        ctx.fillStyle = BLACK
        ctx.fillRect(x, y, 1, 1)
      }
      
      // Inner cream ring
      if (dist <= 19.5 && dist > 17.5) {
        ctx.fillStyle = CREAM
        ctx.fillRect(x, y, 1, 1)
      }

      // Decorative gold dotted ring
      if (dist <= 17.5 && dist > 15.5) {
        let angle = Math.atan2(y - 31.5, x - 31.5)
        let slice = Math.floor(angle * 12)
        if (slice % 2 === 0) {
          ctx.fillStyle = GOLD
          ctx.fillRect(x, y, 1, 1)
        } else {
          ctx.fillStyle = BLACK
          ctx.fillRect(x, y, 1, 1)
        }
      }
      
      // Inner color center
      if (dist <= 15.5) {
        ctx.fillStyle = color
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  // Draw Scaled Heart in Center (Cream color)
  const HEART = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0]
  ]
  
  ctx.fillStyle = CREAM
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (HEART[r][c]) {
        // scale 2x
        ctx.fillRect(25 + c * 2, 26 + r * 2, 2, 2)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.anisotropy = 1
  return texture
}

// Single tossed flying chip with physics
function FlyingChip({ id, startPos, velocity, rotationSpeed, color, value, onFinish }) {
  const meshRef = useRef()
  const pos = useRef(new THREE.Vector3(...startPos))
  const vel = useRef(new THREE.Vector3(...velocity))
  const rot = useRef(new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0))
  const life = useRef(0)

  const texture = useMemo(() => createChipTexture(value, color), [value, color])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    life.current += delta

    // Gravity
    vel.current.y -= 14.0 * delta

    // Air resistance
    vel.current.x *= 0.99
    vel.current.z *= 0.99

    // Update position
    pos.current.x += vel.current.x * delta
    pos.current.y += vel.current.y * delta
    pos.current.z += vel.current.z * delta

    // Bounce on table felt floor (y = -3.2)
    if (pos.current.y < -3.1) {
      pos.current.y = -3.1
      vel.current.y = -vel.current.y * 0.55 // Restitution bounce
      vel.current.x *= 0.7
      vel.current.z *= 0.7

      if (Math.abs(vel.current.y) > 0.8) {
        SoundEngine.playChipClink()
      }
    }

    // Spin
    rot.current.x += rotationSpeed.x * delta
    rot.current.y += rotationSpeed.y * delta
    rot.current.z += rotationSpeed.z * delta

    meshRef.current.position.copy(pos.current)
    meshRef.current.rotation.set(rot.current.x, rot.current.y, rot.current.z)

    // Remove after 6 seconds
    if (life.current > 6.0 && onFinish) {
      onFinish(id)
    }
  })

  // Circular geometry for pixel look but smooth shape
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32), [])
  const materials = useMemo(() => {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.8,
      flatShading: true
    })
    const capMat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.1,
      roughness: 0.8,
      flatShading: true
    })
    return [edgeMat, capMat, capMat]
  }, [color, texture])

  return (
    <mesh
      ref={meshRef}
      geometry={cylinderGeo}
      material={materials}
      castShadow
      receiveShadow
    />
  )
}

export default function Chips3D({ tossSignal = 0, isReady = true }) {
  const [flyingChips, setFlyingChips] = useState([])
  
  // Aesthetic pixel colors based on reference
  const chipTypes = useMemo(() => [
    { value: '$100', color: '#000000ff' }, // Purple
    { value: '$500', color: '#3498db' }, // Blue
    { value: '$1K', color: '#cc2e63ff' },  // Green
    { value: '$5K', color: '#f1c40f' },  // Yellow
    { value: '$25K', color: '#e74c3c' }  // Red
  ], [])

  // Static stack chips
  const greenTexture = useMemo(() => createChipTexture('$1K', '#cc2e63ff'), [])
  const purpleTexture = useMemo(() => createChipTexture('$100', '#9b59b6'), [])
  const redTexture = useMemo(() => createChipTexture('$25K', '#e74c3c'), [])
  const dealerTexture = useMemo(() => createChipTexture('DLR', '#ffffff', '#000000'), [])

  // Toss chip when signal changes
  useEffect(() => {
    if (tossSignal > 0) {
      const randomType = chipTypes[Math.floor(Math.random() * chipTypes.length)]
      const newChip = {
        id: Date.now() + Math.random(),
        startPos: [(Math.random() - 0.5) * 3, 2.5 + Math.random() * 1.5, 1 + Math.random() * 2],
        velocity: [(Math.random() - 0.5) * 4, 1.5 + Math.random() * 3, -(2 + Math.random() * 3)],
        rotationSpeed: {
          x: (Math.random() - 0.5) * 12,
          y: (Math.random() - 0.5) * 12,
          z: (Math.random() - 0.5) * 12
        },
        color: randomType.color,
        value: randomType.value
      }

      setFlyingChips(prev => [...prev.slice(-12), newChip]) // keep maximum 12 concurrent flying chips
      SoundEngine.playChipClink()
    }
  }, [tossSignal, chipTypes])

  const handleChipFinish = (id) => {
    setFlyingChips(prev => prev.filter(c => c.id !== id))
  }

  // Circular stack geometry (matching pixel aesthetic)
  const stackCylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32), [])

  return (
    <group position={[0, 0, 0]}>
      {/* Decorative Stack on Bottom Right */}
      <group position={[4.2, -2.8, -0.5]} rotation={[0.1, -0.4, 0]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const mat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? '#cc2e63ff' : '#181920',
            map: i === 6 ? greenTexture : null,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
          })
          return (
            <mesh
              key={i}
              geometry={stackCylinderGeo}
              material={mat}
              position={[0, i * 0.11, 0]}
              rotation={[0, i * 0.35, 0]}
              castShadow
              receiveShadow
            />
          )
        })}
      </group>

      {/* Decorative Stack on Bottom Left */}
      <group position={[-4.2, -2.8, -0.5]} rotation={[0.1, 0.4, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const mat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? '#9b59b6' : '#e74c3c',
            map: i === 4 ? purpleTexture : null,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
          })
          return (
            <mesh
              key={i}
              geometry={stackCylinderGeo}
              material={mat}
              position={[0, i * 0.11, 0]}
              rotation={[0, i * 0.4, 0]}
              castShadow
              receiveShadow
            />
          )
        })}
      </group>

      {/* Dealer Button */}
      <group position={[-3.0, -3.0, 1.2]} rotation={[0.05, 0.2, 0]}>
        <mesh
          geometry={new THREE.CylinderGeometry(0.7, 0.7, 0.12, 32)}
          material={new THREE.MeshStandardMaterial({
            color: '#ffffff',
            map: dealerTexture,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
          })}
          castShadow
          receiveShadow
        />
      </group>

      {/* Active Flying Chips with physics */}
      {flyingChips.map((chip) => (
        <FlyingChip
          key={chip.id}
          id={chip.id}
          startPos={chip.startPos}
          velocity={chip.velocity}
          rotationSpeed={chip.rotationSpeed}
          color={chip.color}
          value={chip.value}
          onFinish={handleChipFinish}
        />
      ))}
    </group>
  )
}
