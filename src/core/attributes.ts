/**
 * Attribute parsing and handling for fixi elements
 */

import { getDefaultTrigger } from './utils';

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
  const action = getAttribute(element, 'fx-action');
  const method = normalizeMethod(getAttribute(element, 'fx-method', 'GET'));
  const target = getAttribute(element, 'fx-target');
  const swap = getAttribute(element, 'fx-swap', 'outerHTML');
  const trigger = getAttribute(element, 'fx-trigger') || getDefaultTrigger(element);

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