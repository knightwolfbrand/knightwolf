const fs = require('fs');
const { NodeIO } = require('@gltf-transform/core');

async function inspectGLB(path) {
  const io = new NodeIO();
  const document = await io.read(path);
  const root = document.getRoot();
  const meshes = root.listMeshes();
  console.log(`--- ${path} ---`);
  meshes.forEach(mesh => {
    console.log(`Mesh: ${mesh.getName()}`);
  });
  const nodes = root.listNodes();
  nodes.forEach(node => {
    if (node.getMesh()) {
      console.log(`Node with Mesh: ${node.getName()} (Mesh: ${node.getMesh().getName()})`);
    }
  });
}

inspectGLB('./public/models/shirt_baked.glb');
inspectGLB('./public/models/oversized_tshirt.glb');
