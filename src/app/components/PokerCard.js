import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PokerCard({ isReady, ...props }) {
  const innerGroup = useRef()
  const { nodes, materials } = useGLTF('/models/ace_of_hearts_-_rider_back.glb')

  const velocity = useRef({ x: 0, y: 0 })
  const position = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (!innerGroup.current) return

    if (!isReady) {
      // Elegant idle spin during preloader
      innerGroup.current.rotation.y += delta * 0.8
      innerGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15
      return
    }

    // Convert normalized pointer to world coordinates
    const targetX = state.pointer.x * 6; // Range of movement X
    const targetY = state.pointer.y * 3.5; // Range of movement Y

    // Spring physics parameters - lowered tension for more "weight/lag"
    const tension = 0.025;
    const friction = 0.88;

    // Calculate spring
    const dx = targetX - position.current.x;
    const dy = targetY - position.current.y;

    velocity.current.x += dx * tension;
    velocity.current.y += dy * tension;

    velocity.current.x *= friction;
    velocity.current.y *= friction;

    position.current.x += velocity.current.x;
    position.current.y += velocity.current.y;

    // Apply position
    innerGroup.current.position.x = position.current.x;
    innerGroup.current.position.y = position.current.y;

    // Calculate swing rotation based on velocity (adds gravity/swing effect)
    // Increased multipliers for a much more dramatic swing when moving fast
    const swingRotX = -velocity.current.y * 5.0;
    const swingRotY = velocity.current.x * 5.0;
    const swingRotZ = velocity.current.x * -1.5;

    // Base rotation tracking mouse
    const baseRotX = -(state.pointer.y * Math.PI) / 8;
    const baseRotY = (state.pointer.x * Math.PI) / 8;

    // Smoothly apply rotation
    innerGroup.current.rotation.x = THREE.MathUtils.lerp(
      innerGroup.current.rotation.x,
      baseRotX + swingRotX,
      0.15
    );
    innerGroup.current.rotation.y = THREE.MathUtils.lerp(
      innerGroup.current.rotation.y,
      baseRotY + swingRotY,
      0.15
    );
    innerGroup.current.rotation.z = THREE.MathUtils.lerp(
      innerGroup.current.rotation.z,
      swingRotZ,
      0.15
    );
  })

  return (
    <group {...props} dispose={null}>
      <group ref={innerGroup}>
        {/* We adjust scale and rotation here to center the card properly based on its geometry */}
        <group rotation={[-Math.PI / 2, 0, 0]} scale={-0.01}>
          <mesh geometry={nodes.Object_2.geometry} material={materials.Regular_0} />
          <mesh geometry={nodes.Object_3.geometry} material={materials.Regular_1} />
          <mesh geometry={nodes.Object_4.geometry} material={materials.Regular_1} />
          <mesh geometry={nodes.Object_5.geometry} material={materials.Regular_1} />
          <mesh geometry={nodes.Object_6.geometry} material={materials.Regular_1} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/ace_of_hearts_-_rider_back.glb')
