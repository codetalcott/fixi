/**
 * Element processor module - handles initialization and processing of fixi elements
 */
import { FixiElement } from './types';
import { shouldIgnore, hasFxAction } from './dom-utils';
import { dispatchFixiEvent } from './events';
import { buildConfig, getTriggerEvent } from './config-builder';
import { executeRequest } from './request-manager';
import { executeSwap } from './swap-strategies';
import { RequestManager } from './request-manager';

/**
 * Process elements with fx-action attributes
 */
export class ElementProcessor {
  private processedElements = new WeakSet<Element>();
  private requestManager = new RequestManager();
  
  /**
   * Initialize a fixi element
   */
  initElement(element: FixiElement): void {
    // Skip if already processed, ignored, or no fx-action
    if (
      this.processedElements.has(element) ||
      shouldIgnore(element) ||
      !hasFxAction(element) ||
      element.__fixi
    ) {
      return;
    }
    
    // Dispatch init event
    const options = {};
    if (!dispatchFixiEvent(element, 'init', { options })) {
      return;
    }
    
    // Mark as processed
    this.processedElements.add(element);
    
    // Create request handler
    const handler = async (event: Event) => {
      // Build configuration
      const config = buildConfig(element, event);
      
      // Set drop count based on active requests
      config.drop = this.requestManager.getRequests(element).size;
      
      // Prevent default if needed
      if (config.preventTrigger) {
        event.preventDefault();
      }
      
      try {
        // Execute request
        await executeRequest(element, config, this.requestManager);
        
        // Execute swap if we have a response
        if (config.text !== undefined) {
          await executeSwap(config);
          
          // Dispatch swapped event
          dispatchFixiEvent(element, 'swapped', { cfg: config });
          
          // Also dispatch on document if element was replaced
          if (!document.contains(element)) {
            dispatchFixiEvent(document, 'swapped', { cfg: config });
          }
        }
      } catch (error) {
        // Error already handled in executeRequest
      }
    };
    
    // Store handler reference
    element.__fixi = handler as any;
    element.__fixi.requests = this.requestManager.getRequests(element);
    
    // Get trigger event
    const triggerEvent = getTriggerEvent(element);
    element.__fixi.evt = triggerEvent;
    
    // Add event listener
    element.addEventListener(triggerEvent, handler);
    
    // Dispatch inited event
    dispatchFixiEvent(element, 'inited', {}, false);
    
    // Handle fx:inited trigger
    if (triggerEvent === 'fx:inited') {
      setTimeout(() => {
        element.dispatchEvent(new Event('fx:inited', { bubbles: true }));
      }, 0);
    }
  }
  
  /**
   * Process a node and its descendants
   */
  processNode(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    
    const element = node as Element;
    
    // Skip ignored elements
    if (shouldIgnore(element)) {
      return;
    }
    
    // Process element if it has fx-action
    if (hasFxAction(element)) {
      this.initElement(element as FixiElement);
    }
    
    // Process descendants
    element.querySelectorAll('[fx-action]').forEach(el => {
      this.initElement(el as FixiElement);
    });
  }
}