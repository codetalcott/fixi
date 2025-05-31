/**
 * fiximod - Modular TypeScript implementation of fixi.js
 * Main entry point and compatibility layer
 */

// Core exports
export * from './core/types';
export * from './core/utils';
export * from './core/events';
export * from './core/attributes';

// Swapping exports
export * from './swapping/swap-strategies';

// Re-export key functions for easy access
export { dispatchFxEvent } from './core/events';
export { parseAttributes } from './core/attributes';
export { executeSwap } from './swapping/swap-strategies';
export {
  shouldIgnore,
  getDefaultTrigger,
  hasFxAction
} from './core/utils';

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