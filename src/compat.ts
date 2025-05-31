/**
 * Compatibility build - drop-in replacement for fixi.js
 * Exposes global fixi object for browser usage
 */

import { 
  parseAttributes, 
  dispatchFxEvent, 
  shouldIgnore, 
  hasFxAction 
} from './core/fixi-core';
import { executeSwap } from './swapping/swap-strategies';

// Create global fixi object that matches original fixi.js API
const fixi = {
  version: '0.7.0-compat',
  
  // Core initialization
  init() {
    console.log('fiximod compatibility mode initialized');
    // TODO: Add MutationObserver setup like original fixi.js
  },
  
  // Utility functions exposed for compatibility
  parseAttributes,
  dispatchEvent: dispatchFxEvent,
  shouldIgnore,
  hasFxAction,
  executeSwap,
  
  // Configuration
  config: {
    defaultHeaders: {} as Record<string, string>,
    autoInit: true,
    observe: true
  }
};

// Expose as global for browser usage
if (typeof window !== 'undefined') {
  (window as any).fixi = fixi;
}

// Also export for module usage
export { fixi };
export default fixi;