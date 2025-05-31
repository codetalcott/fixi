#!/usr/bin/env node

/**
 * CI Performance Check
 * Automated performance regression detection for CI/CD pipelines
 */

import { PerformanceTracker } from './performance-tracker.js';

class CIPerformanceCheck {
    constructor() {
        this.tracker = new PerformanceTracker();
        this.thresholds = {
            bundle_size_increase: 20, // Max 20% bundle size increase
            performance_degradation: 25, // Max 25% performance degradation
            memory_increase: 30 // Max 30% memory increase
        };
    }

    async runChecks() {
        console.log('🔍 Running CI performance checks...\n');
        
        const bundleCheck = this.tracker.analyzeRegression('bundle');
        const perfCheck = this.tracker.analyzeRegression('performance');
        
        const results = {
            timestamp: new Date().toISOString(),
            bundle_check: bundleCheck,
            performance_check: perfCheck,
            overall_status: 'pass',
            failed_checks: [],
            warnings: []
        };

        // Check bundle regressions
        if (bundleCheck.regressions?.length > 0) {
            for (const regression of bundleCheck.regressions) {
                const change = parseFloat(regression.change_percent);
                if (change > this.thresholds.bundle_size_increase) {
                    results.failed_checks.push({
                        type: 'bundle_size',
                        metric: regression.metric,
                        change: regression.change_percent,
                        threshold: this.thresholds.bundle_size_increase,
                        severity: 'error'
                    });
                    results.overall_status = 'fail';
                } else if (change > this.thresholds.bundle_size_increase * 0.7) {
                    results.warnings.push({
                        type: 'bundle_size',
                        metric: regression.metric,
                        change: regression.change_percent,
                        message: 'Approaching bundle size threshold'
                    });
                }
            }
        }

        // Check performance regressions
        if (perfCheck.regressions?.length > 0) {
            for (const regression of perfCheck.regressions) {
                const change = parseFloat(regression.change_percent);
                if (change > this.thresholds.performance_degradation) {
                    results.failed_checks.push({
                        type: 'performance',
                        metric: regression.metric,
                        change: regression.change_percent,
                        threshold: this.thresholds.performance_degradation,
                        severity: 'error'
                    });
                    results.overall_status = 'fail';
                } else if (change > this.thresholds.performance_degradation * 0.7) {
                    results.warnings.push({
                        type: 'performance',
                        metric: regression.metric,
                        change: regression.change_percent,
                        message: 'Approaching performance threshold'
                    });
                }
            }
        }

        return results;
    }

    printResults(results) {
        console.log(`🎯 Performance Check Results: ${results.overall_status.toUpperCase()}\n`);
        
        if (results.overall_status === 'pass') {
            console.log('✅ All performance checks passed!');
            
            if (results.warnings.length > 0) {
                console.log('\n⚠️  Warnings:');
                results.warnings.forEach(warning => {
                    console.log(`   • ${warning.metric}: ${warning.change}% increase (${warning.message})`);
                });
            }
        } else {
            console.log('❌ Performance checks failed:');
            results.failed_checks.forEach(check => {
                console.log(`   • ${check.metric}: ${check.change}% increase (threshold: ${check.threshold}%)`);
            });
            
            console.log('\n💡 Recommendations:');
            console.log('   • Review recent changes for performance impact');
            console.log('   • Run local performance tests before committing');
            console.log('   • Consider optimizing hot paths or bundle size');
        }

        if (results.bundle_check.status === 'insufficient_data' || 
            results.performance_check.status === 'insufficient_data') {
            console.log('\nℹ️  Note: Insufficient baseline data for complete analysis');
            console.log('   Run performance tests on main branch to establish baselines');
        }
    }

    generateGitHubComment(results) {
        let comment = '## 📊 Performance Check Results\n\n';
        
        if (results.overall_status === 'pass') {
            comment += '✅ **All performance checks passed!**\n\n';
        } else {
            comment += '❌ **Performance regressions detected**\n\n';
            
            comment += '### Failed Checks\n';
            results.failed_checks.forEach(check => {
                comment += `- **${check.metric}**: ${check.change}% increase (threshold: ${check.threshold}%)\n`;
            });
            comment += '\n';
        }

        if (results.warnings.length > 0) {
            comment += '### ⚠️ Warnings\n';
            results.warnings.forEach(warning => {
                comment += `- **${warning.metric}**: ${warning.change}% increase\n`;
            });
            comment += '\n';
        }

        // Add trend information if available
        const trend = this.tracker.generateTrendReport(7);
        if (trend.trends.bundle_size_trend || trend.trends.performance_trend) {
            comment += '### 📈 Recent Trends (7 days)\n';
            if (trend.trends.bundle_size_trend) {
                comment += `- Bundle size: ${trend.trends.bundle_size_trend.direction} (${trend.trends.bundle_size_trend.change_percent}%)\n`;
            }
            if (trend.trends.performance_trend) {
                comment += `- Performance: ${trend.trends.performance_trend.direction} (${trend.trends.performance_trend.change_percent}%)\n`;
            }
            comment += '\n';
        }

        comment += `<details>\n<summary>View detailed results</summary>\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n</details>`;
        
        return comment;
    }

    async saveResults(results) {
        const fs = await import('fs');
        const path = await import('path');
        const outputFile = path.join(process.cwd(), 'performance-check-results.json');
        
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(`\n📄 Results saved to: ${outputFile}`);
        
        // Also save GitHub comment if in CI
        if (process.env.CI || process.env.GITHUB_ACTIONS) {
            const comment = this.generateGitHubComment(results);
            const commentFile = path.join(process.cwd(), 'performance-comment.md');
            fs.writeFileSync(commentFile, comment);
            console.log(`📄 GitHub comment saved to: ${commentFile}`);
        }
    }
}

async function main() {
    const checker = new CIPerformanceCheck();
    
    try {
        const results = await checker.runChecks();
        checker.printResults(results);
        await checker.saveResults(results);
        
        // Exit with error code if checks failed
        if (results.overall_status === 'fail') {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Performance check failed:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { CIPerformanceCheck };