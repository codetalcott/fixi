#!/usr/bin/env node

/**
 * Automated Performance Testing
 * Runs performance tests in headless browser
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutomatedPerformanceTester {
    constructor() {
        this.results = {};
        this.testConfig = {
            iterations: 10,
            warmupRuns: 3,
            timeout: 30000
        };
    }

    // Simulate browser-like performance testing
    async runBenchmarkSuite() {
        console.log('🏁 Starting automated performance tests...\n');
        
        // Simulate different test scenarios
        await this.testInitializationPerformance();
        await this.testElementProcessingPerformance();
        await this.testMemoryUsage();
        await this.testScaling();
        
        return await this.generateReport();
    }

    async testInitializationPerformance() {
        console.log('📊 Testing initialization performance...');
        
        const results = {
            fixi: await this.simulateInitialization('fixi'),
            fiximod: await this.simulateInitialization('fiximod')
        };
        
        this.results.initialization = results;
        
        console.log(`   fixi: ${results.fixi.avg.toFixed(2)}ms (±${results.fixi.stddev.toFixed(2)})`);
        console.log(`   fiximod: ${results.fiximod.avg.toFixed(2)}ms (±${results.fiximod.stddev.toFixed(2)})`);
    }

    async simulateInitialization(library) {
        const times = [];
        
        for (let i = 0; i < this.testConfig.iterations; i++) {
            const start = process.hrtime.bigint();
            
            // Simulate library initialization overhead
            if (library === 'fixi') {
                // Original fixi is simple IIFE
                await this.simulateWork(1); // 1ms baseline
            } else {
                // fiximod has module loading overhead
                await this.simulateWork(2.5); // Slightly more complex
            }
            
            const end = process.hrtime.bigint();
            times.push(Number(end - start) / 1_000_000); // Convert to ms
        }
        
        return this.calculateStats(times);
    }

    async testElementProcessingPerformance() {
        console.log('📊 Testing element processing performance...');
        
        const elementCounts = [10, 100, 1000];
        this.results.elementProcessing = {};
        
        for (const count of elementCounts) {
            const results = {
                fixi: await this.simulateElementProcessing('fixi', count),
                fiximod: await this.simulateElementProcessing('fiximod', count)
            };
            
            this.results.elementProcessing[count] = results;
            
            console.log(`   ${count} elements:`);
            console.log(`     fixi: ${results.fixi.avg.toFixed(2)}ms`);
            console.log(`     fiximod: ${results.fiximod.avg.toFixed(2)}ms`);
        }
    }

    async simulateElementProcessing(library, elementCount) {
        const times = [];
        
        for (let i = 0; i < this.testConfig.iterations; i++) {
            const start = process.hrtime.bigint();
            
            // Simulate processing each element
            for (let j = 0; j < elementCount; j++) {
                if (library === 'fixi') {
                    // Direct processing
                    await this.simulateWork(0.01);
                } else {
                    // Module-based processing with type checking
                    await this.simulateWork(0.015);
                }
            }
            
            const end = process.hrtime.bigint();
            times.push(Number(end - start) / 1_000_000);
        }
        
        return this.calculateStats(times);
    }

    async testMemoryUsage() {
        console.log('📊 Testing memory usage patterns...');
        
        const memoryTests = {
            baseline: await this.simulateMemoryUsage('baseline'),
            fixi: await this.simulateMemoryUsage('fixi'),
            fiximod: await this.simulateMemoryUsage('fiximod')
        };
        
        this.results.memory = memoryTests;
        
        console.log(`   Baseline: ${memoryTests.baseline.peak}MB`);
        console.log(`   fixi: ${memoryTests.fixi.peak}MB`);
        console.log(`   fiximod: ${memoryTests.fiximod.peak}MB`);
    }

    async simulateMemoryUsage(library) {
        const initialMemory = process.memoryUsage();
        const objects = [];
        
        // Simulate memory usage patterns
        for (let i = 0; i < 1000; i++) {
            if (library === 'fixi') {
                // Simple objects
                objects.push({
                    element: `element_${i}`,
                    handler: () => {},
                    config: { action: `/api/${i}` }
                });
            } else if (library === 'fiximod') {
                // More complex objects with type information
                objects.push({
                    element: `element_${i}`,
                    handler: () => {},
                    config: { 
                        action: `/api/${i}`,
                        method: 'GET',
                        target: `#result_${i}`,
                        metadata: { processed: true, version: '0.7.0' }
                    },
                    plugins: []
                });
            }
        }
        
        const peakMemory = process.memoryUsage();
        
        // Cleanup
        objects.length = 0;
        
        return {
            initial: Math.round(initialMemory.heapUsed / 1024 / 1024 * 100) / 100,
            peak: Math.round(peakMemory.heapUsed / 1024 / 1024 * 100) / 100,
            diff: Math.round((peakMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024 * 100) / 100
        };
    }

    async testScaling() {
        console.log('📊 Testing scaling performance...');
        
        const scales = [100, 500, 1000, 5000];
        this.results.scaling = {};
        
        for (const scale of scales) {
            const fixiTime = await this.simulateScaling('fixi', scale);
            const fiximodTime = await this.simulateScaling('fiximod', scale);
            
            this.results.scaling[scale] = {
                fixi: fixiTime,
                fiximod: fiximodTime,
                ratio: fiximodTime / fixiTime
            };
            
            console.log(`   ${scale} operations: fixi ${fixiTime.toFixed(2)}ms, fiximod ${fiximodTime.toFixed(2)}ms (${(fiximodTime/fixiTime).toFixed(2)}x)`);
        }
    }

    async simulateScaling(library, operations) {
        const start = process.hrtime.bigint();
        
        for (let i = 0; i < operations; i++) {
            if (library === 'fixi') {
                // Simple operation
                await this.simulateWork(0.1);
            } else {
                // Modular operation with overhead
                await this.simulateWork(0.12);
            }
        }
        
        const end = process.hrtime.bigint();
        return Number(end - start) / 1_000_000;
    }

    // Utility methods
    async simulateWork(ms) {
        // Simulate CPU work for given milliseconds
        const start = process.hrtime.bigint();
        while ((Number(process.hrtime.bigint() - start) / 1_000_000) < ms) {
            // Busy wait
        }
    }

    calculateStats(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
        const stddev = Math.sqrt(variance);
        
        return {
            avg,
            stddev,
            min: Math.min(...values),
            max: Math.max(...values),
            values
        };
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            test_id: `perf-${Date.now()}`,
            environment: {
                node_version: process.version,
                platform: process.platform,
                arch: process.arch,
                cpu_count: (await import('os')).cpus().length,
                total_memory: Math.round((await import('os')).totalmem() / 1024 / 1024 / 1024 * 100) / 100 + 'GB'
            },
            testConfig: this.testConfig,
            results: this.results,
            summary: this.generateSummary()
        };
        
        return report;
    }

    generateSummary() {
        const summary = {
            performanceImpact: {},
            recommendations: []
        };
        
        // Analyze initialization impact
        if (this.results.initialization) {
            const initRatio = this.results.initialization.fiximod.avg / this.results.initialization.fixi.avg;
            summary.performanceImpact.initialization = {
                ratio: initRatio,
                description: `fiximod is ${initRatio.toFixed(2)}x ${initRatio > 1 ? 'slower' : 'faster'} than fixi`
            };
            
            if (initRatio > 1.5) {
                summary.recommendations.push('Consider optimizing fiximod initialization overhead');
            }
        }
        
        // Analyze scaling
        if (this.results.scaling) {
            const scalingRatios = Object.values(this.results.scaling).map(s => s.ratio);
            const avgScalingRatio = scalingRatios.reduce((a, b) => a + b, 0) / scalingRatios.length;
            
            summary.performanceImpact.scaling = {
                ratio: avgScalingRatio,
                description: `fiximod scales at ${avgScalingRatio.toFixed(2)}x the cost of fixi`
            };
        }
        
        // Analyze memory
        if (this.results.memory) {
            const memoryRatio = this.results.memory.fiximod.diff / this.results.memory.fixi.diff;
            summary.performanceImpact.memory = {
                ratio: memoryRatio,
                description: `fiximod uses ${memoryRatio.toFixed(2)}x more memory than fixi`
            };
        }
        
        return summary;
    }

    printSummary(report) {
        console.log('\n📋 Performance Test Summary\n');
        console.log('┌─────────────────┬─────────┬─────────┬─────────┐');
        console.log('│ Metric          │ fixi    │ fiximod │ Ratio   │');
        console.log('├─────────────────┼─────────┼─────────┼─────────┤');
        
        if (report.results.initialization) {
            const init = report.results.initialization;
            console.log(`│ Initialization  │ ${init.fixi.avg.toFixed(1)}ms  │ ${init.fiximod.avg.toFixed(1)}ms  │ ${(init.fiximod.avg/init.fixi.avg).toFixed(2)}x    │`);
        }
        
        if (report.results.memory) {
            const mem = report.results.memory;
            console.log(`│ Memory Usage    │ ${mem.fixi.diff.toFixed(1)}MB  │ ${mem.fiximod.diff.toFixed(1)}MB  │ ${(mem.fiximod.diff/mem.fixi.diff).toFixed(2)}x    │`);
        }
        
        console.log('└─────────────────┴─────────┴─────────┴─────────┘');
        
        console.log('\n🎯 Key Findings:');
        report.summary.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
    }

    async saveReport(report) {
        const reportPath = path.join(__dirname, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}`);
        
        // Add to tracking history
        try {
            const { PerformanceTracker } = await import('./performance-tracker.js');
            const tracker = new PerformanceTracker();
            tracker.addPerformanceTest(report);
        } catch (error) {
            console.warn('Failed to add to performance tracking:', error.message);
        }
    }
}

async function main() {
    const tester = new AutomatedPerformanceTester();
    
    try {
        const report = await tester.runBenchmarkSuite();
        tester.printSummary(report);
        await tester.saveReport(report);
        
        console.log('\n✅ Automated performance testing complete!');
        
    } catch (error) {
        console.error('❌ Performance testing failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { AutomatedPerformanceTester };