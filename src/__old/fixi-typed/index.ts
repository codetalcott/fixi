/**
 * Main entry point for typed fixi library
 */
import { ElementProcessor } from './element-processor';
import { onFixiEvent, dispatchFixiEvent } from './events';
import { FixiOptions } from './types';

/**
 * Fixi class - main API
 */
export class Fixi {
  private processor = new ElementProcessor();
  private observer?: MutationObserver;
  private options: FixiOptions;
  
  constructor(options: FixiOptions = {}) {
    this.options = {
      observe: true,
      autoInit: true,
      defaultHeaders: {},
      ...options
    };
  }
  
  /**
   * Initialize fixi
   */
  init(): void {
    // Prevent double initialization
    if (this.observer) {
      return;
    }
    
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
   * Process a specific element
   */
  process(element: Element): void {
    this.processor.processNode(element);
  }
  
  /**
   * Destroy fixi instance
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}

/**
 * Create and auto-initialize a global fixi instance
 */
export function createFixi(options?: FixiOptions): Fixi {
  const fixi = new Fixi(options);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fixi.init());
  } else {
    fixi.init();
  }
  
  return fixi;
}

// Export all modules for advanced usage
export * from './types';
export * from './events';
export * from './dom-utils';
export * from './swap-strategies';
export * from './request-manager';
export * from './config-builder';
export * from './element-processor';