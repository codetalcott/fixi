/**
 * Full fiximod build - all features and APIs
 * Complete TypeScript modular experience
 */

// Re-export everything from main index
export * from './index';

// Additional full-featured fixi object
import { fixi as baseFixi } from './index';

export const fixi = {
  ...baseFixi,
  version: '0.7.0-full',
  
  // Enhanced initialization with more features
  init() {
    console.log('fiximod full build initialized');
    // TODO: Add comprehensive initialization
  },
  
  // Additional utilities for power users
  utils: {
    parseAttributes: () => import('./core/fixi-core').then(m => m.parseAttributes),
    dispatchEvent: () => import('./core/fixi-core').then(m => m.dispatchFxEvent),
    executeSwap: () => import('./swapping/swap-strategies').then(m => m.executeSwap),
    shouldIgnore: () => import('./core/fixi-core').then(m => m.shouldIgnore),
    hasFxAction: () => import('./core/fixi-core').then(m => m.hasFxAction)
  },
  
  // Type information for runtime introspection
  types: {
    version: '0.7.0',
    features: ['events', 'attributes', 'swapping', 'utils'],
    build: 'full'
  }
};