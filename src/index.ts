/**
 * fiximod - Modular TypeScript implementation of fixi.js
 * Main entry point and compatibility layer
 */

// Core exports - consolidated for performance
export * from './core/types';
export * from './core/fixi-core';

// Swapping exports - kept separate for tree-shaking  
export * from './swapping/swap-strategies';

// Re-export key functions for easy access
export { dispatchFxEvent, parseAttributes, shouldIgnore, hasFxAction } from './core/fixi-core';
export { executeSwap } from './swapping/swap-strategies';

// Compatibility object for drop-in replacement
export const fixi = {
  version: '0.7.0',
  
  // Main initialization function
  init() {
    console.log('fiximod initialized');
    // TODO: Implement full initialization
  },

  // Module access for advanced users
  modules: {
    events: () => import('./core/events'),
    attributes: () => import('./core/attributes'),
    swapping: () => import('./swapping/swap-strategies'),
    utils: () => import('./core/utils')
  }
};