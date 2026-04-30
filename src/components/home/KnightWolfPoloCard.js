'use client'

import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, AdaptiveDpr, AdaptiveEvents, Decal, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './KnightWolfPoloCard.module.css'

// --- 1. THE SHIRT MODEL (OFFICIAL MOCKUP) ---
function ShirtModel({ shirtColor, scale = 3.5 }) {
  const { nodes, materials } = useGLTF('/models/shirt_baked.glb');
  const groupRef = useRef();
  

  // Animation: "Smooth Interaction"
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Breathing effect - optimized scale setting
      const breathing = 1 + Math.sin(time * 1.5) * 0.006;
      groupRef.current.scale.setScalar(scale * breathing);
    }
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, 0, 0]}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        dispose={null}
      >
        <meshPhysicalMaterial 
          color={shirtColor || "#708090"}
          roughness={1.0}
          metalness={0.0}
          sheen={1.0}
          sheenRoughness={1.0}
          sheenColor={0xffffff}
          map={materials.lambert1?.map}
          normalMap={materials.lambert1?.normalMap}
        />
      </mesh>
    </group>
  )
}

export default function KnightWolfPoloCard({ 
  shirtColor = "#5D8AA8", 
  collarColor = "#E5E4E2", 
  buttonColor = "#FFFFFF" 
}) {
  return (
    <div className={styles.card}>
      <div className={styles.viewArea}>
        <Canvas 
          camera={{ position: [0, 0, 6.2], fov: 35 }} 
          shadows 
          gl={{ 
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
            stencil: false,
            depth: true
          }}
          dpr={[1, 2]} 
        >
          <Suspense fallback={null}>
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <ShirtModel 
              shirtColor="#708090" 
              scale={4} 
            />

            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              minPolarAngle={Math.PI / 2} 
              maxPolarAngle={Math.PI / 2} 
              autoRotate={false}
              autoRotateSpeed={4}
              rotateSpeed={2}
              makeDefault
            />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.info}>
        <div className={styles.headerWrapper}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>EXCLUSIVE</span>
            <h2 className={styles.title}>LUNAR POLO</h2>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>₹7,499</p>
          </div>
        </div>
        <p className={styles.collection}>Polo Collection 2026</p>
        <button 
          className={styles.buyBtn}
          onClick={() => window.location.href = '/customize/configurator.html'}
        >
          CUSTOMIZE
        </button>
      </div>
    </div>
  )
}

useGLTF.preload('/models/shirt_baked.glb')
