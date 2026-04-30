import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// --- CONFIGURATION & STATE ---
const STATE = {
    color: '#888888',
    sticker: null,
    stickerScale: 2.8,
    loaded: false,
    modelStyle: 'regular' // 'regular' | 'oversized'
};

// Matte fabric colors — zero metalness, high roughness
const COLORS = {
    '#888888': { roughness: 0.95, metalness: 0.0 },
    '#050505': { roughness: 0.95, metalness: 0.0 },
    '#1a1a1a': { roughness: 0.95, metalness: 0.0 },
    '#f5f5f5': { roughness: 0.92, metalness: 0.0 },
    '#00d2ff': { roughness: 0.90, metalness: 0.0 }
};

// Model configs — each points to its own GLB
const MODEL_CONFIGS = {
    regular: {
        url: 'https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/main/client/public/shirt_baked.glb',
        scale: [6.5, 6.5, 6.5],
        position: [0, 4.0, 0],
        stickerPos: [0, 4.15, 0.5],
        stickerDepth: 1.2    // shallow enough to not project through to the back
    },
    oversized: {
        url: '/models/oversized_tshirt.glb',
        scale: [0.028, 0.028, 0.028],   // auto-adjusts after fitModel()
        position: [0, 0, 0],
        stickerPos: [0, 5.2, 0.5],     // Centered on the chest (y=5.2)
        stickerDepth: 1.2              // Deep enough to wrap the boxy fit
    }
};

// --- SCENE SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 4, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// ACESFilmic gives natural color rolloff so fabric stays rich
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; 
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// --- ORBIT CONTROLS (smooth, limited zoom) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 3;    // allow zooming in close enough to see fabric detail
controls.maxDistance = 22;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.75;
controls.zoomSpeed = 0.4;
controls.rotateSpeed = 1.2;
controls.update();

// --- DRESSING ROOM ENVIRONMENT ---
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
floor.receiveShadow = true;  // catches the shirt's cast shadow on the floor
scene.add(floor);

// Walls (charcoal gradient)
function createWallTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 512, 0, 0);
    g.addColorStop(0, '#050505');
    g.addColorStop(1, '#1c1c1c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
}
const wallTex = createWallTexture();
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.98, metalness: 0.0 });
const wallGeo = new THREE.PlaneGeometry(30, 20);
[
    { pos: [0, 8.75, -15], ry: 0 },
    { pos: [0, 8.75,  15], ry: Math.PI },
    { pos: [-15, 8.75, 0], ry:  Math.PI / 2 },
    { pos: [ 15, 8.75, 0], ry: -Math.PI / 2 },
].forEach(({ pos, ry }) => {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.position.set(...pos);
    w.rotation.y = ry;
    w.receiveShadow = true;
    scene.add(w);
});

// --- LIGHTING — Form Depth without self-shadow ---
// Key insight: The T-shirt has receiveShadow = false, so it NEVER receives
// shadows ON itself. Depth/form comes purely from normal-based shading.
// The shirt casts its shadow on the floor only (looks professional).

// Soft ambient base — keeps the dark side from going pitch black
scene.add(new THREE.AmbientLight(0xffffff, 1.4));

// Key Light — front-top-right. This is what creates the 3D form highlights.
// Because shirt has receiveShadow=false, this light only shades via normals.
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(4, 8, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width  = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.camera.near   = 1;
keyLight.shadow.camera.far    = 40;
keyLight.shadow.bias          = -0.001;
keyLight.shadow.radius        = 6; // soft shadow edge on the floor
scene.add(keyLight);

// Fill Light — left side, counters the key without flattening
const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
fillLight.position.set(-8, 3, 6);
scene.add(fillLight);

// Rim Light — from behind, creates the bright outline that separates
// the shirt's silhouette from the dark background (premium look)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 6, -12);
scene.add(rimLight);
// --- ASSETS ---
let tshirtModel = null;
let tshirtMesh = null;    // the mesh we project decals onto
let logoMesh = null;
const loader = new GLTFLoader();
const stickerTextures = {};

// Picks the mesh with the most vertices (the main body, not collar/label)
function findMainMesh(gltfScene) {
    let best = null;
    let bestCount = 0;
    gltfScene.traverse(child => {
        if (child.isMesh) {
            const count = child.geometry.attributes.position.count;
            if (count > bestCount) { bestCount = count; best = child; }
        }
    });
    return best;
}

// Auto-fit a loaded model to a target height and snap it to the SAME
// visual center as the regular tee (y = 4.0) so the camera framing
// never changes when the user switches fit styles.
function fitModel(model, targetHeight) {
    // 1. Scale to target height
    const box1 = new THREE.Box3().setFromObject(model);
    const size1 = new THREE.Vector3();
    box1.getSize(size1);
    const fitScale = targetHeight / size1.y;
    model.scale.multiplyScalar(fitScale);

    // 2. Re-measure after scale
    const box2 = new THREE.Box3().setFromObject(model);
    const center2 = new THREE.Vector3();
    box2.getCenter(center2);

    // 3. Center X/Z, then lift so the model centre sits at y = 4.0
    //    (same visual position the regular tee occupies)
    model.position.x -= center2.x;
    model.position.z -= center2.z;
    model.position.y  = 4.0 - center2.y;  // centre of model at y=4.0
}

// Flood-Fill background removal — removes only the outer background, preserves internal pixels
function processTexture(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const W = canvas.width;
    const H = canvas.height;

    const visited = new Uint8Array(W * H);
    const queue = [];

    // Seed from all four corners
    [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(([x,y]) => {
        const idx = y * W + x;
        if (!visited[idx]) { visited[idx] = 1; queue.push(x, y); }
    });

    const bgR = data[0], bgG = data[1], bgB = data[2];
    const TOL = 20; // tight tolerance — only removes background, not artwork edges

    let head = 0;
    while (head < queue.length) {
        const x = queue[head++];
        const y = queue[head++];
        const pos = (y * W + x) * 4;
        const r = data[pos], g = data[pos+1], b = data[pos+2];
        const diff = Math.abs(r-bgR) + Math.abs(g-bgG) + Math.abs(b-bgB);
        if (diff < TOL) {
            data[pos+3] = 0;
            for (const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
                if (nx>=0 && nx<W && ny>=0 && ny<H) {
                    const nIdx = ny*W+nx;
                    if (!visited[nIdx]) { visited[nIdx]=1; queue.push(nx,ny); }
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
}

// Preload all sticker textures
texLoader.load('/images/logo.png',              img => { stickerTextures.logo      = processTexture(img.image); });
texLoader.load('/images/sticker_wolf.png',      img => { stickerTextures.wolf      = processTexture(img.image); });
texLoader.load('/images/sticker_bolt.png',      img => { stickerTextures.bolt      = processTexture(img.image); });
texLoader.load('/images/sticker_sacrifice.png', img => { stickerTextures.sacrifice = processTexture(img.image); });
texLoader.load('/images/sticker_justdoit.png',  img => { stickerTextures.justdoit  = processTexture(img.image); });
texLoader.load('/images/sticker_realistic.png', img => { stickerTextures.realistic = processTexture(img.image); });

// ---------------------------------------------------------------------------
// TERRY COTTON FABRIC TEXTURES — generated procedurally, no external files
// ---------------------------------------------------------------------------
// JERSEY COTTON FABRIC TEXTURES (Standard T-Shirt Fabric)
// ---------------------------------------------------------------------------

// 1. Normal Map — Microscopic Jersey Weave
//    Simulates the tiny 'V' shape interlocking threads of cotton jersey.
// JERSEY COTTON — VERTICAL MICRO-RIB normal map
// Fine vertical columns simulate the warp threads of real cotton jersey.
// Tiled very densely so individual ribs are microscopic (realistic scale).
function generateCottonNormalMap() {
    const SIZE = 128; // small tile, tiled densely
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    // Base: flat normal (128,128,255)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const RIB_W = 3;   // px width of each rib column
    const GAP   = 1;   // px gap (valley) between ribs
    const PITCH  = RIB_W + GAP; // total cycle = 4px

    for (let x = 0; x < SIZE; x++) {
        const phase = x % PITCH;
        let r, g, b;

        if (phase === 0) {
            // Left slope of rib — normal tilts right
            r = 148; g = 128; b = 255;
        } else if (phase === 1) {
            // Rib peak — normal points straight forward (brightest)
            r = 138; g = 128; b = 255;
        } else if (phase === 2) {
            // Rib peak continues
            r = 128; g = 128; b = 255;
        } else {
            // Gap/valley — normal tilts left (shadow side)
            r = 108; g = 128; b = 235;
        }

        // Draw the full vertical column
        for (let y = 0; y < SIZE; y++) {
            // Add tiny horizontal micro-noise for organic cotton feel
            const noise = Math.floor((Math.random() - 0.5) * 6);
            ctx.fillStyle = `rgb(${r+noise},${g},${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(80, 80); // Finer ribbing for ultra-realistic detail
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
}

// 2. Roughness Map — Soft, matte cotton feel
function generateCottonRoughnessMap() {
    const SIZE = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    // High roughness base for matte cotton
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Micro-noise for organic feel
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = 230 + Math.floor(Math.random() * 25);
        imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = v;
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    return tex;
}

// Generate once
const cottonNormalMap    = generateCottonNormalMap();
const cottonRoughnessMap = generateCottonRoughnessMap();

// ---------------------------------------------------------------------------
// Shared material factory — MeshPhysicalMaterial for premium "Depth"
// ---------------------------------------------------------------------------
function makeFabricMaterial(color) {
    const mat = new THREE.MeshPhysicalMaterial({
        color:        new THREE.Color(color),
        roughness:    0.95,
        metalness:    0.0,
        side:         THREE.DoubleSide,
        
        // Jersey cotton textures
        normalMap:    cottonNormalMap,
        roughnessMap: cottonRoughnessMap,

        // SHEEN: Essential for fabric depth.
        sheen: 0.6,
        sheenRoughness: 0.9,
        sheenColor: new THREE.Color(0xffffff),

        // Clear any baked GLB maps
        map:         null,
        aoMap:       null,
        metalnessMap: null,
        emissiveMap: null,
    });
    // Normal scale for tactile feel
    mat.normalScale.set(1.4, 1.4); 
    return mat;
}

// Loads a model by style key, tears down the previous one first
function loadModel(style) {
    const cfg = MODEL_CONFIGS[style];

    // Remove current model + decal
    if (logoMesh) { scene.remove(logoMesh); logoMesh.geometry.dispose(); logoMesh.material.dispose(); logoMesh = null; }
    if (tshirtModel) { scene.remove(tshirtModel); tshirtModel = null; tshirtMesh = null; }

    loader.load(
        cfg.url,
        (gltf) => {
            tshirtModel = gltf.scene;

            if (style === 'regular') {
                tshirtModel.scale.set(...cfg.scale);
                tshirtModel.position.set(...cfg.position);
            } else {
                // Fit to same visual height as regular tee, centre at y=4.0
                fitModel(tshirtModel, 9.0);
            }

            tshirtMesh = findMainMesh(tshirtModel);

            tshirtModel.traverse(child => {
                if (child.isMesh) {
                    child.castShadow    = true;  // shirt casts shadow on the floor
                    child.receiveShadow = false; // shirt NEVER receives shadows on itself
                    child.material = makeFabricMaterial(STATE.color);
                }
            });

            scene.add(tshirtModel);

            // Re-apply active sticker to new mesh geometry
            if (STATE.sticker && STATE.loaded) {
                setTimeout(() => applySticker(STATE.sticker, true), 80);
            }
        },
        undefined,
        err => console.error('Model load error:', err)
    );
}

// Initial load — regular model with splash screen
(function initialLoad() {
    loader.load(
        MODEL_CONFIGS.regular.url,
        (gltf) => {
            tshirtModel = gltf.scene;
            tshirtModel.scale.set(...MODEL_CONFIGS.regular.scale);
            tshirtModel.position.set(...MODEL_CONFIGS.regular.position);
            tshirtMesh = findMainMesh(tshirtModel);
            tshirtModel.traverse(child => {
                if (child.isMesh) {
                    child.castShadow    = true;  // shirt casts shadow on the floor
                    child.receiveShadow = false; // shirt NEVER receives shadows on itself
                    child.material = makeFabricMaterial(STATE.color);
                }
            });
            scene.add(tshirtModel);

            const start = Date.now();
            const msgs = ['INITIALIZING RENDER ENGINE...', 'LOADING FABRIC GEOMETRY...', 'CALIBRATING SHADERS...', 'FINALIZING...'];
            let mi = 0;
            const t = setInterval(() => { if (mi < msgs.length) document.querySelector('.loader-text').innerText = msgs[mi++]; }, 1000);
            const check = () => {
                if (Date.now() - start >= 4000) {
                    clearInterval(t);
                    const el = document.getElementById('loader');
                    el.style.transition = 'opacity 0.5s ease';
                    el.style.opacity = '0';
                    setTimeout(() => { el.style.display = 'none'; STATE.loaded = true; }, 500);
                } else setTimeout(check, 100);
            };
            check();
        },
        undefined,
        err => { console.error(err); document.querySelector('.loader-text').innerText = 'ERROR. PLEASE REFRESH.'; }
    );
})();


function updateTshirtMaterial() {
    if (!tshirtModel) return;
    const props = COLORS[STATE.color] || { roughness: 0.95, metalness: 0.0 };
    tshirtModel.traverse(child => {
        if (child.isMesh) {
            child.material.color.set(STATE.color);
            child.material.roughness = props.roughness;
            child.material.metalness = props.metalness;
        }
    });
}

// --- STICKER APPLICATION ---
function applySticker(stickerId, skipStateUpdate = false) {
    if (!tshirtMesh || !STATE.loaded) return;
    if (!stickerTextures[stickerId]) { console.warn('Texture not ready:', stickerId); return; }

    if (logoMesh) { scene.remove(logoMesh); logoMesh.geometry.dispose(); logoMesh.material.dispose(); logoMesh = null; }
    if (!skipStateUpdate) STATE.sticker = stickerId;

    const cfg = MODEL_CONFIGS[STATE.modelStyle];
    const pos = new THREE.Vector3(...cfg.stickerPos);
    const rot = new THREE.Euler(0, 0, 0);
    const s = STATE.stickerScale;
    const size = new THREE.Vector3(s, s, cfg.stickerDepth);

    const decalGeo = new DecalGeometry(tshirtMesh, pos, rot, size);
    const decalMat = new THREE.MeshStandardMaterial({
        map: stickerTextures[stickerId],
        transparent: true,
        alphaTest: 0.05,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        side: THREE.FrontSide,
        roughness: 0.85,
        metalness: 0.0
    });

    logoMesh = new THREE.Mesh(decalGeo, decalMat);
    logoMesh.renderOrder = 2;
    scene.add(logoMesh);
}

// Resize: re-apply without clearing sticker state
function resizeSticker(scale) {
    STATE.stickerScale = scale;
    if (STATE.sticker) applySticker(STATE.sticker, true);
}

// Model style toggle — swaps between real GLB files
// Camera target stays at y=4 for both so the frame never jumps.
function setModelStyle(style) {
    STATE.modelStyle = style;
    loadModel(style);
    // Keep camera locked on the same centre point for both styles
    controls.target.set(0, 4.0, 0);
    controls.update();
}

// --- UI EVENT LISTENERS ---

// Toggle sticker panel
document.getElementById('toggle-stickers').addEventListener('click', () => {
    const grid = document.getElementById('sticker-grid');
    const isHidden = grid.classList.toggle('hidden');
    document.getElementById('toggle-stickers').querySelector('.btn-icon').innerText = isHidden ? '+' : '-';
});

// Resize slider — NEVER removes the sticker
document.getElementById('sticker-resize').addEventListener('input', (e) => {
    resizeSticker(parseFloat(e.target.value));
});

// Sticker buttons — clicking the active sticker does NOT remove it
document.querySelectorAll('.sticker-opt').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sticker-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applySticker(btn.dataset.sticker);
    });
});

// Color swatches
document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        btn.classList.add('active');
        STATE.color = btn.dataset.color;
        updateTshirtMaterial();
    });
});

// Model style buttons (regular / oversized)
document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setModelStyle(btn.dataset.style);
    });
});

// --- FABRIC ZOOM ---
// Dynamic targets based on model height
const ZOOM_CONFIGS = {
    regular:   { pos: new THREE.Vector3(0, 4.8, 3.8), target: new THREE.Vector3(0, 4.8, 0) },
    oversized: { pos: new THREE.Vector3(0, 5.8, 4.2), target: new THREE.Vector3(0, 5.8, 0) },
    default:   { pos: new THREE.Vector3(0, 4.0, 16),  target: new THREE.Vector3(0, 4.0, 0) }
};

let zoomState    = 'out';
let zoomGoal     = null;
let zoomStartPos = new THREE.Vector3();
let zoomStartTar = new THREE.Vector3();
let zoomProgress = 1.0;
const ZOOM_SPEED = 0.04;

function startZoom(goal) {
    zoomGoal = goal;
    zoomStartPos.copy(camera.position);
    zoomStartTar.copy(controls.target);
    zoomProgress = 0.0;
    controls.enabled = false;
}

const zoomBtn = document.getElementById('fabric-zoom-btn');
if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
        if (zoomState === 'out') {
            zoomState = 'animating';
            // Use model-specific target
            const target = ZOOM_CONFIGS[STATE.modelStyle] || ZOOM_CONFIGS.regular;
            startZoom(target);
            zoomBtn.textContent = 'EXIT ZOOM';
            zoomBtn.classList.add('active');
        } else {
            zoomState = 'animating';
            startZoom(ZOOM_CONFIGS.default);
            zoomBtn.textContent = '🔍 FABRIC ZOOM';
            zoomBtn.classList.remove('active');
        }
    });
}

// Smooth easing function (ease-in-out)
function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Camera zoom lerp
    if (zoomGoal && zoomProgress < 1.0) {
        zoomProgress = Math.min(zoomProgress + ZOOM_SPEED, 1.0);
        const t = easeInOut(zoomProgress);

        camera.position.lerpVectors(zoomStartPos, zoomGoal.pos, t);
        controls.target.lerpVectors(zoomStartTar, zoomGoal.target, t);

        if (zoomProgress >= 1.0) {
            controls.enabled = true;
            zoomState = (zoomGoal === ZOOM_CONFIGS.default) ? 'out' : 'in';
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
console.log('Knight Wolf Configurator v3.0 — Initialized');
