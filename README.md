# fixi.js & fiximod

This repository contains:
- **[fixi.js](./fixi/)** - The original ultra-minimalist hypermedia library (3.2KB)
- **[fiximod](./src/fiximod/)** - A modern TypeScript reimplementation with modular architecture

## Quick Comparison

| Feature | fixi.js | fiximod |
|---------|---------|---------|
| Size | 1.4KB gzipped | ~4KB gzipped |
| Language | JavaScript | TypeScript |
| Architecture | Single IIFE | 8 ES modules |
| View Transitions | ✅ Always | ✅ Configurable |
| Type Safety | ❌ | ✅ Full |
| Tree Shaking | ❌ | ✅ |
| Extensibility | Events only | Events + Modules |

## Quick Start

Both libraries use the same HTML attributes:

```html
<button fx-action="/api/data" fx-swap="innerHTML">
  Load Data
</button>
```

### Using fixi.js (Original)
```html
<script src="https://unpkg.com/fixi.js"></script>
<!-- Auto-initializes -->
```

### Using fiximod (TypeScript)
```typescript
import { init } from './src/fiximod';
init(); // Same behavior as fixi.js
```

## When to Use Which?

**Use fixi.js when:**
- Minimal bundle size is critical (1.4KB)
- You want a single file solution
- No build process needed
- Maximum simplicity

**Use fiximod when:**
- You need TypeScript support
- You want modular, testable code
- You need custom swap mechanisms
- You're building larger applications

## Documentation

- [fixi.js Documentation](./fixi/README.md)
- [fiximod Documentation](./src/fiximod/README.md)

## License

[0BSD](LICENSE) - Same as original fixi.js by Big Sky Software