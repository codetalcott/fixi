/**
 * Minimal fiximod build - only core functionality
 * Optimized for smallest possible bundle size
 */

// Only export essential functions for basic HTMX-like functionality
export { parseAttributes } from './core/fixi-core';
export { dispatchFxEvent } from './core/fixi-core';
export { executeSwap } from './swapping/swap-strategies';

// Essential types
export type { ParsedAttributes } from './core/fixi-core';
export type { RequestConfig, SwapStrategy } from './core/types';

// Minimal fixi object for compatibility
export const fixi = {
  version: '0.7.0-minimal',
  
  init() {
    // Minimal initialization
    console.log('fiximod minimal initialized');
  }
};