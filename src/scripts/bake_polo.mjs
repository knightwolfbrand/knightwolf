const THREE = require('three');
const fs = require('fs');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
const { BufferGeometryUtils } = require('three/examples/jsm/utils/BufferGeometryUtils');
const { JSDOM } = require('jsdom');

// Mock browser environment for Three.js loaders/exporters
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.self = global.window;
global.Blob = dom.window.Blob;
global.FileReader = dom.window.FileReader;
global.TextEncoder = dom.window.TextEncoder;
global.TextDecoder = dom.window.TextDecoder;

async function bakePolo() {
    const loader = new GLTFLoader();
    const exporter = new GLTFExporter();

    console.log("Loading base model...");
    const modelData = fs.readFileSync('public/models/tshirt.glb');
    const arrayBuffer = modelData.buffer.slice(modelData.byteOffset, modelData.byteOffset + modelData.byteLength);

    loader.parse(arrayBuffer, '', (gltf) => {
        const scene = gltf.scene;
        const meshes = [];
        
        scene.traverse((child) => {
            if (child.isMesh) {
                // Ensure geometry is clean
                child.geometry.applyMatrix4(child.matrixWorld);
                meshes.push(child.geometry);
            }
        });

        console.log("Generating procedural polo parts...");
        // Procedural Collar
        const collarGeom = new THREE.CylinderGeometry(0.095, 0.105, 0.06, 32, 1, true);
        collarGeom.rotateZ(Math.PI / 2);
        collarGeom.translate(0, 0.48, 0.02);
        meshes.push(collarGeom);

        // Collar Wings
        const wingL = new THREE.BoxGeometry(0.08, 0.01, 0.12);
        const wingR = new THREE.BoxGeometry(0.08, 0.01, 0.12);
        
        const matrixL = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.4, -0.5, -0.3));
        matrixL.setPosition(0.06, 0.44, 0.1);
        wingL.applyMatrix4(matrixL);
        
        const matrixR = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.4, 0.5, 0.3));
        matrixR.setPosition(-0.06, 0.44, 0.1);
        wingR.applyMatrix4(matrixR);

        meshes.push(wingL, wingR);

        // Placket
        const placket = new THREE.BoxGeometry(0.035, 0.18, 0.005);
        placket.translate(0, 0.36, 0.1);
        meshes.push(placket);

        // Buttons
        for (let i = 0; i < 3; i++) {
            const button = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16);
            button.rotateX(Math.PI / 2);
            button.translate(0, 0.41 - (i * 0.05), 0.11);
            meshes.push(button);
        }

        console.log("Merging all geometries into a single mesh...");
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(meshes);
        const finalMesh = new THREE.Mesh(mergedGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));

        console.log("Exporting to GLB...");
        exporter.parse(finalMesh, (result) => {
            const buffer = Buffer.from(result);
            fs.writeFileSync('public/models/classic_polo_baked.glb', buffer);
            console.log("Success! Created public/models/classic_polo_baked.glb");
        }, { binary: true });
    }, (error) => {
        console.error("Error loading model:", error);
    });
}

bakePolo();
