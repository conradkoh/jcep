#!/usr/bin/env bun

/**
 * App Icon Generator
 *
 * Generates all PWA app icons from the SVG source, plus the favicon.
 *
 * Usage:
 *   bun scripts/generate-icons.ts              # Generate all icons + favicon
 *
 * Source: public/svg-sources/app-icon.svg
 * Output:
 *   - public/appicon-{size}x{size}.png (all sizes for PWA manifest)
 *   - src/app/favicon.ico (browser favicon)
 *
 * Note: If you have a custom favicon design (different from app icon),
 * place it directly at src/app/favicon.ico and don't run this script.
 *
 * For complete documentation on PWA setup, see:
 * guides/pwa/pwa-setup.md
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon sizes to generate (matching manifest.ts)
const SIZES = [16, 32, 64, 96, 128, 192, 256, 384, 512, 1024] as const;

// Opaque background for iOS PWA icons (no alpha channel — iOS renders transparency as white matte)
const ICON_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }; // #ffffff

// Paths
const SVG_SOURCE = join(__dirname, '../public/svg-sources/app-icon.svg');
const PUBLIC_DIR = join(__dirname, '../public');
const FAVICON_OUTPUT = join(__dirname, '../src/app/favicon.ico');

/**
 * Renders the SVG source to a 1024x1024 opaque PNG buffer.
 */
async function renderSourcePng(): Promise<Buffer> {
  return sharp(SVG_SOURCE)
    .resize(1024, 1024, { fit: 'contain', background: ICON_BACKGROUND })
    .flatten({ background: ICON_BACKGROUND })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function generateAppIcons(): Promise<boolean> {
  console.log('🎨 Generating app icons from public/svg-sources/app-icon.svg...\n');

  try {
    // Render the SVG source once and reuse the buffer for all sizes
    const sourcePng = await renderSourcePng();

    // Generate each size
    for (const size of SIZES) {
      const outputFile = join(PUBLIC_DIR, `appicon-${size}x${size}.png`);

      await sharp(sourcePng)
        .resize(size, size, {
          fit: 'contain',
          background: ICON_BACKGROUND,
        })
        .flatten({ background: ICON_BACKGROUND })
        .removeAlpha()
        .png()
        .toFile(outputFile);

      console.log(`✅ Generated appicon-${size}x${size}.png`);
    }

    return true;
  } catch (error) {
    console.error(
      '❌ Error generating app icons:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

async function generateFavicon(): Promise<boolean> {
  console.log('\n🔷 Generating favicon.ico...\n');

  try {
    // Use 16, 32, 64 pixel icons for the favicon
    const sizes = [16, 32, 64];
    const pngFiles = sizes.map((size) => join(PUBLIC_DIR, `appicon-${size}x${size}.png`));

    // Check if all PNG files exist
    for (const file of pngFiles) {
      if (!existsSync(file)) {
        console.error(`❌ PNG file not found: ${file}`);
        return false;
      }
    }

    // Read PNG files
    const pngBuffers = await Promise.all(pngFiles.map((file) => readFile(file)));

    // Create ICO file - handle ESM default export
    const icoFn = (pngToIco as { default?: typeof pngToIco }).default || pngToIco;
    const icoBuffer = await icoFn(pngBuffers);

    // Write ICO file to src/app/ (Next.js App Router convention)
    await writeFile(FAVICON_OUTPUT, icoBuffer);

    console.log(`✅ Generated favicon.ico at src/app/favicon.ico`);
    return true;
  } catch (error) {
    console.error(
      '❌ Error generating favicon:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

async function main(): Promise<void> {
  // Check if source file exists
  if (!existsSync(SVG_SOURCE)) {
    console.error('❌ Error: Source file not found at:', SVG_SOURCE);
    console.error('Please ensure app-icon.svg exists in the public/svg-sources directory.');
    process.exit(1);
  }

  console.log('📦 Icon Generator\n');
  console.log(`Source: ${SVG_SOURCE}\n`);

  // Generate app icons
  const iconsSuccess = await generateAppIcons();
  if (!iconsSuccess) {
    process.exit(1);
  }

  // Generate favicon
  const faviconSuccess = await generateFavicon();
  if (!faviconSuccess) {
    process.exit(1);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('\nOutput:');
  console.log('  - public/appicon-*.png (PWA manifest icons)');
  console.log('  - src/app/favicon.ico (browser favicon)');
}

main();
