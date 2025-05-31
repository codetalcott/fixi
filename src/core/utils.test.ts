import { describe, it, expect, beforeEach } from 'vitest';
import { shouldIgnore } from './utils';

describe('Utils', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('shouldIgnore', () => {
    it('should return true for elements with fx-ignore attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('fx-ignore', '');
      
      expect(shouldIgnore(element)).toBe(true);
    });

    it('should return true for elements inside fx-ignore parent', () => {
      container.innerHTML = '<div fx-ignore><span id="child"></span></div>';
      const child = container.querySelector('#child') as Element;
      
      expect(shouldIgnore(child)).toBe(true);
    });

    it('should return false for elements without fx-ignore', () => {
      const element = document.createElement('div');
      
      expect(shouldIgnore(element)).toBe(false);
    });

    it('should return false for null elements', () => {
      expect(shouldIgnore(null as any)).toBe(false);
    });
  });

  // Note: getDefaultTrigger, isForm, and isFormElement have been inlined
  // into parseAttributes for performance. Tests for this logic are now
  // in src/__tests__/inline-optimization.test.ts
});