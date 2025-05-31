/**
 * Core utility functions for the fixi library
 */

/**
 * Check if an element should be ignored by fixi processing
 */
export function shouldIgnore(element: Element | null): boolean {
  if (!element) return false;
  return element.closest('[fx-ignore]') !== null;
}

/**
 * Get the default trigger event for an element based on its type
 */
export function getDefaultTrigger(element: Element): string {
  if (isForm(element)) {
    return 'submit';
  }
  
  if (isFormElement(element)) {
    return 'change';
  }
  
  return 'click';
}

/**
 * Check if an element is a form
 */
export function isForm(element: Element): element is HTMLFormElement {
  return element.matches('form');
}

/**
 * Check if an element is a form control element (but not a button)
 */
export function isFormElement(element: Element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return element.matches('input:not([type=button]):not([type=submit]):not([type=reset]),select,textarea');
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