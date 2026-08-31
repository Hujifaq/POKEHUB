"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { SoundEngine } from './SoundEngine'

/**
 * Real WebGL Three.js 3D Floating Logo Component
 * Renders the authentic POKERHUB logo as a true 3D floating mesh
 * with physical depth, studio reflections, ambient levitation, and mouse parallax.
 */
export default function Floating3DLogo({
  src = '/PKH_Logo.jpg',
  alt = 'POKERHUB 3D Logo',
  onClick,
  className = ''
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const isHoveredRef = useRef(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const meshGroupRef = useRef(null)

  const handlePointerMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    mouseRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) }
  }, [])

  const handlePointerEnter = useCallback(() => {
    isHoveredRef.current = true
  }, [])

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false
    mouseRef.current = { x: 0, y: 0 }
  }, [])

  const handleClick = useCallback(() => {
    SoundEngine.playHeroCardRotate({
      velocity: 1.6,
      direction: 1,
      intensity: 1.1,
      mode: 'rotate'
    })
    if (meshGroupRef.current) {
      gsap.to(meshGroupRef.current.rotation, {
        y: '+=6.283', // Full 360 spin
        duration: 0.85,
        ease: 'power3.out'
      })
    }
    if (onClick) onClick()
  }, [onClick])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current

    let width = container.clientWidth || 210
    let height = container.clientHeight || 60

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100)
    camera.position.set(0, 0, 3.1)

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8)
    dirLight.position.set(4, 5, 6)
    scene.add(dirLight)

    const rimLight = new THREE.PointLight(0xffe500, 2.0, 10)
    rimLight.position.set(-3, -2, 4)
    scene.add(rimLight)

    const cursorLight = new THREE.PointLight(0x00f5ff, 1.5, 8)
    cursorLight.position.set(0, 0, 3)
    scene.add(cursorLight)

    // 4. 3D Logo Mesh Creation
    const logoGroup = new THREE.Group()
    scene.add(logoGroup)
    meshGroupRef.current = logoGroup

    let texture = null
    let material = null
    let backMaterial = null
    let edgeMaterial = null
    let frontMesh = null
    let backMesh = null
    let rimMesh = null

    // Load and process image to make white background transparent
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      const offCanvas = document.createElement('canvas')
      const W = img.naturalWidth || 512
      const H = img.naturalHeight || 256
      offCanvas.width = W
      offCanvas.height = H
      const ctx = offCanvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, W, H)
      const d = imgData.data

      // Clean high-precision background removal (strictly keeps only logo artwork)
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        if (brightness > 190 || (r > 180 && g > 180 && b > 180)) {
          d[i + 3] = 0 // Completely transparent
        } else if (brightness > 165) {
          const factor = (brightness - 165) / 25
          d[i + 3] = Math.max(0, Math.floor(255 * (1 - factor)))
        }
      }
      ctx.putImageData(imgData, 0, 0)

      // Front & Back Vivid Texture
      texture = new THREE.CanvasTexture(offCanvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.magFilter = THREE.LinearFilter
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.generateMipmaps = true
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 4
      texture.needsUpdate = true

      // Dark Extrusion Depth Texture for 3D body thickness
      const edgeCanvas = document.createElement('canvas')
      edgeCanvas.width = W
      edgeCanvas.height = H
      const edgeCtx = edgeCanvas.getContext('2d')
      if (edgeCtx) {
        edgeCtx.drawImage(offCanvas, 0, 0)
        edgeCtx.globalCompositeOperation = 'source-in'
        edgeCtx.fillStyle = '#050505'
        edgeCtx.fillRect(0, 0, W, H)
      }
      const edgeTexture = new THREE.CanvasTexture(edgeCanvas)
      edgeTexture.colorSpace = THREE.SRGBColorSpace
      edgeTexture.magFilter = THREE.LinearFilter
      edgeTexture.minFilter = THREE.LinearMipmapLinearFilter
      edgeTexture.generateMipmaps = true
      edgeTexture.needsUpdate = true

      // Aspect ratio of the logo
      const aspect = W / H
      const planeW = 3.2
      const planeH = planeW / aspect
      const geometry = new THREE.PlaneGeometry(planeW, planeH, 8, 8)

      // Vibrant Front Material (100% True-to-Original Pink & Cyber Yellow Vibrance)
      material = new THREE.MeshStandardMaterial({
        map: texture,
        emissiveMap: texture,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.55,
        transparent: true,
        alphaTest: 0.25,
        metalness: 0.05,
        roughness: 0.35,
        side: THREE.FrontSide
      })

      // Back Material (Matching Vibrance)
      backMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        emissiveMap: texture,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.55,
        transparent: true,
        alphaTest: 0.25,
        metalness: 0.05,
        roughness: 0.35,
        side: THREE.FrontSide
      })

      // Extrusion Core Material (3D letter depth with dark metallic edge)
      const coreMaterial = new THREE.MeshStandardMaterial({
        map: edgeTexture,
        transparent: true,
        alphaTest: 0.25,
        color: 0x050505,
        metalness: 0.9,
        roughness: 0.2
      })

      // Multi-layer 3D Volumetric Extrusion: Spawns dense 3D slices along Z
      const numSlices = 7
      const totalDepth = 0.09
      for (let s = 0; s < numSlices; s++) {
        const zOffset = -totalDepth / 2 + (s / (numSlices - 1)) * totalDepth
        let layerMat = coreMaterial
        if (s === numSlices - 1) {
          layerMat = material
        } else if (s === 0) {
          layerMat = backMaterial
        }

        const sliceMesh = new THREE.Mesh(geometry, layerMat)
        sliceMesh.position.z = zOffset
        if (s === 0) {
          sliceMesh.rotation.y = Math.PI
        }
        logoGroup.add(sliceMesh)
      }
    }

    // 5. Animation Loop with Real 3D Levitation & Cursor Parallax
    let rafId = 0
    let clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()

      // Smooth cursor parallax easing
      const targetRotX = -mouseRef.current.y * 0.45
      const targetRotY = mouseRef.current.x * 0.55
      const hoverScale = isHoveredRef.current ? 1.08 : 1.0

      // Ambient 3D Floating Physics
      const floatY = Math.sin(time * 2.2) * 0.05
      const floatRotZ = Math.sin(time * 1.8) * 0.04
      const floatRotY = Math.cos(time * 1.4) * 0.08

      logoGroup.position.y += (floatY - logoGroup.position.y) * 0.1
      logoGroup.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.12)

      // Blend ambient rotation + mouse tilt
      logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * 0.1
      logoGroup.rotation.y += (targetRotY + floatRotY - logoGroup.rotation.y) * 0.1
      logoGroup.rotation.z += (floatRotZ - logoGroup.rotation.z) * 0.1

      cursorLight.position.x = mouseRef.current.x * 3
      cursorLight.position.y = mouseRef.current.y * 2

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return
      width = containerRef.current.clientWidth || 150
      height = containerRef.current.clientHeight || 52
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      if (texture) texture.dispose()
      if (material) material.dispose()
      if (backMaterial) backMaterial.dispose()
      renderer.dispose()
    }
  }, [src])

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none pointer-events-auto w-[115px] xs:w-[140px] sm:w-[185px] md:w-[225px] h-10 sm:h-12 md:h-16 overflow-visible bg-transparent ${className}`}
      title="POKERHUB 3D"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none bg-transparent"
      />
    </div>
  )
}

