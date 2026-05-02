const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function removeBackground(inputPath, outputPath) {
    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Target white/near-white backgrounds
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // If it's very bright (near white), make it transparent
        if (r > 240 && g > 240 && b > 240) {
            data[i+3] = 0;
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Processed: ${outputPath}`);
}

async function run() {
    const stickers = [
        { name: 'sacrifice', src: 'public/images/stickers/sacrifice.png' },
        { name: 'justdoit', src: 'public/images/stickers/justdoit.png' },
        { name: 'realistic', src: 'public/images/stickers/realistic.png' }
    ];
    
    for (const sticker of stickers) {
        await removeBackground(sticker.src, `public/images/sticker_${sticker.name}.png`);
    }
}

run().catch(console.error);
