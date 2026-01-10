// Script to generate extension icons from logo.png
// Resizes the logo to standard Chrome extension icon sizes

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const publicPath = path.join(__dirname, '..', 'public');
const distPath = path.join(__dirname, '..', 'dist');

console.log('🎨 TabEcho Icon Generator\n');

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
    console.log('🎨 Creating icons from logo.png...\n');

    const conversions = sizes.map(async (size) => {
      const publicPngPath = path.join(publicPath, `icon-${size}.png`);
      const distPngPath = path.join(distPath, `icon-${size}.png`);

      // Resize logo to the icon size
      await sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(publicPngPath);

      // Copy to dist if it exists
      if (fs.existsSync(distPath)) {
        await sharp(publicPngPath).toFile(distPngPath);
      }

      console.log(`✅ Created icon-${size}.png`);
    });

    await Promise.all(conversions);
    console.log('\n✨ All icons created successfully!');
    console.log('Icons saved to public/ folder (and dist/ if it exists).');

  } catch (err) {
    console.error('❌ Error generating icons:', err.message);
    process.exit(1);
  }
})();
