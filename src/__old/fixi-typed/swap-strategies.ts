/**
 * Swap strategies module - different ways to update the DOM
 */
import { FixiConfig, SwapFunction } from './types';

/**
 * Execute a swap operation
 */
export async function executeSwap(config: FixiConfig): Promise<void> {
  const { swap, target, text = '' } = config;
  
  // Handle function swaps
  if (typeof swap === 'function') {
    return swap(config);
  }
  
  // Handle insertAdjacentHTML positions
  if (isAdjacentPosition(swap)) {
    target.insertAdjacentHTML(swap, text);
    return;
  }
  
  // Handle property assignments
  if (swap in target) {
    (target as any)[swap] = text;
    return;
  }
  
  throw new Error(`Invalid swap strategy: ${swap}`);
}

/**
 * Check if a string is a valid insertAdjacentHTML position
 */
function isAdjacentPosition(value: string): value is InsertPosition {
  return /^(before|after)(begin|end)$/i.test(value);
}

/**
 * Create a swap function that swaps innerHTML
 */
export function innerHTMLSwap(): SwapFunction {
  return (config) => {
    config.target.innerHTML = config.text || '';
  };
}

/**
 * Create a swap function that swaps outerHTML
 */
export function outerHTMLSwap(): SwapFunction {
  return (config) => {
    config.target.outerHTML = config.text || '';
  };
}

/**
 * Create a swap function that updates a specific property
 */
export function propertySwap(property: string): SwapFunction {
  return (config) => {
    (config.target as any)[property] = config.text || '';
  };
}

/**
 * Create a swap function with view transition support
 */
export function transitionSwap(baseSwap: SwapFunction): SwapFunction {
  return async (config) => {
    if (config.transition) {
      await config.transition(() => baseSwap(config)).finished;
    } else {
      await baseSwap(config);
    }
  };
}