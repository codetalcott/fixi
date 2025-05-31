/**
 * Consolidated core module for fixi - combines events, attributes, and utils
 * for reduced import overhead while maintaining tree-shaking support
 */

// ============================================================================
// EVENT SYSTEM (from events.ts)
// ============================================================================

import type { 
  FxEventMap, 
  FxEventType
} from './types';

/**
 * Dispatch a fixi custom event
 * @param element - Element to dispatch the event on
 * @param type - Event type (without fx: prefix)
 * @param detail - Event detail payload
 * @param bubbles - Whether the event should bubble (default: true)
 * @returns true if event was not cancelled, false if preventDefault() was called
 */
export function dispatchFxEvent<T extends FxEventType>(
  element: Element,
  type: T,
  detail: FxEventMap[T]['detail'],
  bubbles: boolean = true
): boolean {
  const event = new CustomEvent(`fx:${type}`, {
    detail,
    cancelable: true,
    bubbles,
    composed: true
  });
  
  return element.dispatchEvent(event);
}

/**
 * Add an event listener for a specific fixi event type
 */
export function addFxEventListener<T extends FxEventType>(
  element: Element,
  eventType: T,
  listener: (event: FxEventMap[T]) => void,
  options?: AddEventListenerOptions
): void {
  element.addEventListener(eventType, listener as EventListener, options);
}

/**
 * Remove an event listener for a specific fixi event type
 */
export function removeFxEventListener<T extends FxEventType>(
  element: Element,
  eventType: T,
  listener: (event: FxEventMap[T]) => void,
  options?: EventListenerOptions
): void {
  element.removeEventListener(eventType, listener as EventListener, options);
}

// ============================================================================
// ATTRIBUTE PARSING (from attributes.ts)
// ============================================================================

export interface ParsedAttributes {
  action: string;
  method: string;
  target: string;
  swap: string;
  trigger: string;
}

/**
 * Get an attribute value with optional default
 */
export function getAttribute(element: Element, name: string, defaultValue: string = ''): string {
  return element.getAttribute(name) || defaultValue;
}

/**
 * Parse all fixi attributes from an element
 */
export function parseAttributes(element: Element): ParsedAttributes {
  // Inlined getAttribute calls for hot path optimization
  const action = element.getAttribute('fx-action') || '';
  const method = normalizeMethod(element.getAttribute('fx-method') || 'GET');
  const target = element.getAttribute('fx-target') || '';
  const swap = element.getAttribute('fx-swap') || 'outerHTML';
  
  // Inlined getDefaultTrigger logic
  const explicitTrigger = element.getAttribute('fx-trigger');
  const trigger = explicitTrigger || (
    element.tagName === 'FORM' ? 'submit' :
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) ? 'change' :
    'click'
  );

  return {
    action,
    method,
    target,
    swap,
    trigger
  };
}

/**
 * Normalize HTTP method to uppercase and validate
 */
function normalizeMethod(method: string): string {
  const normalized = method.toUpperCase();
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  
  return validMethods.includes(normalized) ? normalized : 'GET';
}

// ============================================================================
// UTILITY FUNCTIONS (from utils.ts)
// ============================================================================

/**
 * Check if an element should be ignored by fixi processing
 */
export function shouldIgnore(element: Element | null): boolean {
  if (!element) return false;
  return element.closest('[fx-ignore]') !== null;
}

/**
 * Get an attribute value with a default fallback
 */
export function getAttributeWithDefault(element: Element, name: string, defaultValue: string = ''): string {
  return element.getAttribute(name) || defaultValue;
}

/**
 * Check if an element has fixi attributes
 */
export function hasFxAction(element: Element): boolean {
  return element.hasAttribute('fx-action');
}

/**
 * Query selector with safe fallback
 */
export function safeQuerySelector(selector: string, context: Document | Element = document): Element | null {
  try {
    return context.querySelector(selector);
  } catch {
    return null;
  }
}