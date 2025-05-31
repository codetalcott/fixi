#!/usr/bin/env node

/**
 * Bundle Size Measurement Script
 * Measures actual bundle sizes with real compression
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

class BundleMeasurer {
    constructor() {
        this.results = {};
    }

    async measureFile(filePath, name) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const buffer = Buffer.from(content, 'utf8');
            
            const gzipped = await gzip(buffer);
            const brotlied = await brotli(buffer);
            
            const result = {
                raw: buffer.length,
                gzipped: gzipped.length,
                brotli: brotlied.length,
                lines: content.split('\n').length,
                path: filePath
            };
            
            this.results[name] = result;
            return result;
        } catch (error) {
            console.error(`Failed to measure ${filePath}:`, error.message);
            return null;
        }
    }

    formatBytes(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    printComparison() {
        console.log('\n📦 Bundle Size Comparison\n');
        console.log('┌─────────────┬─────────┬─────────┬─────────┬───────┐');
        console.log('│ Library     │ Raw     │ Gzipped │ Brotli  │ Lines │');
        console.log('├─────────────┼─────────┼─────────┼─────────┼───────┤');
        
        Object.entries(this.results).forEach(([name, data]) => {
            const raw = this.formatBytes(data.raw).padEnd(7);
            const gzipped = this.formatBytes(data.gzipped).padEnd(7);
            const brotli = this.formatBytes(data.brotli).padEnd(7);
            const lines = data.lines.toString().padEnd(5);
            
            console.log(`│ ${name.padEnd(11)} │ ${raw} │ ${gzipped} │ ${brotli} │ ${lines} │`);
        });
        
        console.log('└─────────────┴─────────┴─────────┴─────────┴───────┘');
        
        // Calculate differences
        if (this.results.fixi && this.results.fiximod) {
            const fixiGzip = this.results.fixi.gzipped;
            const fiximodGzip = this.results.fiximod.gzipped;
            const diff = fiximodGzip - fixiGzip;
            const percent = ((diff / fixiGzip) * 100).toFixed(1);
            
            console.log(`\n📈 Size Impact: fiximod is ${this.formatBytes(diff)} (${percent}%) ${diff > 0 ? 'larger' : 'smaller'} than fixi`);
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            test_id: `bundle-${Date.now()}`,
            environment: {
                node_version: process.version,
                platform: process.platform,
                arch: process.arch
            },
            bundles: this.results,
            summary: {}
        };

        if (this.results.fixi && this.results.fiximod) {
            const fixi = this.results.fixi;
            const fiximod = this.results.fiximod;
            
            report.summary = {
                size_difference_bytes: fiximod.gzipped - fixi.gzipped,
                size_difference_percent: ((fiximod.gzipped - fixi.gzipped) / fixi.gzipped * 100).toFixed(2),
                complexity_ratio: (fiximod.lines / fixi.lines).toFixed(2),
                compression_efficiency: {
                    fixi: ((1 - fixi.gzipped / fixi.raw) * 100).toFixed(1),
                    fiximod: ((1 - fiximod.gzipped / fiximod.raw) * 100).toFixed(1)
                }
            };
        }

        return report;
    }

    async saveReport(report) {
        const reportPath = path.join(__dirname, 'bundle-size-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
        
        // Add to tracking history
        try {
            const { PerformanceTracker } = await import('./performance-tracker.js');
            const tracker = new PerformanceTracker();
            tracker.addBundleTest(report);
        } catch (error) {
            console.warn('Failed to add to performance tracking:', error.message);
        }
    }
}

async function buildFiximod() {
    console.log('🔨 Building fiximod...');
    
    // We would need to implement the actual build process here
    // For now, let's create a simple concatenated version
    const srcDir = path.join(__dirname, '..', 'src');
    const outputPath = path.join(__dirname, 'fiximod-built.js');
    
    try {
        // Simple concatenation for demo (real build would use TypeScript compiler)
        const files = [
            'core/types.ts',
            'core/utils.ts', 
            'core/events.ts',
            'core/attributes.ts',
            'swapping/swap-strategies.ts'
        ];
        
        let combined = '// fiximod - Built for performance testing\n';
        
        for (const file of files) {
            const filePath = path.join(srcDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                // Strip TypeScript types and imports for this demo
                const jsContent = content
                    .replace(/import.*from.*['"];/g, '')
                    .replace(/export\s+/g, '')
                    .replace(/:\s*[A-Za-z<>[\]|&{}\s,]+(?=\s*[=)])/g, '') // Remove type annotations
                    .replace(/interface\s+\w+[^}]*}/g, '') // Remove interfaces
                    .replace(/type\s+\w+.*?;/g, ''); // Remove type aliases
                
                combined += `\n// === ${file} ===\n${jsContent}\n`;
            }
        }
        
        // Add a simple init wrapper
        combined += `
// Initialize fiximod
(function() {
    // Simple initialization for demo
    if (typeof window !== 'undefined') {
        window.fiximod = {
            version: '0.7.0',
            init: function() { console.log('fiximod initialized'); }
        };
    }
})();`;
        
        fs.writeFileSync(outputPath, combined);
        console.log(`✅ Built fiximod to: ${outputPath}`);
        return outputPath;
        
    } catch (error) {
        console.error('❌ Failed to build fiximod:', error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting bundle size measurement...\n');
    
    const measurer = new BundleMeasurer();
    
    // Measure original fixi.js
    const fixiPath = path.join(__dirname, '..', 'fixi', 'fixi.js');
    await measurer.measureFile(fixiPath, 'fixi');
    
    // Build and measure fiximod
    const fiximodPath = await buildFiximod();
    if (fiximodPath) {
        await measurer.measureFile(fiximodPath, 'fiximod');
    }
    
    // Measure existing fiximod.js if it exists
    const existingFiximodPath = path.join(__dirname, '..', 'fiximod.js');
    if (fs.existsSync(existingFiximodPath)) {
        await measurer.measureFile(existingFiximodPath, 'fiximod-orig');
    }
    
    // Print results
    measurer.printComparison();
    
    // Generate and save report
    const report = measurer.generateReport();
    await measurer.saveReport(report);
    
    console.log('\n✨ Bundle measurement complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { BundleMeasurer };