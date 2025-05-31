/**
 * Event dispatching system for fixi
 */

import type { FxEventType, FxEventMap } from './types';

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