'use client'
 
import React, { useState, Suspense, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Libre_Baskerville } from 'next/font/google'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Float, View, Preload, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import styles from './DashboardHome.module.css'

const libreBaskerville = Libre_Baskerville({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function DashboardHome() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const containerRef = useRef(null);

  const toggleTheme = () => setIsDark(!isDark);

  // ─── UV CANVAS STICKER SYSTEM (same as configurator) ─────────────────────
  // Paint sticker directly onto the shirt's UV texture — real printed-on-fabric look
  const UV_CONFIG = {
    oversized: { cx: 0.30, cy: 0.38, aspectY: 1.2, isFlipped: true,  scale: 0.30 },
    regular:   { cx: 0.28, cy: 0.35, aspectY: 1.2, isFlipped: false, scale: 0.30 },
  };

  function removeBackground(img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const W = c.width, H = c.height;
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    const visited = new Uint8Array(W * H);
    const queue = [];
    const bgR = data[0], bgG = data[1], bgB = data[2];
    const TOL = 55;
    [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(([x,y]) => {
      const idx = y * W + x;
      if (!visited[idx]) { visited[idx] = 1; queue.push(x, y); }
    });
    let head = 0;
    while (head < queue.length) {
      const x = queue[head++], y = queue[head++];
      const pos = (y * W + x) * 4;
      const diff = Math.abs(data[pos]-bgR) + Math.abs(data[pos+1]-bgG) + Math.abs(data[pos+2]-bgB);
      if (diff < TOL) {
        data[pos + 3] = 0;
        for (const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            const nIdx = ny * W + nx;
            if (!visited[nIdx]) { visited[nIdx] = 1; queue.push(nx, ny); }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return c;
  }

  function buildUVTexture(shirtColor, stickerImg, uvCfg) {
    const UV_SIZE = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = UV_SIZE;
    const ctx = canvas.getContext('2d');
    // 1. Fill base shirt color
    ctx.fillStyle = shirtColor;
    ctx.fillRect(0, 0, UV_SIZE, UV_SIZE);
    // 2. Paint sticker if provided
    if (stickerImg && uvCfg) {
      const clean = removeBackground(stickerImg);
      const stickerSize = Math.round(UV_SIZE * uvCfg.scale);
      const sx = Math.round(uvCfg.cx * UV_SIZE);
      const sy = Math.round(uvCfg.cy * UV_SIZE);
      ctx.save();
      ctx.translate(sx, sy);
      if (uvCfg.isFlipped) ctx.scale(1, -1);
      ctx.drawImage(clean, -stickerSize / 2, -(stickerSize * uvCfg.aspectY) / 2, stickerSize, stickerSize * uvCfg.aspectY);
      ctx.restore();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  // --- Rotating Group with delay and mode ---
  const RotatingGroup = ({ delay = 0, speed = 0.004, mode = 'spin', children }) => {
    const groupRef = useRef()
    const startTime = useRef(null)
    const active = useRef(false)

    useFrame((state) => {
      if (!groupRef.current) return
      if (startTime.current === null) startTime.current = state.clock.elapsedTime
      const elapsed = state.clock.elapsedTime - startTime.current
      if (elapsed >= delay) active.current = true

      if (active.current) {
        const t = elapsed - delay
        if (mode === 'spin') {
          // Continuous 360° full rotation
          groupRef.current.rotation.y += speed
        } else if (mode === 'swing') {
          // ±180° back and forth using sine wave
          groupRef.current.rotation.y = Math.sin(t * speed) * Math.PI
        }
      }
    })

    return <group ref={groupRef}>{children}</group>
  }

  // --- 3D Model Component ---
  const ModelPreview = ({ color = '#f5f5f5', modelPath = '/models/shirt_baked.glb', scale = 8.2, showSticker = false, position = null, rotation = null }) => {
    const { scene } = useGLTF(modelPath);
    const [uvTex, setUvTex] = React.useState(null);
    
    const isOversized = modelPath.includes('oversized');
    const finalScale = isOversized ? scale * 0.8 : scale;
    const defaultPos  = isOversized ? [0, -7.5, 0] : [0, -4.5, 0];
    const finalPos = position || defaultPos;
    const finalRot = rotation || [0, 0, 0];
    const uvCfg = isOversized ? UV_CONFIG.oversized : UV_CONFIG.regular;

    // Build UV texture (with sticker painted in)
    React.useEffect(() => {
      if (!showSticker) {
        // plain color only
        const UV_SIZE = 512;
        const c = document.createElement('canvas');
        c.width = c.height = UV_SIZE;
        const ctx = c.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, UV_SIZE, UV_SIZE);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.flipY = false;
        setUvTex(t);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const t = buildUVTexture(color, img, uvCfg);
          setUvTex(t);
        };
        img.src = '/stickers/user_sticker.png';
      }
    }, [scene, color, showSticker]);

    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      return clone;
    }, [scene]);

    // Apply UV texture to material
    React.useEffect(() => {
      if (!uvTex) return;
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            map: uvTex,
            roughness: 0.95,
            metalness: 0.0,
            sheen: 0.8,
            sheenRoughness: 0.9,
            sheenColor: new THREE.Color(0xffffff),
          });
          child.material.needsUpdate = true;
        }
      });
    }, [uvTex, clonedScene]);

    return (
      <group position={finalPos} scale={finalScale} rotation={finalRot}>
        <primitive object={clonedScene} />
      </group>
    );
  };

  const cardBgs = [
    "#E58A24", // Orange
    "#9AB67D", // Greenish-Yellow
    "#D4A73F", // Mustard Yellow
    "#B83E3E", // Deep Red
    "#1A1A1A"  // Dark Grey/Black
  ];

  // Internal component for scrolling columns
  const ScrollingColumn = ({ items, direction = 'up', speed = 40, isEmpty = false, cardClassName = '' }) => {
    return (
      <div className={styles.scrollColumnWrap}>
        <motion.div 
          className={styles.scrollColumn}
          animate={{ 
            y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'] 
          }}
          transition={{ 
            duration: speed, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...items, ...items].map((item, idx) => (
            <div key={idx} className={`${styles.galleryCard} ${cardClassName}`} style={{ backgroundColor: item.bgColor }}>
              {item.img && (
                <img src={item.img} alt="Gallery item" className={styles.centerImg} />
              )}
              {!isEmpty && !item.img && (
                <View className={styles.fullView}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={2.5} />
                    <ModelPreview color="#ffffff" modelPath={item.path} />
                    <ContactShadows position={[0, -7.5, 0]} opacity={0.4} scale={10} blur={2.5} far={2} />
                  </Suspense>
                </View>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`${isDark ? styles.heroSectionDark : styles.heroSection} ${libreBaskerville.className}`}>
      
      {/* ─── Cinematic Vignettes ─── */}
      <div className={styles.vignetteTop} />
      <div className={styles.vignetteBottom} />

      {/* ─── Unified Command Center (Header) ─── */}
      <div className={styles.headerWrapper}>
        <nav className={styles.commandCenter}>
          <div className={styles.navBrand}>
            <img 
              src="/KnightWolf_Logo_White.svg" 
              alt="Knight Wolf Logo" 
              className={styles.navLogo} 
            />
          </div>
          
          <div className={styles.navMenu}>
            {['About Us', 'Contact', 'Login'].map((item) => {
              const id = item.toLowerCase().replace(' ', '');
              return (
                <button 
                  key={id}
                  className={`${styles.navItem} ${activeTab === id ? styles.navItemActive : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button 
            className={`${styles.headerToggle} ${!isDark ? styles.headerToggleLight : ''}`} 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* ─── Living Gallery Grid ─── */}
      <main className={styles.galleryGrid}>
        {/* Left Side: Two Scrolling Columns */}
        <ScrollingColumn 
          items={[
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-18-47.png' },
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-20-11.png' },
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-20-50.png' }
          ]} 
          direction="up" 
          speed={30} 
          isEmpty={false}
        />
        <ScrollingColumn 
          items={[
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-22-08.png' },
            { bgColor: '#111', img: '/box/knightwolf_hd_poster.png' },
            { bgColor: '#111', img: '/box/ad_poster.jpg' }
          ]} 
          direction="down" 
          speed={25} 
          isEmpty={false}
          cardClassName={styles.squareCard}
        />

        {/* Center Focus — Reduced Panoramic Frame */}
        <div className={styles.centerFocusCol}>
          <div className={styles.centerContent}>
            <h2 className={styles.trendingTitle}>Wear to Hurt</h2>
            <span className={styles.trendingLabel}>Trending Collections</span>
            
            <div className={styles.reducedPanoramicFrame}>
              <View className={styles.tripleView}>
                <Suspense fallback={null}>
                  {/* Shared lighting */}
                  <ambientLight intensity={1.2} />
                  <directionalLight position={[4, 8, 10]} intensity={1.6} castShadow />
                  <directionalLight position={[-8, 3, 6]}  intensity={0.7} />
                  <directionalLight position={[0, 6, -12]} intensity={0.6} />

                  {/* Single Hero T-shirt — Oversized */}
                  <RotatingGroup delay={0} speed={0.005} mode="spin">
                    <ModelPreview color="#f5f5f5" modelPath="/models/oversized_tshirt.glb" showSticker={true} scale={8.18} position={[0, -8.0, 0]} rotation={[0, 0, 0]} />
                  </RotatingGroup>

                  {/* Shared shadows */}
                  <ContactShadows position={[0, -7, 0]} opacity={0.5} scale={20} blur={3} far={4} />
                </Suspense>
              </View>
            </div>
          </div>
        </div>

        {/* Right Side: Two Scrolling Columns */}
        <ScrollingColumn 
          items={[
            { bgColor: '#111', img: '/box/knight_wolf_editorial_v2.png' },
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-34-40.png' },
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-22-22.png' }
          ]} 
          direction="up" 
          speed={28} 
          isEmpty={false}
          cardClassName={styles.squareCard}
        />
        <ScrollingColumn 
          items={[
            { bgColor: '#111', img: '/box/ad_poster.jpg' },
            { bgColor: '#111', img: '/box/knightwolf_hd_poster.png' },
            { bgColor: '#111', img: '/box/PHOTO-2026-05-11-13-20-50.png' }
          ]} 
          direction="down" 
          speed={35} 
          isEmpty={false}
        />
      </main>

      {/* ─── Global 3D Canvas Context ─── */}
      <Canvas 
        className={styles.globalCanvas} 
        eventSource={containerRef}
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows
      >
        <View.Port />
        <Preload all />
      </Canvas>

      {/* ─── Global Bottom CTA ─── */}
      <button className={styles.centerCta}>
        Explore More <span className={styles.ctaArrow}>→</span>
      </button>
    </div>
  )
}
