'use client'

import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './KnightWolfPoloCard.module.css' // Reusing styles

// --- 1. THE ADVANCED POLO MODEL (SINGLE-MESH ARCHITECTURE) ---
function ClassicPoloModel({ logoPath, shirtColor = "#FFFFFF", scale = 3.5 }) {
  const { nodes } = useGLTF('/models/tshirt.glb');
  const logoTexture = useTexture(logoPath);
  const groupRef = useRef();
  
  // Extract base mesh
  const meshes = useMemo(() => Object.values(nodes).filter(n => n.isMesh), [nodes]);
  const fabricMesh = useMemo(() => 
    meshes.find(n => n.name.toLowerCase().includes('fabric') || n.name.toLowerCase().includes('shirt')) || meshes[0]
  , [meshes]);

  // Animation: "High-Fidelity Interaction"
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const targetRotation = Math.sin(time * 0.4) * 0.1 + state.mouse.x * 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
      // Realistic fabric "breathing"
      const breathing = 1 + Math.sin(time * 1.2) * 0.005;
      groupRef.current.scale.set(scale * breathing, scale, scale * breathing);
    }
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, -0.8, 0]}>
      {/* 1. MAIN BODY */}
      {fabricMesh && (
        <mesh geometry={fabricMesh.geometry}>
          <meshStandardMaterial 
            color={shirtColor}
            roughness={0.7} 
            metalness={0.02} 
            envMapIntensity={1} 
          />
        </mesh>
      )}

      {/* 2. INTEGRATED COLLAR SYSTEM (Unified with body) */}
      <group position={[0, 0.485, 0.02]} rotation={[-0.05, 0, 0]}>
        {/* Collar Neck Base */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.096, 0.1, 0.05, 64, 1, true]} />
          <meshStandardMaterial color={shirtColor} side={THREE.DoubleSide} roughness={0.6} />
        </mesh>
        
        {/* Collar Wings (Left & Right) */}
        <mesh position={[0.07, -0.03, 0.08]} rotation={[0.5, -0.6, -0.3]}>
          <boxGeometry args={[0.08, 0.008, 0.13]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.07, -0.03, 0.08]} rotation={[0.5, 0.6, 0.3]}>
          <boxGeometry args={[0.08, 0.008, 0.13]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>

        {/* The Placket */}
        <mesh position={[0, -0.11, 0.085]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.032, 0.16, 0.004]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>

        {/* Premium Buttons (3-Button Layout like image) */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -0.05 - (i * 0.05), 0.092]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.003, 16]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.2} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* 3. CHEST LOGO (The Knight Wolf Badge) */}
      <mesh position={[0.12, 0.28, 0.12]} rotation={[0, 0.2, 0]}>
        <circleGeometry args={[0.035, 32]} />
        <meshStandardMaterial 
          map={logoTexture} 
          transparent={true} 
          roughness={0.5} 
          polygonOffset 
          polygonOffsetFactor={-4}
        />
      </mesh>
    </group>
  )
}

export default function ClassicPoloCard() {
  const logoPath = "/knight_wolf_clean_logo.png";

  return (
    <div className={styles.card}>
      <div className={styles.viewArea} style={{ background: 'radial-gradient(circle at center, #222, #000)' }}>
        <Canvas camera={{ position: [0, 0, 4.5], fov: 30 }} shadows gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            
            <ClassicPoloModel 
              logoPath={logoPath}
              shirtColor="#FFFFFF" 
              scale={3.8} 
            />
            
            <ContactShadows 
              position={[0, -1.2, 0]} 
              opacity={0.5} 
              scale={8} 
              blur={2} 
              far={1.5}
            />

            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              minPolarAngle={Math.PI / 2.2} 
              maxPolarAngle={Math.PI / 1.8} 
              makeDefault
            />
            <Environment preset="apartment" />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.info}>
        <div className={styles.headerWrapper}>
          <div className={styles.titleArea}>
            <span className={styles.badge} style={{ color: '#888' }}>PREMIUM ARCHIVE</span>
            <h2 className={styles.title} style={{ color: '#fff' }}>CLASSIC WHITE POLO</h2>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>₹8,999</p>
          </div>
        </div>
        <p className={styles.collection}>Heritage Collection 2026</p>
        <button className={styles.buyBtn} style={{ backgroundColor: '#fff', color: '#000' }}>
          JOIN WAITLIST
        </button>
      </div>
    </div>
  )
}

useGLTF.preload('/models/tshirt.glb')
