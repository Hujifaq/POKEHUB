"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SoundEngine } from './SoundEngine'

// Generate casino chip face texture
function createChipTexture(value = '$1,000', color = '#d4af37', textColor = '#14161c') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Outer base circle
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(256, 256, 250, 0, Math.PI * 2)
  ctx.fill()

  // Edge stripe notches
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 8; i++) {
    ctx.save()
    ctx.translate(256, 256)
    ctx.rotate((i * Math.PI) / 4)
    ctx.fillRect(-20, -250, 40, 45)
    ctx.restore()
  }

  // Inner ring
  ctx.fillStyle = '#181920'
  ctx.beginPath()
  ctx.arc(256, 256, 175, 0, Math.PI * 2)
  ctx.fill()

  // Gold accent border
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(256, 256, 175, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(256, 256, 150, 0, Math.PI * 2)
  ctx.stroke()

  // Text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px "Geist", Arial'
  ctx.textAlign = 'center'
  ctx.fillText('POKEHUB', 256, 170)

  ctx.fillStyle = '#f5d77f'
  ctx.font = '900 68px "Geist", Arial'
  ctx.fillText(value, 256, 275)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = 'bold 22px "Geist", Arial'
  ctx.fillText('HIGH ROLLER', 256, 335)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
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

  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32), [])
  const materials = useMemo(() => {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.4,
      roughness: 0.3
    })
    const capMat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.3,
      roughness: 0.25
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
  const chipTypes = useMemo(() => [
    { value: '$100', color: '#1a1c23' },
    { value: '$500', color: '#8e44ad' },
    { value: '$1,000', color: '#d4af37' },
    { value: '$5,000', color: '#27ae60' },
    { value: '$25,000', color: '#c0392b' }
  ], [])

  // Static stack chips
  const goldTexture = useMemo(() => createChipTexture('$1,000', '#d4af37'), [])
  const purpleTexture = useMemo(() => createChipTexture('$500', '#8e44ad'), [])
  const redTexture = useMemo(() => createChipTexture('$25k', '#c0392b'), [])
  const dealerTexture = useMemo(() => createChipTexture('DEALER', '#f39c12'), [])

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

  const stackCylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32), [])

  return (
    <group position={[0, 0, 0]}>
      {/* Decorative Stack on Bottom Right */}
      <group position={[4.2, -2.8, -0.5]} rotation={[0.1, -0.4, 0]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const mat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? '#d4af37' : '#1a1c23',
            map: i === 6 ? goldTexture : null,
            metalness: 0.5,
            roughness: 0.3
          })
          return (
            <mesh
              key={i}
              geometry={stackCylinderGeo}
              material={mat}
              position={[0, i * 0.09, 0]}
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
            color: i % 2 === 0 ? '#8e44ad' : '#c0392b',
            map: i === 4 ? purpleTexture : null,
            metalness: 0.45,
            roughness: 0.3
          })
          return (
            <mesh
              key={i}
              geometry={stackCylinderGeo}
              material={mat}
              position={[0, i * 0.09, 0]}
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
            color: '#f5f5f5',
            map: dealerTexture,
            metalness: 0.6,
            roughness: 0.2
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
