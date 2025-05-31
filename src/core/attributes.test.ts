import { describe, it, expect, beforeEach } from 'vitest';
import { parseAttributes, getAttribute } from './attributes';

describe('Attributes', () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  describe('getAttribute', () => {
    it('should return attribute value when present', () => {
      element.setAttribute('fx-action', '/test');
      expect(getAttribute(element, 'fx-action')).toBe('/test');
    });

    it('should return default value when attribute is missing', () => {
      expect(getAttribute(element, 'fx-method', 'GET')).toBe('GET');
    });

    it('should return empty string when no default provided', () => {
      expect(getAttribute(element, 'fx-target')).toBe('');
    });

    it('should handle boolean attributes', () => {
      element.setAttribute('fx-ignore', '');
      expect(getAttribute(element, 'fx-ignore')).toBe('');
      
      element.setAttribute('fx-ignore', 'true');
      expect(getAttribute(element, 'fx-ignore')).toBe('true');
    });
  });

  describe('parseAttributes', () => {
    it('should parse all fx attributes correctly', () => {
      element.setAttribute('fx-action', '/api/test');
      element.setAttribute('fx-method', 'POST');
      element.setAttribute('fx-target', '#result');
      element.setAttribute('fx-swap', 'innerHTML');
      element.setAttribute('fx-trigger', 'click');

      const attrs = parseAttributes(element);

      expect(attrs).toEqual({
        action: '/api/test',
        method: 'POST',
        target: '#result',
        swap: 'innerHTML',
        trigger: 'click'
      });
    });

    it('should use defaults for missing attributes', () => {
      element.setAttribute('fx-action', '/test');

      const attrs = parseAttributes(element);

      expect(attrs).toEqual({
        action: '/test',
        method: 'GET',
        target: '',
        swap: 'outerHTML',
        trigger: 'click' // Should use getDefaultTrigger result
      });
    });

    it('should handle method case insensitive', () => {
      element.setAttribute('fx-action', '/test');
      element.setAttribute('fx-method', 'post');

      const attrs = parseAttributes(element);

      expect(attrs.method).toBe('POST');
    });

    it('should validate method values', () => {
      element.setAttribute('fx-action', '/test');
      element.setAttribute('fx-method', 'INVALID');

      const attrs = parseAttributes(element);

      expect(attrs.method).toBe('GET'); // Should fallback to default
    });

    it('should handle different element types for trigger defaults', () => {
      // Test form element
      const form = document.createElement('form');
      form.setAttribute('fx-action', '/submit');
      
      const formAttrs = parseAttributes(form);
      expect(formAttrs.trigger).toBe('submit');

      // Test input element
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('fx-action', '/change');
      
      const inputAttrs = parseAttributes(input);
      expect(inputAttrs.trigger).toBe('change');

      // Test button element  
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/click');
      
      const buttonAttrs = parseAttributes(button);
      expect(buttonAttrs.trigger).toBe('click');
    });

    it('should respect explicit trigger over defaults', () => {
      const form = document.createElement('form');
      form.setAttribute('fx-action', '/test');
      form.setAttribute('fx-trigger', 'change');
      
      const attrs = parseAttributes(form);
      expect(attrs.trigger).toBe('change');
    });
  });
});