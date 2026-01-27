// scripts/optimize-images.js
// Usage: install sharp (`npm install sharp`) then run `node scripts/optimize-images.js`
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'images');
const outDir = path.join(srcDir, 'variants');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Automatically discover raster images in the images folder
const supportedExt = ['.png', '.jpg', '.jpeg'];
const files = fs.readdirSync(srcDir).filter(f => supportedExt.includes(path.extname(f).toLowerCase()));

// Sizes to generate (widths). Add 1920 for hero/fullscreen
const sizes = [400, 800, 1200, 1600, 1920];

async function processFile(file){
  const input = path.join(srcDir, file);
  if (!fs.existsSync(input)) { console.warn('Missing', file); return; }
  const name = path.parse(file).name;
  for (const w of sizes){
    const outWebp = path.join(outDir, `${name}-${w}.webp`);
    const outJpg = path.join(outDir, `${name}-${w}.jpg`);
    const outAvif = path.join(outDir, `${name}-${w}.avif`);
    try{
      await sharp(input)
        .resize({ width: w })
        .webp({ quality: 80 })
        .toFile(outWebp);
      await sharp(input)
        .resize({ width: w })
        .jpeg({ quality: 82 })
        .toFile(outJpg);
      await sharp(input)
        .resize({ width: w })
        .avif({ quality: 60 })
        .toFile(outAvif);
      console.log(`Wrote ${path.basename(outWebp)}, ${path.basename(outJpg)}, ${path.basename(outAvif)}`);
    } catch(err){ console.error('Error', file, w, err.message); }
  }
}

(async ()=>{
  if (files.length === 0){ console.log('No raster images found in images/ to process.'); return; }
  console.log('Found images:', files.join(', '));
  for (const f of files){ await processFile(f); }
  console.log('Done. Variants in images/variants/');
})();
