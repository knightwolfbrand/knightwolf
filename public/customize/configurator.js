import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

// --- CONFIGURATION & STATE ---
const PRINT_AREAS = {
    fullFront: {
        name: "FULL FRONT",
        side: "front",
        width: 0.28,
        height: 0.40,
        x: 0.50,
        y: 0.50
    },
    mediumFront: {
        name: "MEDIUM FRONT",
        side: "front",
        width: 0.18,
        height: 0.24,
        x: 0.50,
        y: 0.42
    },
    leftChest: {
        name: "LEFT CHEST",
        side: "front",
        width: 0.08,
        height: 0.08,
        x: 0.68,
        y: 0.30
    },
    fullBack: {
        name: "FULL BACK",
        side: "back",
        width: 0.28,
        height: 0.40,
        x: 0.50,
        y: 0.50
    },
    mediumBack: {
        name: "MEDIUM BACK",
        side: "back",
        width: 0.18,
        height: 0.24,
        x: 0.50,
        y: 0.42
    }
};

const STATE = {
    color: '#f5f0cc', // Default color cream
    loaded: false,
    modelStyle: 'oversized',
    fabricStyle: 'structured',
    stickerZone: 'front',    // 'front' | 'back'
    designs: {
        front: {
            stickerImage: null,
            printSize: 'mediumFront',
            stickerKey: null,
            _cachedClean: null,
            x: 0.5, // relative to the selected print area bounds
            y: 0.5,
            texts: []
        },
        back: {
            stickerImage: null,
            printSize: 'mediumBack',
            stickerKey: null,
            _cachedClean: null,
            x: 0.5,
            y: 0.5,
            texts: []
        }
    }
};

// ─── COLORS ──────────────────────────────────────────────────────────────────
const COLORS = {
    '#ffffff': { roughness: 0.92, metalness: 0.0 }, // White swatch maps here
    '#f5f5f5': { roughness: 0.92, metalness: 0.0 },
    '#050505': { roughness: 0.95, metalness: 0.0 },
    '#949494': { roughness: 0.95, metalness: 0.0 },
    '#00d2ff': { roughness: 0.90, metalness: 0.0 },
    '#f5f0cc': { roughness: 0.95, metalness: 0.0 }, // Cream
};

// ─── MODEL CONFIGS ────────────────────────────────────────────────────────────
const MODEL_CONFIGS = {
    regular:   { 
        url: '/models/Tshirt2.glb', 
        uvCenter: { cx: 0.27, cy: 0.63 },
        uvBack:   { cx: 0.73, cy: 0.63 }, 
        isFlipped: true 
    },
    oversized: { 
        url: '/models/oversized_tshirt.glb', 
        uvCenter: { cx: 0.30, cy: 0.45 },
        uvBack:   { cx: 0.74, cy: 0.45 }, 
        aspectY: 1.25,
        isFlipped: true
    },
};

// ─── SCENE ───────────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 4, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setClearColor(0xfffef4, 1.0); // Clean creamy white background fallback
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// ─── ORBIT CONTROLS ───────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 11.5;
controls.maxDistance = 22.0;
// Limit vertical viewing angles to prevent going too high or below floor level
controls.minPolarAngle = Math.PI * 0.38;
controls.maxPolarAngle = Math.PI * 0.55;
controls.update();

// Tshirt Model dedicated group (keeps environment stationary during rotation)
const tshirtGroup = new THREE.Group();
scene.add(tshirtGroup);

// ─── ENVIRONMENT: LUXURY MINIMAL SHOWROOM ────────────────────────────────────
const texLoader = new THREE.TextureLoader();

const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.75,
    metalness: 0.25,
});

// 1. Polished Light Gray Concrete Floor
const floorGeo = new THREE.PlaneGeometry(80, 80);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0xc9c7c3,
    roughness: 0.40,
    metalness: 0.05,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -4.5;
floor.receiveShadow = true;
scene.add(floor);

// Subtle circular 3D podium underneath the T-shirt
const podiumGroup = new THREE.Group();
podiumGroup.position.set(0, -4.5, 0);

// Flatter warm stone circular base
const podiumGeo = new THREE.CylinderGeometry(2.6, 2.7, 0.08, 64);
const podiumMat = new THREE.MeshStandardMaterial({
    color: 0xeae8e2,
    roughness: 0.70,
});
const podium = new THREE.Mesh(podiumGeo, podiumMat);
podium.position.y = 0.04;
podium.receiveShadow = true;
podium.castShadow = true;
podiumGroup.add(podium);

// Subtle warm-white LED ring under the podium
const ledRingGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.02, 32);
const ledRingMat = new THREE.MeshBasicMaterial({
    color: 0xfff3d6,
});
const ledRing = new THREE.Mesh(ledRingGeo, ledRingMat);
ledRing.position.y = 0.01;
podiumGroup.add(ledRing);
scene.add(podiumGroup);

// 2. Creamy White Gallery Walls (#FFFEF4)
const backWallGeo = new THREE.PlaneGeometry(80, 30);
const wallMat = new THREE.MeshBasicMaterial({
    color: 0xfffef4,
});
const backWall = new THREE.Mesh(backWallGeo, wallMat);
backWall.position.set(0, 10, -22);
backWall.receiveShadow = true;
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), wallMat);
leftWall.position.set(-35, 10, 0);
leftWall.rotation.y = Math.PI / 2;
leftWall.receiveShadow = true;
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), wallMat);
rightWall.position.set(35, 10, 0);
rightWall.rotation.y = -Math.PI / 2;
rightWall.receiveShadow = true;
scene.add(rightWall);

// 2. Full-Height Floor-to-Ceiling Reflective Glass Wall (spans the entire wall area)
const frontWall = new Reflector(new THREE.PlaneGeometry(80, 30), {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xccddee, // slight natural blue/grey glass tint
    recursion: 1
});
frontWall.position.set(0, 10, 22);
frontWall.rotation.y = Math.PI; // faced inwards

// Mix dynamic reflection with transparent see-through void
frontWall.material.transparent = true;
frontWall.material.opacity = 0.28; // balanced transparency and T-shirt reflection
scene.add(frontWall);

// Frameless Glass Door Seams & Accents (integrated into the glass wall at z = 21.9)
const doorGroup = new THREE.Group();
doorGroup.position.set(0, -4.5, 21.9);

// Thin black metal divider joints to define the double door panels
const jointLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 26.0, 0.06), matteBlackMat);
jointLeft.position.set(-6.5, 13.0, 0);
doorGroup.add(jointLeft);

const jointRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 26.0, 0.06), matteBlackMat);
jointRight.position.set(6.5, 13.0, 0);
doorGroup.add(jointRight);

// Clean vertical center seam split between the doors
const seamCenter = new THREE.Mesh(new THREE.BoxGeometry(0.02, 26.0, 0.04), matteBlackMat);
seamCenter.position.set(0, 13.0, 0);
doorGroup.add(seamCenter);

// Minimal top and bottom frame profile borders
const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.06, 0.1), matteBlackMat);
bottomFrame.position.set(0, 0.03, 0);
doorGroup.add(bottomFrame);

const topFrame = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.06, 0.1), matteBlackMat);
topFrame.position.set(0, 25.97, 0);
doorGroup.add(topFrame);

// Two long slim vertical black pull handles on the glass doors
const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 5.0, 16);
const leftHandle = new THREE.Mesh(handleGeo, matteBlackMat);
leftHandle.position.set(-1.2, 12.0, 0.1); // centered at y=12.0 on the wall (7.5 units up from floor)
doorGroup.add(leftHandle);

const rightHandle = new THREE.Mesh(handleGeo, matteBlackMat);
rightHandle.position.set(1.2, 12.0, 0.1);
doorGroup.add(rightHandle);

// Hanger brackets/pivots at floor and ceiling junctions
for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.12), matteBlackMat);
    const px = (i < 2) ? -6.0 : 6.0;
    const py = (i % 2 === 0) ? 0.04 : 25.96;
    pivot.position.set(px, py, 0.0);
    doorGroup.add(pivot);
}

scene.add(doorGroup);

// Up-and-Down Wall Sconces moved to the right side wall with up/down light effect
const sconceZPositions = [-9.0, 10.0];
sconceZPositions.forEach((sz) => {
    // Sconce physical fixture (matte black rectangle) mounted on the right wall (facing inwards)
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.3), matteBlackMat);
    fixture.position.set(34.82, 10.0, sz);
    scene.add(fixture);

    // Warm white spot lights pointing straight up & down along the right wall (x = 34.78)
    // Upward beam
    const upLight = new THREE.SpotLight(0xffb575, 45.0, 14.0, Math.PI / 4, 0.5, 2.0);
    upLight.position.set(34.78, 10.45, sz);
    const upTarget = new THREE.Object3D();
    upTarget.position.set(34.78, 22.0, sz);
    scene.add(upTarget);
    upLight.target = upTarget;
    scene.add(upLight);

    // Downward beam
    const downLight = new THREE.SpotLight(0xffb575, 45.0, 14.0, Math.PI / 4, 0.5, 2.0);
    downLight.position.set(34.78, 9.55, sz);
    const downTarget = new THREE.Object3D();
    downTarget.position.set(34.78, -4.5, sz);
    scene.add(downTarget);
    downLight.target = downTarget;
    scene.add(downLight);
});

// 3. Warm Off-White Gallery Ceiling
const ceilingGeo = new THREE.PlaneGeometry(80, 80);
const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f0,
    roughness: 0.98,
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 22;
scene.add(ceiling);

// Soft volumetric shadows under T-shirt hem (resting flat on concrete floor at y = -4.5)
const shadowTexture = texLoader.load('https://threejs.org/examples/textures/shadow.png');
const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.38, depthWrite: false })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -4.41; // Sit just above the podium surface
tshirtGroup.add(shadowPlane);

// Spartan Wolf Logo mounted on the left side wall
const logoTex = texLoader.load('/customize/logo_spartan.png');
const logoMat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    map: logoTex,
    transparent: true,
    depthWrite: false
});
const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.0), logoMat);
logoMesh.position.set(-34.82, 11.5, 4.0);
logoMesh.rotation.y = Math.PI / 2;
scene.add(logoMesh);

// "KNIGHTWOLF" Dimensional text plaque
const brandingCanvas = document.createElement('canvas');
brandingCanvas.width = 2048;
brandingCanvas.height = 512;
const brandingCtx = brandingCanvas.getContext('2d');
brandingCtx.fillStyle = '#111111';
brandingCtx.font = "normal 160px 'Libre Baskerville', serif";
brandingCtx.textAlign = 'center';
brandingCtx.textBaseline = 'middle';
brandingCtx.letterSpacing = '4px';
brandingCtx.fillText('KNIGHTWOLF', 1024, 256);

const brandingTex = new THREE.CanvasTexture(brandingCanvas);
const plaqueGeo = new THREE.PlaneGeometry(15.0, 3.75);
const plaqueMat = new THREE.MeshStandardMaterial({
    map: brandingTex,
    transparent: true,
    roughness: 0.8,
});
const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
plaque.position.set(0, 15.0, -21.8);
scene.add(plaque);

// 6. LEFT WALL: BRAND STORY
// 3 Vertically Aligned Framed Campaign Posters
function makeCampaignPoster(z, y, titleText) {
    const posterGroup = new THREE.Group();
    posterGroup.position.set(-34.8, y, z);
    posterGroup.rotation.y = Math.PI / 2;

    // Thin black frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.8, 0.1), matteBlackMat);
    posterGroup.add(frame);

    // Canvas inside frame
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 300;
    posterCanvas.height = 380;
    const pctx = posterCanvas.getContext('2d');
    pctx.fillStyle = '#18181c';
    pctx.fillRect(0, 0, 300, 380);

    // Poster branding typography/graphics
    pctx.fillStyle = '#d8d4cc';
    pctx.font = "bold 24px 'Space Grotesk', sans-serif";
    pctx.textAlign = 'center';
    pctx.fillText('KNIGHTWOLF', 150, 60);

    pctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    pctx.fillRect(40, 100, 220, 200);

    pctx.fillStyle = '#ff3333';
    pctx.font = "bold 18px 'Space Grotesk', sans-serif";
    pctx.fillText(titleText, 150, 330);

    const posterTex = new THREE.CanvasTexture(posterCanvas);
    const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 3.6),
        new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.9 })
    );
    canvasMesh.position.z = 0.06;
    posterGroup.add(canvasMesh);
    scene.add(posterGroup);
}
makeCampaignPoster(-12, 14, 'CAMPAIGN 01');
makeCampaignPoster(-12, 9.5, 'STREETWEAR');
makeCampaignPoster(-12, 5.0, 'TOKYO SHOT');

// Realistic Clothing Rack display billboard on Left Side Wall
const rackTex = texLoader.load('/customize/rack_display.png');
const rackGeo = new THREE.PlaneGeometry(12.3, 8.2);
const rackMat = new THREE.MeshStandardMaterial({
    map: rackTex,
    transparent: true,
    alphaTest: 0.35,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
});
const rackMesh = new THREE.Mesh(rackGeo, rackMat);
// Positioned freestanding on the floor, moved forward away from the back wall (at z = -22)
rackMesh.position.set(-10.0, -4.5 + 4.1, -17.0); 
rackMesh.rotation.y = 0.0; // Parallel to back wall
rackMesh.castShadow = true;
rackMesh.receiveShadow = true;
scene.add(rackMesh);

// Large indoor plant near the corner
const plantGroup = new THREE.Group();
plantGroup.position.set(-30, -4.5, -18);
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 1.6), new THREE.MeshStandardMaterial({ color: 0xc4c2bc, roughness: 0.6 }));
pot.position.y = 0.8;
plantGroup.add(pot);
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6), new THREE.MeshStandardMaterial({ color: 0x4a5d4e }));
stem.position.y = 2.4;
plantGroup.add(stem);
const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d4e3f, roughness: 0.9 });
for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5 + i*0.06, 8, 8), leafMat);
    leaf.position.set(Math.sin(i)*0.6, 3.0 + i*0.25, Math.cos(i)*0.6);
    plantGroup.add(leaf);
}
scene.add(plantGroup);

// 7. RIGHT WALL: PRODUCT & CUSTOMIZATION STORY
// Wall Typography "WEAR TO HURT" (architectural embossed effect)
// Wall typography removed

// Fabric Display (3 mounted swatches with thickness)
const swatchLabels = ['240 GSM', '280 GSM', 'PREMIUM'];
swatchLabels.forEach((label, idx) => {
    const swatchGroup = new THREE.Group();
    swatchGroup.position.set(34.7, 10.5, -16.5 + idx * 2.2);
    swatchGroup.rotation.y = -Math.PI / 2;

    // Physical thickness backing
    const swatchBacking = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.15), new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.85 }));
    swatchGroup.add(swatchBacking);

    // Fabric text label
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fafafa';
    ctx.font = "bold 16px 'Space Grotesk', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(label, 64, 32);

    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    labelMesh.position.z = 0.08;
    swatchGroup.add(labelMesh);
    scene.add(swatchGroup);
});

// Floating Display Shelves with LED warm glow
function makeFloatingShelf(y, z, itemType) {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(33.5, y, z);
    shelfGroup.rotation.y = -Math.PI / 2;

    // Slim matte-black shelf plane
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 1.2), matteBlackMat);
    shelfGroup.add(shelf);

    // LED stripe warm glow helper
    const glow = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.04, 0.1), new THREE.MeshBasicMaterial({ color: 0xffedd6 }));
    glow.position.set(0, -0.07, -0.4);
    shelfGroup.add(glow);

    // Add object on top of shelf
    if (itemType === 'folded') {
        const foldedTee = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.2), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.8 }));
        foldedTee.position.y = 0.2;
        shelfGroup.add(foldedTee);
    } else if (itemType === 'cap') {
        const capGroup = new THREE.Group();
        capGroup.position.set(0, 0.25, 0);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), matteBlackMat);
        capGroup.add(dome);
        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.6), matteBlackMat);
        brim.position.set(0, -0.2, 0.35);
        capGroup.add(brim);
        shelfGroup.add(capGroup);
    } else if (itemType === 'accessory') {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.8 }));
        box.position.y = 0.45;
        shelfGroup.add(box);
    }
    scene.add(shelfGroup);
}
makeFloatingShelf(8.5, -4, 'folded');
makeFloatingShelf(8.5, 1, 'cap');
makeFloatingShelf(8.5, 6, 'accessory');

// 2x3 Grid framed KNIGHTWOLF Graphic Artworks
function makeGridArtwork(z, y, index) {
    const artGroup = new THREE.Group();
    artGroup.position.set(34.8, y, z);
    artGroup.rotation.y = -Math.PI / 2;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 0.1), matteBlackMat);
    artGroup.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0,0,256,320);

    // Streetwear geometric lines
    ctx.fillStyle = '#ff1111';
    ctx.fillRect(40, 60, 176, 20);
    ctx.fillStyle = '#111111';
    ctx.fillRect(40, 100, 176, 160);

    const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 2.35), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvas), roughness: 0.9 }));
    artMesh.position.z = 0.06;
    artGroup.add(artMesh);
    scene.add(artGroup);
}
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
        makeGridArtwork(-4 + j * 2.8, 4.2 - i * 3.2, i * 3 + j);
    }
}

// Far-Right Floor-to-Ceiling Mirror
const mirrorGroup = new THREE.Group();
mirrorGroup.position.set(34.8, 5.0, 14);
mirrorGroup.rotation.y = -Math.PI / 2;
// Frame
const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 19.2, 0.18), matteBlackMat);
mirrorGroup.add(mirrorFrame);
// Reflection panel (High metalness, zero roughness)
const mirrorGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 19.0),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.05, metalness: 0.95 })
);
mirrorGlass.position.z = 0.1;
mirrorGroup.add(mirrorGlass);
scene.add(mirrorGroup);

// Minimal Furniture: low charcoal bench
const bench = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.9, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.85 })
);
bench.position.set(22, -4.05, -12);
scene.add(bench);

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.65));

// Key directional sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
sunLight.position.set(8, 18, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// Ceiling Spotlights directed at targets
function addSpotlight(x, y, z, tx, ty, tz, intensity, angle) {
    const spot = new THREE.SpotLight(0xfff5e6, intensity); // Warm 3500K-4000K neutral light color
    spot.position.set(x, y, z);
    spot.angle = angle || Math.PI / 6;
    spot.penumbra = 0.8;
    spot.decay = 1.2;
    spot.distance = 55;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 512;
    spot.shadow.mapSize.height = 512;

    const target = new THREE.Object3D();
    target.position.set(tx, ty, tz);
    scene.add(target);
    spot.target = target;

    scene.add(spot);
}
// Spotlights pointing directly at T-shirt
addSpotlight(0, 18, 2, 0, 1.5, 0, 1.4, Math.PI / 5);
// Accent spotlights for posters
addSpotlight(-28, 18, -12, -34.8, 9.5, -12, 0.8);
// Spotlight pointing at wolf emblem and raised physical lettering
addSpotlight(0, 18, -12, 0, 10, -21.8, 1.0);
// Accent spotlights for floating shelves and graphic wall
addSpotlight(28, 18, 1, 34.8, 6.0, 1, 0.8);

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
const UV_SIZE = 2048; 
const uvCanvas = document.createElement('canvas');
uvCanvas.width = uvCanvas.height = UV_SIZE;
const uvCtx = uvCanvas.getContext('2d');
const uvTexture = new THREE.CanvasTexture(uvCanvas);
uvTexture.colorSpace = THREE.SRGBColorSpace;
uvTexture.flipY = false;
uvTexture.anisotropy = 16; 
uvTexture.minFilter = THREE.LinearMipmapLinearFilter;
uvTexture.magFilter = THREE.LinearFilter;
uvTexture.wrapS = uvTexture.wrapT = THREE.ClampToEdgeWrapping;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${r},${g},${b})`;
}

// ─── BACKGROUND REMOVAL ──────────────────────────────────────────────────────
function removeBackground(img) {
    const maxDim = 512;
    let w = img.naturalWidth || img.width || 200;
    let h = img.naturalHeight || img.height || 200;
    
    if (w > maxDim || h > maxDim) {
        if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
        } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
        }
    }

    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    try {
        const W = c.width, H = c.height;
        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;
        const visited = new Uint8Array(W * H);
        const queue = [];

        const bgR = data[0], bgG = data[1], bgB = data[2];
        const TOL = 55;

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
                data[pos+3] = 0; 
                for (const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
                    if (nx>=0&&nx<W&&ny>=0&&ny<H) {
                        const nIdx = ny*W+nx;
                        if (!visited[nIdx]) { visited[nIdx]=1; queue.push(nx,ny); }
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    } catch (err) {
        console.error("Flood fill background removal failed:", err);
    }
    return c;
}

function drawTextOnCanvas(ctx, text, uv, cfg) {
    ctx.save();
    
    // Width and height mapping factors of printable overlay box to UV canvas
    const widthFactor = 0.18;
    const heightFactor = 0.22;
    
    const ux = uv.cx + (text.x - 0.5) * widthFactor;
    const uy = uv.cy - (text.y - 0.5) * heightFactor;
    
    const sx = Math.round(ux * UV_SIZE);
    const sy = Math.round(uy * UV_SIZE);
    
    const scaledSize = Math.round(text.fontSize * (UV_SIZE / 1024));
    const styleStr = `700 ${scaledSize}px ${text.fontFamily}`;
    
    ctx.font = styleStr;
    ctx.fillStyle = text.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.translate(sx, sy);
    
    if (cfg.isFlipped) {
        ctx.scale(1, -1);
    }
    
    ctx.fillText(text.content, 0, 0);
    ctx.restore();
}

function repaintStickerCanvas() {
    uvCtx.fillStyle = hexToRgb(STATE.color);
    uvCtx.fillRect(0, 0, UV_SIZE, UV_SIZE);

    const cfg = MODEL_CONFIGS[STATE.modelStyle];
    const scaleFactor = 0.95;

    // Paint Front Design
    const front = STATE.designs.front;
    if (front.stickerImage) {
        const sizeId = front.printSize || 'mediumFront';
        const printSizeConfig = PRINT_AREAS[sizeId];
        const uv = cfg.uvCenter;
        const aspectY = cfg.aspectY || 1.0;

        if (!front._cachedClean) {
            if (front.stickerKey && front.stickerKey.startsWith('custom_')) {
                front._cachedClean = removeBackground(front.stickerImage);
            } else {
                front._cachedClean = front.stickerImage;
            }
        }

        // Calculate visual dimensions fitted inside the bounding box with safe margin
        const boxWidth = Math.round(UV_SIZE * printSizeConfig.width * scaleFactor);
        const boxHeight = Math.round(UV_SIZE * printSizeConfig.height * scaleFactor);
        let stickerWidth = boxWidth;
        let stickerHeight = boxWidth * aspectY;
        if (stickerHeight > boxHeight) {
            stickerHeight = boxHeight;
            stickerWidth = boxHeight / aspectY;
        }

        const posX = front.x !== undefined ? front.x : 0.5;
        const posY = front.y !== undefined ? front.y : 0.5;
        const ux = uv.cx + (posX - 0.5) * 0.18 * printSizeConfig.width + (printSizeConfig.x - 0.5) * 0.18;
        const uy = uv.cy - (posY - 0.5) * 0.22 * printSizeConfig.height - (printSizeConfig.y - 0.5) * 0.22 - 0.055;

        const sx = Math.round(ux * UV_SIZE);
        const sy = Math.round(uy * UV_SIZE);

        console.log(`[STICKER RENDER] front sticker: ${front.stickerKey}, position: (${sx}, ${sy}), size: ${stickerWidth}x${stickerHeight}`);

        uvCtx.save();

        // Clip front design to the print-area bounding box boundaries
        const cx = Math.round((uv.cx + (printSizeConfig.x - 0.5) * 0.18) * UV_SIZE);
        const cy = Math.round((uv.cy - (printSizeConfig.y - 0.5) * 0.22 - 0.055) * UV_SIZE);
        const wLimit = Math.round(printSizeConfig.width * UV_SIZE);
        const hLimit = Math.round(printSizeConfig.height * UV_SIZE);

        uvCtx.beginPath();
        uvCtx.rect(cx - wLimit / 2, cy - hLimit / 2, wLimit, hLimit);
        uvCtx.clip();

        uvCtx.translate(sx, sy);
        if (cfg.isFlipped) {
            uvCtx.scale(1, -1);
        }
        uvCtx.drawImage(
            front._cachedClean, 
            -stickerWidth / 2, 
            -stickerHeight / 2, 
            stickerWidth, 
            stickerHeight
        );
        uvCtx.restore();
    }

    // Paint Front Texts
    if (front.texts && front.texts.length > 0) {
        front.texts.forEach(txt => {
            drawTextOnCanvas(uvCtx, txt, cfg.uvCenter, cfg);
        });
    }

    // Paint Back Design
    const back = STATE.designs.back;
    if (back.stickerImage) {
        const sizeId = back.printSize || 'mediumBack';
        const printSizeConfig = PRINT_AREAS[sizeId];
        const uv = cfg.uvBack;
        const aspectY = cfg.aspectY || 1.0;

        if (!back._cachedClean) {
            if (back.stickerKey && back.stickerKey.startsWith('custom_')) {
                back._cachedClean = removeBackground(back.stickerImage);
            } else {
                back._cachedClean = back.stickerImage;
            }
        }

        // Calculate visual dimensions fitted inside the bounding box with safe margin
        const boxWidth = Math.round(UV_SIZE * printSizeConfig.width * scaleFactor);
        const boxHeight = Math.round(UV_SIZE * printSizeConfig.height * scaleFactor);
        let stickerWidth = boxWidth;
        let stickerHeight = boxWidth * aspectY;
        if (stickerHeight > boxHeight) {
            stickerHeight = boxHeight;
            stickerWidth = boxHeight / aspectY;
        }

        const posX = back.x !== undefined ? back.x : 0.5;
        const posY = back.y !== undefined ? back.y : 0.5;
        const ux = uv.cx + (posX - 0.5) * 0.18 * printSizeConfig.width + (printSizeConfig.x - 0.5) * 0.18;
        const uy = uv.cy - (posY - 0.5) * 0.22 * printSizeConfig.height - (printSizeConfig.y - 0.5) * 0.22 - 0.055;

        const sx = Math.round(ux * UV_SIZE);
        const sy = Math.round(uy * UV_SIZE);

        console.log(`[STICKER RENDER] back sticker: ${back.stickerKey}, position: (${sx}, ${sy}), size: ${stickerWidth}x${stickerHeight}`);

        uvCtx.save();

        // Clip back design to the print-area bounding box boundaries
        const cx = Math.round((uv.cx + (printSizeConfig.x - 0.5) * 0.18) * UV_SIZE);
        const cy = Math.round((uv.cy - (printSizeConfig.y - 0.5) * 0.22 - 0.055) * UV_SIZE);
        const wLimit = Math.round(printSizeConfig.width * UV_SIZE);
        const hLimit = Math.round(printSizeConfig.height * UV_SIZE);

        uvCtx.beginPath();
        uvCtx.rect(cx - wLimit / 2, cy - hLimit / 2, wLimit, hLimit);
        uvCtx.clip();

        uvCtx.translate(sx, sy);
        if (cfg.isFlipped) {
            uvCtx.scale(1, -1);
        }
        uvCtx.drawImage(
            back._cachedClean, 
            -stickerWidth / 2, 
            -stickerHeight / 2, 
            stickerWidth, 
            stickerHeight
        );
        uvCtx.restore();
    }

    // Paint Back Texts
    if (back.texts && back.texts.length > 0) {
        back.texts.forEach(txt => {
            drawTextOnCanvas(uvCtx, txt, cfg.uvBack, cfg);
        });
    }

    uvTexture.needsUpdate = true;
    if (typeof updateLivePrice === 'function') {
        updateLivePrice();
    }
}

// ─── MATERIAL FACTORY ────────────────────────────────────────────────────────
let tshirtMaterial = null;
function makeFabricMaterial() {
    if (tshirtMaterial) return tshirtMaterial;
    
    const cfg = ensureFabricMaps(STATE.fabricStyle);
    repaintStickerCanvas();
    tshirtMaterial = new THREE.MeshPhysicalMaterial({
        map:          uvTexture,      
        roughness:    0.98,
        metalness:    0.0,
        side:         THREE.DoubleSide, // Ensure double sided rendering
        normalMap:    cfg.normal,
        roughnessMap: cfg.roughness,
        sheen:        1.0,
        sheenRoughness: 0.8,
        sheenColor:   new THREE.Color(0xffffff),
    });
    tshirtMaterial.normalScale.set(cfg.normalScale, cfg.normalScale);
    return tshirtMaterial;
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
    const mat = makeFabricMaterial();
    tshirtModel.traverse(child => {
        if (child.isMesh) {
            child.castShadow    = false;
            child.receiveShadow = false;
            child.material = mat;
        }
    });
}

function loadModel(style) {
    if (tshirtModel) { tshirtGroup.remove(tshirtModel); tshirtModel = null; }
    loader.load(
        MODEL_CONFIGS[style].url,
        (gltf) => {
            tshirtModel = gltf.scene;
            fitModel(tshirtModel, 7.8);
            applyMaterialToModel();
            repaintStickerCanvas();
            tshirtGroup.add(tshirtModel);
        },
        undefined,
        err => console.error('Model load error:', err)
    );
}

// ─── INITIAL LOAD ─────────────────────────────────────────────────────────────
(function initialLoad() {
    loader.load(
        MODEL_CONFIGS.oversized.url,
        (gltf) => {
            tshirtModel = gltf.scene;
            fitModel(tshirtModel, 7.8);
            applyMaterialToModel();
            tshirtGroup.add(tshirtModel);
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
    repaintStickerCanvas(); 
}

// ─── STICKER IMAGE LOADING ────────────────────────────────────────────────────
// ROOT CAUSE FIX: Netlify CDN returns no Access-Control-Allow-Origin headers.
// Drawing a cross-origin <img> onto a canvas taints it, making getImageData()
// throw SecurityError. Even the catch block cannot save it — Three.js also
// fails to read a tainted CanvasTexture, producing an empty (invisible) GPU
// texture. The fix: route every sticker through the local /api/sticker-proxy
// which re-serves the image with CORS headers. The blob: URL produced by
// createObjectURL() is always same-origin, so the canvas is never tainted.

const stickerImages = {}; // key → HTMLImageElement (loaded via blob URL)
const _blobUrls = {};     // key → blob: URL (for cleanup if needed)

const STICKER_SRCS = {
    s_anime_back_afb1: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb1.webp',
    s_anime_back_afb2: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb2.webp',
    s_anime_back_afb3: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb3.webp',
    s_anime_back_afb4: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb4.webp',
    s_anime_back_afb5: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb5.webp',
    s_anime_back_afb6: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb6.webp',
    s_anime_back_afb7: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb7.webp',
    s_anime_back_afb8: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb8.webp',
    s_anime_back_afb9: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb9.webp',
    s_anime_back_afb10: 'https://knightwolfshop.netlify.app/stickers/anime_back_afb10.webp',
    s_anime_front_af1: 'https://knightwolfshop.netlify.app/stickers/anime_front_af1.webp',
    s_anime_front_af2: 'https://knightwolfshop.netlify.app/stickers/anime_front_af2.webp',
    s_anime_front_af3: 'https://knightwolfshop.netlify.app/stickers/anime_front_af3.webp',
    s_anime_front_af4: 'https://knightwolfshop.netlify.app/stickers/anime_front_af4.webp',
    s_anime_front_af5: 'https://knightwolfshop.netlify.app/stickers/anime_front_af5.webp',
    s_anime_front_af6: 'https://knightwolfshop.netlify.app/stickers/anime_front_af6.webp',
    s_anime_front_chest_ac1: 'https://knightwolfshop.netlify.app/stickers/anime_front_chest_ac1.webp',
    s_comics_back_b1: 'https://knightwolfshop.netlify.app/stickers/comics_back_b1.webp',
    s_comics_back_j1: 'https://knightwolfshop.netlify.app/stickers/comics_back_j1.webp',
    s_comics_back_s1: 'https://knightwolfshop.netlify.app/stickers/comics_back_s1.webp',
    s_comics_back_s2: 'https://knightwolfshop.netlify.app/stickers/comics_back_s2.webp',
    s_comics_back_s3: 'https://knightwolfshop.netlify.app/stickers/comics_back_s3.webp',
    s_comics_front_sf1: 'https://knightwolfshop.netlify.app/stickers/comics_front_sf1.webp',
    s_comics_front_chest_sfc1: 'https://knightwolfshop.netlify.app/stickers/comics_front_chest_sfc1.webp',
    s_f1_back_fob1: 'https://knightwolfshop.netlify.app/stickers/f1_back_fob1.webp',
    s_f1_front_fof1: 'https://knightwolfshop.netlify.app/stickers/f1_front_fof1.webp',
    s_f1_front_fof2: 'https://knightwolfshop.netlify.app/stickers/f1_front_fof2.webp',
    s_fifa_back_f1: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f1.webp',
    s_fifa_back_f2: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f2.webp',
    s_fifa_back_f3: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f3.webp',
    s_fifa_back_f4: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f4.webp',
    s_fifa_back_f5: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f5.webp',
    s_fifa_back_f6: 'https://knightwolfshop.netlify.app/stickers/fifa_back_f6.webp',
    s_fifa_front_tf1: 'https://knightwolfshop.netlify.app/stickers/fifa_front_tf1.webp',
    s_fifa_front_tf2: 'https://knightwolfshop.netlify.app/stickers/fifa_front_tf2.webp',
    s_fifa_front_tf3: 'https://knightwolfshop.netlify.app/stickers/fifa_front_tf3.webp',
    s_fifa_front_chest_fc1: 'https://knightwolfshop.netlify.app/stickers/fifa_front_chest_fc1.webp',
    s_thalapathy_back_t1: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t1.webp',
    s_thalapathy_back_t2: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t2.webp',
    s_thalapathy_back_t3: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t3.webp',
    s_thalapathy_back_t4: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t4.webp',
    s_thalapathy_back_t5: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t5.webp',
    s_thalapathy_back_t6: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t6.webp',
    s_thalapathy_back_t7: 'https://knightwolfshop.netlify.app/stickers/thalapathy_back_t7.webp',
    s_thalapathy_front_tf1: 'https://knightwolfshop.netlify.app/stickers/thalapathy_front_tf1.webp',
    s_thalapathy_front_tf2: 'https://knightwolfshop.netlify.app/stickers/thalapathy_front_tf2.webp',
    s_thalapathy_front_tf3: 'https://knightwolfshop.netlify.app/stickers/thalapathy_front_tf3.webp',
    s_thalapathy_front_chest_tfc1: 'https://knightwolfshop.netlify.app/stickers/thalapathy_front_chest_tfc1.webp',
    s_quotes_back_q1: 'https://knightwolfshop.netlify.app/stickers/quotes_back_q1.png',
    s_quotes_back_q2: 'https://knightwolfshop.netlify.app/stickers/quotes_back_q2.png',
    s_quotes_back_q3: 'https://knightwolfshop.netlify.app/stickers/quotes_back_q3.png',
};

/**
 * loadStickerViaBlobURL
 * Fetches a sticker through the local /api/sticker-proxy so the browser
 * receives it with CORS headers. The resulting blob: URL is same-origin,
 * meaning the UV canvas will NEVER be tainted when drawing this image.
 *
 * @param {string} key - Sticker key in STICKER_SRCS
 * @param {string} externalUrl - Original Netlify URL (used to derive filename)
 * @returns {Promise<HTMLImageElement>}
 */
function loadStickerViaBlobURL(key, externalUrl) {
    return new Promise((resolve, reject) => {
        // Extract just the filename from the full URL
        const filename = externalUrl.split('/').pop(); // e.g. "anime_back_afb1.webp"
        const proxyUrl = `/api/sticker-proxy?file=${encodeURIComponent(filename)}`;

        fetch(proxyUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Proxy returned ${res.status} for ${filename}`);
                return res.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                _blobUrls[key] = blobUrl;
                const img = new Image();
                img.onload = () => {
                    console.log(`[STICKER LOAD] success: ${key} via blob URL (canvas-safe)`);
                    resolve(img);
                };
                img.onerror = (err) => {
                    URL.revokeObjectURL(blobUrl);
                    reject(new Error(`Image load failed for blob of ${key}: ${err}`));
                };
                img.src = blobUrl; // blob: URL → same-origin → canvas never tainted
            })
            .catch(err => {
                console.error(`[STICKER LOAD] proxy error for ${key}:`, err);
                // Fallback: try loading directly (canvas will be tainted but at
                // least the sticker may render if bg-removal is skipped).
                const img = new Image();
                img.onload = () => {
                    console.warn(`[STICKER LOAD] fallback direct load for ${key} — canvas may taint`);
                    resolve(img);
                };
                img.onerror = () => reject(new Error(`All load paths failed for ${key}`));
                img.src = externalUrl;
            });
    });
}

// Pre-load all stickers in background so clicks are instant.
// Only the first few are kicked off immediately; the rest load lazily
// to avoid hammering the proxy on page load.
const PRELOAD_BATCH = 6; // Load first N stickers eagerly
Object.entries(STICKER_SRCS).forEach(([key, src], index) => {
    if (index < PRELOAD_BATCH) {
        loadStickerViaBlobURL(key, src)
            .then(img => {
                stickerImages[key] = img;
                // Apply the very first sticker as default artwork if nothing is set yet
                if (key === 's_anime_back_afb1' && !STATE.designs.front.stickerKey) {
                    applySticker('s_anime_back_afb1');
                }
            })
            .catch(err => console.error(`[STICKER PRELOAD] failed for ${key}:`, err));
    }
    // The rest are loaded on-demand by applySticker()
});

function applySticker(key) {
    console.log(`[STICKER CLICK] sticker id: ${key}, asset: ${STICKER_SRCS[key] || 'custom_upload'}, active side: ${STATE.stickerZone}`);
    const activeZone = STATE.designs[STATE.stickerZone];
    
    const applyLoadedImage = (img) => {
        activeZone.stickerImage = img;
        activeZone.stickerKey = key;
        activeZone._cachedClean = null; // Reset cache so removeBackground() re-runs on clean img
        activeZone.x = 0.5;
        activeZone.y = 0.5;
        
        if (!activeZone.printSize) {
            activeZone.printSize = STATE.stickerZone === 'front' ? 'mediumFront' : 'mediumBack';
        }
        
        document.querySelectorAll('.print-size-card').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sizeId === activeZone.printSize);
        });

        repaintStickerCanvas();
        if (typeof syncTextOverlay === 'function') {
            syncTextOverlay();
        }
    };

    if (stickerImages[key]) {
        // Already in cache — apply immediately
        applyLoadedImage(stickerImages[key]);
    } else if (STICKER_SRCS[key]) {
        // Not cached yet — load via blob proxy to keep canvas untainted
        loadStickerViaBlobURL(key, STICKER_SRCS[key])
            .then(img => {
                stickerImages[key] = img;
                applyLoadedImage(img);
            })
            .catch(err => {
                console.error(`[STICKER LOAD] error: dynamic ${key} load failed`, err);
            });
    }
}

function applyCustomSticker(imgEl) {
    const activeZone = STATE.designs[STATE.stickerZone];
    activeZone.stickerImage = imgEl;
    activeZone.stickerKey = 'custom_' + Date.now();
    activeZone._cachedClean = null; 
    activeZone.x = 0.5;
    activeZone.y = 0.5;
    
    // Assign default printSize based on active side ONLY if not already set
    if (!activeZone.printSize) {
        activeZone.printSize = STATE.stickerZone === 'front' ? 'mediumFront' : 'mediumBack';
    }
    
    // Highlight the active print size button in the list
    document.querySelectorAll('.print-size-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sizeId === activeZone.printSize);
    });

    repaintStickerCanvas();
    if (typeof syncTextOverlay === 'function') {
        syncTextOverlay();
    }
}

// ─── UI EVENT LISTENERS ──────────────────────────────────────────────────────

// Choose Your Fit card triggers
document.querySelectorAll('.fit-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.fit-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const style = card.dataset.style;
        STATE.modelStyle = style;
        loadModel(style);
        controls.target.set(0, 4.0, 0);
        controls.update();
    });
});

// Color swatches (Left Sidebar)
document.querySelectorAll('.color-swatch-ring').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.color-swatch-ring.active')?.classList.remove('active');
        btn.classList.add('active');
        updateColor(btn.dataset.color);
    });
});

// Size selection (Left Sidebar)
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Navigation Tabs (Right Sidebar)
document.querySelectorAll('.tab-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetPanel = document.getElementById(`panel-${btn.dataset.tab}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// Category Filter (Right Sidebar)
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        document.querySelectorAll('.sticker-opt').forEach(opt => {
            const matchesCategory = category === 'all' || opt.dataset.category === category;
            opt.style.display = matchesCategory ? 'flex' : 'none';
        });
    });
});

// Search Filter (Right Sidebar)
document.getElementById('sticker-search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.sticker-opt').forEach(opt => {
        const title = opt.getAttribute('title').toLowerCase();
        const matchesSearch = title.includes(query);
        opt.style.display = matchesSearch ? 'flex' : 'none';
    });
});

// Sticker grid buttons (Toggles sticker on/off)
document.querySelectorAll('.sticker-opt').forEach(btn => {
    btn.addEventListener('click', () => {
        const isAlreadyActive = btn.classList.contains('active');
        document.querySelectorAll('.sticker-opt').forEach(b => b.classList.remove('active'));
        
        const activeZone = STATE.designs[STATE.stickerZone];
        if (isAlreadyActive) {
            // Remove the sticker
            activeZone.stickerImage = null;
            activeZone.stickerKey = null;
            activeZone._cachedClean = null;
            repaintStickerCanvas();
        } else {
            btn.classList.add('active');
            applySticker(btn.dataset.sticker);
        }
    });
});

// Zone switching (Front/Back)
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;
        STATE.stickerZone = zone;

        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const activeZone = STATE.designs[zone];
        
        // Sync active print size preset highlights
        const currentSize = activeZone.printSize;
        document.querySelectorAll('.print-size-card').forEach(pc => {
            pc.classList.toggle('active', pc.dataset.sizeId === currentSize);
        });

        // Sync active sticker option card highlights
        document.querySelectorAll('.sticker-opt').forEach(opt => {
            const isCurrentSticker = opt.dataset.sticker === activeZone.stickerKey;
            opt.classList.toggle('active', isCurrentSticker);
        });

        // Natural Camera Orbit Swivel
        const targetAngle = (zone === 'front') ? 0 : Math.PI; 
        const distance = 16;
        const proxy = { angle: (zone === 'front') ? Math.PI : 0 }; 
        gsap.to(proxy, {
            angle: targetAngle,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.position.x = Math.sin(proxy.angle) * distance;
                camera.position.z = Math.cos(proxy.angle) * distance;
                camera.position.y = 4;
                controls.update();
            }
        });

        repaintStickerCanvas();
        if (typeof syncTextOverlay === 'function') {
            syncTextOverlay();
        }
    });
});

// Predefined print size button clicks
document.querySelectorAll('.print-size-card').forEach(btn => {
    btn.addEventListener('click', () => {
        const sizeId = btn.dataset.sizeId;
        const config = PRINT_AREAS[sizeId];
        
        // Update the design state on the placement's side
        const targetZone = STATE.designs[config.side];
        targetZone.printSize = sizeId;
        targetZone.x = 0.5;
        targetZone.y = 0.5;
        
        if (typeof syncTextOverlay === 'function') {
            syncTextOverlay();
        }
        
        // Auto-populate sticker if switching sides and the other side has one
        const otherSide = config.side === 'front' ? 'back' : 'front';
        const otherZone = STATE.designs[otherSide];
        if (!targetZone.stickerImage && otherZone.stickerImage) {
            targetZone.stickerImage = otherZone.stickerImage;
            targetZone.stickerKey = otherZone.stickerKey;
            targetZone._cachedClean = null;
            
            // Sync sticker selection card highlights
            document.querySelectorAll('.sticker-opt').forEach(opt => {
                const isCurrentSticker = opt.dataset.sticker === targetZone.stickerKey;
                opt.classList.toggle('active', isCurrentSticker);
            });
        }
        
        // Sync the UI active highlights
        document.querySelectorAll('.print-size-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Trigger zone switch if changing sides
        if (STATE.stickerZone !== config.side) {
            const zoneBtn = document.querySelector(`.zone-btn[data-zone="${config.side}"]`);
            if (zoneBtn) {
                zoneBtn.click();
            }
        } else {
            repaintStickerCanvas();
        }
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

// Center Controls triggers
document.getElementById('ctrl-rotate').addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    controls.autoRotateSpeed = 1.8;
    document.getElementById('ctrl-rotate').classList.toggle('active', controls.autoRotate);
});

document.getElementById('ctrl-zoom').addEventListener('click', () => {
    // toggle between camera zoom configurations
    const isZoomed = camera.position.z < 14.5;
    gsap.to(camera.position, {
        z: isZoomed ? 17.0 : 13.0,
        y: isZoomed ? 4.0 : 3.8,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => controls.update()
    });
});

document.getElementById('ctrl-reset').addEventListener('click', () => {
    controls.autoRotate = false;
    document.getElementById('ctrl-rotate').classList.remove('active');
    gsap.to(camera.position, {
        x: 0,
        y: 4,
        z: 16,
        duration: 1.0,
        ease: "power2.out",
        onComplete: () => {
            controls.target.set(0, 4, 0);
            controls.update();
        }
    });
    // Reset group shifts if any
    gsap.to(tshirtGroup.position, { x: 0, y: 0, z: 0, duration: 1.0 });
    gsap.to(tshirtGroup.rotation, { x: 0, y: 0, z: 0, duration: 1.0 });
});

// ─── STICKER HOVER / DRAG PREVIEW ─────────────────────────────────────────────
const hoverPreview = document.getElementById('sticker-hover-preview');
const hoverPreviewImg = document.getElementById('hover-preview-img');
const hoverPreviewTitle = document.getElementById('hover-preview-title');

document.querySelectorAll('.sticker-opt').forEach(btn => {
    const showPreview = () => {
        const img = btn.querySelector('img');
        if (!img) return;
        const imgSrc = img.getAttribute('src');
        const title = btn.getAttribute('title') || 'Sticker';
        
        if (hoverPreview && hoverPreviewImg && hoverPreviewTitle) {
            hoverPreviewImg.src = imgSrc;
            hoverPreviewTitle.textContent = title;
            hoverPreview.classList.add('visible');
        }
    };
    
    const hidePreview = () => {
        if (hoverPreview) {
            hoverPreview.classList.remove('visible');
        }
    };

    btn.addEventListener('mouseenter', showPreview);
    btn.addEventListener('mouseleave', hidePreview);
    btn.addEventListener('dragstart', showPreview);
    btn.addEventListener('dragend', hidePreview);
});

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Dynamically control overlay visibility based on camera position & active zone
    const overlay = document.getElementById('design-canvas-overlay');
    if (overlay) {
        let isVisible = false;
        const x = camera.position.x;
        const z = camera.position.z;
        
        if (STATE.stickerZone === 'front') {
            // Front view: camera Z must be positive, and rotation angle not too far side
            if (z > 2.0 && Math.abs(x) < z * 1.3) {
                isVisible = true;
            }
        } else if (STATE.stickerZone === 'back') {
            // Back view: camera Z must be negative, and rotation angle not too far side
            if (z < -2.0 && Math.abs(x) < Math.abs(z) * 1.3) {
                isVisible = true;
            }
        }
        
        if (isVisible) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
console.log('Knight Wolf Configurator v5.0 — Premium Gallery Showroom Mode');

// ─── DYNAMIC STICKER CARD BUILDER ─────────────────────────────────────────────
document.querySelectorAll('.sticker-opt').forEach(btn => {
    const title = btn.getAttribute('title') || 'Artwork';
    const category = (btn.dataset.category || 'front').toUpperCase();

    // Create wrapper for the image
    const img = btn.querySelector('img');
    if (img) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'sticker-opt-img-wrapper';
        btn.insertBefore(imgWrapper, img);
        imgWrapper.appendChild(img);
    }

    // Create info text container
    const info = document.createElement('div');
    info.className = 'sticker-opt-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'sticker-opt-title';
    titleSpan.textContent = title;

    const zoneSpan = document.createElement('span');
    zoneSpan.className = 'sticker-opt-zone';
    zoneSpan.textContent = category; // E.g. "WOLF", "MINIMAL", "STREET", "SYMBOL"

    info.appendChild(titleSpan);
    info.appendChild(zoneSpan);
    btn.appendChild(info);
});

// ─── CENTRALIZED PRICE CALCULATION ───────────────────────────────────────────
const PRICING = {
    tshirt: 500,
    sticker: 150,
    stickerSizeIncrease: 30,
    standardStickerScale: 0.15
};

function calculatePrice() {
    const tshirtPrice = PRICING.tshirt;
    
    // Count stickers from both front and back designs
    let stickerCount = 0;
    let enlargedStickerCount = 0;
    
    const front = STATE.designs.front;
    if (front.stickerImage) {
        stickerCount++;
        if (front.printSize === 'fullFront') {
            enlargedStickerCount++;
        }
    }
    
    const back = STATE.designs.back;
    if (back.stickerImage) {
        stickerCount++;
        if (back.printSize === 'fullBack') {
            enlargedStickerCount++;
        }
    }
    
    const stickerCost = stickerCount * PRICING.sticker;
    const stickerSizeCost = enlargedStickerCount * PRICING.stickerSizeIncrease;
    const total = tshirtPrice + stickerCost + stickerSizeCost;
    
    return {
        tshirtPrice,
        stickerCount,
        stickerCost,
        enlargedStickerCount,
        stickerSizeCost,
        total
    };
}

function updateLivePrice() {
    const priceInfo = calculatePrice();
    const livePriceNode = document.getElementById('live-price-total');
    const breakdownTotalNode = document.getElementById('breakdown-total-val');
    const stickerRow = document.getElementById('breakdown-row-stickers');
    const sizeRow = document.getElementById('breakdown-row-sizes');

    if (livePriceNode) {
        livePriceNode.textContent = `₹${priceInfo.total}`;
    }
    if (breakdownTotalNode) {
        breakdownTotalNode.textContent = `₹${priceInfo.total}`;
    }
    if (stickerRow) {
        stickerRow.innerHTML = `<span>Stickers × ${priceInfo.stickerCount}</span><span>₹${priceInfo.stickerCost}</span>`;
    }
    if (sizeRow) {
        sizeRow.innerHTML = `<span>Size Increase × ${priceInfo.enlargedStickerCount}</span><span>₹${priceInfo.stickerSizeCost}</span>`;
    }
}

function calculateCartItemPrice(item) {
    if (item && item.pricing) {
        return {
            unitPrice: item.pricing.tshirtPrice,
            customizationPrice: item.pricing.stickerCost + item.pricing.stickerSizeCost,
            totalPrice: item.pricing.total
        };
    }
    return {
        unitPrice: PRICING.tshirt,
        customizationPrice: 0,
        totalPrice: PRICING.tshirt
    };
}

// ─── CART STORAGE HELPER FUNCTIONS ────────────────────────────────────────────
function getCart() {
    try {
        const stored = localStorage.getItem('knightWolfCart');
        const parsed = stored ? JSON.parse(stored) : [];
        let modified = false;
        
        const upgraded = parsed.map(item => {
            // Upgrade old structures safely to prevent crashes
            if (!item.pricing) {
                item.pricing = {
                    tshirtPrice: 500,
                    stickerCount: 0,
                    stickerCost: 0,
                    enlargedStickerCount: 0,
                    stickerSizeCost: 0,
                    total: item.price ? item.price.totalPrice : 500
                };
                modified = true;
            }
            // Strip old bloated high-res screenshots to instantly recover localStorage space
            if (item.preview && item.preview.frontImage && item.preview.frontImage.length > 50000) {
                item.preview.frontImage = '';
                modified = true;
            }
            return item;
        });

        if (modified) {
            // Write clean shrunken items back to free up storage space immediately
            try {
                localStorage.setItem('knightWolfCart', JSON.stringify(upgraded));
            } catch(ex) {
                console.error('Failed to write recovered storage:', ex);
            }
        }
        return upgraded;
    } catch (e) {
        console.error('Failed to parse cart storage:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('knightWolfCart', JSON.stringify(cart));
        updateCartCount();
        renderCartDrawer();
    } catch (e) {
        console.error('Failed to write cart storage:', e);
        showToast('Unable to save cart. Storage quota full.', true);
    }
}

function addToCart(item) {
    const cart = getCart();
    
    // Hash based on fit, color, size, sticker keys, and sticker scales
    const itemHash = `${item.fit.id}_${item.color.id}_${item.size}_` +
                     `${item.customization.frontDesign.stickers[0]?.id || 'none'}_` +
                     `${item.customization.frontDesign.stickers[0]?.scale || 0}_` +
                     `${item.customization.backDesign.stickers[0]?.id || 'none'}_` +
                     `${item.customization.backDesign.stickers[0]?.scale || 0}`;

    const existing = cart.find(i => {
        const iHash = `${i.fit.id}_${i.color.id}_${i.size}_` +
                      `${i.customization.frontDesign.stickers[0]?.id || 'none'}_` +
                      `${i.customization.frontDesign.stickers[0]?.scale || 0}_` +
                      `${i.customization.backDesign.stickers[0]?.id || 'none'}_` +
                      `${i.customization.backDesign.stickers[0]?.scale || 0}`;
        return iHash === itemHash;
    });

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.push(item);
    }
    
    saveCart(cart);
}

function removeFromCart(id) {
    const cart = getCart();
    const filtered = cart.filter(item => item.id !== id);
    saveCart(filtered);
}

function updateCartQuantity(id, qty) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, qty);
        saveCart(cart);
    }
}

function clearCart() {
    saveCart([]);
}

function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
    return getCart().reduce((sum, item) => sum + (item.pricing.total * item.quantity), 0);
}

// ─── TOAST NOTIFICATION SYSTEM ────────────────────────────────────────────────
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${isError ? 'error-toast' : ''}`;
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            ${isError 
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>' 
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>'}
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Slide in
    setTimeout(() => { toast.classList.add('show'); }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 350);
    }, 3200);
}

// ─── UPDATE CART BADGE & UI ───────────────────────────────────────────────────
function updateCartCount() {
    const count = getCartCount();
    const badges = document.querySelectorAll('.cart-badge-count, .cart-drawer-count-val');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    });
}

function renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const subtotalNode = document.querySelector('.cart-subtotal-val');
    if (!container) return;

    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">YOUR BAG IS EMPTY</p>';
        if (subtotalNode) subtotalNode.textContent = '₹0.00';
        return;
    }

    container.innerHTML = cart.map(item => {
        const PLACEMENT_LABELS = {
            fullFront: 'Full Front',
            mediumFront: 'Medium Front',
            leftChest: 'Left Chest',
            fullBack: 'Full Back',
            mediumBack: 'Medium Back'
        };
        
        let placementDetails = '';
        if (item.customization && item.customization.stickers && item.customization.stickers.length > 0) {
            placementDetails = item.customization.stickers.map(s => {
                const label = PLACEMENT_LABELS[s.printSize] || s.printSize || 'Medium Front';
                const name = s.id ? s.id.replace('sticker_', '').toUpperCase() : 'Sticker';
                return `<p class="cart-item-details">Sticker: ${name} (${label})</p>`;
            }).join('');
        }

        const stickersBreakdown = item.pricing.stickerCount > 0 

            ? `<p class="cart-item-details">Stickers × ${item.pricing.stickerCount}: ₹${item.pricing.stickerCost}</p>` 
            : '';
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-preview-box">
                    <img src="${item.preview.frontImage || '/images/room_bg.png'}" alt="Preview">
                </div>
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p class="cart-item-details">${item.fit.name} • ${item.color.name} • ${item.size}</p>
                    ${placementDetails}
                    <p class="cart-item-details">Base T-Shirt: ₹${item.pricing.tshirtPrice}</p>
                    ${stickersBreakdown}
                    <div class="cart-item-controls">
                        <div class="cart-qty-selector">
                            <button class="cart-qty-btn minus-qty" data-id="${item.id}">-</button>
                            <span class="cart-qty-value">${item.quantity}</span>
                            <button class="cart-qty-btn plus-qty" data-id="${item.id}">+</button>
                        </div>
                        <p class="cart-item-price">₹${(item.pricing.total * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            </div>
        `;
    }).join('');

    if (subtotalNode) {
        subtotalNode.textContent = `₹${getCartSubtotal().toLocaleString('en-IN')}`;
    }

    // Bind quantity increment/decrement buttons inside drawer
    container.querySelectorAll('.minus-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const item = getCart().find(i => i.id === id);
            if (item) updateCartQuantity(id, item.quantity - 1);
        });
    });

    container.querySelectorAll('.plus-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const item = getCart().find(i => i.id === id);
            if (item) updateCartQuantity(id, item.quantity + 1);
        });
    });

    // Bind remove button inside drawer
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.id);
        });
    });
}

// ─── ADD TO CART ACTION FLOW ──────────────────────────────────────────────────
function capturePreview() {
    try {
        renderer.render(scene, camera);
        
        // Downscale base64 to a tiny canvas (e.g. 100x100 pixels) to avoid localStorage size limits
        const size = 100;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        
        const srcW = renderer.domElement.width;
        const srcH = renderer.domElement.height;
        const minSide = Math.min(srcW, srcH);
        
        const sx = (srcW - minSide) / 2;
        const sy = (srcH - minSide) / 2;
        
        tempCtx.drawImage(
            renderer.domElement,
            sx, sy, minSide, minSide, // center crop
            0, 0, size, size          // scale down to 100x100
        );
        
        return tempCanvas.toDataURL('image/jpeg', 0.4); // extremely small base64 (~2KB)
    } catch(e) {
        console.error('Failed to capture canvas screenshot:', e);
        return '';
    }
}

const addToCartBtn = document.querySelector('.add-to-cart-btn');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        if (addToCartBtn.disabled) return;
        
        const activeFitCard = document.querySelector('.fit-card.active');
        const activeColorSwatch = document.querySelector('.color-swatch-ring.active');
        const activeSizeBtn = document.querySelector('.size-btn.active');
        
        if (!activeFitCard) {
            showToast('Please select your fit card.', true);
            return;
        }
        if (!activeColorSwatch) {
            showToast('Please select your fabric color.', true);
            return;
        }
        if (!activeSizeBtn) {
            showToast('Please select a size before adding to cart.', true);
            return;
        }

        addToCartBtn.disabled = true;
        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = 'ADDING...';

        try {
            const fitName = activeFitCard.querySelector('.fit-name').textContent.trim();
            const fitId = activeFitCard.dataset.style || 'regular';
            const colorValue = STATE.color;
            const colorName = activeColorSwatch.getAttribute('title') || 'Fabric';
            const colorId = activeColorSwatch.dataset.color || colorValue;
            const sizeValue = activeSizeBtn.textContent.trim();
            
            // Collect stickers from both designs
            const stickers = [];
            const front = STATE.designs.front;
            if (front.stickerImage) {
                const cfg = PRINT_AREAS[front.printSize || 'mediumFront'];
                stickers.push({
                    id: front.stickerKey,
                    src: front.stickerImage.src || '',
                    printSize: front.printSize || 'mediumFront',
                    side: 'front',
                    x: cfg.x,
                    y: cfg.y
                });
            }
            const back = STATE.designs.back;
            if (back.stickerImage) {
                const cfg = PRINT_AREAS[back.printSize || 'mediumBack'];
                stickers.push({
                    id: back.stickerKey,
                    src: back.stickerImage.src || '',
                    printSize: back.printSize || 'mediumBack',
                    side: 'back',
                    x: cfg.x,
                    y: cfg.y
                });
            }

            const priceInfo = calculatePrice();

            const cartItem = {
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                product: {
                    name: 'Custom T-Shirt',
                    basePrice: PRICING.tshirt
                },
                fit: { id: fitId, name: fitName },
                color: { id: colorId, name: colorName, value: colorValue },
                size: sizeValue,
                quantity: 1,
                customization: {
                    stickers: stickers,
                    texts: front.texts.concat(back.texts),
                    uploadedImages: [],
                    frontDesign: { 
                        stickers: front.stickerImage ? [stickers.find(s => s.side === 'front')] : [],
                        texts: front.texts 
                    },
                    backDesign: { 
                        stickers: back.stickerImage ? [stickers.find(s => s.side === 'back')] : [],
                        texts: back.texts 
                    }
                },
                preview: {
                    frontImage: capturePreview(),
                    backImage: ''
                },
                pricing: priceInfo,
                price: {
                    unitPrice: priceInfo.tshirtPrice,
                    customizationPrice: priceInfo.stickerCost + priceInfo.stickerSizeCost,
                    totalPrice: priceInfo.total
                },
                createdAt: Date.now()
            };

            addToCart(cartItem);

            addToCartBtn.textContent = 'ADDED ✓';
            showToast(`Added to cart: Custom T-Shirt · ${fitName} · ${sizeValue}`);

            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.disabled = false;
                const drawer = document.getElementById('cart-drawer');
                if (drawer) drawer.classList.add('active');
            }, 1000);

        } catch (err) {
            console.error('Failed to create cart item object:', err);
            showToast('Unable to add this design to cart. Please try again.', true);
            addToCartBtn.textContent = originalText;
            addToCartBtn.disabled = false;
        }
    });
}

// ─── CART DRAWER EVENT HANDLERS ──────────────────────────────────────────────
const cartDrawer = document.getElementById('cart-drawer');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartOverlay = document.getElementById('cart-drawer-overlay');

if (openCartBtn && cartDrawer) {
    openCartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('active');
    });
}

if (closeCartBtn && cartDrawer) {
    closeCartBtn.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
    });
}

if (cartOverlay && cartDrawer) {
    cartOverlay.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
    });
}

const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        showToast('Checkout feature coming soon!');
    });
}

// Initial storage synch execution
updateLivePrice();
updateCartCount();
renderCartDrawer();

// ─── T-SHIRT TEXT CUSTOMIZATION EDITOR ───────────────────────────────────────
const FONT_MAPPING = {
    Modern: "'Montserrat', sans-serif",
    Clean: "'Poppins', sans-serif",
    Minimal: "'Roboto', sans-serif",
    Tech: "'Space Grotesk', sans-serif",
    Futuristic: "'Orbitron', sans-serif",
    
    Bold: "'Bebas Neue', sans-serif",
    Heavy: "'Anton', sans-serif",
    Impact: "Impact, sans-serif",
    Strong: "'Archivo Black', sans-serif",
    Blackout: "'Rubik Mono One', sans-serif",
    
    Classic: "Georgia, serif",
    Elegant: "'Playfair Display', serif",
    Serif: "'Times New Roman', serif",
    Vintage: "'Cinzel', serif",
    Royal: "'Cormorant Garamond', serif",
    
    Street: "'Oswald', sans-serif",
    Urban: "'Black Ops One', sans-serif",
    Graffiti: "'Permanent Marker', cursive",
    HipHop: "'Bungee', sans-serif",
    Sport: "'Teko', sans-serif",
    
    Handwritten: "'Caveat', cursive",
    Script: "'Pacifico', cursive",
    Signature: "'Dancing Script', cursive",
    Brush: "'Great Vibes', cursive",
    Casual: "'Shadows Into Light', cursive"
};

let selectedTextId = null;
let defaultFontStyle = 'Modern';

function getSelectedText() {
    const activeZone = STATE.designs[STATE.stickerZone];
    return activeZone.texts.find(t => t.id === selectedTextId);
}

function syncDesignOverlay() {
    const overlay = document.getElementById('design-canvas-overlay');
    if (!overlay) return;

    const activeZone = STATE.designs[STATE.stickerZone];
    const sizeId = activeZone.printSize || (STATE.stickerZone === 'front' ? 'mediumFront' : 'mediumBack');
    
    // 1. Update guide box size & position dynamically based on selected print size
    const VIEWPORT_PRINT_AREAS = {
        fullFront:   { width: 130, height: 180, top: 41, left: 50 },
        mediumFront: { width: 85,  height: 110, top: 38, left: 50 },
        leftChest:   { width: 40,  height: 40,  top: 33, left: 56.5 },
        fullBack:    { width: 130, height: 180, top: 41, left: 50 },
        mediumBack:  { width: 85,  height: 110, top: 38, left: 50 }
    };
    
    const area = VIEWPORT_PRINT_AREAS[sizeId];
    overlay.style.width = `${area.width}px`;
    overlay.style.height = `${area.height}px`;
    overlay.style.top = `${area.top}%`;
    overlay.style.left = `${area.left}%`;

    // 2. If a sticker is applied, add a draggable handle
    if (activeZone.stickerImage) {
        const handle = document.createElement('div');
        handle.className = 'sticker-drag-handle';
        
        // Calculate aspect ratio and dimensions with 20% safe margin
        const cfg = MODEL_CONFIGS[STATE.modelStyle];
        const aspectY = cfg.aspectY || 1.0;
        const scaleFactor = 0.95;
        
        let handleWidth = area.width * scaleFactor;
        let handleHeight = area.width * scaleFactor * aspectY;
        if (handleHeight > area.height * scaleFactor) {
            handleHeight = area.height * scaleFactor;
            handleWidth = (area.height * scaleFactor) / aspectY;
        }
        
        handle.style.width = `${handleWidth}px`;
        handle.style.height = `${handleHeight}px`;
        
        // Position handle centered on activeZone.x, activeZone.y (which default to 0.5)
        const posX = activeZone.x !== undefined ? activeZone.x : 0.5;
        const posY = activeZone.y !== undefined ? activeZone.y : 0.5;
        
        handle.style.left = `${posX * 100}%`;
        handle.style.top = `${posY * 100}%`;
        handle.style.transform = 'translate(-50%, -50%)';

        // Bind drag events
        let isDragging = false;
        let startX = 0, startY = 0;
        let origX = 0, origY = 0;

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            origX = activeZone.x !== undefined ? activeZone.x : 0.5;
            origY = activeZone.y !== undefined ? activeZone.y : 0.5;
            handle.classList.add('dragging');
        };

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
        });

        handle.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        });

        const doDrag = (clientX, clientY) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Normalized delta relative to guide box
            const normDeltaX = deltaX / area.width;
            const normDeltaY = deltaY / area.height;

            let targetX = origX + normDeltaX;
            let targetY = origY + normDeltaY;

            // Bounding box clamping: entire sticker bounding box must stay inside the print area
            const w = handleWidth / area.width;
            const h = handleHeight / area.height;
            
            const minX = w / 2;
            const maxX = 1.0 - w / 2;
            const minY = h / 2;
            const maxY = 1.0 - h / 2;

            targetX = Math.max(minX, Math.min(maxX, targetX));
            targetY = Math.max(minY, Math.min(maxY, targetY));

            activeZone.x = targetX;
            activeZone.y = targetY;

            handle.style.left = `${targetX * 100}%`;
            handle.style.top = `${targetY * 100}%`;

            repaintStickerCanvas();
        };

        window.addEventListener('mousemove', (e) => {
            if (isDragging) doDrag(e.clientX, e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                doDrag(touch.clientX, touch.clientY);
            }
        });

        const endDrag = () => {
            if (isDragging) {
                isDragging = false;
                handle.classList.remove('dragging');
            }
        };

        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);

        overlay.appendChild(handle);
    }
}

function syncTextOverlay() {
    const overlay = document.getElementById('design-canvas-overlay');
    if (!overlay) return;

    overlay.innerHTML = '';
    
    syncDesignOverlay();

    const activeZone = STATE.designs[STATE.stickerZone];
    if (!activeZone.texts || activeZone.texts.length === 0) {
        return;
    }

    activeZone.texts.forEach(txt => {
        const div = document.createElement('div');
        div.className = `text-element-overlay ${txt.id === selectedTextId ? 'active' : ''}`;
        div.dataset.id = txt.id;
        
        div.style.left = `${txt.x * 100}%`;
        div.style.top = `${txt.y * 100}%`;
        div.style.transform = `translate(-50%, -50%)`;

        const span = document.createElement('span');
        span.className = 'text-element-overlay-content';
        span.textContent = txt.content;
        
        span.style.fontFamily = txt.fontFamily;
        span.style.fontSize = `${txt.fontSize}px`;
        span.style.color = txt.color;
        span.style.fontWeight = '700';
        
        div.appendChild(span);
        overlay.appendChild(div);

        // Bind simple drag events
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let originalX = 0;
        let originalY = 0;

        div.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectText(txt.id);
            
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            originalX = txt.x;
            originalY = txt.y;
            div.style.cursor = 'grabbing';
        });

        div.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            selectText(txt.id);
            
            const touch = e.touches[0];
            isDragging = true;
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
            originalX = txt.x;
            originalY = txt.y;
        });

        const handleMove = (clientX, clientY) => {
            if (!isDragging) return;
            const rect = overlay.getBoundingClientRect();
            const deltaX = clientX - dragStartX;
            const deltaY = clientY - dragStartY;
            
            const normDeltaX = deltaX / rect.width;
            const normDeltaY = deltaY / rect.height;
            
            txt.x = Math.max(0.05, Math.min(0.95, originalX + normDeltaX));
            txt.y = Math.max(0.05, Math.min(0.95, originalY + normDeltaY));
            
            div.style.left = `${txt.x * 100}%`;
            div.style.top = `${txt.y * 100}%`;
            repaintStickerCanvas();
        };

        window.addEventListener('mousemove', (e) => {
            if (isDragging) handleMove(e.clientX, e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        });

        const endDrag = () => {
            if (isDragging) {
                isDragging = false;
                div.style.cursor = 'move';
            }
        };

        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    });
}

function selectText(id) {
    selectedTextId = id;
    
    document.querySelectorAll('.sticker-opt').forEach(opt => opt.classList.remove('active'));

    const txt = getSelectedText();
    const controlsSection = document.getElementById('text-controls-section');
    const emptyState = document.getElementById('text-empty-state');

    // Sync font style grid highlights
    const activeStyle = txt ? txt.fontStyleName : defaultFontStyle;
    document.querySelectorAll('.font-style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === activeStyle);
    });

    if (txt) {
        controlsSection.classList.remove('hidden');
        emptyState.classList.add('hidden');

        document.getElementById('edit-text-content').value = txt.content;
        document.getElementById('text-color-picker').value = txt.color;

        // Sync size buttons active class
        document.querySelectorAll('.size-preset-btn').forEach(btn => {
            const isMatch = parseInt(btn.dataset.size) === txt.fontSize;
            btn.classList.toggle('active', isMatch);
        });
    } else {
        controlsSection.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }

    syncTextOverlay();
}

// ─── ADD TEXT EVENT ──────────────────────────────────────────────────────────
const addTextBtn = document.getElementById('add-text-btn');
if (addTextBtn) {
    addTextBtn.addEventListener('click', () => {
        const input = document.getElementById('text-input');
        const content = input.value.trim();
        if (!content) {
            showToast('Please enter some text first.', true);
            return;
        }

        const activeZone = STATE.designs[STATE.stickerZone];
        const newText = {
            id: 'txt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            content: content,
            fontStyleName: defaultFontStyle,
            fontFamily: FONT_MAPPING[defaultFontStyle] || "'Montserrat', sans-serif",
            fontSize: 36, // default Medium
            fontWeight: '700',
            color: '#ffffff',
            x: 0.5, // Center chest
            y: 0.35, // Chest height
            scale: 1.0,
            rotation: 0,
            side: STATE.stickerZone
        };

        activeZone.texts.push(newText);
        input.value = '';
        selectText(newText.id);
        repaintStickerCanvas();
    });
}

// ─── CONTROL SYNC LISTENERS ──────────────────────────────────────────────────
const editContentInput = document.getElementById('edit-text-content');
if (editContentInput) {
    editContentInput.addEventListener('input', (e) => {
        const txt = getSelectedText();
        if (txt) {
            txt.content = e.target.value;
            repaintStickerCanvas();
            syncTextOverlay();
        }
    });
}

// Font Style Grid clicking bindings
document.querySelectorAll('.font-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const style = btn.dataset.font;
        const txt = getSelectedText();
        
        if (txt) {
            txt.fontStyleName = style;
            txt.fontFamily = FONT_MAPPING[style];
            repaintStickerCanvas();
            syncTextOverlay();
        } else {
            // Apply to next added text
            defaultFontStyle = style;
        }

        // Highlight active style button
        document.querySelectorAll('.font-style-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.font === style);
        });
    });
});

// Size preset triggers
document.querySelectorAll('.size-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const txt = getSelectedText();
        if (txt) {
            const size = parseInt(btn.dataset.size);
            txt.fontSize = size;
            document.querySelectorAll('.size-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            repaintStickerCanvas();
            syncTextOverlay();
        }
    });
});

const colorPicker = document.getElementById('text-color-picker');
if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
        const txt = getSelectedText();
        if (txt) {
            txt.color = e.target.value;
            repaintStickerCanvas();
            syncTextOverlay();
        }
    });
}

// Delete text
const deleteBtn = document.getElementById('delete-text-btn');
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        const txt = getSelectedText();
        if (txt) {
            const activeZone = STATE.designs[STATE.stickerZone];
            activeZone.texts = activeZone.texts.filter(t => t.id !== txt.id);
            selectText(null);
            repaintStickerCanvas();
        }
    });
}

// Keyboard Backspace/Delete hook
window.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
            return;
        }

        const txt = getSelectedText();
        if (txt) {
            e.preventDefault();
            const activeZone = STATE.designs[STATE.stickerZone];
            activeZone.texts = activeZone.texts.filter(t => t.id !== txt.id);
            selectText(null);
            repaintStickerCanvas();
        }
    }
});

// Click outside deselects text
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#design-canvas-overlay') || e.target.closest('#panel-text') || e.target.closest('#toast-container')) {
        return;
    }
    selectText(null);
});


