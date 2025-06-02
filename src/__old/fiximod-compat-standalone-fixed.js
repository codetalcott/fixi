/**
 * fiximod-compat-standalone-fixed.js
 * Standalone IIFE version of fiximod compatibility layer
 * Drop-in replacement for fixi.js with ES modules functionality inlined
 * Version: 0.7.0-compat-standalone
 */

(function() {
  'use strict';

  // ============================================================================
  // INLINED TYPES AND INTERFACES (for reference in comments)
  // ============================================================================
  
  /*
   * This file contains inlined versions of:
   * - parseAttributes, dispatchFxEvent, shouldIgnore, hasFxAction from fixi-core.ts
   * - executeSwap from swap-strategies.ts
   * - All type definitions and interfaces
   */

  // ============================================================================
  // UTILITY FUNCTIONS (inlined from fixi-core.ts)
  // ============================================================================

  /**
   * Check if an element should be ignored by fixi processing
   */
  function shouldIgnore(element) {
    if (!element) return false;
    return element.closest('[fx-ignore]') !== null;
  }

  /**
   * Check if an element has fixi attributes
   */
  function hasFxAction(element) {
    return element.hasAttribute('fx-action');
  }

  /**
   * Get an attribute value with optional default
   */
  function getAttribute(element, name, defaultValue = '') {
    return element.getAttribute(name) || defaultValue;
  }

  /**
   * Normalize HTTP method to uppercase and validate
   */
  function normalizeMethod(method) {
    const normalized = method.toUpperCase();
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    return validMethods.includes(normalized) ? normalized : 'GET';
  }

  /**
   * Parse all fixi attributes from an element
   */
  function parseAttributes(element) {
    // Inlined getAttribute calls for hot path optimization
    const action = element.getAttribute('fx-action') || '';
    const method = normalizeMethod(element.getAttribute('fx-method') || 'GET');
    const target = element.getAttribute('fx-target') || '';
    const swap = element.getAttribute('fx-swap') || 'outerHTML';
    
    // Inlined getDefaultTrigger logic with proper input type handling
    const explicitTrigger = element.getAttribute('fx-trigger');
    let defaultTrigger = 'click';
    if (element.tagName === 'FORM') {
      defaultTrigger = 'submit';
    } else if (element.tagName === 'INPUT') {
      const inputType = element.type?.toLowerCase();
      // Button-like inputs use click, form inputs use change
      if (['button', 'submit', 'reset', 'image'].includes(inputType)) {
        defaultTrigger = 'click';
      } else {
        defaultTrigger = 'change';
      }
    } else if (['TEXTAREA', 'SELECT'].includes(element.tagName)) {
      defaultTrigger = 'change';
    }
    
    const trigger = explicitTrigger || defaultTrigger;

    return {
      action,
      method,
      target,
      swap,
      trigger
    };
  }

  /**
   * Dispatch a fixi custom event
   */
  function dispatchFxEvent(element, type, detail, bubbles = true) {
    const event = new CustomEvent(`fx:${type}`, {
      detail,
      cancelable: true,
      bubbles,
      composed: true
    });
    
    return element.dispatchEvent(event);
  }

  // ============================================================================
  // SWAP STRATEGIES (inlined from swap-strategies.ts)
  // ============================================================================

  /**
   * Check if a swap strategy is a function
   */
  function isSwapFunction(swap) {
    return typeof swap === 'function';
  }

  /**
   * Set a nested property on an object using dot notation
   */
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!key) continue; // Skip empty keys
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    // Set the final property
    const finalKey = keys[keys.length - 1];
    if (finalKey) {
      current[finalKey] = value;
    }
  }

  /**
   * Execute a swap operation based on the configuration
   */
  async function executeSwap(config) {
    const { target, swap, text = '' } = config;

    if (isSwapFunction(swap)) {
      await swap(config);
      return;
    }

    const swapStr = swap;

    // Handle insertAdjacentHTML methods
    if (/(before|after)(begin|end)/.test(swapStr)) {
      target.insertAdjacentHTML(swapStr, text);
      return;
    }

    // Handle direct element properties
    if (swapStr === 'innerHTML') {
      target.innerHTML = text;
      return;
    }

    if (swapStr === 'outerHTML') {
      target.outerHTML = text;
      return;
    }

    // Handle nested property access (e.g., dataset.value, style.color)
    if (swapStr.includes('.')) {
      setNestedProperty(target, swapStr, text);
      return;
    }

    // Handle direct properties (textContent, className, etc.)
    if (swapStr in target) {
      target[swapStr] = text;
      return;
    }

    // If we get here, the swap strategy is invalid
    throw new Error(`Invalid swap strategy: ${swapStr}`);
  }

  // ============================================================================
  // MAIN COMPATIBILITY LAYER (from compat.ts)
  // ============================================================================

  // Track processed elements to avoid re-initialization
  const processedElements = new WeakSet();

  // Track active requests per element
  const activeRequests = new WeakMap();

  /**
   * Process a single element with fx-action
   */
  function processElement(element) {
    // Skip if already processed or should be ignored
    if (processedElements.has(element) || shouldIgnore(element)) {
      return;
    }

    // Skip if no fx-action
    if (!hasFxAction(element)) {
      return;
    }

    // Double-check if element already has __fixi handler (belt and suspenders)
    if (element.__fixi) {
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
      const inputType = element.type?.toLowerCase();
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
      // Only trigger once - check if already triggered
      if (element.__fixiInitedFired) {
        return;
      }
      element.__fixiInitedFired = true;
      
      // Dispatch inited event and let the handler fire immediately
      setTimeout(() => {
        if (document.contains(element)) {
          element.dispatchEvent(new Event('fx:inited', { bubbles: true }));
        }
      }, 0);
    }

    // Create request handler
    const handler = async (evt) => {
      // Don't handle if element is disabled
      if (element.disabled) {
        return;
      }

      // Get form data if needed
      let formData = null;
      const form = element.tagName === 'FORM' ? element : element.closest('form');
      if (form && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        formData = new FormData(form);
      }

      // Build request URL
      let url = config.action;
      if (form && ['GET', 'DELETE'].includes(config.method)) {
        const params = new URLSearchParams(new FormData(form));
        const separator = url.includes('?') ? '&' : '?';
        if (params.toString()) {
          url = url + separator + params.toString();
        }
      }

      // Create abort controller
      const abortController = new AbortController();

      // Build request config
      const requestConfig = {
        trigger: evt,
        action: url,
        method: config.method,
        target: config.target ? document.querySelector(config.target) || element : element,
        swap: config.swap,
        body: formData,
        drop: requests.size,
        headers: {},
        abort: () => abortController.abort(),
        signal: abortController.signal,
        preventTrigger: false,
        fetch: window.fetch,
        transition: document.startViewTransition?.bind(document)
      };

      // Get active requests for this element
      let requests = activeRequests.get(element);
      if (!requests) {
        requests = new Set();
        activeRequests.set(element, requests);
      }

      // Dispatch config event
      const configEvent = new CustomEvent('fx:config', {
        detail: { cfg: requestConfig, requests: Array.from(requests) },
        bubbles: true,
        cancelable: true
      });
      
      if (!element.dispatchEvent(configEvent)) {
        evt.preventDefault();
        return;
      }
      
      if (requestConfig.preventTrigger) {
        evt.preventDefault();
      }

      // Handle request dropping
      if (!configEvent.defaultPrevented && requestConfig.drop) {
        return;
      }
      
      // Prevent default action for forms/submit buttons
      if (evt.type === 'submit' || evt.type === 'click') {
        evt.preventDefault();
      }

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
        detail: { cfg: requestConfig, requests: Array.from(requests) },
        bubbles: true,
        cancelable: true
      });
      if (!element.dispatchEvent(beforeEvent)) {
        requests.delete(requestConfig);
        element.dispatchEvent(new CustomEvent('fx:finally', {
          detail: { cfg: requestConfig },
          bubbles: true
        }));
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
        if (requestConfig.transition) {
          try {
            const transition = requestConfig.transition(async () => {
              await executeSwap(requestConfig);
            });
            if (transition && transition.finished) {
              await transition.finished;
            }
          } catch (e) {
            // Fallback if transition fails
            await executeSwap(requestConfig);
          }
        } else {
          await executeSwap(requestConfig);
        }
        
        // Dispatch swapped event (capture phase to ensure it fires even if element is replaced)
        document.dispatchEvent(new CustomEvent('fx:swapped', {
          detail: { cfg: requestConfig },
          bubbles: true
        }));
        
      } catch (error) {
        // Only dispatch error event if it's not an abort
        if (error.name !== 'AbortError') {
          element.dispatchEvent(new CustomEvent('fx:error', {
            detail: { cfg: requestConfig, error },
            bubbles: true
          }));
        }
      } finally {
        requests.delete(requestConfig);
        element.dispatchEvent(new CustomEvent('fx:finally', {
          detail: { cfg: requestConfig },
          bubbles: true
        }));
      }
    };

    // Store handler reference
    element.__fixi = handler;

    // Add event listener
    element.addEventListener(eventName, handler);
    
    // Dispatch inited event (but not if trigger is fx:inited to avoid loops)
    if (config.trigger !== 'fx:inited') {
      element.dispatchEvent(new CustomEvent('fx:inited', {
        detail: {},
        bubbles: true
      }));
    }
  }

  /**
   * Process a node and its descendants
   */
  function processNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    
    const element = node;
    
    // Skip if this is inside a test div that's already complete
    if (element.closest('.passed, .failed')) {
      return;
    }
    
    // Process the element itself
    processElement(element);
    
    // Process descendants
    element.querySelectorAll('[fx-action]').forEach(processElement);
  }

  /**
   * Initialize fiximod
   */
  function init() {
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
        mutation.addedNodes.forEach(node => {
          // Add a small delay to let the DOM settle
          setTimeout(() => processNode(node), 0);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer reference
    window.__fixiObserver = observer;

    // Dispatch inited event
    document.documentElement.dispatchEvent(new CustomEvent('fx:inited', {
      detail: {},
      bubbles: true
    }));
  }

  // ============================================================================
  // GLOBAL API SETUP
  // ============================================================================

  // Create global fixi object that matches original fixi.js API
  const fixi = {
    version: '0.7.0-compat-standalone',
    
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
      defaultHeaders: {},
      autoInit: true,
      observe: true
    }
  };

  // Listen for fx:process events (like original fixi.js)
  if (typeof document !== 'undefined') {
    document.addEventListener('fx:process', (evt) => {
      if (evt.target) {
        processNode(evt.target);
      }
    });
  }

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
    window.fixi = fixi;
  }

})();