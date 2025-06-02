/**
 * Fiximod - Modern, modular hypermedia control library
 * 
 * A TypeScript reimplementation of fixi.js with:
 * - Full type safety
 * - Modular architecture
 * - Extensible design
 * - Hyperscript integration ready
 */

import { ElementProcessor } from './core/element-processor.js';
import { onFixiEvent } from './core/events.js';
import { FixiOptions } from './core/types.js';
import { swapMechanismRegistry } from './core/swap-mechanisms.js';

// Re-export all core modules for advanced usage
export * from './core/types.js';
export * from './core/events.js';
export * from './core/dom-utils.js';
export * from './core/swap-strategies.js';
export * from './core/swap-mechanisms.js';
export * from './core/request-manager.js';
export * from './core/config-builder.js';
export * from './core/element-processor.js';

/**
 * Main Fiximod class
 */
export class Fiximod {
  private processor = new ElementProcessor();
  private observer: MutationObserver | undefined = undefined;
  private options: FixiOptions;
  private initialized = false;
  
  constructor(options: FixiOptions = {}) {
    this.options = {
      observe: true,
      autoInit: true,
      defaultHeaders: {},
      defaultSwapMechanism: 'view-transition', // Default to View Transitions (matches fixi.js)
      ...options
    };
    
    // Set the default swap mechanism if specified
    if (options.defaultSwapMechanism) {
      swapMechanismRegistry.setDefault(options.defaultSwapMechanism);
    }
  }
  
  /**
   * Initialize fiximod
   */
  init(): void {
    // Prevent double initialization
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    
    // Set up fx:process event listener
    onFixiEvent(document, 'process', (evt) => {
      if (evt.target instanceof Element) {
        this.processor.processNode(evt.target);
      }
    });
    
    // Process existing elements
    this.processor.processNode(document.body);
    
    // Set up mutation observer if enabled
    if (this.options.observe) {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              this.processor.processNode(node);
            });
          }
        });
      });
      
      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }
  
  /**
   * Process a specific element and its descendants
   */
  process(element: Element): void {
    this.processor.processNode(element);
  }
  
  /**
   * Get the element processor (for advanced usage)
   */
  getProcessor(): ElementProcessor {
    return this.processor;
  }
  
  /**
   * Destroy fiximod instance
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    this.initialized = false;
  }
}

/**
 * Global instance for convenience
 */
let globalInstance: Fiximod | null = null;

/**
 * Initialize fiximod with default settings
 * Creates a global instance that auto-initializes on DOMContentLoaded
 */
export function init(options?: FixiOptions): Fiximod {
  if (globalInstance) {
    console.warn('Fiximod already initialized. Call destroy() first to reinitialize.');
    return globalInstance;
  }
  
  globalInstance = new Fiximod(options);
  
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => globalInstance!.init());
    } else {
      globalInstance.init();
    }
  }
  
  return globalInstance;
}

/**
 * Destroy the global instance
 */
export function destroy(): void {
  if (globalInstance) {
    globalInstance.destroy();
    globalInstance = null;
  }
}

/**
 * Get the global instance (if initialized)
 */
export function getInstance(): Fiximod | null {
  return globalInstance;
}

// Auto-initialize if not in module environment
if (typeof window !== 'undefined') {
  (window as any).fiximod = { init, destroy, getInstance, Fiximod };
}