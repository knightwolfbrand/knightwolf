import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// --- CONFIGURATION & STATE ---
const STATE = {
    color: '#949494',
    loaded: false,
    modelStyle: 'regular',
    fabricStyle: 'structured',
    stickerImage: null,      // raw HTMLImageElement of chosen sticker
    stickerZone: 'front',    // 'front' | 'back' | 'left' | 'right'
    stickerScale: 0.15,      // Ultra-minimalist logo size
};


// ─── COLORS ──────────────────────────────────────────────────────────────────
const COLORS = {
    '#949494': { roughness: 0.95, metalness: 0.0 },
    '#050505': { roughness: 0.95, metalness: 0.0 },
    '#1a1a1a': { roughness: 0.95, metalness: 0.0 },
    '#f5f5f5': { roughness: 0.92, metalness: 0.0 },
    '#00d2ff': { roughness: 0.90, metalness: 0.0 },
};

// ─── MODEL CONFIGS ────────────────────────────────────────────────────────────
const MODEL_CONFIGS = {
    regular:   { 
        url: '/models/Tshirt2.glb', 
        uvCenter: { cx: 0.25, cy: 0.68 },
        uvBack:   { cx: 0.75, cy: 0.68 }, // Calibrated Back Center
        isFlipped: true 
    },
    oversized: { 
        url: '/models/oversized_tshirt.glb', 
        uvCenter: { cx: 0.30, cy: 0.45 },
        uvBack:   { cx: 0.74, cy: 0.45 }, // Calibrated Back Center
        aspectY: 1.25,
        isFlipped: true
    },
};

// ─── SCENE ───────────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 4, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// ─── ORBIT CONTROLS ───────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 9;
controls.maxDistance = 22;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.75;
controls.update();


// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
const texLoader = new THREE.TextureLoader();

// Floor
const woodTexture = texLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(4, 4);
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.85, metalness: 0.0 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.25;
floor.receiveShadow = true;
scene.add(floor);

// Walls
function createWallTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 512, 0, 0);
    g.addColorStop(0, '#050505'); g.addColorStop(1, '#1c1c1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
}
const wallMat = new THREE.MeshStandardMaterial({ map: createWallTexture(), roughness: 0.98, metalness: 0.0 });
const wallGeo = new THREE.PlaneGeometry(30, 20);
[{pos:[0,8.75,-15],ry:0},{pos:[0,8.75,15],ry:Math.PI},{pos:[-15,8.75,0],ry:Math.PI/2},{pos:[15,8.75,0],ry:-Math.PI/2}]
.forEach(({pos,ry}) => {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.position.set(...pos); w.rotation.y = ry; w.receiveShadow = true; scene.add(w);
});

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(4, 8, 10); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.bias = -0.001; keyLight.shadow.radius = 6;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
fillLight.position.set(-8, 3, 6); scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 6, -12); scene.add(rimLight);

// ─── FABRIC TEXTURE GENERATORS ───────────────────────────────────────────────
function createFabricTex(size, drawFn) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d'); drawFn(ctx, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

const FABRIC_MAPS = {
    structured: {
        normal: null, roughness: null, repeat: 50, normalScale: 1.2,
        _makeNormal: (s) => createFabricTex(s, (ctx,s) => {
            ctx.fillStyle='#8080ff'; ctx.fillRect(0,0,s,s);
            for(let x=0;x<s;x+=8){ctx.fillStyle='#9090ff';ctx.fillRect(x,0,4,s);}
        }),
        _makeRoughness: (s) => createFabricTex(s, (ctx,s) => { ctx.fillStyle='#f5f5f5'; ctx.fillRect(0,0,s,s); })
    }
};

function ensureFabricMaps(style) {
    const cfg = FABRIC_MAPS[style] || FABRIC_MAPS.structured;
    if (!cfg.normal) {
        cfg.normal = cfg._makeNormal(128);
        cfg.normal.repeat.set(cfg.repeat, cfg.repeat);
        cfg.normal.anisotropy = 4;
    }
    if (!cfg.roughness) {
        cfg.roughness = cfg._makeRoughness(128);
        cfg.roughness.repeat.set(cfg.repeat, cfg.repeat);
    }
    return cfg;
}

// ─── UV CANVAS STICKER SYSTEM ────────────────────────────────────────────────
// The shirt material uses a 1024×1024 canvas as its .map texture.
// We paint the base fabric colour + sticker directly onto this canvas.
// No 3D projection needed — works on every model.

const UV_SIZE = 2048; // Doubled resolution for crisp stickers
const uvCanvas = document.createElement('canvas');
uvCanvas.width = uvCanvas.height = UV_SIZE;
const uvCtx = uvCanvas.getContext('2d');
const uvTexture = new THREE.CanvasTexture(uvCanvas);
uvTexture.colorSpace = THREE.SRGBColorSpace;
uvTexture.flipY = false;
uvTexture.anisotropy = 16; // Max sharpness for fabric details
uvTexture.minFilter = THREE.LinearMipmapLinearFilter;
uvTexture.magFilter = THREE.LinearFilter;
uvTexture.wrapS = uvTexture.wrapT = THREE.ClampToEdgeWrapping; // Ensure no tiling/repetition

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${r},${g},${b})`;
}

// ─── BACKGROUND REMOVAL ──────────────────────────────────────────────────────
// Flood-fills from all 4 corners, removes any solid background colour,
// returns a new canvas with the background made transparent.
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

    // Sample background colour from all 4 corners
    const bgR = data[0], bgG = data[1], bgB = data[2];
    const TOL = 55; // Increased tolerance for cleaner background removal

    [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(([x,y]) => {
        const idx = y*W+x;
        if (!visited[idx]) { visited[idx]=1; queue.push(x,y); }
    });

    let head = 0;
    while (head < queue.length) {
        const x = queue[head++], y = queue[head++];
        const pos = (y*W+x)*4;
        const diff = Math.abs(data[pos]-bgR)+Math.abs(data[pos+1]-bgG)+Math.abs(data[pos+2]-bgB);
        if (diff < TOL) {
            data[pos+3] = 0; // make transparent
            for (const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
                if (nx>=0&&nx<W&&ny>=0&&ny<H) {
                    const nIdx = ny*W+nx;
                    if (!visited[nIdx]) { visited[nIdx]=1; queue.push(nx,ny); }
                }
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return c; // return processed canvas (can be drawn like an image)
}

function repaintStickerCanvas() {
    // 1. Fill base colour
    uvCtx.fillStyle = hexToRgb(STATE.color);
    uvCtx.fillRect(0, 0, UV_SIZE, UV_SIZE);

    // 2. Draw sticker if one is selected
    if (STATE.stickerImage) {
        const cfg = MODEL_CONFIGS[STATE.modelStyle];
        // Select coordinates based on Front or Back zone
        const uv = (STATE.stickerZone === 'front') ? cfg.uvCenter : cfg.uvBack;
        
        const stickerSize = Math.round(UV_SIZE * STATE.stickerScale);
        const aspectY = cfg.aspectY || 1.0;
        const cleanSticker = removeBackground(STATE.stickerImage);

        const sx = Math.round(uv.cx * UV_SIZE);
        const sy = Math.round(uv.cy * UV_SIZE);

        uvCtx.save();
        uvCtx.translate(sx, sy);

        // Apply orientation correction if the model has inverted UVs
        if (cfg.isFlipped) {
            uvCtx.scale(1, -1);
        }

        // Draw centered on the target UV point with aspect ratio correction
        uvCtx.drawImage(
            cleanSticker, 
            -stickerSize / 2, 
            -(stickerSize * aspectY) / 2, 
            stickerSize, 
            stickerSize * aspectY
        );
        uvCtx.restore();
    }

    // 3. Tell Three.js the texture changed
    uvTexture.needsUpdate = true;
}

// ─── MATERIAL FACTORY ────────────────────────────────────────────────────────
function makeFabricMaterial() {
    const cfg = ensureFabricMaps(STATE.fabricStyle);
    // Start with a fresh canvas paint
    repaintStickerCanvas();
    const mat = new THREE.MeshPhysicalMaterial({
        map:          uvTexture,      // UV-painted canvas drives colour + sticker
        roughness:    0.98,
        metalness:    0.0,
        side:         THREE.FrontSide,
        normalMap:    cfg.normal,
        roughnessMap: cfg.roughness,
        sheen:        1.0,
        sheenRoughness: 0.8,
        sheenColor:   new THREE.Color(0xffffff),
    });
    mat.normalScale.set(cfg.normalScale, cfg.normalScale);
    return mat;
}

// ─── MODEL LOADING ────────────────────────────────────────────────────────────
let tshirtModel = null;
const loader = new GLTFLoader();

function fitModel(model, targetHeight) {
    const box1 = new THREE.Box3().setFromObject(model);
    const size1 = new THREE.Vector3(); box1.getSize(size1);
    model.scale.multiplyScalar(targetHeight / size1.y);
    const box2 = new THREE.Box3().setFromObject(model);
    const center2 = new THREE.Vector3(); box2.getCenter(center2);
    model.position.x -= center2.x;
    model.position.z -= center2.z;
    model.position.y  = 4.0 - center2.y;
}

function applyMaterialToModel() {
    if (!tshirtModel) return;
    console.log("--- Applying Material to Meshes ---");
    const mat = makeFabricMaterial();
    tshirtModel.traverse(child => {
        if (child.isMesh) {
            console.log("Found Mesh:", child.name);
            child.castShadow    = true;
            child.receiveShadow = false;
            child.material = mat;
        }
    });
}

function loadModel(style) {
    if (tshirtModel) { scene.remove(tshirtModel); tshirtModel = null; }
    loader.load(
        MODEL_CONFIGS[style].url,
        (gltf) => {
            tshirtModel = gltf.scene;
            fitModel(tshirtModel, 9.0);
            applyMaterialToModel();
            scene.add(tshirtModel);
        },
        undefined,
        err => console.error('Model load error:', err)
    );
}

// ─── INITIAL LOAD ─────────────────────────────────────────────────────────────
(function initialLoad() {
    loader.load(
        MODEL_CONFIGS.regular.url,
        (gltf) => {
            tshirtModel = gltf.scene;
            fitModel(tshirtModel, 9.0);
            applyMaterialToModel();
            scene.add(tshirtModel);
            STATE.loaded = true;

            const el = document.getElementById('loader');
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
            setTimeout(() => { el.style.display = 'none'; }, 500);
        },
        undefined,
        err => {
            console.error(err);
            document.querySelector('.loader-text').innerText = 'ERROR. PLEASE REFRESH.';
        }
    );
})();

// ─── UPDATE COLOUR ────────────────────────────────────────────────────────────
function updateColor(hex) {
    STATE.color = hex;
    repaintStickerCanvas(); // Re-paint canvas with new base colour
}

// ─── PRELOAD STICKER IMAGES ───────────────────────────────────────────────────
// We load them as HTMLImageElements (not THREE textures) so we can drawImage()
const stickerImages = {};
const STICKER_SRCS = {
    logo:       '/images/logo.png',
    wolf:       '/images/sticker_wolf.png',
    bolt:       '/images/sticker_bolt.png',
    sacrifice:  '/images/sticker_sacrifice.png',
    justdoit:   '/images/sticker_justdoit.png',
    realistic:  '/images/sticker_realistic.png',
    risktakers: '/images/sticker_risktakers.png',
    art1:       '/images/PHOTO-2026-05-05-23-58-49.png',
    art2:       '/images/PHOTO-2026-05-05-23-59-10.png',
    art3:       '/images/PHOTO-2026-05-06-00-00-01.png',
    art4:       '/images/PHOTO-2026-05-06-00-00-28.png',
    art5:       '/images/PHOTO-2026-05-06-00-02-47.png',
    art6:       '/images/PHOTO-2026-05-06-00-03-52.png',
    art7:       '/images/PHOTO-2026-05-06-00-05-23.png',
};
Object.entries(STICKER_SRCS).forEach(([key, src]) => {
    const img = new Image();
    // No crossOrigin needed — images are same-origin local files
    img.onload = () => {
        stickerImages[key] = img;
        console.log(`✅ Sticker loaded: ${key}`);
    };
    img.onerror = () => console.error(`❌ Sticker failed to load: ${src}`);
    img.src = src;
});

function applySticker(key) {
    if (!stickerImages[key]) { console.warn('Sticker image not loaded yet:', key); return; }
    STATE.stickerImage = stickerImages[key];
    repaintStickerCanvas();
}

function applyCustomSticker(imgEl) {
    STATE.stickerImage = imgEl;
    repaintStickerCanvas();
}

// ─── UI EVENT LISTENERS ──────────────────────────────────────────────────────

// Toggle sticker panel
document.getElementById('toggle-stickers').addEventListener('click', () => {
    const grid = document.getElementById('sticker-grid');
    const isHidden = grid.classList.toggle('hidden');
    document.getElementById('toggle-stickers').querySelector('.btn-icon').innerText = isHidden ? '+' : '-';
});

// Sticker buttons
document.querySelectorAll('.sticker-opt').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sticker-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applySticker(btn.dataset.sticker);
    });
});

// Zone switching (Front/Back)
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;
        STATE.stickerZone = zone;

        // Update UI
        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Natural Orbital Swivel (arcs around the shirt instead of zooming through it)
        const targetAngle = (zone === 'front') ? 0 : Math.PI; // 0 for front, 180 degrees for back
        const distance = 18;
        
        // We animate a dummy object to handle the arc calculation
        const proxy = { angle: (zone === 'front') ? Math.PI : 0 }; 
        gsap.to(proxy, {
            angle: targetAngle,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.position.x = Math.sin(proxy.angle) * distance;
                camera.position.z = Math.cos(proxy.angle) * distance;
                camera.position.y = 4;
                controls.update();
            }
        });

        repaintStickerCanvas();
    });
});

// Sticker size slider
// View buttons removed — user rotates freely with mouse

// Sticker size slider
document.getElementById('sticker-resize').addEventListener('input', (e) => {
    STATE.stickerScale = parseFloat(e.target.value);
    repaintStickerCanvas();
});

// Color swatches
document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        btn.classList.add('active');
        updateColor(btn.dataset.color);
    });
});

// Model style (Regular / Oversized)
document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.modelStyle = btn.dataset.style;
        loadModel(btn.dataset.style);
        controls.target.set(0, 4.0, 0);
        controls.update();
    });
});

// Custom image upload
const uploadInput = document.getElementById('custom-sticker-upload');
document.getElementById('trigger-upload').addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            document.querySelectorAll('.sticker-opt').forEach(b => b.classList.remove('active'));
            applyCustomSticker(img);
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
console.log('Knight Wolf Configurator v4.0 — UV Canvas Mode');
