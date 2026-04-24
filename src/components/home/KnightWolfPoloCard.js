'use client'

import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './KnightWolfPoloCard.module.css'

// --- 1. THE POLO MODEL (PROCEDURAL ENHANCEMENT) ---
function PoloModel({ shirtColor, collarColor = "#E5E4E2", buttonColor = "#ffffff", scale = 3.5 }) {
  const { nodes } = useGLTF('/models/tshirt.glb');
  const groupRef = useRef();
  
  // Extract specific meshes from the GLB
  const meshes = useMemo(() => Object.values(nodes).filter(n => n.isMesh), [nodes]);
  const fabricMesh = useMemo(() => 
    meshes.find(n => n.name.toLowerCase().includes('fabric') || n.name.toLowerCase().includes('shirt')) || meshes[0]
  , [meshes]);

  // Animation: "Oversized Round-Neck Look"
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const targetRotation = Math.sin(time * 0.5) * 0.15 + state.mouse.x * 0.4;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
      // Breathing effect
      const breathing = 1 + Math.sin(time * 1.5) * 0.008;
      groupRef.current.scale.set(
        scale * breathing,
        scale * (1 + Math.cos(time * 1.5) * 0.004),
        scale * breathing
      );
    }
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, -0.8, 0]}>
      {/* 1. THE BASE SHIRT (Re-rendering geometry to ensure clean material application) */}
      {fabricMesh && (
        <mesh geometry={fabricMesh.geometry}>
          <meshStandardMaterial 
            color={shirtColor}
            roughness={0.8} 
            metalness={0.05} 
            envMapIntensity={0.8} 
          />
        </mesh>
      )}

      {/* 2. THE POLO COLLAR (Procedural) */}
      <group position={[0, 0.48, 0.02]} rotation={[-0.1, 0, 0]}>
        {/* Collar "Neck Wrap" */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.095, 0.105, 0.06, 32, 1, true, 0, Math.PI * 2]} />
          <meshStandardMaterial color={collarColor} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
        
        {/* The Fold-Down Parts (Wings) */}
        <mesh position={[0.06, -0.04, 0.08]} rotation={[0.4, -0.5, -0.3]}>
          <boxGeometry args={[0.08, 0.01, 0.12]} />
          <meshStandardMaterial color={collarColor} roughness={0.7} />
        </mesh>
        <mesh position={[-0.06, -0.04, 0.08]} rotation={[0.4, 0.5, 0.3]}>
          <boxGeometry args={[0.08, 0.01, 0.12]} />
          <meshStandardMaterial color={collarColor} roughness={0.7} />
        </mesh>

        {/* 3. THE PLACKET (Center strip) */}
        <mesh position={[0, -0.12, 0.085]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.035, 0.18, 0.005]} />
          <meshStandardMaterial color={shirtColor} roughness={0.9} />
        </mesh>

        {/* 4. BUTTONS */}
        <mesh position={[0, -0.07, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.004, 16]} />
          <meshStandardMaterial color={buttonColor} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.13, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.004, 16]} />
          <meshStandardMaterial color={buttonColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
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
        <Canvas camera={{ position: [0, 0, 4.5], fov: 35 }} shadows gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <PoloModel 
              shirtColor={shirtColor} 
              collarColor={collarColor} 
              buttonColor={buttonColor} 
              scale={3.8} 
            />
            
            <ContactShadows 
              position={[0, -1.2, 0]} 
              opacity={0.4} 
              scale={10} 
              blur={2.5} 
              far={1.5}
            />

            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              minPolarAngle={Math.PI / 2.2} 
              maxPolarAngle={Math.PI / 1.8} 
              makeDefault
            />
            <Environment preset="city" />
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
        <button className={styles.buyBtn}>
          RESERVE NOW
        </button>
      </div>
    </div>
  )
}

useGLTF.preload('/models/tshirt.glb')
