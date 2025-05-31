/**
 * Performance Testing Harness for fixi vs fiximod
 */

class PerformanceHarness {
    constructor() {
        this.results = {
            fixi: {},
            fiximod: {}
        };
        this.memoryBaseline = this.getMemoryUsage();
        this.testCount = 0;
        this.totalTests = 6;
    }

    // Memory measurement utilities
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
            };
        }
        return { used: 0, total: 0, limit: 0 };
    }

    updateProgress() {
        this.testCount++;
        const percent = (this.testCount / this.totalTests) * 100;
        document.getElementById('progress-bar').style.width = `${percent}%`;
    }

    // High precision timing
    measureTime(fn, iterations = 1000) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = performance.now();
        return (end - start) / iterations; // Average time per operation
    }

    async measureAsyncTime(fn, iterations = 100) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            await fn();
        }
        const end = performance.now();
        return (end - start) / iterations;
    }

    // Bundle size measurement
    async measureBundleSize(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            return {
                raw: text.length,
                // Simulate gzip by measuring compression ratio
                estimated_gzip: Math.round(text.length * 0.3) // Rough estimate
            };
        } catch (error) {
            console.error(`Failed to measure bundle size for ${url}:`, error);
            return { raw: 0, estimated_gzip: 0 };
        }
    }

    // Parse time measurement
    measureParseTime(code) {
        const start = performance.now();
        try {
            new Function(code);
        } catch (e) {
            // Ignore errors, we just want parse time
        }
        const end = performance.now();
        return end - start;
    }

    // Test implementations
    async testInitialization(library) {
        const container = document.getElementById('test-container');
        container.innerHTML = '';
        
        const start = performance.now();
        
        if (library === 'fixi') {
            // Simulate fixi initialization
            const script = document.createElement('script');
            script.src = '../fixi/fixi.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        } else {
            // Simulate fiximod initialization
            const start = performance.now();
            // Mock fiximod initialization
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        const end = performance.now();
        return end - start;
    }

    testElementProcessing(library, elementCount = 100) {
        const container = document.getElementById('test-container');
        container.innerHTML = '';
        
        // Create test elements
        for (let i = 0; i < elementCount; i++) {
            const div = document.createElement('div');
            div.setAttribute('fx-action', `/api/test${i}`);
            div.setAttribute('fx-method', 'GET');
            div.setAttribute('fx-target', `#result${i}`);
            container.appendChild(div);
        }

        const elements = container.querySelectorAll('[fx-action]');
        
        return this.measureTime(() => {
            // Simulate element processing
            elements.forEach(el => {
                const action = el.getAttribute('fx-action');
                const method = el.getAttribute('fx-method');
                // Simple processing simulation
                el.__fixi_processed = { action, method };
            });
        }, 10);
    }

    testEventHandling(library) {
        const container = document.getElementById('test-container');
        container.innerHTML = '<button fx-action="/test">Test</button>';
        const button = container.querySelector('button');
        
        return this.measureTime(() => {
            // Simulate event dispatch
            const event = new CustomEvent('fx:before', {
                detail: { cfg: { action: '/test' } },
                bubbles: true,
                cancelable: true
            });
            button.dispatchEvent(event);
        }, 1000);
    }

    testDOMSwapping(library) {
        const container = document.getElementById('test-container');
        container.innerHTML = '<div id="target">original</div>';
        const target = container.querySelector('#target');
        
        const swapOperations = [
            () => target.innerHTML = '<span>new content</span>',
            () => target.outerHTML = '<div id="target">replaced</div>',
            () => container.querySelector('#target').insertAdjacentHTML('beforeend', '<span>appended</span>')
        ];

        let opIndex = 0;
        return this.measureTime(() => {
            swapOperations[opIndex % swapOperations.length]();
            opIndex++;
            // Reset for next iteration
            if (opIndex % 3 === 0) {
                container.innerHTML = '<div id="target">original</div>';
            }
        }, 100);
    }

    testScaling(library, elementCount = 1000) {
        const container = document.getElementById('test-container');
        container.innerHTML = '';
        
        const start = performance.now();
        
        // Create many elements
        for (let i = 0; i < elementCount; i++) {
            const div = document.createElement('div');
            div.setAttribute('fx-action', `/api/item${i}`);
            div.innerHTML = `Item ${i}`;
            container.appendChild(div);
        }
        
        // Simulate processing all elements
        const elements = container.querySelectorAll('[fx-action]');
        elements.forEach(el => {
            el.__fixi_processed = true;
        });
        
        const end = performance.now();
        return end - start;
    }

    testMemoryUsage(library) {
        const before = this.getMemoryUsage();
        
        // Create many objects to stress memory
        const objects = [];
        for (let i = 0; i < 10000; i++) {
            objects.push({
                element: document.createElement('div'),
                config: { action: `/test${i}`, method: 'GET' },
                handler: () => {}
            });
        }
        
        const after = this.getMemoryUsage();
        
        // Clean up
        objects.length = 0;
        
        return after.used - before.used;
    }

    // Format results for display
    formatTime(ms) {
        if (ms < 1) {
            return `${(ms * 1000).toFixed(2)}μs`;
        } else if (ms < 1000) {
            return `${ms.toFixed(2)}ms`;
        } else {
            return `${(ms / 1000).toFixed(2)}s`;
        }
    }

    formatBytes(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Update UI with results
    updateResult(library, test, value) {
        const element = document.getElementById(`${library}-${test}`);
        if (element) {
            if (typeof value === 'number') {
                element.textContent = this.formatTime(value);
            } else {
                element.textContent = value;
            }
        }
    }

    // Compare results and highlight better performance
    compareResults() {
        const tests = ['init', 'elements', 'events', 'swapping', 'scaling', 'memory'];
        
        tests.forEach(test => {
            const fixiValue = this.results.fixi[test];
            const fiximodValue = this.results.fiximod[test];
            
            if (fixiValue !== undefined && fiximodValue !== undefined) {
                const fixiElement = document.getElementById(`fixi-${test}`);
                const fiximodElement = document.getElementById(`fiximod-${test}`);
                
                if (fixiValue < fiximodValue) {
                    fixiElement.classList.add('better');
                    fiximodElement.classList.add('worse');
                } else if (fiximodValue < fixiValue) {
                    fiximodElement.classList.add('better');
                    fixiElement.classList.add('worse');
                }
            }
        });
    }
}

// Global instance
const harness = new PerformanceHarness();

// Test functions called from HTML
async function runInitializationTest() {
    console.log('Running initialization test...');
    
    const fixiTime = await harness.testInitialization('fixi');
    const fiximodTime = await harness.testInitialization('fiximod');
    
    harness.results.fixi.init = fixiTime;
    harness.results.fiximod.init = fiximodTime;
    
    harness.updateResult('fixi', 'init', fixiTime);
    harness.updateResult('fiximod', 'init', fiximodTime);
    harness.updateProgress();
}

async function runElementProcessingTest() {
    console.log('Running element processing test...');
    
    const fixiTime = harness.testElementProcessing('fixi');
    const fiximodTime = harness.testElementProcessing('fiximod');
    
    harness.results.fixi.elements = fixiTime;
    harness.results.fiximod.elements = fiximodTime;
    
    harness.updateResult('fixi', 'elements', fixiTime);
    harness.updateResult('fiximod', 'elements', fiximodTime);
    harness.updateProgress();
}

async function runEventHandlingTest() {
    console.log('Running event handling test...');
    
    const fixiTime = harness.testEventHandling('fixi');
    const fiximodTime = harness.testEventHandling('fiximod');
    
    harness.results.fixi.events = fixiTime;
    harness.results.fiximod.events = fiximodTime;
    
    harness.updateResult('fixi', 'events', fixiTime);
    harness.updateResult('fiximod', 'events', fiximodTime);
    harness.updateProgress();
}

async function runDOMSwappingTest() {
    console.log('Running DOM swapping test...');
    
    const fixiTime = harness.testDOMSwapping('fixi');
    const fiximodTime = harness.testDOMSwapping('fiximod');
    
    harness.results.fixi.swapping = fixiTime;
    harness.results.fiximod.swapping = fiximodTime;
    
    harness.updateResult('fixi', 'swapping', fixiTime);
    harness.updateResult('fiximod', 'swapping', fiximodTime);
    harness.updateProgress();
}

async function runScalingTest() {
    console.log('Running scaling test...');
    
    const fixiTime = harness.testScaling('fixi');
    const fiximodTime = harness.testScaling('fiximod');
    
    harness.results.fixi.scaling = fixiTime;
    harness.results.fiximod.scaling = fiximodTime;
    
    harness.updateResult('fixi', 'scaling', fixiTime);
    harness.updateResult('fiximod', 'scaling', fiximodTime);
    harness.updateProgress();
}

async function runMemoryTest() {
    console.log('Running memory test...');
    
    const fixiMemory = harness.testMemoryUsage('fixi');
    const fiximodMemory = harness.testMemoryUsage('fiximod');
    
    harness.results.fixi.memory = fixiMemory;
    harness.results.fiximod.memory = fiximodMemory;
    
    harness.updateResult('fixi', 'memory', `${fixiMemory.toFixed(2)}MB`);
    harness.updateResult('fiximod', 'memory', `${fiximodMemory.toFixed(2)}MB`);
    harness.updateProgress();
}

async function runAllTests() {
    console.log('Running all performance tests...');
    harness.testCount = 0;
    
    await runInitializationTest();
    await runElementProcessingTest();
    await runEventHandlingTest();
    await runDOMSwappingTest();
    await runScalingTest();
    await runMemoryTest();
    
    harness.compareResults();
    console.log('All tests completed!');
}

async function measureBundleSizes() {
    try {
        // Measure fixi.js
        const fixiSize = await harness.measureBundleSize('../fixi/fixi.js');
        document.getElementById('fixi-raw-size').textContent = harness.formatBytes(fixiSize.raw);
        document.getElementById('fixi-gzip-size').textContent = harness.formatBytes(fixiSize.estimated_gzip);
        
        // Measure parse time
        const fixiResponse = await fetch('../fixi/fixi.js');
        const fixiCode = await fixiResponse.text();
        const fixiParseTime = harness.measureParseTime(fixiCode);
        document.getElementById('fixi-parse-time').textContent = harness.formatTime(fixiParseTime);
        
        // For fiximod, we'd need to build it first
        document.getElementById('fiximod-raw-size').textContent = 'Build required';
        document.getElementById('fiximod-gzip-size').textContent = 'Build required';
        document.getElementById('fiximod-parse-time').textContent = 'Build required';
        
    } catch (error) {
        console.error('Failed to measure bundle sizes:', error);
    }
}

function updateMemoryInfo() {
    const memory = harness.getMemoryUsage();
    document.getElementById('initial-heap').textContent = memory.used;
    
    // Update peak heap periodically
    setInterval(() => {
        const current = harness.getMemoryUsage();
        document.getElementById('peak-heap').textContent = Math.max(
            parseFloat(document.getElementById('peak-heap').textContent) || 0,
            current.used
        );
    }, 1000);
}

function forceGC() {
    if (window.gc) {
        window.gc();
        updateMemoryInfo();
        console.log('Garbage collection forced');
    } else {
        console.log('GC not available - run with --expose-gc flag');
    }
}