"use client"

import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import PokerCard from './PokerCard'

export default function Scene({ isReady }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Environment preset="city" />
      
      <PokerCard position={[0, 0, 0]} isReady={isReady} />
      
      <ContactShadows 
        position={[0, -3, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={10} 
      />
    </Canvas>
  )
}
