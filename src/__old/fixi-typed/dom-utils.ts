/**
 * DOM utilities module - helpers for working with DOM elements
 */

/**
 * Get attribute value with optional default
 */
export function getAttribute(
  element: Element,
  name: string,
  defaultValue: string = ''
): string {
  return element.getAttribute(name) || defaultValue;
}

/**
 * Check if element should be ignored
 */
export function shouldIgnore(element: Element): boolean {
  return element.closest('[fx-ignore]') !== null;
}

/**
 * Get default trigger event for an element
 */
export function getDefaultTrigger(element: Element): string {
  if (element.matches('form')) {
    return 'submit';
  }
  
  if (element.matches('input:not([type=button]),select,textarea')) {
    return 'change';
  }
  
  return 'click';
}

/**
 * Find form element for the given element
 */
export function findForm(element: Element): HTMLFormElement | null {
  if (element instanceof HTMLFormElement) {
    return element;
  }
  
  if ('form' in element && element.form instanceof HTMLFormElement) {
    return element.form;
  }
  
  return element.closest('form');
}

/**
 * Query selector with type safety
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  root: Document | Element = document
): T | null {
  return root.querySelector<T>(selector);
}

/**
 * Check if element has fx-action attribute
 */
export function hasFxAction(element: Element): boolean {
  return element.hasAttribute('fx-action');
}