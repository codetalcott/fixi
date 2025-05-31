import { describe, it, expect } from 'vitest';

describe('Production Bundle Variants', () => {
  describe('Variant Entry Points', () => {
    it('should provide minimal entry point with core functionality', async () => {
      const minimal = await import('../minimal');
      
      expect(minimal.parseAttributes).toBeDefined();
      expect(minimal.dispatchFxEvent).toBeDefined();
      expect(minimal.executeSwap).toBeDefined();
      expect(minimal.fixi).toBeDefined();
      expect(minimal.fixi.version).toContain('minimal');
    });

    it('should provide compat entry point for drop-in replacement', async () => {
      const compat = await import('../compat');
      
      expect(compat.fixi).toBeDefined();
      expect(compat.fixi.init).toBeDefined();
      expect(compat.fixi.version).toContain('compat');
      expect(compat.fixi.parseAttributes).toBeDefined();
      expect(compat.fixi.dispatchEvent).toBeDefined();
      expect(compat.fixi.executeSwap).toBeDefined();
    });

    it('should provide full entry point with all features', async () => {
      const full = await import('../full');
      
      expect(full.fixi).toBeDefined();
      expect(full.fixi.version).toContain('full');
      expect(full.fixi.utils).toBeDefined();
      expect(full.fixi.types).toBeDefined();
      expect(full.parseAttributes).toBeDefined();
      expect(full.dispatchFxEvent).toBeDefined();
      expect(full.executeSwap).toBeDefined();
      expect(full.shouldIgnore).toBeDefined();
      expect(full.hasFxAction).toBeDefined();
    });
  });

  describe('Bundle Content Validation', () => {
    it('should have minimal bundle with only essential exports', async () => {
      const minimal = await import('../minimal');
      
      // Should have core functions
      expect(minimal.parseAttributes).toBeDefined();
      expect(minimal.dispatchFxEvent).toBeDefined();
      expect(minimal.executeSwap).toBeDefined();
      
      // Should NOT have utility functions
      expect((minimal as any).shouldIgnore).toBeUndefined();
      expect((minimal as any).hasFxAction).toBeUndefined();
      expect((minimal as any).getAttributeWithDefault).toBeUndefined();
    });

    it('should have compat bundle expose global-style API', async () => {
      const compat = await import('../compat');
      
      expect(compat.fixi.config).toBeDefined();
      expect(compat.fixi.config.defaultHeaders).toBeDefined();
      expect(compat.fixi.config.autoInit).toBe(true);
      expect(compat.fixi.config.observe).toBe(true);
    });

    it('should have full bundle with enhanced utilities', async () => {
      const full = await import('../full');
      
      expect(full.fixi.utils).toBeDefined();
      expect(full.fixi.types).toBeDefined();
      expect(full.fixi.types.features).toContain('events');
      expect(full.fixi.types.features).toContain('attributes');
      expect(full.fixi.types.features).toContain('swapping');
      expect(full.fixi.types.build).toBe('full');
    });
  });

  describe('API Compatibility', () => {
    it('should maintain consistent core API across variants', async () => {
      const minimal = await import('../minimal');
      const compat = await import('../compat');
      const full = await import('../full');
      
      // All should have parseAttributes with same signature
      expect(typeof minimal.parseAttributes).toBe('function');
      expect(typeof compat.fixi.parseAttributes).toBe('function');
      expect(typeof full.parseAttributes).toBe('function');
      
      // All should have fixi objects
      expect(minimal.fixi.version).toBeDefined();
      expect(compat.fixi.version).toBeDefined();
      expect(full.fixi.version).toBeDefined();
    });
  });
});