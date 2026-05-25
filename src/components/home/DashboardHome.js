'use client'
 
import React, { useState, Suspense, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { Libre_Baskerville } from 'next/font/google'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Float, View, Preload, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Info, Phone, User } from 'lucide-react'
import styles from './DashboardHome.module.css'

const libreBaskerville = Libre_Baskerville({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// ─── UV CANVAS STICKER SYSTEM ──────────────────────────────────────────────
// Paint sticker directly onto the shirt's UV texture — real printed-on-fabric look
const UV_CONFIG = {
  oversized: {
    front: { cx: 0.30, cy: 0.38, aspectY: 1.78, isFlipped: true,  scale: 0.23 },
    back:  { cx: 0.74, cy: 0.36, aspectY: 1.78, isFlipped: true,  scale: 0.23 }
  },
  regular: {
    front: { cx: 0.28, cy: 0.35, aspectY: 1.78, isFlipped: false, scale: 0.23 },
    back:  { cx: 0.75, cy: 0.36, aspectY: 1.78, isFlipped: false, scale: 0.23 }
  }
};

function removeBackground(img, isThorLogo = false) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const W = c.width, H = c.height;
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;

  if (isThorLogo) {
    // Precise laser-cut circular crop to preserve inner grunge details
    const centerX = W / 2;
    const centerY = H / 2;
    const radius = Math.min(W, H) * 0.425;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pos = (y * W + x) * 4;

        if (dist > radius) {
          data[pos + 3] = 0;
        }
      }
    }
  } else {
    // Normal flood-fill for character prints
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
  }

  ctx.putImageData(imgData, 0, 0);
  return c;
}

function buildUVTextureWithBoth(shirtColor, frontImg, frontCfg, backImg, backCfg) {
  const UV_SIZE = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = UV_SIZE;
  const ctx = canvas.getContext('2d');

  // 1. Fill base shirt color
  ctx.fillStyle = shirtColor;
  ctx.fillRect(0, 0, UV_SIZE, UV_SIZE);

  // 2. Paint front sticker
  if (frontImg && frontCfg) {
    const cleanFront = removeBackground(frontImg, true);
    const sizeFront = Math.round(UV_SIZE * frontCfg.scale);
    const fx = Math.round(frontCfg.cx * UV_SIZE);
    const fy = Math.round(frontCfg.cy * UV_SIZE);
    ctx.save();
    ctx.translate(fx, fy);
    if (frontCfg.isFlipped) ctx.scale(1, -1);
    ctx.drawImage(cleanFront, -sizeFront / 2, -(sizeFront * frontCfg.aspectY) / 2, sizeFront, sizeFront * frontCfg.aspectY);
    ctx.restore();
  }

  // 3. Paint back sticker
  if (backImg && backCfg) {
    const cleanBack = removeBackground(backImg, false);
    const sizeBack = Math.round(UV_SIZE * backCfg.scale);
    const bx = Math.round(backCfg.cx * UV_SIZE);
    const by = Math.round(backCfg.cy * UV_SIZE);
    ctx.save();
    ctx.translate(bx, by);
    if (backCfg.isFlipped) ctx.scale(1, -1);
    ctx.drawImage(cleanBack, -sizeBack / 2, -(sizeBack * backCfg.aspectY) / 2, sizeBack, sizeBack * backCfg.aspectY);
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
const RotatingGroup = ({ delay = 0, speed = 0.004, speedRef, isIntroRef, animStateRef, mode = 'spin', children }) => {
  const groupRef = useRef()
  const startTime = useRef(null)
  const active = useRef(false)

  useFrame((state) => {
    if (!groupRef.current) return

    // Position Y animation from GSAP animStateRef
    if (animStateRef && animStateRef.current) {
      groupRef.current.position.y = animStateRef.current.y;
    }

    if (isIntroRef && isIntroRef.current) {
      // Rotation Y animation from GSAP animStateRef during intro
      if (animStateRef && animStateRef.current) {
        groupRef.current.rotation.y = animStateRef.current.rotationY;
      }
      return // Skip useFrame default rotation when GSAP is animating the spin
    }

    if (startTime.current === null) startTime.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTime.current
    if (elapsed >= delay) active.current = true

    if (active.current) {
      const t = elapsed - delay
      const currentSpeed = speedRef ? speedRef.current : speed
      if (mode === 'spin') {
        // Continuous 360° full rotation
        groupRef.current.rotation.y += currentSpeed
      } else if (mode === 'swing') {
        // ±180° back and forth using sine wave
        groupRef.current.rotation.y = Math.sin(t * currentSpeed) * Math.PI
      }
    }
  })

  return <group ref={groupRef}>{children}</group>
}

// --- 3D Model Component ---
const ModelPreview = ({ color = '#f5f5f5', modelPath = '/models/shirt_baked.glb', scale = 8.2, showSticker = false, position = null, rotation = null }) => {
  const { scene } = useGLTF(modelPath);
  const logoTex = useTexture('/KnightWolf_Logo_White.svg');
  const [uvTex, setUvTex] = React.useState(null);
  
  const isOversized = modelPath.includes('oversized');
  const finalScale = isOversized ? scale * 0.8 : scale;
  const defaultPos  = isOversized ? [0, -7.5, 0] : [0, -4.5, 0];
  const finalPos = position || defaultPos;
  const finalRot = rotation || [0, 0, 0];
  const uvFront = isOversized ? UV_CONFIG.oversized.front : UV_CONFIG.regular.front;
  const uvBack = isOversized ? UV_CONFIG.oversized.back : UV_CONFIG.regular.back;

  const [stickersLoaded, setStickersLoaded] = React.useState(false);
  const frontImgRef = React.useRef(null);
  const backImgRef = React.useRef(null);

  // Preload sticker images once on mount to prevent dynamic color swap lag/race conditions
  React.useEffect(() => {
    if (!showSticker) return;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setStickersLoaded(true);
      }
    };

    const imgFront = new Image();
    imgFront.crossOrigin = 'anonymous';
    imgFront.onload = () => {
      frontImgRef.current = imgFront;
      checkAllLoaded();
    };
    imgFront.src = '/stickers/thor_logo_sticker.png';

    const imgBack = new Image();
    imgBack.crossOrigin = 'anonymous';
    imgBack.onload = () => {
      backImgRef.current = imgBack;
      checkAllLoaded();
    };
    imgBack.src = '/stickers/thor_sticker.png';
  }, [showSticker]);

  // Build or Redraw the UV texture whenever color changes
  React.useEffect(() => {
    if (!showSticker) {
      // Plain solid color canvas
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
    } else if (stickersLoaded && frontImgRef.current && backImgRef.current) {
      // Instant synchronous redrawing of canvas on color change (no async/network delay!)
      const t = buildUVTextureWithBoth(color, frontImgRef.current, uvFront, backImgRef.current, uvBack);
      setUvTex(t);
    }
  }, [color, showSticker, stickersLoaded, uvFront, uvBack]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    return clone;
  }, [scene]);

  // Apply UV texture and physically attach sleeve label to right sleeve mesh
  React.useEffect(() => {
    if (!uvTex) return;
    
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // Retrieve original mesh material to preserve baked normal/AO detailing (creases, seams, ribs)
        const originalMesh = scene.getObjectByName(child.name);
        const originalMat = originalMesh?.material;

        child.material = new THREE.MeshStandardMaterial({
          map: uvTex,
          normalMap: originalMat?.normalMap || null,
          normalScale: originalMat?.normalScale || new THREE.Vector2(1, 1),
          aoMap: originalMat?.aoMap || null,
          aoMapIntensity: originalMat?.aoMapIntensity !== undefined ? originalMat?.aoMapIntensity : 1.0,
          roughness: 1.0,
          metalness: 0.0,
        });
        child.material.needsUpdate = true;

        // Physically parent the sleeve label directly to the right sleeve mesh (Object_3)
        if (isOversized && showSticker && (child.name.includes('Object_3') || child.name === 'Object_3')) {
          // Remove any old tag to prevent duplicate meshes on rerenders
          const oldLabel = child.getObjectByName('SleeveLabelTag');
          if (oldLabel) {
            child.remove(oldLabel);
          }
        }
      }
    });
  }, [uvTex, clonedScene, logoTex, isOversized, showSticker]);

  return (
    <group position={finalPos} scale={finalScale} rotation={finalRot}>
      <primitive object={clonedScene} />
    </group>
  );
};

// ─── 3D ATMOSPHERIC CLOUD SYSTEM ───────────────────────────────────────────
const CloudEffect = () => {
  const [cloudTex, setCloudTex] = React.useState(null);
  const cloudRef1 = useRef();
  const cloudRef2 = useRef();
  const cloudRef3 = useRef();

  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Convert black background to transparent alpha & make the clouds bright white
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const v = Math.max(r, g, b);
        
        // High opacity for dense, solid cloud appearance
        const alpha = Math.min(255, v * 2.2);
        data[i + 3] = alpha;

        // Bright white color with original grayscale contours for depth
        const factor = 1.35;
        data[i] = Math.min(255, r * factor);
        data[i+1] = Math.min(255, g * factor);
        data[i+2] = Math.min(255, b * factor);
      }

      ctx.putImageData(imgData, 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.needsUpdate = true; // CRITICAL: Upload canvas texture to the GPU!
      setCloudTex(tex);
    };
    img.src = '/images/smoke.png';
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Slow, organic swirling strictly centered under the T-shirt
    if (cloudRef1.current) {
      cloudRef1.current.rotation.z = t * 0.012;
      cloudRef1.current.position.y = -7.0 + Math.sin(t * 0.25) * 0.03;
    }
    if (cloudRef2.current) {
      cloudRef2.current.rotation.z = -t * 0.01 + 0.8;
      cloudRef2.current.position.y = -7.1 + Math.cos(t * 0.2) * 0.04;
    }
    if (cloudRef3.current) {
      cloudRef3.current.rotation.z = t * 0.008 + 1.8;
      cloudRef3.current.position.y = -7.2 + Math.sin(t * 0.3) * 0.03;
    }
  });

  if (!cloudTex) return null;

  return (
    <group>
      {/* Layer 1: Background central cloud puff directly under the shirt hem */}
      <mesh ref={cloudRef1} position={[0, -7.0, -0.4]} scale={[4.5, 2.2, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={cloudTex}
          transparent={true}
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>

      {/* Layer 2: Midground left-shifted cloud puff */}
      <mesh ref={cloudRef2} position={[-0.3, -7.1, -0.2]} scale={[3.8, 1.8, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={cloudTex}
          transparent={true}
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>

      {/* Layer 3: Foreground right-shifted cloud puff */}
      <mesh ref={cloudRef3} position={[0.3, -7.2, 0.4]} scale={[3.8, 1.8, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={cloudTex}
          transparent={true}
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
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
const ScrollingColumn = ({ items, direction = 'up', speed = 40, isEmpty = false, cardClassName = '', wrapRef, scrollTweenRef }) => {
  const innerRef = useRef(null);

  useEffect(() => {
    if (!innerRef.current) return;

    const fromVal = direction === 'up' ? 0 : -50;
    const toVal = direction === 'up' ? -50 : 0;

    gsap.set(innerRef.current, { yPercent: fromVal });

    const tween = gsap.to(innerRef.current, {
      yPercent: toVal,
      duration: speed,
      repeat: -1,
      ease: 'none'
    });

    if (scrollTweenRef) {
      scrollTweenRef.current = tween;
    }

    return () => {
      tween.kill();
    };
  }, [direction, speed, scrollTweenRef]);

  return (
    <div className={styles.scrollColumnWrap} ref={wrapRef}>
      <div 
        className={styles.scrollColumn}
        ref={innerRef}
      >
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className={`${styles.galleryCard} ${cardClassName}`}>
            {item.img && (
              <img src={item.img} alt="Gallery item" className={styles.centerImg} draggable="false" />
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
      </div>
    </div>
  );
};

export default function DashboardHome({ customStyleConfig = null, forceTheme = null }) {
  const [localIsDark, setLocalIsDark] = useState(false);
  const isDark = forceTheme !== null ? forceTheme : localIsDark;
  const [activeTab, setActiveTab] = useState('about');
  const containerRef = useRef(null);

  // Refs for cinematic intro animation
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col4Ref = useRef(null);
  const col5Ref = useRef(null);
  const centerFocusRef = useRef(null);
  const vignetteTopRef = useRef(null);
  const vignetteBottomRef = useRef(null);
  const topNavRef = useRef(null);
  const exploreButtonRef = useRef(null);
  const canvasRef = useRef(null);
  const shirtPosRef = useRef(null);
  const textSubRef = useRef(null);
  const textMassiveRef = useRef(null);

  // Refs for column scroll tweens to control speed / timeScale dynamically
  const col1ScrollRef = useRef(null);
  const col2ScrollRef = useRef(null);
  const col4ScrollRef = useRef(null);
  const col5ScrollRef = useRef(null);

  // Ref for T-shirt rotation speed (starts at 0.12, decelerates to 0.005)
  const shirtSpeedRef = useRef(0.005);
  
  // Flag to check if we are currently playing the cinematic intro spin
  const isIntroSpinning = useRef(true);

  // plain JS object reference for GSAP to animate safely before ThreeJS models have finished loading
  const shirtAnimState = useRef({
    y: -12,
    rotationY: Math.PI * 6
  });

  // Set all intro elements to invisible immediately on mount
  useEffect(() => {
    const cols = [col1Ref.current, col2Ref.current, col4Ref.current, col5Ref.current].filter(Boolean);
    gsap.set(cols, { opacity: 0, filter: 'grayscale(1) contrast(1.08) brightness(0.92)' });
    gsap.set(centerFocusRef.current, { opacity: 0 });
    gsap.set(topNavRef.current, { opacity: 0, y: -14 });
    gsap.set(exploreButtonRef.current, { opacity: 0, y: 14 });
    gsap.set(canvasRef.current, { opacity: 0 });
    gsap.set([textSubRef.current, textMassiveRef.current], { opacity: 0 });
    shirtSpeedRef.current = 0.005;
    isIntroSpinning.current = true;
    shirtAnimState.current = { y: -12, rotationY: Math.PI * 6 };
  }, []);

  // Cinematic intro sequence — fires once when splash completes
  useEffect(() => {
    const handler = () => {
      const cols = [col1Ref.current, col2Ref.current, col4Ref.current, col5Ref.current].filter(Boolean);
      const colTweens = [col1ScrollRef.current, col2ScrollRef.current, col4ScrollRef.current, col5ScrollRef.current].filter(Boolean);
      
      const tl = gsap.timeline();

      // Phase 1: Center Card alone first fading in + text pure fade-in
      tl.to(centerFocusRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      }, 0);

      tl.to([textSubRef.current, textMassiveRef.current], {
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      }, 0.1);

      // Phase 2: Side rolling cards (columns) fastly load (fade in) at 0.8s
      tl.to(cols, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0.8);

      tl.call(() => {
        colTweens.forEach(t => t.timeScale(14)); // Start rapid scrolling
      }, [], 0.8);

      // Decelerate columns from 14x speed down to 1x over 2.0s starting at 1.2s
      colTweens.forEach(t => {
        tl.to(t, {
          timeScale: 1,
          duration: 2.0,
          ease: 'power2.out'
        }, 1.2);
      });

      // Phase 3: T-shirt fades in, slides up and rolls (starts at 1.0s, right after columns show)
      tl.to(canvasRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 1.0);

      tl.call(() => {
        isIntroSpinning.current = true;
      }, [], 1.0);

      // Slide shirt animState position and rotation up (duration reduced to 1.3s for speed and snappiness)
      tl.to(shirtAnimState.current, {
        y: 0,
        rotationY: 0,
        duration: 1.3,
        ease: 'power3.out'
      }, 1.0);

      // Decelerate standard speed ref to match target rotation
      tl.to(shirtSpeedRef, {
        current: 0.005,
        duration: 1.3,
        ease: 'power2.out',
        onComplete: () => {
          isIntroSpinning.current = false; // Hand over back to frame loop rotation
        }
      }, 1.0);

      // Phase 4: Once T-shirt settles in its position (at 2.3s), slide in Vignettes
      tl.to(vignetteTopRef.current, {
        height: '32vh',
        duration: 1.0,
        ease: 'power3.out'
      }, 2.3);
      tl.to(vignetteBottomRef.current, {
        height: '32vh',
        duration: 1.0,
        ease: 'power3.out'
      }, 2.3);

      // Phase 5: Color Sweep starts at 2.3s (when shirt reaches position)
      // One column turns to color, and as the next column turns color, the previous turns grayscale
      const colDuration = 0.5;
      const startCascadeTime = 2.3;

      // Col 1 turns color
      tl.to(col1Ref.current, { filter: 'grayscale(0) contrast(1) brightness(1)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime);

      // Col 2 turns color, Col 1 returns to grayscale
      tl.to(col1Ref.current, { filter: 'grayscale(1) contrast(1.08) brightness(0.92)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration);
      tl.to(col2Ref.current, { filter: 'grayscale(0) contrast(1) brightness(1)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration);

      // Col 4 turns color, Col 2 returns to grayscale
      tl.to(col2Ref.current, { filter: 'grayscale(1) contrast(1.08) brightness(0.92)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration * 2);
      tl.to(col4Ref.current, { filter: 'grayscale(0) contrast(1) brightness(1)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration * 2);

      // Col 5 turns color, Col 4 returns to grayscale
      tl.to(col4Ref.current, { filter: 'grayscale(1) contrast(1.08) brightness(0.92)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration * 3);
      tl.to(col5Ref.current, { filter: 'grayscale(0) contrast(1) brightness(1)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration * 3);

      // Col 5 returns to grayscale, completing the loop
      tl.to(col5Ref.current, { filter: 'grayscale(1) contrast(1.08) brightness(0.92)', duration: colDuration, ease: 'power2.inOut' }, startCascadeTime + colDuration * 4);

      // Phase 6: Once sweep is complete (4.3s), turn all columns to colors and reveal top nav & bottom CTA
      tl.to(cols, {
        filter: 'grayscale(0) contrast(1) brightness(1)',
        duration: 0.85,
        ease: 'power2.inOut'
      }, 4.3);

      // Clear inline filters when transition completely finishes so normal hover styles work
      tl.call(() => {
        cols.forEach(col => gsap.set(col, { clearProps: 'filter' }));
      }, [], 5.2);

      tl.to(topNavRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, 4.3);

      tl.to(exploreButtonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, 4.5);
    };

    window.addEventListener('splashComplete', handler);
    return () => window.removeEventListener('splashComplete', handler);
  }, []);

  const toggleTheme = () => {
    if (forceTheme === null) {
      setLocalIsDark(!localIsDark);
    }
  };

  return (
    <div ref={containerRef} className={`${isDark ? styles.heroSectionDark : styles.heroSection} ${libreBaskerville.className}`}>

      {/* Cinematic Vignette Divs — animated in by GSAP on splashComplete */}
      <div ref={vignetteTopRef} className={styles.vignetteTop} />
      <div ref={vignetteBottomRef} className={styles.vignetteBottom} />

      {/* ─── Top Center Navigation Bar (Floating above Vignettes) ─── */}
      <div ref={topNavRef} className={styles.topNavContainer}>
        {/* Capsule containing logo and tabs */}
        <div className={styles.topNavTabs}>
          <div className={styles.topNavLogoWrapper}>
            <img src="/KnightWolf_Logo_White.svg" alt="Knight Wolf" className={styles.topNavLogoImg} />
          </div>

          {/* About Tab (Active, Solid Contrast) */}
          <div className={styles.topNavTabActive}>
            <Info size={20} style={{ marginRight: '4px' }} />
            <span>About</span>
          </div>

          {/* Contact Tab (Inactive, Phone Icon only) */}
          <div className={styles.topNavTabInactive}>
            <Phone size={20} />
          </div>

          {/* Login Tab (Inactive, User Icon only) */}
          <div className={styles.topNavTabInactive}>
            <User size={20} />
          </div>
        </div>
      </div>

      {/* ─── Bottom White Explore Button (Floating above Vignettes) ─── */}
      <button ref={exploreButtonRef} className={styles.bottomExploreButton}>
        Explore Collections
      </button>


      {/* ─── Living Gallery Grid ─── */}
      <main className={styles.galleryGrid}>
        {/* Left Side: Two Scrolling Columns */}
        <ScrollingColumn 
          items={[
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-18-47.png' },
            { bgColor: '#141414', img: '/box/new_launch_poster.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-20-50.png' }
          ]} 
          direction="up" 
          speed={30} 
          isEmpty={false}
          wrapRef={col1Ref}
          scrollTweenRef={col1ScrollRef}
        />
        <ScrollingColumn 
          items={[
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-22-08.png' },
            { bgColor: '#141414', img: '/box/knightwolf_hd_poster.png' },
            { bgColor: '#141414', img: '/box/ad_poster.jpg' }
          ]} 
          direction="down" 
          speed={25} 
          isEmpty={false}
          cardClassName={styles.squareCard}
          wrapRef={col2Ref}
          scrollTweenRef={col2ScrollRef}
        />

        {/* Center Focus — Reduced Panoramic Frame */}
        <div ref={centerFocusRef} className={styles.centerFocusCol}>

          <div className={styles.centerContent}>
            <div className={styles.reducedPanoramicFrame}>
              {/* Comic style red background with halftone dots */}
              <div className={styles.comicRedBackground} />

               {/* Gritty Vintage tactile noise overlay layer */}
               <div className={styles.noiseOverlay} />
 
               {/* Background Editorial Poster Typography Layer */}
              <div 
                className={styles.backgroundTextContainer}
                style={customStyleConfig ? customStyleConfig.containerStyle : undefined}
              >
                <div ref={textSubRef} className={styles.newStreetwearSubtitle}>NEW STREETWEAR</div>
                <h1 
                  ref={textMassiveRef}
                  className={styles.massiveBgText}
                  style={customStyleConfig ? customStyleConfig.massiveStyle : undefined}
                >
                  {customStyleConfig ? (customStyleConfig.textContent || `${customStyleConfig.newTextContent || 'NEW'} ${customStyleConfig.launchTextContent || 'LAUNCH'}`) : "LAUNCH"}
                </h1>
              </div>

              <View className={styles.tripleView}>
                <Suspense fallback={null}>
                  {/* Crimson Smooth adaptive lighting */}
                  <ambientLight 
                    intensity={0.9} 
                    color="#ffe5e5" 
                  />
                  <directionalLight 
                    position={[4, 8, 10]} 
                    intensity={1.8} 
                    color="#ff7777" 
                    castShadow 
                  />
                  <directionalLight 
                    position={[-8, 3, 6]}  
                    intensity={0.8} 
                    color="#ffffff" 
                    castShadow={false}
                  />
                  <directionalLight 
                    position={[0, 6, -12]} 
                    intensity={0.5} 
                    color="#ff9999" 
                  />

                  {/* Single Hero T-shirt — Adjusted scale to 5.7 per user feedback */}
                  <RotatingGroup delay={0} speedRef={shirtSpeedRef} isIntroRef={isIntroSpinning} animStateRef={shirtAnimState} mode="spin">
                    <ModelPreview 
                      color={customStyleConfig?.shirtColor || '#ffffff'} 
                      modelPath="/models/oversized_tshirt.glb" 
                      showSticker={true} 
                      scale={5.7} 
                      position={[0, -6.5, 0]} 
                      rotation={[0, 0, 0]} 
                    />
                  </RotatingGroup>

                  {/* Volumetric cloud system strictly under the T-shirt hem */}
                  <CloudEffect />

                  {/* Shared shadows aligned with the new T-shirt floor */}
                  <ContactShadows position={[0, -6.8, 0]} opacity={0.5} scale={20} blur={3} far={4} />

                  {/* Enable horizontal rotation only, locking vertical axis */}
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    minPolarAngle={Math.PI / 2} 
                    maxPolarAngle={Math.PI / 2} 
                  />
                </Suspense>
              </View>

            </div>
          </div>
        </div>

        {/* Right Side: Two Scrolling Columns */}
        <ScrollingColumn 
          items={[
            { bgColor: '#141414', img: '/box/knight_wolf_editorial_v2.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-34-40.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-22-22.png' }
          ]} 
          direction="up" 
          speed={28} 
          isEmpty={false}
          cardClassName={styles.squareCard}
          wrapRef={col4Ref}
          scrollTweenRef={col4ScrollRef}
        />
        <ScrollingColumn 
          items={[
            { bgColor: '#141414', img: '/box/ad_poster.jpg' },
            { bgColor: '#141414', img: '/box/knightwolf_hd_poster.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-05-11-13-20-50.png' }
          ]} 
          direction="down" 
          speed={35} 
          isEmpty={false}
          wrapRef={col5Ref}
          scrollTweenRef={col5ScrollRef}
        />
      </main>

      {/* ─── Global 3D Canvas Context ─── */}
      <div ref={canvasRef} className={styles.globalCanvas}>
        <Canvas 
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
      </div>


    </div>
  )
}
