const fs = require('fs');

function readGlbJson() {
  const filePath = 'public/models/oversized_tshirt.glb';
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }

  const fd = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(20);
  fs.readSync(fd, header, 0, 20, 0);

  const magic = header.toString('utf8', 0, 4);
  const version = header.readUInt32LE(4);
  const totalLength = header.readUInt32LE(8);
  const chunkLength = header.readUInt32LE(12);
  const chunkType = header.toString('utf8', 16, 20);

  console.log(`GLB Magic: ${magic}, Version: ${version}, Chunk Type: ${chunkType}, Chunk Length: ${chunkLength}`);

  if (magic !== 'glTF' || chunkType !== 'JSON') {
    console.error("Invalid GLB file");
    return;
  }

  const jsonBuffer = Buffer.alloc(chunkLength);
  fs.readSync(fd, jsonBuffer, 0, chunkLength, 20);
  fs.closeSync(fd);

  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  console.log("\nNodes with translation/scale/rotation:");
  if (gltf.nodes) {
    gltf.nodes.forEach((node, idx) => {
      if (node.name || node.translation || node.scale || node.mesh !== undefined) {
        console.log(`Node ${idx}: ${node.name || 'Unnamed'}`, {
          mesh: node.mesh,
          translation: node.translation,
          scale: node.scale,
          rotation: node.rotation,
          children: node.children
        });
      }
    });
  }

  console.log("\nMeshes count:", gltf.meshes ? gltf.meshes.length : 0);
}

readGlbJson();
