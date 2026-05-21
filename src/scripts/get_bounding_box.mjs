import * as THREE from 'three';
import fs from 'fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.self = global.window;
global.Blob = dom.window.Blob;
global.FileReader = dom.window.FileReader;
global.TextEncoder = dom.window.TextEncoder;
global.TextDecoder = dom.window.TextDecoder;

async function getBoundingBox() {
    const loader = new GLTFLoader();

    console.log("Loading oversized T-shirt model...");
    const modelData = fs.readFileSync('public/models/oversized_tshirt.glb');
    const arrayBuffer = modelData.buffer.slice(modelData.byteOffset, modelData.byteOffset + modelData.byteLength);

    loader.parse(arrayBuffer, '', (gltf) => {
        const scene = gltf.scene;
        
        console.log("\n--- Mesh Bounding Boxes ---");
        scene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeBoundingBox();
                const box = child.geometry.boundingBox;
                console.log(`\nMesh Name: ${child.name}`);
                console.log(`- Local Position:`, child.position);
                console.log(`- Local Rotation:`, child.rotation);
                console.log(`- Local Scale:`, child.scale);
                console.log(`- Bbox Center: X=${((box.max.x + box.min.x)/2).toFixed(4)}, Y=${((box.max.y + box.min.y)/2).toFixed(4)}, Z=${((box.max.z + box.min.z)/2).toFixed(4)}`);
                console.log(`- Bbox Min: X=${box.min.x.toFixed(4)}, Y=${box.min.y.toFixed(4)}, Z=${box.min.z.toFixed(4)}`);
                console.log(`- Bbox Max: X=${box.max.x.toFixed(4)}, Y=${box.max.y.toFixed(4)}, Z=${box.max.z.toFixed(4)}`);
            } else {
                console.log(`\nNon-Mesh Name: ${child.name} (${child.type})`);
                console.log(`- Position:`, child.position);
                console.log(`- Rotation:`, child.rotation);
                console.log(`- Scale:`, child.scale);
            }
        });
    }, (error) => {
        console.error("Error loading model:", error);
    });
}

getBoundingBox();
