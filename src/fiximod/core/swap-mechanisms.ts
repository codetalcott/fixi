/**
 * Swap mechanisms - HOW DOM changes are applied
 * Separate from swap strategies (WHAT changes to make)
 */
import { SwapMechanism } from './types.js';

/**
 * View Transition mechanism (default - matches fixi.js behavior)
 */
export const viewTransitionMechanism: SwapMechanism = async (swapOperation, config) => {
  if (config.transition) {
    try {
      const transition = config.transition(swapOperation);
      if (transition && transition.finished) {
        await transition.finished;
      }
    } catch (e) {
      // Fallback to direct execution if transition fails
      await swapOperation();
    }
  } else {
    await swapOperation();
  }
};

/**
 * Immediate mechanism (no transitions)
 */
export const immediateMechanism: SwapMechanism = async (swapOperation) => {
  await swapOperation();
};

/**
 * Custom animation mechanism
 */
export const customAnimationMechanism = (
  animationConfig: {
    duration?: number;
    easing?: string;
    beforeSwap?: (target: Element) => void;
    afterSwap?: (target: Element) => void;
  }
): SwapMechanism => {
  return async (swapOperation, config) => {
    const target = config.target as HTMLElement;
    const { duration = 300, easing = 'ease-in-out', beforeSwap, afterSwap } = animationConfig;
    
    if (beforeSwap) beforeSwap(target);
    
    // Apply CSS transition
    target.style.transition = `all ${duration}ms ${easing}`;
    target.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, duration / 2));
    await swapOperation();
    
    target.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, duration / 2));
    
    // Cleanup
    target.style.transition = '';
    
    if (afterSwap) afterSwap(target);
  };
};

/**
 * Placeholder for future idiomorph mechanism
 * Will be implemented in plugin module
 */
export const idiomorphMechanism: SwapMechanism = async (swapOperation, config) => {
  // TODO: Implement idiomorph integration
  // For now, fall back to immediate
  console.warn('idiomorph mechanism not yet implemented, falling back to immediate');
  await immediateMechanism(swapOperation, config);
};

/**
 * Registry for swap mechanisms
 */
class SwapMechanismRegistry {
  private mechanisms = new Map<string, SwapMechanism>();
  private defaultMechanism: SwapMechanism = viewTransitionMechanism;
  
  constructor() {
    // Register built-in mechanisms
    this.register('view-transition', viewTransitionMechanism);
    this.register('immediate', immediateMechanism);
    this.register('idiomorph', idiomorphMechanism);
  }
  
  register(name: string, mechanism: SwapMechanism): void {
    this.mechanisms.set(name, mechanism);
  }
  
  get(name: string): SwapMechanism | undefined {
    return this.mechanisms.get(name);
  }
  
  getDefault(): SwapMechanism {
    return this.defaultMechanism;
  }
  
  setDefault(mechanism: SwapMechanism | string): void {
    if (typeof mechanism === 'string') {
      const registered = this.get(mechanism);
      if (!registered) {
        throw new Error(`Unknown swap mechanism: ${mechanism}`);
      }
      this.defaultMechanism = registered;
    } else {
      this.defaultMechanism = mechanism;
    }
  }
  
  list(): string[] {
    return Array.from(this.mechanisms.keys());
  }
}

// Global registry instance
export const swapMechanismRegistry = new SwapMechanismRegistry();