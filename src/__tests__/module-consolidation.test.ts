import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Module Consolidation', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;
  });

  describe('Consolidated Core Module', () => {
    it('should provide all attributes functionality', async () => {
      const { parseAttributes, getAttribute } = await import('../core/fixi-core');
      
      const element = document.createElement('div');
      element.setAttribute('fx-action', '/api/test');
      element.setAttribute('fx-method', 'POST');
      
      const config = parseAttributes(element);
      expect(config.action).toBe('/api/test');
      expect(config.method).toBe('POST');
      
      const attr = getAttribute(element, 'fx-action');
      expect(attr).toBe('/api/test');
    });

    it('should provide all events functionality', async () => {
      const { dispatchFxEvent } = await import('../core/fixi-core');
      
      const element = document.createElement('div');
      let eventFired = false;
      
      element.addEventListener('fx:init', () => {
        eventFired = true;
      });
      
      dispatchFxEvent(element, 'init', { options: {} });
      expect(eventFired).toBe(true);
    });

    it('should provide all utils functionality', async () => {
      const { shouldIgnore, hasFxAction } = await import('../core/fixi-core');
      
      const element = document.createElement('div');
      element.setAttribute('fx-action', '/test');
      
      expect(shouldIgnore(element)).toBe(false);
      expect(hasFxAction(element)).toBe(true);
    });

    it('should maintain separate exports for tree-shaking', async () => {
      // Verify individual functions can still be imported
      const { parseAttributes } = await import('../core/fixi-core');
      const { dispatchFxEvent } = await import('../core/fixi-core');
      const { shouldIgnore } = await import('../core/fixi-core');
      
      expect(typeof parseAttributes).toBe('function');
      expect(typeof dispatchFxEvent).toBe('function');
      expect(typeof shouldIgnore).toBe('function');
    });
  });

  describe('External API Preservation', () => {
    it('should maintain exact same exports through main index', async () => {
      const mainExports = await import('../index');
      
      // Check all expected exports exist
      expect(mainExports.parseAttributes).toBeDefined();
      expect(mainExports.dispatchFxEvent).toBeDefined();
      expect(mainExports.shouldIgnore).toBeDefined();
      expect(mainExports.hasFxAction).toBeDefined();
      expect(mainExports.executeSwap).toBeDefined();
      expect(mainExports.fixi).toBeDefined();
    });

    it('should maintain dynamic module imports', async () => {
      const { fixi } = await import('../index');
      
      const eventsModule = await fixi.modules.events();
      const attributesModule = await fixi.modules.attributes();
      const utilsModule = await fixi.modules.utils();
      
      expect(eventsModule).toBeDefined();
      expect(attributesModule).toBeDefined();
      expect(utilsModule).toBeDefined();
    });
  });

  describe('Tree-shaking Support', () => {
    it('should allow importing individual functions', async () => {
      // Test that we can import specific functions without the whole module
      const { parseAttributes } = await import('../core/fixi-core');
      expect(typeof parseAttributes).toBe('function');
    });

    it('should keep swapping module separate', async () => {
      const swappingModule = await import('../swapping/swap-strategies');
      expect(swappingModule.executeSwap).toBeDefined();
    });
  });
});