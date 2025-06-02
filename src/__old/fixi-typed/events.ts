/**
 * Event system module - handles custom event dispatching
 */
import { FixiEventType, FixiEventDetail } from './types';

/**
 * Dispatch a custom fx: event
 */
export function dispatchFixiEvent(
  element: Element,
  type: FixiEventType,
  detail: FixiEventDetail = {},
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
 * Create an event listener for fixi events
 */
export function onFixiEvent(
  element: Element | Document,
  type: FixiEventType,
  handler: (event: CustomEvent<FixiEventDetail>) => void
): () => void {
  const eventName = `fx:${type}`;
  element.addEventListener(eventName, handler as EventListener);
  
  // Return cleanup function
  return () => {
    element.removeEventListener(eventName, handler as EventListener);
  };
}