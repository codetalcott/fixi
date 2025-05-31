# Performance Benchmarks: fixi vs fiximod

Comprehensive performance testing suite to measure the impact of modularization on the fixi library.

## Quick Start

```bash
# Run all performance tests
npm run run-all

# Or run tests individually:
npm run measure-bundles  # Bundle size analysis
npm run run-automated    # Runtime performance tests

# For interactive browser tests:
npm run serve           # Start local server
npm run open-browser    # Open browser tests
```

## Test Suite Overview

### 1. Bundle Size Analysis (`measure-bundles.js`)
- **Raw file sizes** - Uncompressed bundle sizes
- **Gzipped sizes** - Production-ready compression
- **Brotli compression** - Modern compression algorithm
- **Parse time** - JavaScript compilation overhead
- **Compression efficiency** - How well each bundle compresses

### 2. Runtime Performance (`automated-perf.js`)
- **Initialization time** - Library startup overhead
- **Element processing** - Time to attach fixi behavior to DOM elements
- **Memory usage** - Heap allocation patterns
- **Scaling performance** - How performance degrades with element count
- **Statistical analysis** - Mean, standard deviation, confidence intervals

### 3. Interactive Browser Tests (`index.html`)
- **Real browser environment** - Actual DOM manipulation
- **User interaction simulation** - Click events, form submissions
- **Memory profiling** - Live heap usage monitoring
- **Visual comparison** - Side-by-side performance metrics

## Test Scenarios

### Micro-benchmarks
- Single element processing
- Event dispatch overhead
- DOM swapping operations
- Attribute parsing

### Real-world Scenarios
- Page with 100+ interactive elements
- Dynamic content loading
- Form submission workflows
- Memory usage over time

### Scaling Tests
- 1, 10, 100, 1000, 10000 elements
- Concurrent request handling
- Memory growth patterns
- Garbage collection pressure

## Performance Metrics

### Bundle Impact
```
┌─────────────┬─────────┬─────────┬─────────┬───────┐
│ Library     │ Raw     │ Gzipped │ Brotli  │ Lines │
├─────────────┼─────────┼─────────┼─────────┼───────┤
│ fixi        │ 3.2KB   │ 1.4KB   │ 1.2KB   │ 90    │
│ fiximod     │ 8.5KB   │ 3.1KB   │ 2.7KB   │ 250   │
└─────────────┴─────────┴─────────┴─────────┴───────┘
```

### Runtime Performance
```
┌─────────────────┬─────────┬─────────┬─────────┐
│ Metric          │ fixi    │ fiximod │ Ratio   │
├─────────────────┼─────────┼─────────┼─────────┤
│ Initialization  │ 1.2ms   │ 2.8ms   │ 2.33x   │
│ Element Process │ 0.15ms  │ 0.18ms  │ 1.20x   │
│ Memory Usage    │ 1.2MB   │ 1.8MB   │ 1.50x   │
└─────────────────┴─────────┴─────────┴─────────┘
```

## Understanding Results

### Bundle Size Impact
- **Raw size increase**: Expected due to TypeScript, modules, and abstractions
- **Compression ratio**: How well tree-shaking eliminates unused code
- **Parse time**: JavaScript engine compilation overhead

### Runtime Performance
- **Initialization overhead**: One-time cost during page load
- **Per-operation cost**: Ongoing performance impact
- **Memory efficiency**: Heap usage and garbage collection

### Scaling Characteristics
- **Linear scaling**: Performance should degrade predictably
- **Memory leaks**: Watch for unbounded growth
- **GC pressure**: Frequent allocations hurt performance

## Acceptable Thresholds

Based on fixi's minimalist philosophy:

- **Bundle size**: <2x increase acceptable for development benefits
- **Initialization**: <3x slower acceptable (one-time cost)
- **Runtime operations**: <1.5x slower for core operations
- **Memory usage**: <2x increase acceptable

## Interpreting Results

### 🟢 Green Flags
- Modular benefits outweigh performance costs
- Tree-shaking effectively reduces bundle size
- TypeScript catches errors without runtime cost
- Plugin system enables extensibility

### 🟡 Yellow Flags
- 2-3x performance degradation in non-critical paths
- Memory usage increases but remains bounded
- Bundle size acceptable for most use cases

### 🔴 Red Flags
- >3x performance degradation in hot paths
- Unbounded memory growth
- Bundle size significantly impacts load time
- TypeScript overhead in production builds

## Running Tests

### Prerequisites
- Node.js 16+ (for ES modules)
- Modern browser (for browser tests)
- Python 3 (for local server)

### Environment Setup
```bash
# Install dependencies (if any added)
npm install

# Set up test environment
export NODE_OPTIONS="--expose-gc"  # For memory testing
```

### Manual Testing
1. Start local server: `npm run serve`
2. Open browser: `http://localhost:8080`
3. Run individual tests or full suite
4. Compare results between libraries

### Automated Testing
```bash
# Full automated suite
npm run run-all

# Individual test suites
npm run measure-bundles
npm run run-automated
```

### CI Integration
The test suite can be integrated into CI/CD pipelines to detect performance regressions:

```yaml
# GitHub Actions example
- name: Run Performance Tests
  run: npm run run-all
- name: Check Performance Thresholds
  run: node check-thresholds.js
```

## Output Files

- `bundle-size-report.json` - Bundle analysis results
- `performance-report.json` - Runtime performance data
- Console output with formatted comparison tables

## Performance Tracking Over Time

The system automatically tracks performance metrics with timestamps:

```bash
# View current status and recent trends
npm run track-status

# Export performance history to CSV
npm run track-export performance
npm run track-export bundle

# Generate trend analysis
npm run track-trend 30  # Last 30 days
```

### Historical Data
- All test runs are timestamped and stored in `performance-history.json`
- Environment metadata (Node version, platform, CPU, memory) is recorded
- Regression detection compares against previous runs
- Trend analysis shows performance changes over time

### CI Integration
```bash
# Run performance regression check (exits 1 if regressions detected)
npm run ci-check
```

The CI system will:
- ✅ Run all performance tests on every PR
- 📊 Compare against baseline measurements  
- ⚠️ Flag performance regressions automatically
- 📈 Track long-term performance trends
- 💬 Post results as PR comments

## Contributing

When adding new tests:
1. Follow the established patterns
2. Include statistical analysis (mean, stddev)
3. Test both libraries fairly
4. Document expected performance characteristics
5. Update thresholds if needed
6. Ensure tests are deterministic and reliable

## Philosophy

These benchmarks maintain fixi's core principle: **every byte and every millisecond matters**. The goal is not to make fiximod as fast as fixi, but to understand the trade-offs and ensure they're justified by the benefits of modularity, type safety, and extensibility.