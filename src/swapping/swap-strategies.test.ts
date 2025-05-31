import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeSwap, isSwapFunction } from './swap-strategies';
import type { RequestConfig, SwapFunction } from '../core/types';

describe('Swap Strategies', () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;
  let mockConfig: RequestConfig;

  beforeEach(() => {
    // Clean up previous test
    document.body.innerHTML = '';
    
    container = document.createElement('div');
    container.innerHTML = '<div id="target">original content</div>';
    document.body.appendChild(container);
    
    target = container.querySelector('#target') as HTMLDivElement;
    
    mockConfig = {
      target,
      text: '<span>new content</span>',
      swap: 'innerHTML'
    } as RequestConfig;
  });

  describe('executeSwap', () => {
    it('should handle innerHTML swap', async () => {
      mockConfig.swap = 'innerHTML';
      
      await executeSwap(mockConfig);
      
      expect(target.innerHTML).toBe('<span>new content</span>');
    });

    it('should handle outerHTML swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'outerHTML';
      
      await executeSwap(mockConfig);
      
      const newElement = container.querySelector('span');
      expect(newElement).toBeTruthy();
      expect(newElement?.textContent).toBe('new content');
      expect(container.querySelector('#target')).toBeFalsy();
    });

    it('should handle beforebegin swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'beforebegin';
      
      await executeSwap(mockConfig);
      
      expect(container.innerHTML).toBe('<span>new content</span><div id="target">original content</div>');
    });

    it('should handle afterbegin swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'afterbegin';
      
      await executeSwap(mockConfig);
      
      expect(freshTarget.innerHTML).toBe('<span>new content</span>original content');
    });

    it('should handle beforeend swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'beforeend';
      
      await executeSwap(mockConfig);
      
      expect(freshTarget.innerHTML).toBe('original content<span>new content</span>');
    });

    it('should handle afterend swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'afterend';
      
      await executeSwap(mockConfig);
      
      expect(container.innerHTML).toBe('<div id="target">original content</div><span>new content</span>');
    });

    it('should handle property swaps', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      freshTarget.setAttribute('data-value', 'old');
      mockConfig.target = freshTarget;
      mockConfig.swap = 'dataset.value';
      mockConfig.text = 'new value';
      
      await executeSwap(mockConfig);
      
      expect(freshTarget.dataset.value).toBe('new value');
    });

    it('should handle textContent swap', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      mockConfig.target = freshTarget;
      mockConfig.swap = 'textContent';
      mockConfig.text = 'plain text';
      
      await executeSwap(mockConfig);
      
      expect(freshTarget.textContent).toBe('plain text');
    });

    it('should handle function swaps', async () => {
      const swapFn: SwapFunction = vi.fn();
      mockConfig.swap = swapFn;
      
      await executeSwap(mockConfig);
      
      expect(swapFn).toHaveBeenCalledWith(mockConfig);
    });

    it('should handle async function swaps', async () => {
      const swapFn: SwapFunction = vi.fn().mockResolvedValue(undefined);
      mockConfig.swap = swapFn;
      
      await executeSwap(mockConfig);
      
      expect(swapFn).toHaveBeenCalledWith(mockConfig);
    });

    it('should throw error for invalid swap strategy', async () => {
      mockConfig.swap = 'invalidStrategy';
      
      await expect(executeSwap(mockConfig)).rejects.toThrow('invalidStrategy');
    });

    it('should handle nested property access', async () => {
      const freshTarget = container.querySelector('#target') as HTMLDivElement;
      (freshTarget as any).customObject = { nested: { value: 'old' } };
      mockConfig.target = freshTarget;
      mockConfig.swap = 'customObject.nested.value';
      mockConfig.text = 'new nested value';
      
      await executeSwap(mockConfig);
      
      expect((freshTarget as any).customObject.nested.value).toBe('new nested value');
    });
  });

  describe('isSwapFunction', () => {
    it('should return true for functions', () => {
      const fn = () => {};
      expect(isSwapFunction(fn)).toBe(true);
    });

    it('should return false for strings', () => {
      expect(isSwapFunction('innerHTML')).toBe(false);
    });

    it('should return false for other types', () => {
      expect(isSwapFunction(null)).toBe(false);
      expect(isSwapFunction(undefined)).toBe(false);
      expect(isSwapFunction(42)).toBe(false);
    });
  });
});