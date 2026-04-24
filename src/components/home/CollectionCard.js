'use client'

import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, Environment, useTexture, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import styles from './CollectionCard.module.css'

// --- 1. REUSABLE PRODUCT MODEL COMPONENT ---
function ProductModel({ modelPath, tshirtColor, scale = 2.2, position = [0, 0, 0] }) {
  // Use fallback if model doesn't exist (handled by useGLTF error or checked before)
  const { nodes, scene } = useGLTF(modelPath);
  const groupRef = useRef();

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
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const targetColor = new THREE.Color(tshirtColor);
        gsap.to(child.material.color, {
          r: targetColor.r,
          g: targetColor.g,
          b: targetColor.b,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    });
  }, [scene, tshirtColor]);

  // Smooth rotation logic from user snippet
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Combine idle breathing with mouse interaction
      // We use lerp-like behavior for mouse for extra smoothness
      const targetRotation = Math.sin(time) * 0.2 + state.mouse.x * 0.4;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }
  });

  // Identify the main fabric mesh (Safe fallback)
  const meshes = Object.values(nodes).filter(n => n.isMesh);
  const fabricMesh = meshes.find(n => n.name.toLowerCase().includes('fabric') || n.name.toLowerCase().includes('shirt')) || meshes[0];
  const graphicMesh = meshes.find(n => n.name.toLowerCase().includes('graphic') || n.name.toLowerCase().includes('print')) || meshes[1];

  return (
    <group ref={groupRef} dispose={null} scale={[scale, scale, scale]}>
      {fabricMesh && (
        <mesh geometry={fabricMesh.geometry}>
          <meshStandardMaterial 
            roughness={0.8} 
            metalness={0.1} 
            envMapIntensity={0.5} 
          />
        </mesh>
      )}
      {graphicMesh && (
        <mesh 
          geometry={graphicMesh.geometry} 
          material={graphicMesh.material} 
          material-roughness={0.8}
        />
      )}
    </group>
  )
}

// --- 2. INDIVIDUAL COLLECTION CARD ---
export default function CollectionCard({ 
  title = "K-WOLF OVERSIZE TEE", 
  price = "₹2,499", 
  modelPath = "/models/tshirt.glb", 
  defaultColor = "#111111", 
  scale = 3.5 
}) {
  const [color, setColor] = useState(defaultColor)
  const colors = [
    { name: 'Pitch Black', hex: '#111111' },
    { name: 'Cyber White', hex: '#F0F0F0' },
    { name: 'Neon Red', hex: '#FF0055' },
    { name: 'Volt Green', hex: '#CCFF00' }
  ];

  return (
    <div className={styles.card}>
      
      {/* --- 3D VIEW AREA --- */}
      <div className={styles.viewArea}>
        <Canvas camera={{ position: [0, 0, 5], fov: 35 }} shadows gl={{ antialias: true }}>
          <Suspense fallback={null}>
            {/* Studio Lighting from user snippet */}
            <hemisphereLight intensity={1.2} color="#ffffff" groundColor="#444444" />
            <directionalLight position={[2, 2, 2]} intensity={1} castShadow />
            
            <ProductModel 
              modelPath={modelPath} 
              tshirtColor={color} 
              scale={scale} 
              position={[0, -0.8, 0]} 
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
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>{price}</p>
          </div>
        </div>
        
        <button className={styles.buyBtn}>
          Customize
        </button>
      </div>
    </div>
  )
}

// Preload common model
useGLTF.preload('/models/tshirt.glb')
