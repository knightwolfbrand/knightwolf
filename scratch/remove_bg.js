const sharp = require('sharp');
const path = require('path');

const inputPath = '/Users/apple/Documents/knightwolf/public/stickers/user_sticker.png';
const outputPath = '/Users/apple/Documents/knightwolf/public/stickers/user_sticker_transparent.png';

sharp(inputPath)
  .ensureAlpha()
  .toFormat('png')
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const { width, height, channels } = info;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If the pixel is very bright (near white), make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }
    
    return sharp(data, { raw: { width, height, channels } })
      .toFile(outputPath);
  })
  .then(() => {
    console.log('Background removed successfully!');
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
