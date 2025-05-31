#!/usr/bin/env node

/**
 * Performance Tracking System
 * Tracks performance over time and detects regressions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTracker {
    constructor() {
        this.historyFile = path.join(__dirname, 'performance-history.json');
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(this.historyFile)) {
                return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            }
        } catch (error) {
            console.warn('Failed to load performance history:', error.message);
        }
        return {
            bundle_tests: [],
            performance_tests: [],
            metadata: {
                created: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }

    saveHistory() {
        try {
            fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Failed to save performance history:', error.message);
        }
    }

    addBundleTest(report) {
        this.history.bundle_tests.push({
            ...report,
            recorded_at: new Date().toISOString()
        });
        this.saveHistory();
        console.log(`📝 Bundle test recorded (ID: ${report.test_id})`);
    }

    addPerformanceTest(report) {
        this.history.performance_tests.push({
            ...report,
            recorded_at: new Date().toISOString()
        });
        this.saveHistory();
        console.log(`📝 Performance test recorded (ID: ${report.test_id})`);
    }

    getLatestResults(type = 'all', count = 10) {
        if (type === 'bundle') {
            return this.history.bundle_tests.slice(-count);
        } else if (type === 'performance') {
            return this.history.performance_tests.slice(-count);
        } else {
            return {
                bundle: this.history.bundle_tests.slice(-count),
                performance: this.history.performance_tests.slice(-count)
            };
        }
    }

    analyzeRegression(type = 'performance') {
        const tests = type === 'bundle' ? this.history.bundle_tests : this.history.performance_tests;
        
        if (tests.length < 2) {
            return { status: 'insufficient_data', message: 'Need at least 2 test runs for regression analysis' };
        }

        const latest = tests[tests.length - 1];
        const baseline = tests[tests.length - 2];

        if (type === 'bundle') {
            return this.analyzeBundleRegression(baseline, latest);
        } else {
            return this.analyzePerformanceRegression(baseline, latest);
        }
    }

    analyzeBundleRegression(baseline, latest) {
        const regressions = [];
        const improvements = [];
        
        // Check fiximod bundle size changes
        if (baseline.bundles?.fiximod && latest.bundles?.fiximod) {
            const baselineSize = baseline.bundles.fiximod.gzipped;
            const latestSize = latest.bundles.fiximod.gzipped;
            const change = ((latestSize - baselineSize) / baselineSize) * 100;
            
            if (Math.abs(change) > 5) { // 5% threshold
                const item = {
                    metric: 'fiximod_bundle_size',
                    baseline: baselineSize,
                    latest: latestSize,
                    change_percent: change.toFixed(2),
                    severity: Math.abs(change) > 10 ? 'high' : 'medium'
                };
                
                if (change > 0) {
                    regressions.push(item);
                } else {
                    improvements.push(item);
                }
            }
        }

        return {
            status: regressions.length > 0 ? 'regression_detected' : 'stable',
            regressions,
            improvements,
            baseline_timestamp: baseline.timestamp,
            latest_timestamp: latest.timestamp
        };
    }

    analyzePerformanceRegression(baseline, latest) {
        const regressions = [];
        const improvements = [];
        const threshold = 0.15; // 15% threshold

        // Check key performance metrics
        const metrics = [
            { key: 'initialization.fiximod.avg', name: 'fiximod_initialization' },
            { key: 'elementProcessing.100.fiximod.avg', name: 'fiximod_element_processing' },
            { key: 'memory.fiximod.diff', name: 'fiximod_memory_usage' }
        ];

        metrics.forEach(({ key, name }) => {
            const baselineValue = this.getNestedValue(baseline.results, key);
            const latestValue = this.getNestedValue(latest.results, key);
            
            if (baselineValue && latestValue) {
                const change = (latestValue - baselineValue) / baselineValue;
                
                if (Math.abs(change) > threshold) {
                    const item = {
                        metric: name,
                        baseline: baselineValue,
                        latest: latestValue,
                        change_percent: (change * 100).toFixed(2),
                        severity: Math.abs(change) > 0.3 ? 'high' : 'medium'
                    };
                    
                    if (change > 0) {
                        regressions.push(item);
                    } else {
                        improvements.push(item);
                    }
                }
            }
        });

        return {
            status: regressions.length > 0 ? 'regression_detected' : 'stable',
            regressions,
            improvements,
            baseline_timestamp: baseline.timestamp,
            latest_timestamp: latest.timestamp
        };
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    generateTrendReport(days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        const recentBundles = this.history.bundle_tests.filter(
            test => new Date(test.timestamp) > cutoff
        );
        
        const recentPerf = this.history.performance_tests.filter(
            test => new Date(test.timestamp) > cutoff
        );

        return {
            period: `${days} days`,
            bundle_tests_count: recentBundles.length,
            performance_tests_count: recentPerf.length,
            trends: this.calculateTrends(recentBundles, recentPerf),
            latest_bundle: recentBundles[recentBundles.length - 1],
            latest_performance: recentPerf[recentPerf.length - 1]
        };
    }

    calculateTrends(bundleTests, perfTests) {
        const trends = {};
        
        // Bundle size trend
        if (bundleTests.length >= 2) {
            const sizes = bundleTests
                .filter(t => t.bundles?.fiximod?.gzipped)
                .map(t => t.bundles.fiximod.gzipped);
            
            if (sizes.length >= 2) {
                const firstSize = sizes[0];
                const lastSize = sizes[sizes.length - 1];
                trends.bundle_size_trend = {
                    direction: lastSize > firstSize ? 'increasing' : 'decreasing',
                    change_percent: ((lastSize - firstSize) / firstSize * 100).toFixed(2)
                };
            }
        }

        // Performance trend
        if (perfTests.length >= 2) {
            const initTimes = perfTests
                .filter(t => t.results?.initialization?.fiximod?.avg)
                .map(t => t.results.initialization.fiximod.avg);
            
            if (initTimes.length >= 2) {
                const firstTime = initTimes[0];
                const lastTime = initTimes[initTimes.length - 1];
                trends.performance_trend = {
                    direction: lastTime > firstTime ? 'degrading' : 'improving',
                    change_percent: ((lastTime - firstTime) / firstTime * 100).toFixed(2)
                };
            }
        }

        return trends;
    }

    printStatus() {
        const bundleRegression = this.analyzeRegression('bundle');
        const perfRegression = this.analyzeRegression('performance');
        const trend = this.generateTrendReport(7); // Last 7 days

        console.log('\n📊 Performance Tracking Status\n');
        
        // Current status
        console.log('🔍 Regression Analysis:');
        console.log(`   Bundle Status: ${bundleRegression.status === 'regression_detected' ? '⚠️  Regression detected' : '✅ Stable'}`);
        console.log(`   Performance Status: ${perfRegression.status === 'regression_detected' ? '⚠️  Regression detected' : '✅ Stable'}`);
        
        // Print regressions if any
        if (bundleRegression.regressions?.length > 0) {
            console.log('\n📈 Bundle Regressions:');
            bundleRegression.regressions.forEach(reg => {
                console.log(`   • ${reg.metric}: ${reg.change_percent}% increase (${reg.severity} severity)`);
            });
        }
        
        if (perfRegression.regressions?.length > 0) {
            console.log('\n⚡ Performance Regressions:');
            perfRegression.regressions.forEach(reg => {
                console.log(`   • ${reg.metric}: ${reg.change_percent}% slower (${reg.severity} severity)`);
            });
        }

        // Trends
        if (trend.trends.bundle_size_trend) {
            console.log(`\n📦 Bundle Size Trend (7 days): ${trend.trends.bundle_size_trend.direction} (${trend.trends.bundle_size_trend.change_percent}%)`);
        }
        
        if (trend.trends.performance_trend) {
            console.log(`⚡ Performance Trend (7 days): ${trend.trends.performance_trend.direction} (${trend.trends.performance_trend.change_percent}%)`);
        }

        console.log(`\n📋 Test History: ${this.history.bundle_tests.length} bundle tests, ${this.history.performance_tests.length} performance tests`);
    }

    exportCsv(type = 'performance', filename = null) {
        const tests = type === 'bundle' ? this.history.bundle_tests : this.history.performance_tests;
        
        if (tests.length === 0) {
            console.log('No data to export');
            return;
        }

        let csv = '';
        let headers = [];
        let rows = [];

        if (type === 'bundle') {
            headers = ['timestamp', 'test_id', 'fixi_gzipped', 'fiximod_gzipped', 'size_difference', 'size_ratio'];
            rows = tests.map(test => [
                test.timestamp,
                test.test_id,
                test.bundles?.fixi?.gzipped || '',
                test.bundles?.fiximod?.gzipped || '',
                test.summary?.size_difference_bytes || '',
                test.summary?.size_difference_percent || ''
            ]);
        } else {
            headers = ['timestamp', 'test_id', 'init_fixi', 'init_fiximod', 'memory_fixi', 'memory_fiximod'];
            rows = tests.map(test => [
                test.timestamp,
                test.test_id,
                test.results?.initialization?.fixi?.avg || '',
                test.results?.initialization?.fiximod?.avg || '',
                test.results?.memory?.fixi?.diff || '',
                test.results?.memory?.fiximod?.diff || ''
            ]);
        }

        csv = headers.join(',') + '\n';
        csv += rows.map(row => row.join(',')).join('\n');

        const outputFile = filename || path.join(__dirname, `${type}-history.csv`);
        fs.writeFileSync(outputFile, csv);
        console.log(`📄 Exported ${tests.length} ${type} tests to: ${outputFile}`);
    }
}

// CLI Interface
async function main() {
    const tracker = new PerformanceTracker();
    const command = process.argv[2];

    switch (command) {
        case 'status':
            tracker.printStatus();
            break;
            
        case 'export':
            const type = process.argv[3] || 'performance';
            tracker.exportCsv(type);
            break;
            
        case 'trend':
            const days = parseInt(process.argv[3]) || 30;
            const trend = tracker.generateTrendReport(days);
            console.log(JSON.stringify(trend, null, 2));
            break;
            
        default:
            console.log(`
Usage: node performance-tracker.js <command>

Commands:
  status              Show current performance status and regressions
  export [type]       Export history to CSV (type: bundle|performance)
  trend [days]        Generate trend report for last N days
            `);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { PerformanceTracker };