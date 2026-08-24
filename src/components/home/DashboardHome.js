'use client'

import React, { useState, Suspense, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { Libre_Baskerville } from 'next/font/google'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Float, View, Preload, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Compass, User, Home, Mail } from 'lucide-react'
import styles from './DashboardHome.module.css'

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre-baskerville',
})

// ─── UV CANVAS STICKER SYSTEM ──────────────────────────────────────────────
// Paint sticker directly onto the shirt's UV texture — real printed-on-fabric look
const UV_CONFIG = {
  oversized: {
    front: { cx: 0.30, cy: 0.38, aspectY: 1.78, isFlipped: true, scale: 0.23 },
    back: { cx: 0.74, cy: 0.36, aspectY: 1.78, isFlipped: true, scale: 0.23 }
  },
  regular: {
    front: { cx: 0.28, cy: 0.35, aspectY: 1.78, isFlipped: false, scale: 0.23 },
    back: { cx: 0.75, cy: 0.36, aspectY: 1.78, isFlipped: false, scale: 0.23 }
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
    [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].forEach(([x, y]) => {
      const idx = y * W + x;
      if (!visited[idx]) { visited[idx] = 1; queue.push(x, y); }
    });
    let head = 0;
    while (head < queue.length) {
      const x = queue[head++], y = queue[head++];
      const pos = (y * W + x) * 4;
      const diff = Math.abs(data[pos] - bgR) + Math.abs(data[pos + 1] - bgG) + Math.abs(data[pos + 2] - bgB);
      if (diff < TOL) {
        data[pos + 3] = 0;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
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

// --- Shirt Carousel Variants ---
const SHIRT_CAROUSEL = [
  { color: '#FFFFFF', showSticker: true, label: 'White' },
  { color: '#F5F0CC', showSticker: true, label: 'Pale Yellow' },
  { color: '#1A1A1A', showSticker: true, label: 'Gray Black' },
];

// --- Rotating Group with delay and mode ---
const RotatingGroup = React.forwardRef(({ delay = 0, speed = 0.004, speedRef, isIntroRef, animStateRef, isDraggingRef, hoverPauseRef, targetRotationYRef, mode = 'spin', children }, ref) => {
  const localRef = useRef()
  const groupRef = ref || localRef
  const startTime = useRef(null)
  const active = useRef(false)

  useFrame((state) => {
    if (!groupRef.current) return

    // Position Y + X and Scale animations from GSAP animStateRef
    if (animStateRef && animStateRef.current) {
      groupRef.current.position.y = animStateRef.current.y;
      groupRef.current.position.x = animStateRef.current.x ?? 0;

      const sX = animStateRef.current.sX ?? 1;
      const sY = animStateRef.current.sY ?? 1;
      const sZ = animStateRef.current.sZ ?? 1;

      groupRef.current.scale.set(sX, sY, sZ);
    }

    if (isIntroRef && isIntroRef.current) {
      // Rotation Y animation from GSAP animStateRef during intro
      if (animStateRef && animStateRef.current) {
        groupRef.current.rotation.y = animStateRef.current.rotationY;
        if (targetRotationYRef) {
          targetRotationYRef.current = animStateRef.current.rotationY;
        }
      }
      return // Skip useFrame default rotation when GSAP is animating the spin
    }

    const isDragging = isDraggingRef && isDraggingRef.current;
    const isHovering = hoverPauseRef && hoverPauseRef.current;

    // Target tracking for auto-rotation — paused when hovering or dragging
    if (!isDragging && !isHovering) {
      if (startTime.current === null) startTime.current = state.clock.elapsedTime
      const elapsed = state.clock.elapsedTime - startTime.current
      if (elapsed >= delay) active.current = true

      if (active.current) {
        // Slow continuous relative increment to ensure 100% jump-free transition after manual drag
        const deltaSpeed = 0.005; 

        if (mode === 'spin' || mode === 'swing') {
          if (targetRotationYRef) {
            targetRotationYRef.current = (targetRotationYRef.current ?? 0) + deltaSpeed;
          } else {
            groupRef.current.rotation.y += deltaSpeed;
            return;
          }
        }
      }
    }

    // Always smoothly interpolate (lerp) the actual mesh rotation to follow the target (auto or drag)
    if (targetRotationYRef && targetRotationYRef.current !== undefined) {
      // 0.05 (5%) creates an incredibly soft, heavy, floating premium feel
      groupRef.current.rotation.y += (targetRotationYRef.current - groupRef.current.rotation.y) * 0.05;
    }
  })

  return <group ref={groupRef}>{children}</group>
})
RotatingGroup.displayName = 'RotatingGroup';

// --- 3D Model Component ---
const ModelPreview = ({ color = '#f5f5f5', modelPath = '/models/shirt_baked.glb', scale = 8.2, showSticker = false, position = null, rotation = null }) => {
  const { scene } = useGLTF(modelPath);
  const logoTex = useTexture('/KnightWolf_Logo_White.svg');
  const [uvTex, setUvTex] = React.useState(null);

  const isOversized = modelPath.includes('oversized');
  const finalScale = isOversized ? scale * 0.8 : scale;
  const defaultPos = isOversized ? [0, -7.5, 0] : [0, -4.5, 0];
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
        // Clone original material once to avoid memory leak and constant shader recompilation
        if (!child.userData.isMaterialCloned) {
          const originalMesh = scene.getObjectByName(child.name);
          const originalMat = originalMesh?.material;
          
          if (originalMat) {
            child.material = originalMat.clone();
          } else {
            child.material = new THREE.MeshStandardMaterial();
          }
          child.userData.isMaterialCloned = true;
        }

        // Just update the map property instead of recreating the MeshStandardMaterial
        if (child.material) {
          child.material.map = uvTex;
          child.material.roughness = 1.0;
          child.material.metalness = 0.0;
          child.material.needsUpdate = true;
        }

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
  }, [uvTex, clonedScene, isOversized, showSticker]);

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
        const g = data[i + 1];
        const b = data[i + 2];
        const v = Math.max(r, g, b);

        // High opacity for dense, solid cloud appearance
        const alpha = Math.min(255, v * 2.2);
        data[i + 3] = alpha;

        // Bright white color with original grayscale contours for depth
        const factor = 1.35;
        data[i] = Math.min(255, r * factor);
        data[i + 1] = Math.min(255, g * factor);
        data[i + 2] = Math.min(255, b * factor);
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
const ScrollingColumn = ({ items, direction = 'up', speed = 40, isEmpty = false, cardClassName = '', wrapRef, scrollTweenRef, revealLineRef }) => {
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
      {/* Black reveal line — sweeps across column before it appears */}
      {revealLineRef && (
        <div ref={revealLineRef} className={styles.revealLine} />
      )}
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
  const [activeTab, setActiveTab] = useState(null); // Keep no option active by default as requested
  const [activeContactType, setActiveContactType] = useState('instagram');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [connectName, setConnectName] = useState('');
  const [connectMessage, setConnectMessage] = useState('');
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const containerRef = useRef(null);

  const handlePhoneClick = () => {
    const textToCopy = '+919941292729';
    if (typeof window !== 'undefined') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            setShowCopiedToast(true);
            setTimeout(() => {
              setShowCopiedToast(false);
            }, 2000);
          })
          .catch((err) => {
            console.error('Failed to copy: ', err);
          });
      } else {
        // Safe Fallback copy method for non-HTTPS or non-secure local IP contexts
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.top = '0';
          textarea.style.left = '0';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (successful) {
            setShowCopiedToast(true);
            setTimeout(() => {
              setShowCopiedToast(false);
            }, 2000);
          }
        } catch (err) {
          console.error('Fallback copy failed: ', err);
        }
      }
    }
  };

  const validateIndianPhone = (formatted) => {
    // Strip space, then check exactly 10 digits starting with 6-9
    const digits = formatted.replace(/\s/g, '');
    return /^[6-9]\d{9}$/.test(digits);
  };

  const handlePhoneChange = (e) => {
    // Strip non-digits, cap at 10 raw digits, then insert space after 5th digit
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = raw.length > 5 ? raw.slice(0, 5) + ' ' + raw.slice(5) : raw;
    setPhoneNumber(formatted);
    setIsPhoneValid(validateIndianPhone(formatted));
  };

  // ─── Shirt Carousel State ───────────────────────────────────────────────
  const [activeShirtIdx, setActiveShirtIdx] = useState(0);
  const activeShirtIdxRef = useRef(0); // mirrored ref for use inside GSAP callbacks
  const carouselRunning = useRef(false);
  const carouselTlRef = useRef(null);
  const [isExplored, setIsExplored] = useState(false);
  const [activeFit, setActiveFit] = useState('oversized');

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

  // Refs for the physical folding screen panels
  const foldingLeftRef = useRef(null);
  const foldingRightRef = useRef(null);

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
  // Added .x for carousel slide-in/out transitions
  const shirtAnimState = useRef({
    y: -12,
    x: 0,
    sX: 1,
    sY: 1,
    sZ: 1,
    rotationY: Math.PI * 6
  });

  // Refs and state for manual drag-to-rotate interaction
  const shirtGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartRotationYRef = useRef(0);
  const targetRotationYRef = useRef(0); // target rotation Y for smooth lerped drag
  const resumeTimeoutRef = useRef(null);

  // Hover-to-pause rotation
  const isHoveringShirtRef = useRef(false);

  // Idle detection — hides UI after 3s of no cursor movement
  const idleTimeoutRef = useRef(null);
  const isIdleRef = useRef(false);
  const introCompleteRef = useRef(false); // only activate idle after intro finishes



  const handlePointerDown = (e) => {
    // Only drag with left click (button 0) or touches
    if (e.button !== undefined && e.button !== 0) return;

    // Don't drag during the cinematic intro sequence
    if (isIntroSpinning.current) return;

    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStartXRef.current = e.clientX;

    if (shirtGroupRef.current) {
      dragStartRotationYRef.current = targetRotationYRef.current || shirtGroupRef.current.rotation.y;
      targetRotationYRef.current = targetRotationYRef.current || shirtGroupRef.current.rotation.y;
    }

    // Pause the carousel timeline so it doesn't move or transition while user interactively rotates
    if (carouselTlRef.current) {
      carouselTlRef.current.pause();
    }

    // Clear any active resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartXRef.current;

    if (shirtGroupRef.current) {
      // 0.008 rad per pixel sensitivity for a responsive feel
      targetRotationYRef.current = dragStartRotationYRef.current + deltaX * 0.008;
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingState(false);

    // Resume auto-rotation after 3.5 seconds of user inactivity
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      if (carouselTlRef.current && carouselRunning.current) {
        carouselTlRef.current.play();
      }
    }, 3500);
  };

  // Set all intro elements to invisible immediately on mount
  useEffect(() => {
    const cols = [col1Ref.current, col2Ref.current, col4Ref.current, col5Ref.current].filter(Boolean);
    gsap.set(cols, { opacity: 0, filter: 'none' });
    gsap.set(centerFocusRef.current, { opacity: 0 });
    gsap.set(topNavRef.current, { opacity: 0, y: -32 });
    gsap.set(exploreButtonRef.current, { opacity: 0, y: 14 });
    gsap.set(canvasRef.current, { opacity: 0 });
    gsap.set([textSubRef.current, textMassiveRef.current], { opacity: 0 });
    gsap.set([vignetteTopRef.current, vignetteBottomRef.current], { scaleY: 0 }); // ensure collapsed on mount
    shirtSpeedRef.current = 0.005;
    isIntroSpinning.current = true;
    shirtAnimState.current = { y: -12, x: 0, sX: 1, sY: 1, sZ: 1, rotationY: Math.PI * 6 };
  }, []);

  // ─── Idle detection — hide UI when no cursor movement for 10s ───────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const goIdle = () => {
      if (!introCompleteRef.current || isIdleRef.current) return;
      isIdleRef.current = true;
      gsap.to(topNavRef.current, { opacity: 0, y: -14, duration: 0.6, ease: 'power2.inOut' });
      gsap.to(exploreButtonRef.current, { opacity: 0, y: 14, duration: 0.6, ease: 'power2.inOut' });
      gsap.to(vignetteTopRef.current, { scaleY: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(vignetteBottomRef.current, { scaleY: 0, duration: 0.8, ease: 'power2.inOut' });
    };

    const wakeUp = () => {
      if (!introCompleteRef.current) return; // don't reset idle timer during intro
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (isIdleRef.current) {
        isIdleRef.current = false;
        gsap.to(topNavRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.to(exploreButtonRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.to(vignetteTopRef.current, { scaleY: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to(vignetteBottomRef.current, { scaleY: 1, duration: 0.6, ease: 'power2.out' });
      }
      idleTimeoutRef.current = setTimeout(goIdle, 10000);
    };

    container.addEventListener('mousemove', wakeUp);
    container.addEventListener('pointerdown', wakeUp);
    container.addEventListener('touchstart', wakeUp, { passive: true });
    container.addEventListener('touchmove', wakeUp, { passive: true });
    return () => {
      container.removeEventListener('mousemove', wakeUp);
      container.removeEventListener('pointerdown', wakeUp);
      container.removeEventListener('touchstart', wakeUp);
      container.removeEventListener('touchmove', wakeUp);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // ─── Carousel step function ─────────────────────────────────────────────
  const runCarouselStep = useRef(null);
  runCarouselStep.current = () => {
    if (!carouselRunning.current) return;

    // At 60 fps, 0.008 rad/frame × 510 frames (8.5 s) ≈ 4.08 rad ≈ 233° of slow elegant rotation
    const SHOWCASE_SPEED = 0.008;  // rad/frame — slow, premium showcase speed
    const IDLE_SPIN_DURATION = 8.5;  // seconds — shows each shirt for 8 to 9 seconds
    const RAMP_UP_DURATION = 0.5;    // seconds — smooth acceleration into showcase spin
    const EXIT_DURATION = 0.45;   // normal exit slide duration
    const ENTER_DURATION = 0.6;    // normal enter slide duration
    const SLIDE_DISTANCE = 8.5;    // world-space units (ensures normal scale model clears the frame)

    const stepTl = gsap.timeline({
      onComplete: () => {
        if (carouselRunning.current) runCarouselStep.current();
      }
    });

    // 1. Showcase hold — user requested front view only, so no spin happens
    stepTl.to(shirtSpeedRef, {
      current: 0,
      duration: RAMP_UP_DURATION,
      ease: 'power2.inOut'
    });

    // 2. Hold — shirt stays in perfect front view
    stepTl.to({}, { duration: IDLE_SPIN_DURATION });

    // 3. Exit: slide out right directly without rotation
    stepTl.to(shirtSpeedRef, {
      current: 0,
      duration: EXIT_DURATION * 0.4,
      ease: 'power3.in'
    });
    stepTl.to(shirtAnimState.current, {
      x: SLIDE_DISTANCE,
      duration: EXIT_DURATION,
      ease: 'power3.in',
    }, '<');

    // 4. Snap to next shirt + teleport to left offscreen while hidden
    stepTl.call(() => {
      const nextIdx = (activeShirtIdxRef.current + 1) % SHIRT_CAROUSEL.length;
      activeShirtIdxRef.current = nextIdx;
      setActiveShirtIdx(nextIdx);
      shirtAnimState.current.x = -SLIDE_DISTANCE;
      shirtSpeedRef.current = 0; // enter without spinning
    });

    // 5. Enter: slide in from left with normal sliding
    stepTl.to(shirtAnimState.current, {
      x: 0,
      duration: ENTER_DURATION,
      ease: 'power3.out', // normal smooth deceleration slide-in
    });
    stepTl.to(shirtSpeedRef, {
      current: 0,
      duration: ENTER_DURATION,
      ease: 'power2.out'
    }, '<');

    carouselTlRef.current = stepTl;
  };

  // Cinematic intro sequence — fires once when splash completes
  useEffect(() => {
    const handler = () => {
      const cols = [col1Ref.current, col2Ref.current, col4Ref.current, col5Ref.current].filter(Boolean);
      const colTweens = [col1ScrollRef.current, col2ScrollRef.current, col4ScrollRef.current, col5ScrollRef.current].filter(Boolean);
      const colRefs = [col1Ref.current, col2Ref.current, col4Ref.current, col5Ref.current];

      const tl = gsap.timeline();

      // Establish global 3D perspective context on the grid parent
      gsap.set(containerRef.current, { perspective: 1200 });

      // Initialise: Columns start at opacity 0 with no 3D offset or filters
      colRefs.forEach((col) => {
        if (!col) return;
        gsap.set(col, {
          y: 0,
          z: 0,
          rotationX: 0,
          opacity: 0,
          filter: 'none',
        });
      });

      // Initialise Center Box folding panels (start at 0% width, slightly open in 3D)
      gsap.set(foldingLeftRef.current, {
        scaleX: 0,
        rotationY: 45,
        transformOrigin: 'left center',
        opacity: 0
      });
      gsap.set(foldingRightRef.current, {
        scaleX: 0,
        rotationY: -45,
        transformOrigin: 'right center',
        opacity: 0
      });

      // Initialise center container, canvas, and typography to hidden states
      gsap.set(centerFocusRef.current, { opacity: 0, scale: 0.94 });
      // Canvas starts grayscale so the shirt enters in B&W — no color until vignette phase
      gsap.set(canvasRef.current, { opacity: 0, filter: 'grayscale(1) brightness(0.9)' });
      gsap.set([textSubRef.current, textMassiveRef.current], {
        opacity: 0,
        y: 25,
        filter: 'blur(20px)' // start with a elegant 20px blur
      });

      // 1. Columns entrance animation (Elegant clean fade-in together)
      colRefs.forEach((col, i) => {
        const startT = 0.0; // All appear together simultaneously
        const tween = colTweens[i];

        if (col) {
          // Fade in smoothly
          tl.to(col, {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
          }, startT);
        }

        // Trigger infinite scrolling & deceleration on lock-in
        if (tween) {
          tl.call(() => {
            tween.timeScale(14);
          }, [], startT);

          tl.to(tween, {
            timeScale: 1,
            duration: 2.6,
            ease: 'power3.out',
          }, startT);
        }
      });

      // 2. Center Box fade-in (starts at 1.2s, right after columns finish fading in together)
      const centerStart = 1.2;

      // Reveal center column frame cleanly
      tl.to(centerFocusRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: 'power2.out',
      }, centerStart);

      // 3. T-shirt canvas fades in in grayscale — shirt rises & spins alone, no vignette competing
      tl.to(canvasRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, centerStart);
      // Note: canvas stays grayscale(1) until vignette phase — this isolates the WebGL render loop

      tl.call(() => {
        isIntroSpinning.current = true;
      }, [], centerStart);

      // Initialize the shirt rotation at a multiple-spin angle and lowered Y position so it rises from the bottom
      gsap.set(shirtAnimState.current, {
        rotationY: Math.PI * 6.0,
        y: -12,
        x: 0
      });

      // Shirt rises smoothly into a full front view (rotation Y goes to 0)
      tl.to(shirtAnimState.current, {
        rotationY: 0,
        y: 0,
        duration: 2.2,
        ease: 'power3.inOut',
      }, centerStart);

      tl.to(shirtSpeedRef, {
        current: 0,
        duration: 2.2,
        ease: 'power3.inOut',
        onComplete: () => {
          isIntroSpinning.current = false;
        },
      }, centerStart);

      // 4. Typography rises after shirt begins spinning
      const textStart = centerStart + 0.7;
      tl.to(textSubRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
      }, textStart);

      tl.to(textMassiveRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out',
      }, textStart + 0.35);

      // 5. Vignette starts AFTER shirt has fully settled (centerStart + 2.2s)
      //    Simultaneously: canvas transitions from grayscale to full color (GPU-composited, zero reflow)
      const vignetteStart = centerStart + 2.3;
      tl.to(vignetteTopRef.current, {
        scaleY: 1,
        duration: 1.2,
        ease: 'power3.out',
      }, vignetteStart);
      tl.to(vignetteBottomRef.current, {
        scaleY: 1,
        duration: 1.2,
        ease: 'power3.out',
      }, vignetteStart);

      // Shirt color reveal: grayscale → full color, synced with vignette (dramatic reveal moment)
      tl.to(canvasRef.current, {
        filter: 'grayscale(0) brightness(1)',
        duration: 1.0,
        ease: 'power2.inOut',
      }, vignetteStart);

      // Clear filters on side columns so they are clean and hoverable
      tl.call(() => {
        cols.forEach(col => gsap.set(col, { clearProps: 'filter' }));
      }, [], vignetteStart + 0.5);

      // Top navigation slides down
      tl.to(topNavRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.6,
        ease: 'power2.out',
      }, vignetteStart);

      tl.call(() => { setIsPeeking(true); }, [], vignetteStart);

      // Explore button slides up
      tl.to(exploreButtonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, vignetteStart + 0.2);

      // Peek compression after 5.0 seconds
      tl.call(() => { setIsPeeking(false); }, [], vignetteStart + 5.0);

      // Start the infinite product carousel loop
      tl.call(() => {
        carouselRunning.current = true;
        runCarouselStep.current();
      }, [], vignetteStart + 1.2);

      // Mark intro complete → activate idle listeners
      tl.call(() => {
        introCompleteRef.current = true;
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
          if (!isIdleRef.current) {
            isIdleRef.current = true;
            gsap.to(topNavRef.current, { opacity: 0, y: -14, duration: 0.6, ease: 'power2.inOut' });
            gsap.to(exploreButtonRef.current, { opacity: 0, y: 14, duration: 0.6, ease: 'power2.inOut' });
            gsap.to(vignetteTopRef.current, { scaleY: 0, duration: 0.8, ease: 'power2.inOut' });
            gsap.to(vignetteBottomRef.current, { scaleY: 0, duration: 0.8, ease: 'power2.inOut' });
          }
        }, 10000);
      }, [], vignetteStart + 1.7);
    };

    window.addEventListener('splashComplete', handler);
    return () => {
      window.removeEventListener('splashComplete', handler);
      carouselRunning.current = false;
      if (carouselTlRef.current) carouselTlRef.current.kill();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const selectedModelPath = activeFit === 'regular' 
    ? "/models/shirt_baked.glb" 
    : activeFit === 'polo' 
      ? "/models/classic_polo_baked.glb" 
      : "/models/oversized_tshirt.glb";

  const selectedScale = activeFit === 'regular' 
    ? 5.8 
    : activeFit === 'polo' 
      ? 5.8 
      : 5.7;

  const selectedPosition = activeFit === 'regular'
    ? [0, -0.7, 0]
    : activeFit === 'polo'
      ? [0, -0.7, 0]
      : [0, -6.5, 0];

  return (
    <div ref={containerRef} className={`${isDark ? styles.heroSectionDark : styles.heroSection} ${libreBaskerville.className} ${libreBaskerville.variable}`}>

      {/* Cinematic Vignette Divs — animated in by GSAP on splashComplete */}
      <div ref={vignetteTopRef} className={styles.vignetteTop} />
      <div ref={vignetteBottomRef} className={styles.vignetteBottom} />

      {/* ─── Top Center Navigation Bar (Floating above Vignettes) ─── */}
      <div ref={topNavRef} className={styles.topNavContainer}>
        <div className={styles.topNavGridWrapper}>
          <AnimatePresence mode="wait">
            {!isExplored ? (
              <motion.div 
                key="top-nav"
                className={styles.topNavCapsule}
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {/* Always-visible: logo mark + brand name */}
                <div className={styles.topNavLogoWrapper} onClick={() => setActiveTab(null)} style={{ cursor: 'pointer' }}>
                  <svg
                    viewBox="0 0 430 593"
                    className={styles.topNavLogoImg}
                    aria-label="Knight Wolf Logo"
                  >
                    <path d="M95.7916 208.421L172.729 269.321C172.729 269.321 173.464 258.689 172.729 251.921C168 208.375 85.6217 165.284 85.1795 166.009C84.7373 166.734 80.6694 174.056 67.9349 197.546C55.2003 221.036 55.5541 282.733 57.3228 310.646C59.0914 338.558 6.47318 367.92 16.2009 387.858C25.9287 407.795 57.3228 459.632 57.3228 459.632C57.3228 459.632 102.424 481.382 132.934 495.52C157.342 506.83 168.75 555.332 168.75 555.332C168.75 555.332 212.714 583.575 222 593C222 593 222.871 570.992 221.81 564.032C220.749 557.072 203.681 548.807 195.28 545.544C195.28 545.544 197.402 395.408 195.28 375.398C193.158 355.388 149.016 342.032 126.465 334.42C130.445 342.395 132.094 348.825 138.462 361.875C144.829 374.925 166.097 380.914 172.729 382.364L155.485 481.382C131.077 455.282 94.9072 445.857 79.8735 444.407L48.0372 387.858L89.159 314.996C68.996 265.406 85.1795 223.284 95.7916 208.421Z" fill="currentColor" />
                    <path d="M348.49 208.421L271.553 269.321C271.553 269.321 270.817 258.689 271.553 251.921C276.282 208.375 358.66 165.284 359.102 166.009C359.544 166.734 363.612 174.056 376.347 197.546C389.081 221.036 388.728 282.733 386.959 310.646C385.19 338.558 437.809 367.92 428.081 387.858C418.353 407.795 386.959 459.632 386.959 459.632C386.959 459.632 341.858 481.382 311.348 495.52C286.94 506.83 275.532 555.332 275.532 555.332C275.532 555.332 231.286 583.575 222 593C222 593 221.41 570.992 222.472 564.032C223.533 557.072 240.601 548.807 249.002 545.544C249.002 545.544 246.879 395.408 249.002 375.398C251.124 355.388 295.266 342.032 317.816 334.42C313.837 342.395 312.187 348.825 305.82 361.875C299.453 374.925 278.185 380.914 271.553 382.364L288.797 481.382C313.205 455.282 349.374 445.857 364.408 444.407L396.245 387.858L355.123 314.996C375.286 265.406 359.102 223.284 348.49 208.421Z" fill="currentColor" />
                    <path d="M260.332 82.1131C255.813 108.324 221.719 133.974 221.719 133.974C221.719 133.974 196.806 91.2368 151.549 133.974C106.292 176.711 49.4092 123.89 29.4794 92.6774C9.54968 61.4648 2.35282 19.848 0 0C1.93762 3.84155 12.0408 28.3314 29.4794 46.0986C46.9181 63.8658 66.8479 60.9846 66.8479 60.9846C66.8479 60.9846 46.0877 47.059 40.69 18.7276C42.3508 20.1681 62.1322 41.413 78.4734 46.0986C111.428 55.5478 130.528 25.1532 161.514 16.3266C192.5 7.5 269.04 31.6097 260.332 82.1131Z" fill="currentColor" />
                    <path d="M199.5 150.5L222 123V359L189.5 248L211.5 222C211.5 222 197.5 224 175 211.5C152.5 199 142.5 199 142.5 199L152 185C169.5 165.5 190.333 165 199.5 162V150.5Z" fill="currentColor" />
                    <path d="M244 150.5L221.5 123V359L254 248L232 222C232 222 246 224 268.5 211.5C291 199 301 199 301 199L291.5 185C274 165.5 253.167 165 244 162V150.5Z" fill="currentColor" />
                  </svg>
                  <span className={styles.topNavBrandName}>KnightWolf</span>
                </div>

                <div className={styles.topNavDivider} />

                {/* Navigation Tabs List */}
                <div className={styles.topNavTabsList}>
                  {/* Home Tab */}
                  <button
                    className={activeTab === null ? styles.navTabActive : styles.navTabInactive}
                    onClick={() => setActiveTab(null)}
                  >
                    {activeTab === null && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={styles.activeIndicatorBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Home size={16} className={styles.tabIcon} />
                    {activeTab === null && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.tabText}
                      >
                        HOME
                      </motion.span>
                    )}
                  </button>

                  {/* Connect Tab (About/Contact) */}
                  <button
                    className={activeTab === 'connect' ? styles.navTabActive : styles.navTabInactive}
                    onClick={() => setActiveTab('connect')}
                  >
                    {activeTab === 'connect' && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={styles.activeIndicatorBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Compass size={16} className={styles.tabIcon} />
                    {activeTab === 'connect' && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.tabText}
                      >
                        CONNECT
                      </motion.span>
                    )}
                  </button>

                  {/* Login Tab */}
                  <button
                    className={activeTab === 'login' ? styles.navTabActive : styles.navTabInactive}
                    onClick={() => setActiveTab('login')}
                  >
                    {activeTab === 'login' && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={styles.activeIndicatorBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <User size={16} className={styles.tabIcon} />
                    {activeTab === 'login' && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.tabText}
                      >
                        LOGIN
                      </motion.span>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="fits-switcher"
                className={styles.fitsSwitcherContainer}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              >
                <button 
                  className={`${styles.fitPill} ${activeFit === 'regular' ? styles.fitPillActive : styles.fitPillInactive}`}
                  onClick={() => setActiveFit('regular')}
                >
                  REGULAR T-SHIRT
                </button>
                <button 
                  className={`${styles.fitPill} ${activeFit === 'oversized' ? styles.fitPillActive : styles.fitPillInactive}`}
                  onClick={() => setActiveFit('oversized')}
                >
                  DROP SHOULDER
                </button>
                <button 
                  className={`${styles.fitPill} ${activeFit === 'polo' ? styles.fitPillActive : styles.fitPillInactive}`}
                  onClick={() => setActiveFit('polo')}
                >
                  POLO TEES
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Bottom White Explore Button (Floating above Vignettes) ─── */}
      {activeTab === null && (
        <div className={styles.bottomExploreButtonContainer}>
          <div className={styles.bottomExploreButtonGridWrapper}>
            <AnimatePresence mode="wait">
              {!isExplored ? (
                <motion.button 
                  key="explore"
                  ref={exploreButtonRef} 
                  className={styles.bottomExploreButton}
                  onClick={() => setIsExplored(true)}
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  Explore Collections
                </motion.button>
              ) : (
                <motion.button 
                  key="design"
                  className={styles.bottomExploreButton}
                  onClick={() => {
                    window.location.href = '/customize/configurator.html';
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                >
                  Design Your Tees
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}


      {/* ─── Living Gallery Grid ─── */}
      <main className={styles.galleryGrid}>
        {/* Left Side: Two Scrolling Columns */}
        <ScrollingColumn
          items={[
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-19-16-16-49.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-13-10-29.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-11-46-52.png' }
          ]}
          direction="up"
          speed={30}
          isEmpty={false}
          wrapRef={col1Ref}
          scrollTweenRef={col1ScrollRef}
        />
        <ScrollingColumn
          items={[
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-12-35-12.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-15-22-13.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-19-17-28-29.png' }
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
              {/* folding screen visual overlays for luxury door unified reveal */}
              <div ref={foldingLeftRef} className={styles.foldingLeft} />
              <div ref={foldingRightRef} className={styles.foldingRight} />

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



              <View
                className={styles.tripleView}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => {
                  handlePointerUp();
                  isHoveringShirtRef.current = false;
                }}
                onPointerEnter={() => {
                  if (!isIntroSpinning.current) {
                    isHoveringShirtRef.current = true;
                  }
                }}
                style={{ 
                  cursor: isDraggingState ? 'grabbing' : 'grab', 
                  touchAction: 'none',
                  transform: isExplored ? 'translateY(-120px)' : 'translateY(0px)',
                  transition: 'transform 2.2s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
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

                  {/* Hero T-shirt Carousel — cycles through SHIRT_CAROUSEL variants */}
                  <RotatingGroup
                    ref={shirtGroupRef}
                    delay={0}
                    speedRef={shirtSpeedRef}
                    isIntroRef={isIntroSpinning}
                    animStateRef={shirtAnimState}
                    isDraggingRef={isDraggingRef}
                    hoverPauseRef={isHoveringShirtRef}
                    targetRotationYRef={targetRotationYRef}
                    mode="spin"
                  >
                    <ModelPreview
                      color={customStyleConfig?.shirtColor || SHIRT_CAROUSEL[activeShirtIdx].color}
                      modelPath={selectedModelPath}
                      showSticker={SHIRT_CAROUSEL[activeShirtIdx].showSticker}
                      scale={selectedScale}
                      position={selectedPosition}
                      rotation={[0, 0, 0]}
                    />
                  </RotatingGroup>

                  {/* Volumetric cloud system strictly under the T-shirt hem */}
                  <CloudEffect />

                  {/* Shared shadows aligned with the new T-shirt floor */}
                  <ContactShadows position={[0, -6.8, 0]} opacity={0.5} scale={20} blur={3} far={4} />
                </Suspense>
              </View>

            </div>
          </div>
        </div>

        {/* Right Side: Two Scrolling Columns */}
        <ScrollingColumn
          items={[
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-11-53-36.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-12-10-01.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-13-10-10.png' }
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
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-14-34-07.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-15-06-28.png' },
            { bgColor: '#141414', img: '/box/PHOTO-2026-08-20-16-50-43.png' }
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
          shadows={false}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      </div>

      {/* ─── Center Column Pop-Up Modals (Stacked above 3D WebGL Canvas) ─── */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={styles.modalOverlay}
          >
            <div className={styles.modalOverlayCenter}>
              <AnimatePresence mode="wait">
                {activeTab === 'connect' && (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className={styles.modalCard}
                  >
                    <label className={styles.modalLabel}>about us</label>
                    <p className={styles.modalText}>
                      We design heavy-engineered premium modern streetwear. Combining raw cyber culture aesthetics with premium canvas comfort fitments.
                    </p>

                    {/* Horizontal Divider Line */}
                    <div className={styles.modalDivider} />

                    <label className={styles.modalLabel}>name</label>
                    <input
                      type="text"
                      placeholder="your name..."
                      className={styles.modalInput}
                      value={connectName}
                      onChange={(e) => setConnectName(e.target.value)}
                    />

                    <label className={styles.modalLabel}>message</label>
                    <textarea
                      placeholder="your inquiry or message..."
                      rows="3"
                      className={styles.modalTextarea}
                      value={connectMessage}
                      onChange={(e) => setConnectMessage(e.target.value)}
                    />
                    
                    <button className={styles.modalActionBtn}>send message</button>

                    {/* Horizontal Divider Line */}
                    <div className={styles.modalDivider} />

                    <label className={styles.modalLabel}>contact us</label>

                    {/* Contact Links (Style 05: Neon Hologram Glow) */}
                    <div className={styles.iconRow}>
                      <button
                        onClick={() => window.open('https://instagram.com/knightwolf.shop', '_blank')}
                        onMouseEnter={() => setHoveredIcon('instagram')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        className={`${styles.iconBtn} ${styles.btnInsta}`}
                      >
                        <svg
                          width="25" height="25" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <circle cx="12" cy="12" r="4"/>
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                        </svg>
                        <AnimatePresence>
                          {hoveredIcon === 'instagram' && (
                            <div className={styles.tooltipWrapper}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className={styles.iconTooltip}
                              >
                                @knightwolf.shop
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </button>

                      <button
                        onClick={() => window.open('https://wa.me/919941292729', '_blank')}
                        onMouseEnter={() => setHoveredIcon('whatsapp')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        className={`${styles.iconBtn} ${styles.btnWa}`}
                      >
                        <svg
                          width="25" height="25" viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.704 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <AnimatePresence>
                          {hoveredIcon === 'whatsapp' && (
                            <div className={styles.tooltipWrapper}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className={styles.iconTooltip}
                              >
                                +91 99412 92729
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </button>

                      <button
                        onClick={() => window.location.href = 'mailto:hello.knightwolf@gmail.com'}
                        onMouseEnter={() => setHoveredIcon('email')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        className={`${styles.iconBtn} ${styles.btnMail}`}
                      >
                        <Mail size={25} />
                        <AnimatePresence>
                          {hoveredIcon === 'email' && (
                            <div className={styles.tooltipWrapper}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className={styles.iconTooltip}
                              >
                                hello.knightwolf@gmail.com
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </button>

                      <button
                        onClick={() => {
                          handlePhoneClick();
                          window.location.href = 'tel:+919941292729';
                        }}
                        onMouseEnter={() => setHoveredIcon('phone')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        className={`${styles.iconBtn} ${styles.btnPhone}`}
                      >
                        <svg
                          width="25" height="25" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 .18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                        </svg>
                        <AnimatePresence>
                          {hoveredIcon === 'phone' && (
                            <div className={styles.tooltipWrapper}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className={styles.iconTooltip}
                              >
                                +91 99412 92729
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCopiedToast && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={styles.copiedToast}
                        >
                          COPIED
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {activeTab === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className={styles.modalCard}
                  >
                    <h2 className={styles.modalTitle}>join the wolfpack</h2>
                    <p className={styles.modalSubtitle}>enter your number to unlock early access drops</p>

                    <label className={styles.modalLabel}>Phone number</label>
                    <div className={styles.phoneInputRow}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        maxLength={11}
                        className={styles.phoneDigitInput}
                        autoComplete="tel-national"
                      />
                    </div>
                    
                    <button
                      disabled={!isPhoneValid}
                      className={`${styles.modalActionBtn} ${!isPhoneValid ? styles.btnDisabled : ''}`}
                    >
                      authenticate
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
