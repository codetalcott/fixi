/**
 * DOM swapping strategies for fixi
 */

import type { RequestConfig, SwapFunction, SwapStrategy } from '../core/types';

/**
 * Execute a swap operation based on the configuration
 */
export async function executeSwap(config: RequestConfig): Promise<void> {
  const { target, swap, text = '' } = config;

  if (isSwapFunction(swap)) {
    await swap(config);
    return;
  }

  const swapStr = swap as string;

  // Handle insertAdjacentHTML methods
  if (/(before|after)(begin|end)/.test(swapStr)) {
    target.insertAdjacentHTML(swapStr as InsertPosition, text);
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
    (target as any)[swapStr] = text;
    return;
  }

  // If we get here, the swap strategy is invalid
  throw new Error(`Invalid swap strategy: ${swapStr}`);
}

/**
 * Check if a swap strategy is a function
 */
export function isSwapFunction(swap: SwapStrategy | string): swap is SwapFunction {
  return typeof swap === 'function';
}

/**
 * Set a nested property on an object using dot notation
 */
function setNestedProperty(obj: any, path: string, value: string): void {
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