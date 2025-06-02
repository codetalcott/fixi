# Fixi TypeScript Module Architecture

## Module Dependency Diagram

```
┌─────────────────┐
│    index.ts     │  Main entry point & public API
└────────┬────────┘
         │ uses
         ▼
┌─────────────────────┐
│ element-processor.ts │  Initializes & processes elements
└──────────┬──────────┘
           │ uses
           ├──────────────┬───────────────┬──────────────┐
           ▼              ▼               ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌───────────────┐
│ dom-utils.ts │ │ events.ts   │ │ request-     │ │ swap-         │
│              │ │             │ │ manager.ts   │ │ strategies.ts │
└──────────────┘ └─────────────┘ └──────┬───────┘ └───────────────┘
                                        │ uses
                                        ▼
                               ┌─────────────────┐
                               │ config-         │
                               │ builder.ts      │
                               └─────────────────┘
                                        │ uses
                                        ▼
                               ┌─────────────────┐
                               │ dom-utils.ts    │
                               └─────────────────┘

┌─────────────┐
│  types.ts   │  Shared type definitions (used by all modules)
└─────────────┘
```

## Module Responsibilities

### 1. **types.ts** - Type Definitions
- Defines all TypeScript interfaces and types
- No dependencies, imported by all other modules
- Key types: `FixiConfig`, `FixiElement`, `FixiEvent`

### 2. **events.ts** - Event System
- Handles custom event dispatching and listening
- Pure functions for event operations
- Exports: `dispatchFixiEvent()`, `onFixiEvent()`

### 3. **dom-utils.ts** - DOM Utilities
- Pure functions for DOM operations
- No fixi-specific logic, just helpers
- Exports: `getAttribute()`, `shouldIgnore()`, `querySelector()`, etc.

### 4. **swap-strategies.ts** - Swap Logic
- Handles different ways to update the DOM
- Supports function swaps, property swaps, transitions
- Exports: `executeSwap()`, swap function factories

### 5. **config-builder.ts** - Configuration
- Builds request configurations from elements
- Handles form data and URL building
- Exports: `buildConfig()`, `getTriggerEvent()`

### 6. **request-manager.ts** - Request Lifecycle
- Tracks active requests per element
- Manages request execution with proper events
- Exports: `RequestManager` class, `executeRequest()`

### 7. **element-processor.ts** - Element Processing
- Initializes elements with fx-action
- Sets up event listeners and handlers
- Exports: `ElementProcessor` class

### 8. **index.ts** - Main API
- Orchestrates all modules
- Provides public API
- Handles initialization and mutation observation
- Exports: `Fixi` class, `createFixi()` function

## Integration with Hyperscript

This modular design makes integration with hyperscript straightforward:

1. **Shared modules**: `dom-utils`, `events`, and `types` can be shared directly
2. **Swap strategies**: Can be extended to support hyperscript's command system
3. **Request manager**: Can be adapted to handle hyperscript's async operations
4. **Config builder**: Can be extended to parse hyperscript attributes

The key is that each module has a single responsibility and clear interfaces, making it easy to:
- Replace modules with hyperscript equivalents
- Extend modules with additional functionality
- Share common functionality between both libraries

## Usage Example

```typescript
// Simple usage
import { createFixi } from './fixi-typed';
const fixi = createFixi();

// Advanced usage with custom configuration
import { Fixi, SwapFunction } from './fixi-typed';

const customSwap: SwapFunction = (config) => {
  // Custom swap logic
  console.log('Custom swap:', config.text);
  config.target.innerHTML = config.text || '';
};

const fixi = new Fixi({
  defaultHeaders: { 'X-Custom': 'value' }
});

// Add custom event handling
import { onFixiEvent } from './fixi-typed';
onFixiEvent(document, 'before', (evt) => {
  if (evt.detail.cfg) {
    evt.detail.cfg.swap = customSwap;
  }
});

fixi.init();
```