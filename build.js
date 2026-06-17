import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuilds() {
  console.log('🚀 Starting extension build process...');

  try {
    // 1. Build the React popup
    console.log('\n📦 Building Popup UI...');
    await build({
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: true, // clear output directory first
        rollupOptions: {
          input: {
            popup: resolve(__dirname, 'index.html'),
          },
          output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          }
        },
      },
    });
    console.log('✅ Popup UI built successfully.');

    // 2. Build Content Script (Library mode to prevent code splitting)
    console.log('\n⚙️ Building Content Script...');
    await build({
      configFile: false, // disable loading of vite.config.ts
      build: {
        outDir: 'dist',
        emptyOutDir: false, // keep popup files
        lib: {
          entry: resolve(__dirname, 'src/content/contentScript.ts'),
          name: 'contentScript',
          formats: ['iife'],
          fileName: () => 'contentScript.js',
        },
        rollupOptions: {
          output: {
            extend: true,
          },
        },
      },
    });
    console.log('✅ Content Script built successfully.');

    // 3. Build Background Service Worker (Library mode)
    console.log('\n⚙️ Building Background Service Worker...');
    await build({
      configFile: false,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(__dirname, 'src/background/background.ts'),
          name: 'background',
          formats: ['iife'],
          fileName: () => 'background.js',
        },
        rollupOptions: {
          output: {
            extend: true,
          },
        },
      },
    });
    console.log('✅ Background Service Worker built successfully.');

    // 4. Copy manifest.json
    console.log('\n📋 Copying Manifest file...');
    const manifestSrc = resolve(__dirname, 'src/manifest.json');
    const manifestDst = resolve(__dirname, 'dist/manifest.json');
    if (fs.existsSync(manifestSrc)) {
      fs.copyFileSync(manifestSrc, manifestDst);
      console.log('✅ manifest.json copied to dist/manifest.json.');
    } else {
      console.error('❌ src/manifest.json does not exist!');
      process.exit(1);
    }

    // 5. Package into dist.zip
    console.log('\n🤐 Packaging dist/ into dist.zip for Chrome Web Store...');
    await packageExtension();
    console.log('🎉 Build process completed successfully!');

  } catch (error) {
    console.error('❌ Build failed with error:', error);
    process.exit(1);
  }
}

function packageExtension() {
  return new Promise((resolvePromise, rejectPromise) => {
    const zipPath = resolve(__dirname, 'dist.zip');
    
    // Delete existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // maximum compression
    });

    output.on('close', () => {
      console.log(`✅ dist.zip successfully created (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB).`);
      resolvePromise(true);
    });

    archive.on('error', (err) => {
      rejectPromise(err);
    });

    archive.pipe(output);
    archive.directory('dist/', false);
    archive.finalize();
  });
}

runBuilds();
