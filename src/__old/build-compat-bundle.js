// Build script to create a standalone fiximod-compat bundle
import { readFileSync, writeFileSync } from 'fs';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

async function buildCompatBundle() {
  try {
    // Create a rollup bundle
    const bundle = await rollup({
      input: './dist/fiximod-compat.js',
      plugins: [
        nodeResolve({
          browser: true,
          preferBuiltins: false
        })
      ]
    });

    // Generate the bundle
    const { output } = await bundle.generate({
      format: 'iife',
      name: 'fixi',
      compact: true
    });

    // Write the bundled file
    const code = output[0].code;
    writeFileSync('./dist/fiximod-compat-bundle.js', code);
    
    console.log('✅ Created fiximod-compat-bundle.js');
    
    // Get file sizes
    const bundleSize = code.length;
    const gzipSize = (await import('zlib')).gzipSync(code).length;
    
    console.log(`📦 Bundle size: ${bundleSize} bytes`);
    console.log(`📦 Gzipped size: ${gzipSize} bytes`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildCompatBundle();