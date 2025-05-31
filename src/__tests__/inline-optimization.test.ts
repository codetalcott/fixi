import { describe, it, expect, beforeEach } from 'vitest';
import { parseAttributes } from '../core/attributes';
import { JSDOM } from 'jsdom';

describe('Function Inlining Optimization', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
  });

  describe('getAttribute inlining', () => {
    it('should correctly handle default values when attributes are missing', () => {
      const element = document.createElement('div');
      const config = parseAttributes(element);
      
      expect(config.action).toBe('');
      expect(config.method).toBe('GET');
      expect(config.trigger).toBe('click');
      expect(config.target).toBe('');
      expect(config.swap).toBe('outerHTML');
    });

    it('should correctly read all fx-* attributes', () => {
      const element = document.createElement('div');
      element.setAttribute('fx-action', '/api/test');
      element.setAttribute('fx-method', 'POST');
      element.setAttribute('fx-trigger', 'mouseover');
      element.setAttribute('fx-target', '#result');
      element.setAttribute('fx-swap', 'outerHTML');
      
      const config = parseAttributes(element);
      
      expect(config.action).toBe('/api/test');
      expect(config.method).toBe('POST');
      expect(config.trigger).toBe('mouseover');
      expect(config.target).toBe('#result');
      expect(config.swap).toBe('outerHTML');
    });
  });

  describe('getDefaultTrigger inlining', () => {
    it('should return submit for forms', () => {
      const form = document.createElement('form');
      form.setAttribute('fx-action', '/submit');
      const config = parseAttributes(form);
      
      expect(config.trigger).toBe('submit');
    });

    it('should return change for form inputs', () => {
      const inputs = ['input', 'textarea', 'select'];
      
      for (const tag of inputs) {
        const element = document.createElement(tag);
        element.setAttribute('fx-action', '/change');
        const config = parseAttributes(element);
        
        expect(config.trigger).toBe('change');
      }
    });

    it('should return click for other elements', () => {
      const elements = ['button', 'a', 'div', 'span'];
      
      for (const tag of elements) {
        const element = document.createElement(tag);
        element.setAttribute('fx-action', '/click');
        const config = parseAttributes(element);
        
        expect(config.trigger).toBe('click');
      }
    });
  });
});