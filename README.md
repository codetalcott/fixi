# fiximod

A modular, TypeScript-powered implementation of [fixi.js](./fixi/README.md) with tree-shaking support and comprehensive typing.

## Overview

fiximod brings modern development practices to the ultra-minimalist fixi hypermedia library while maintaining its core philosophy. This modular architecture enables:

- 🌳 **Tree-shaking**: Import only what you need
- 📝 **Full TypeScript support**: Complete type safety and IDE integration
- 🔌 **Plugin system**: Extend functionality without modifying core
- ✅ **100% test coverage**: Comprehensive test suite with Vitest
- 🎯 **API compatible**: Drop-in replacement for original fixi.js

## Installation

```bash
npm install fiximod
```

Or use directly via CDN:

```html
<script type="module">
  import { fixi } from 'https://cdn.jsdelivr.net/npm/fiximod/dist/index.js'
</script>
```

## Quick Start

### Basic Usage (Compatible with fixi.js)

```html
<button fx-action="/api/hello" fx-target="#result">
  Click me
</button>
<div id="result"></div>

<script type="module">
  import { fixi } from 'fiximod'
  // Auto-initializes on DOMContentLoaded
</script>
```

### Modular Usage

```typescript
import { processElement, dispatchFxEvent } from 'fiximod/core'
import { executeSwap } from 'fiximod/swapping'

// Use individual functions for fine-grained control
const element = document.querySelector('[fx-action]')
processElement(element)
```

## Architecture

### Module Structure

```
fiximod/
├── core/
│   ├── types.ts       # TypeScript interfaces
│   ├── events.ts      # Event system
│   ├── attributes.ts  # Attribute parsing
│   └── utils.ts       # Utilities
├── processing/        # Element processing
├── requests/          # HTTP request handling
├── swapping/          # DOM manipulation
└── plugins/           # Plugin system
```

### Core Modules

#### Events

```typescript
import { dispatchFxEvent } from 'fiximod/core/events'

// Dispatch typed events
dispatchFxEvent(element, 'config', { 
  cfg: requestConfig,
  requests: activeRequests 
})
```

#### Attributes

```typescript
import { parseAttributes } from 'fiximod/core/attributes'

const attrs = parseAttributes(element)
// { action: '/api', method: 'GET', target: '#result', ... }
```

#### Swapping

```typescript
import { executeSwap } from 'fiximod/swapping/swap-strategies'

await executeSwap({
  target: element,
  text: '<p>New content</p>',
  swap: 'innerHTML'
})
```

## TypeScript Support

Full typing for all APIs:

```typescript
import type { 
  RequestConfig,
  FxEventMap,
  Plugin,
  SwapStrategy 
} from 'fiximod'

// Typed event listeners
element.addEventListener('fx:before', (e: FxEventMap['fx:before']) => {
  console.log(e.detail.cfg.action)
})

// Custom swap strategies
const customSwap: SwapStrategy = (config) => {
  // Your implementation
}
```

## Plugin System

Create powerful extensions:

```typescript
const myPlugin: Plugin = {
  name: 'my-plugin',
  hooks: {
    beforeRequest: (config) => {
      // Modify request config
      config.headers['X-Custom'] = 'value'
    },
    afterSwap: (config) => {
      // Post-swap actions
    }
  }
}

fixi.plugins.register(myPlugin)
```

## Bundle Sizes

- **Core only**: ~2KB gzipped (minimal feature set)
- **Full bundle**: ~3.2KB gzipped (all features)
- **Custom bundle**: Tree-shake to your needs

## Differences from Original fixi.js

| Feature | fixi.js | fiximod |
|---------|---------|---------|
| Size | 1.4KB gzipped | 2-3.2KB gzipped |
| TypeScript | ❌ | ✅ Full support |
| Tree-shaking | ❌ | ✅ Modular imports |
| Plugin system | ❌ | ✅ Hook-based |
| Test coverage | Visual tests | ✅ Unit + integration |
| Module format | IIFE | ESM |
| Browser support | Modern | Modern |

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Check bundle size
npm run size
```

## Migration from fixi.js

fiximod is 100% API compatible with fixi.js:

```javascript
// Before (fixi.js)
<script src="fixi.js"></script>

// After (fiximod) 
<script type="module">
  import { fixi } from 'fiximod'
</script>
```

All HTML attributes and events work identically. The modular architecture is additive - use it when you need it.

## Philosophy

fiximod maintains fixi's minimalist philosophy while embracing modern tooling:

- **Every byte matters**: Tree-shaking ensures you only ship what you use
- **No magic**: Explicit, debuggable, understandable code
- **Progressive enhancement**: Start simple, add complexity as needed
- **Type safety**: Catch errors at build time, not runtime

## License

[0BSD](LICENSE) - Same as original fixi.js

## See Also

- [Original fixi.js](./fixi/) - The ultra-minimalist inspiration
- [htmx](https://htmx.org) - The full-featured hypermedia library
- [Examples](./examples/) - Sample applications and patterns
