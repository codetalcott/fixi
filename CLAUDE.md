# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

fixi.js is an experimental, ultra-minimalist hypermedia control library (3.2KB uncompressed) created by Big Sky Software as a lean alternative to htmx. It enables dynamic web applications through HTML attributes without writing JavaScript.

## Key Development Constraints

1. **Size is Critical**: Every byte matters. The library must remain smaller than minified+compressed Preact (4.6KB).
2. **No Dependencies**: Zero external dependencies, no build tools, no package.json.
3. **Single File**: Everything is contained in fixi.js - no modules, no separate files.
4. **Modern JavaScript Only**: Uses async/await, fetch, MutationObserver, View Transitions API.

## Development Commands

```bash
# Run tests - open in browser
open test.html

# Check file size (must stay under 4.6KB compressed)
ls -l fixi.js | awk '{print "raw:", $5}'
gzip -c fixi.js | wc -c
brotli -c fixi.js | wc -c

# No build/lint/format commands - this is intentional
```

## Architecture

The entire library is a self-contained IIFE in fixi.js that:
1. Initializes on DOMContentLoaded
2. Uses MutationObserver to watch for elements with `fx-action`
3. Attaches event listeners based on `fx-trigger` (with smart defaults)
4. Makes fetch requests and swaps content based on `fx-swap`

Core flow:
```
DOM Change → MutationObserver → Process Elements → Attach Listeners → 
User Interaction → Fetch Request → Swap Content → Trigger Events
```

## Testing Approach

test.html contains a comprehensive visual test suite with:
- Mocked fetch() responses
- Visual feedback for passing/failing tests
- Can be run directly via file:// protocol
- Tests core functionality, web components, and all events

## Important Implementation Details

1. **Request Handling**: Concurrent requests to the same element are dropped by default (not queued like htmx).
2. **Event System**: All advanced features are implemented via event handlers, not built-in.
3. **Swap Strategies**: Can swap innerHTML, outerHTML, adjacent positions, or any element property.
4. **No Minification**: The unminified code IS the production code - must be debuggable.

## Contributing Guidelines

When modifying fixi.js:
1. Every line added increases download time for users worldwide
2. Features should be implementable as event-based extensions when possible
3. Maintain compatibility with modern browsers only (no polyfills)
4. Update test.html with visual tests for any new functionality
5. Ensure the file size remains under constraints