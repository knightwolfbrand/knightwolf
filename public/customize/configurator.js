import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURATION & STATE ---
const STATE = {
    color: '#f5f5f5', // Default color white as per user instructions
    loaded: false,
    modelStyle: 'regular',
    fabricStyle: 'structured',
    stickerImage: null,      // raw HTMLImageElement of chosen sticker
    stickerZone: 'front',    // 'front' | 'back'
    stickerScale: 0.15,      
    _cachedCleanSticker: null, 
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
        uvCenter: { cx: 0.25, cy: 0.68 },
        uvBack:   { cx: 0.75, cy: 0.68 }, 
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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false; // Disabled real shadow maps for premium optimization
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
controls.minDistance = 12.8;
controls.maxDistance = 20;
controls.minPolarAngle = Math.PI * 0.5;
controls.maxPolarAngle = Math.PI * 0.5;
controls.update();


// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
const texLoader = new THREE.TextureLoader();

// Soft volumetric shadows under T-shirt hem
const shadowTexture = texLoader.load('https://threejs.org/examples/textures/shadow.png');
const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.45, depthWrite: false })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -1.2;
scene.add(shadowPlane);

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(4, 8, 10);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
fillLight.position.set(-8, 3, 6);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 6, -12);
scene.add(rimLight);

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
    return c;
}

function repaintStickerCanvas() {
    uvCtx.fillStyle = hexToRgb(STATE.color);
    uvCtx.fillRect(0, 0, UV_SIZE, UV_SIZE);

    if (STATE.stickerImage) {
        const cfg = MODEL_CONFIGS[STATE.modelStyle];
        const uv = (STATE.stickerZone === 'front') ? cfg.uvCenter : cfg.uvBack;
        
        const stickerSize = Math.round(UV_SIZE * STATE.stickerScale);
        const aspectY = cfg.aspectY || 1.0;

        if (!STATE._cachedCleanSticker) {
            STATE._cachedCleanSticker = removeBackground(STATE.stickerImage);
        }
        const cleanSticker = STATE._cachedCleanSticker;

        const sx = Math.round(uv.cx * UV_SIZE);
        const sy = Math.round(uv.cy * UV_SIZE);

        uvCtx.save();
        uvCtx.translate(sx, sy);

        if (cfg.isFlipped) {
            uvCtx.scale(1, -1);
        }

        uvCtx.drawImage(
            cleanSticker, 
            -stickerSize / 2, 
            -(stickerSize * aspectY) / 2, 
            stickerSize, 
            stickerSize * aspectY
        );
        uvCtx.restore();
    }
    uvTexture.needsUpdate = true;
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
    if (tshirtModel) { scene.remove(tshirtModel); tshirtModel = null; }
    loader.load(
        MODEL_CONFIGS[style].url,
        (gltf) => {
            tshirtModel = gltf.scene;
            fitModel(tshirtModel, 7.8);
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
            fitModel(tshirtModel, 7.8);
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
    repaintStickerCanvas(); 
}

// ─── PRELOAD STICKER IMAGES ───────────────────────────────────────────────────
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
    art8:       '/images/PHOTO-2026-05-07-11-16-19.png',
    art9:       '/images/PHOTO-2026-05-07-11-16-41.png',
    art10:      '/images/PHOTO-2026-05-07-11-19-49.png',
    art11:      '/images/PHOTO-2026-05-07-11-22-00.png',
};
Object.entries(STICKER_SRCS).forEach(([key, src]) => {
    const img = new Image();
    img.onload = () => {
        stickerImages[key] = img;
        console.log(`✅ Sticker loaded: ${key}`);
        if (key === 'logo') {
            applySticker('logo');
        }
    };
    img.src = src;
});

function applySticker(key) {
    if (!stickerImages[key]) { return; }
    STATE.stickerImage = stickerImages[key];
    STATE._cachedCleanSticker = null; 
    repaintStickerCanvas();
}

function applyCustomSticker(imgEl) {
    STATE.stickerImage = imgEl;
    STATE._cachedCleanSticker = null; 
    repaintStickerCanvas();
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

// Sticker grid buttons
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

        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Natural Orbital Swivel
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
    });
});

// Sticker size slider
document.querySelectorAll('#sticker-resize').forEach(slider => {
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        STATE.stickerScale = val;
        repaintStickerCanvas();

        // Dynamically scale the active sticker preview image on the side grid
        const activeImg = document.querySelector('.sticker-opt.active img');
        if (activeImg) {
            const visualScale = 0.8 + ((val - 0.05) / 0.45) * 0.7; // Maps 0.05-0.5 to 0.8-1.5
            activeImg.style.transform = `scale(${visualScale})`;
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
    // slow auto-rotate loop or small nudge
    controls.autoRotate = !controls.autoRotate;
    controls.autoRotateSpeed = 2.0;
    document.getElementById('ctrl-rotate').classList.toggle('active', controls.autoRotate);
});

document.getElementById('ctrl-zoom').addEventListener('click', () => {
    // toggle between zoom configurations
    const isZoomed = camera.position.z < 14.5;
    gsap.to(camera.position, {
        z: isZoomed ? 17 : 13.0,
        y: isZoomed ? 4 : 3.8,
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
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
console.log('Knight Wolf Configurator v5.0 — 3-Column Premium Mode');

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
function calculateCartItemPrice(config) {
    const basePrice = 1499.00;
    const customizationPrice = 0.00; // Customizable/sticker upgrades can go here
    return {
        unitPrice: basePrice,
        customizationPrice: customizationPrice,
        totalPrice: basePrice + customizationPrice
    };
}

// ─── CART STORAGE HELPER FUNCTIONS ────────────────────────────────────────────
function getCart() {
    try {
        const stored = localStorage.getItem('knightWolfCart');
        return stored ? JSON.parse(stored) : [];
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
    
    // Config hash check to combine duplicates
    const itemHash = `${item.fit.id}_${item.color.id}_${item.size}_${item.customization.stickers[0]?.id || 'none'}_${item.customization.stickers[0]?.side || 'front'}`;
    const existing = cart.find(i => {
        const iHash = `${i.fit.id}_${i.color.id}_${i.size}_${i.customization.stickers[0]?.id || 'none'}_${i.customization.stickers[0]?.side || 'front'}`;
        return iHash === itemHash;
    });

    if (existing) {
        existing.quantity += item.quantity;
        existing.price = calculateCartItemPrice(existing); // recalculate total price
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
        item.price = calculateCartItemPrice(item);
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
    return getCart().reduce((sum, item) => sum + (item.price.totalPrice * item.quantity), 0);
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
        const customizationInfo = item.customization.stickers[0] 
            ? `• ${item.customization.stickers[0].id.toUpperCase()}` 
            : '';
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-preview-box">
                    <img src="${item.preview.frontImage || '/images/room_bg.png'}" alt="Preview">
                </div>
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p class="cart-item-details">${item.fit.name} • ${item.color.name} • ${item.size} ${customizationInfo}</p>
                    <div class="cart-item-controls">
                        <div class="cart-qty-selector">
                            <button class="cart-qty-btn minus-qty" data-id="${item.id}">-</button>
                            <span class="cart-qty-value">${item.quantity}</span>
                            <button class="cart-qty-btn plus-qty" data-id="${item.id}">+</button>
                        </div>
                        <p class="cart-item-price">₹${(item.price.totalPrice * item.quantity).toLocaleString('en-IN')}</p>
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
        // data URL is JPEG at 0.5 quality to protect localStorage limit sizes
        return renderer.domElement.toDataURL('image/jpeg', 0.5);
    } catch(e) {
        console.error('Failed to capture canvas screenshot:', e);
        return '';
    }
}

const addToCartBtn = document.querySelector('.add-to-cart-btn');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        // Double-click protection
        if (addToCartBtn.disabled) return;
        
        // 1. Validation check
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

        // Lock button
        addToCartBtn.disabled = true;
        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = 'ADDING...';

        try {
            // Collect metadata fields
            const fitName = activeFitCard.querySelector('.fit-name').textContent.trim();
            const fitId = activeFitCard.dataset.style || 'regular';
            const colorValue = STATE.color;
            const colorName = activeColorSwatch.getAttribute('title') || 'Fabric';
            const colorId = activeColorSwatch.dataset.color || colorValue;
            const sizeValue = activeSizeBtn.textContent.trim();
            
            // Collect active sticker
            const activeStickerOpt = document.querySelector('.sticker-opt.active');
            const stickers = [];
            if (STATE.stickerImage && activeStickerOpt) {
                const stickerId = activeStickerOpt.dataset.sticker;
                const stickerSrc = activeStickerOpt.querySelector('img').getAttribute('src');
                const cfg = MODEL_CONFIGS[STATE.modelStyle];
                const uv = (STATE.stickerZone === 'front') ? cfg.uvCenter : cfg.uvBack;
                stickers.push({
                    id: stickerId,
                    src: stickerSrc,
                    x: uv.cx,
                    y: uv.cy,
                    scale: STATE.stickerScale,
                    rotation: 0,
                    side: STATE.stickerZone
                });
            }

            const cartItem = {
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                product: {
                    name: 'Custom T-Shirt',
                    basePrice: 1499.00
                },
                fit: { id: fitId, name: fitName },
                color: { id: colorId, name: colorName, value: colorValue },
                size: sizeValue,
                quantity: 1,
                customization: {
                    stickers: stickers,
                    texts: [],
                    uploadedImages: [],
                    frontDesign: STATE.stickerZone === 'front' ? { stickers } : { stickers: [] },
                    backDesign: STATE.stickerZone === 'back' ? { stickers } : { stickers: [] }
                },
                preview: {
                    frontImage: capturePreview(),
                    backImage: ''
                },
                price: calculateCartItemPrice(),
                createdAt: Date.now()
            };

            // Save to localStorage
            addToCart(cartItem);

            // Button success visual feedback
            addToCartBtn.textContent = 'ADDED ✓';
            showToast(`Added to cart: Custom T-Shirt · ${fitName} · ${sizeValue}`);

            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.disabled = false;
                // Open drawer after successful action
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
updateCartCount();
renderCartDrawer();

