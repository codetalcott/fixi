/**
 * Swap strategies module - WHAT DOM changes to make
 * Uses swap mechanisms for HOW to apply the changes
 */
import { FixiConfig, SwapFunction, SwapMechanism } from './types.js';
import { swapMechanismRegistry } from './swap-mechanisms.js';

/**
 * Execute a swap operation using the configured mechanism
 */
export async function executeSwap(
  config: FixiConfig, 
  mechanism?: SwapMechanism
): Promise<void> {
  const swapMechanism = mechanism || swapMechanismRegistry.getDefault();
  
  // Define the swap operation (WHAT to change)
  const swapOperation = () => {
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
  };
  
  // Execute using the mechanism (HOW to apply)
  await swapMechanism(swapOperation, config);
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