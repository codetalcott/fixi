/**
 * Compatibility build - drop-in replacement for fixi.js
 * Provides auto-initialization and full fixi.js API compatibility
 */

import { 
  parseAttributes, 
  dispatchFxEvent, 
  shouldIgnore, 
  hasFxAction 
} from './core/fixi-core';
import { executeSwap } from './swapping/swap-strategies';
import type { RequestConfig, FxElement } from './core/types';

// Track processed elements to avoid re-initialization
const processedElements = new WeakSet<Element>();

// Track active requests per element
const activeRequests = new WeakMap<Element, Set<RequestConfig>>();

/**
 * Process a single element with fx-action
 */
function processElement(element: Element): void {
  // Skip if already processed or should be ignored
  if (processedElements.has(element) || shouldIgnore(element)) {
    return;
  }

  // Skip if no fx-action
  if (!hasFxAction(element)) {
    return;
  }

  // Mark as processed
  processedElements.add(element);

  // Parse attributes
  const config = parseAttributes(element);
  
  // Determine event to listen to  
  let defaultTrigger = 'click';
  if (element.tagName === 'FORM') {
    defaultTrigger = 'submit';
  } else if (element.tagName === 'INPUT') {
    const inputType = (element as HTMLInputElement).type?.toLowerCase();
    // Button-like inputs use click, form inputs use change
    if (['button', 'submit', 'reset', 'image'].includes(inputType)) {
      defaultTrigger = 'click';
    } else {
      defaultTrigger = 'change';
    }
  } else if (['TEXTAREA', 'SELECT'].includes(element.tagName)) {
    defaultTrigger = 'change';
  }
  
  const eventName = config.trigger || defaultTrigger;

  // Special handling for fx:inited trigger
  if (config.trigger === 'fx:inited') {
    // Dispatch inited event and let the handler fire immediately
    setTimeout(() => {
      element.dispatchEvent(new Event('fx:inited', { bubbles: true }));
    }, 0);
  }

  // Create request handler
  const handler = async (evt: Event) => {
    // Don't handle if element is disabled
    if ((element as HTMLButtonElement).disabled) {
      return;
    }

    // Get form data if needed
    let formData: FormData | null = null;
    const form = element.tagName === 'FORM' ? element as HTMLFormElement : element.closest('form');
    if (form && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      formData = new FormData(form);
    }

    // Build request URL
    let url = config.action;
    if (form && ['GET', 'DELETE'].includes(config.method)) {
      const params = new URLSearchParams(new FormData(form) as any);
      const separator = url.includes('?') ? '&' : '?';
      if (params.toString()) {
        url = url + separator + params.toString();
      }
    }

    // Create abort controller
    const abortController = new AbortController();

    // Build request config
    const requestConfig: RequestConfig = {
      trigger: evt,
      action: url,
      method: config.method,
      target: config.target ? document.querySelector(config.target) || element : element,
      swap: config.swap,
      body: formData,
      drop: 1,
      headers: {},
      abort: () => abortController.abort(),
      signal: abortController.signal,
      preventTrigger: false,
      fetch: window.fetch
    };

    // Get active requests for this element
    let requests = activeRequests.get(element);
    if (!requests) {
      requests = new Set();
      activeRequests.set(element, requests);
    }

    // Dispatch config event
    const configEvent = new CustomEvent('fx:config', {
      detail: { cfg: requestConfig, requests },
      bubbles: true,
      cancelable: true
    });
    
    if (!element.dispatchEvent(configEvent)) {
      if (requestConfig.preventTrigger !== false) {
        evt.preventDefault();
      }
      return;
    }

    // Handle request dropping
    if (requestConfig.drop && requests.size > 0) {
      return;
    }

    // Prevent default action
    evt.preventDefault();

    // Check confirm
    if (requestConfig.confirm) {
      const confirmed = await requestConfig.confirm();
      if (!confirmed) {
        return;
      }
    }

    // Add to active requests
    requests.add(requestConfig);

    // Dispatch before event
    const beforeEvent = new CustomEvent('fx:before', {
      detail: { cfg: requestConfig, requests },
      bubbles: true,
      cancelable: true
    });
    if (!element.dispatchEvent(beforeEvent)) {
      requests.delete(requestConfig);
      return;
    }

    try {
      // Make request
      const response = await requestConfig.fetch(requestConfig.action, {
        method: requestConfig.method,
        body: requestConfig.body,
        headers: requestConfig.headers,
        signal: requestConfig.signal
      });
      
      const text = await response.text();
      requestConfig.response = response;
      requestConfig.text = text;
      
      // Dispatch after event
      element.dispatchEvent(new CustomEvent('fx:after', {
        detail: { cfg: requestConfig },
        bubbles: true
      }));
      
      // Execute swap
      if (requestConfig.transition && 'startViewTransition' in document) {
        (document as any).startViewTransition(async () => {
          await executeSwap(requestConfig);
        });
      } else {
        await executeSwap(requestConfig);
      }
      
      // Dispatch swapped event (capture phase to ensure it fires even if element is replaced)
      document.dispatchEvent(new CustomEvent('fx:swapped', {
        detail: { cfg: requestConfig },
        bubbles: true
      }));
      
    } catch (error: any) {
      element.dispatchEvent(new CustomEvent('fx:error', {
        detail: { cfg: requestConfig, error },
        bubbles: true
      }));
    } finally {
      requests.delete(requestConfig);
      element.dispatchEvent(new CustomEvent('fx:finally', {
        detail: { cfg: requestConfig },
        bubbles: true
      }));
    }
  };

  // Store handler reference
  (element as FxElement).__fixi = handler as any;

  // Add event listener
  element.addEventListener(eventName, handler);
  
  // Dispatch inited event
  element.dispatchEvent(new CustomEvent('fx:inited', {
    detail: {},
    bubbles: true
  }));
}

/**
 * Process a node and its descendants
 */
function processNode(node: Node): void {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  
  const element = node as Element;
  
  // Process the element itself
  processElement(element);
  
  // Process descendants
  element.querySelectorAll('[fx-action]').forEach(processElement);
}

/**
 * Initialize fiximod
 */
function init(): void {
  // Dispatch init event
  document.documentElement.dispatchEvent(new CustomEvent('fx:init', {
    detail: { options: {} },
    bubbles: true
  }));

  // Process all existing elements
  document.querySelectorAll('[fx-action]').forEach(processElement);

  // Set up mutation observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(processNode);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Store observer reference
  (window as any).__fixiObserver = observer;

  // Dispatch inited event
  document.documentElement.dispatchEvent(new CustomEvent('fx:inited', {
    detail: {},
    bubbles: true
  }));
}

// Create global fixi object that matches original fixi.js API
const fixi = {
  version: '0.7.0-compat',
  
  // Core initialization
  init,
  
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

// Auto-initialize on DOMContentLoaded (like original fixi.js)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }
}

// Expose as global for browser usage
if (typeof window !== 'undefined') {
  (window as any).fixi = fixi;
}

// Also export for module usage
export { fixi };
export default fixi;