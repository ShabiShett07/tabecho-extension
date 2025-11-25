// Simple script to generate placeholder icons for the Chrome extension
// This creates colored square PNG images using node-canvas (if available) or data URLs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const distPath = path.join(__dirname, '..', 'dist');

// Create a simple SVG that we'll save as a reference
// Users can convert this to PNG using online tools or image editors
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-weight="bold"
    font-size="${size * 0.5}"
    fill="white">
    T
  </text>
</svg>
`;

console.log('🎨 TabEcho Icon Generator\n');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create SVG files
console.log('Creating SVG icon templates...');
sizes.forEach(size => {
  const svgPath = path.join(distPath, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, createSVG(size));
  console.log(`✅ Created icon-${size}.svg`);
});

console.log('\n📝 Next steps:');
console.log('1. The SVG files have been created in the dist/ folder');
console.log('2. Convert them to PNG using one of these methods:\n');
console.log('   Option A - Online converter:');
console.log('   • Go to https://cloudconvert.com/svg-to-png');
console.log('   • Upload each SVG and download as PNG\n');
console.log('   Option B - ImageMagick (if installed):');
console.log('   • Run: convert icon-16.svg icon-16.png (repeat for each size)\n');
console.log('   Option C - Photoshop/Figma/Canva:');
console.log('   • Open SVG, export as PNG at the correct size\n');
console.log('   Option D - Use existing icons:');
console.log('   • Place your own PNG icons in the dist/ folder');
console.log('   • Name them: icon-16.png, icon-32.png, icon-48.png, icon-128.png\n');

// Check if sharp is available (for PNG conversion)
(async () => {
  try {
    const sharp = (await import('sharp')).default;
    console.log('🎨 Converting SVG to PNG using sharp...\n');

    const conversions = sizes.map(async (size) => {
      const svgPath = path.join(distPath, `icon-${size}.svg`);
      const pngPath = path.join(distPath, `icon-${size}.png`);

      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✅ Converted icon-${size}.png`);
    });

    await Promise.all(conversions);
    console.log('\n✨ All icons created successfully!');
    console.log('You can now load the extension in Chrome from the dist/ folder.');

  } catch (err) {
    console.log('ℹ️  For automatic PNG conversion, install sharp:');
    console.log('   npm install --save-dev sharp\n');
    console.log('Otherwise, manually convert the SVG files to PNG.\n');
  }
})();
