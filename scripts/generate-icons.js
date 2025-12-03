// Script to generate extension icons with purplish gradient background
// Composites the logo.png over a gradient background

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const publicPath = path.join(__dirname, '..', 'public');
const distPath = path.join(__dirname, '..', 'dist');

// Create gradient background SVG matching header gradient (135deg, #667eea -> #764ba2)
const createGradientSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
</svg>
`;

console.log('🎨 TabEcho Icon Generator with Gradient Background\n');

// Check if logo exists
const logoPath = path.join(publicPath, 'logo.png');
if (!fs.existsSync(logoPath)) {
  console.error('❌ Error: logo.png not found in public/ folder.');
  process.exit(1);
}

// Check if sharp is available (for PNG conversion)
(async () => {
  try {
    const sharp = (await import('sharp')).default;
    console.log('🎨 Creating icons with gradient background...\n');

    const conversions = sizes.map(async (size) => {
      // Create gradient background
      const gradientSVG = Buffer.from(createGradientSVG(size));

      // Resize logo to fit the icon (80% of icon size for padding)
      const logoSize = Math.round(size * 0.8);
      const logoBuffer = await sharp(logoPath)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      // Composite logo over gradient background
      const publicPngPath = path.join(publicPath, `icon-${size}.png`);
      const distPngPath = path.join(distPath, `icon-${size}.png`);

      await sharp(gradientSVG)
        .composite([{
          input: logoBuffer,
          gravity: 'center'
        }])
        .png()
        .toFile(publicPngPath);

      // Copy to dist if it exists
      if (fs.existsSync(distPath)) {
        await sharp(publicPngPath).toFile(distPngPath);
      }

      console.log(`✅ Created icon-${size}.png`);
    });

    await Promise.all(conversions);
    console.log('\n✨ All icons created successfully with gradient background!');
    console.log('Icons saved to public/ folder (and dist/ if it exists).');

  } catch (err) {
    console.error('❌ Error generating icons:', err.message);
    process.exit(1);
  }
})();
