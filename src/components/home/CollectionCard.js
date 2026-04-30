'use client'

import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, Environment, useTexture, ContactShadows, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './CollectionCard.module.css'

// --- 1. REUSABLE PRODUCT MODEL COMPONENT ---
function ProductModel({ modelPath, tshirtColor, scale = 2.2, position = [0, 0, 0] }) {
  const { nodes, materials, scene } = useGLTF(modelPath);
  const groupRef = useRef();
  const materialRef = useRef();

  // Automatically center the geometry and then apply user position offset
  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.position.sub(center);
      groupRef.current.position.add(new THREE.Vector3(...position));
    }
  }, [scene, position]);

  // GSAP for smooth color transitions
  useEffect(() => {
    if (materialRef.current) {
      const targetColor = new THREE.Color(tshirtColor);
      gsap.to(materialRef.current.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [tshirtColor]);

  // Smooth breathing effect instead of mouse-following rotation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const breathing = 1 + Math.sin(time * 1.5) * 0.01;
      groupRef.current.scale.setScalar(scale * breathing);
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={[scale, scale, scale]}>
      <mesh 
        geometry={nodes.T_Shirt_male.geometry} 
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial 
          ref={materialRef}
          color={tshirtColor}
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

// --- 2. INDIVIDUAL COLLECTION CARD ---
export default function CollectionCard({ 
  title = "K-WOLF OVERSIZE TEE", 
  price = "₹2,499", 
  modelPath = "/models/shirt_baked.glb", 
  defaultColor = "#111111", 
  scale = 3.5 
}) {
  const [color, setColor] = useState(defaultColor)
  const colors = [
    { name: 'Pitch Black', hex: '#111111' },
    { name: 'Cyber White', hex: '#F0F0F0' },
    { name: 'Vibrant Red', hex: '#E60000' },
    { name: 'Volt Green', hex: '#CCFF00' }
  ];

  return (
    <div className={styles.card}>
      
      {/* --- 3D VIEW AREA --- */}
      <div className={styles.viewArea}>
        <Canvas 
          camera={{ position: [0, 0, 6.5], fov: 35 }} 
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
            {/* Studio Lighting from user snippet */}
            <hemisphereLight intensity={1.5} color="#ffffff" groundColor="#444444" />
            
            <ProductModel 
              modelPath={modelPath} 
              tshirtColor={color} 
              scale={scale} 
              position={[0, 0, 0]} 
            />
            
            <ContactShadows 
              position={[0, -1.2, 0]} 
              opacity={0.3} 
              scale={10} 
              blur={3} 
              far={1.5}
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
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* --- PRODUCT INFO --- */}
      <div className={styles.info}>
        <div className={styles.headerWrapper}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>EXCLUSIVE DROP</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>{price}</p>
          </div>
        </div>
        
        <p className={styles.collection}>Summer Collection 2026</p>

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

// Preload common model
useGLTF.preload('/models/shirt_baked.glb')
