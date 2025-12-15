#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Icon sizes to generate, matching the sizes defined in manifest.ts.
 */
const _SIZES = [16, 32, 64, 96, 128, 192, 256, 384, 512, 1024] as const;

/**
 * Path to the source icon file (1024x1024 PNG).
 */
const _SOURCE_FILE = join(__dirname, '../public/appicon-1024x1024.png');

/**
 * Directory where generated icons will be saved.
 */
const _OUTPUT_DIR = join(__dirname, '../public');

/**
 * Generates app icons in multiple sizes from a source 1024x1024 PNG file.
 * Creates icons for all sizes defined in _SIZES, skipping the source file itself.
 *
 * @throws Exits process with code 1 if source file is missing or generation fails.
 */
async function generateIcons(): Promise<void> {
  if (!existsSync(_SOURCE_FILE)) {
    console.error('❌ Error: Source file not found at:', _SOURCE_FILE);
    console.error('Please ensure appicon-1024x1024.png exists in the public directory.');
    process.exit(1);
  }

  console.log('🎨 Generating app icons from appicon-1024x1024.png...\n');

  try {
    const sourceImage = sharp(_SOURCE_FILE);
    const metadata = await sourceImage.metadata();

    if (metadata.width !== 1024 || metadata.height !== 1024) {
      console.warn(
        `⚠️  Warning: Source image is ${metadata.width}x${metadata.height}, expected 1024x1024`
      );
    }

    for (const size of _SIZES) {
      const outputFile = join(_OUTPUT_DIR, `appicon-${size}x${size}.png`);

      if (outputFile === _SOURCE_FILE) {
        console.log(`⏭️  Skipped appicon-${size}x${size}.png (source file)`);
        continue;
      }

      await sharp(_SOURCE_FILE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputFile);

      console.log(`✅ Generated appicon-${size}x${size}.png`);
    }

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error(
      '❌ Error generating icons:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

generateIcons();
