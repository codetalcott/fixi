import { describe, it, expect } from 'vitest';
import { fixi } from '../index';
import { parseAttributes } from '../core/attributes';
import { JSDOM } from 'jsdom';

describe('Plugin Infrastructure Removal', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;
  });

  it('should have core functionality working without plugins', () => {
    // Verify main fixi object exists
    expect(fixi).toBeDefined();
    expect(fixi.version).toBeDefined();
    expect(typeof fixi.init).toBe('function');
  });

  it('should have core modules still accessible', () => {
    expect(fixi.modules).toBeDefined();
    expect(typeof fixi.modules.events).toBe('function');
    expect(typeof fixi.modules.attributes).toBe('function');
    expect(typeof fixi.modules.swapping).toBe('function');
    expect(typeof fixi.modules.utils).toBe('function');
  });

  it('should parse attributes correctly without plugin system', () => {
    const element = document.createElement('div');
    element.setAttribute('fx-action', '/api/test');
    element.setAttribute('fx-method', 'POST');
    
    const config = parseAttributes(element);
    
    expect(config.action).toBe('/api/test');
    expect(config.method).toBe('POST');
    expect(config.trigger).toBe('click');
    expect(config.target).toBe('');
    expect(config.swap).toBe('outerHTML');
  });

  it('should not expose plugin-related APIs', () => {
    // Ensure no plugin APIs are accidentally exposed
    expect((fixi as any).plugins).toBeUndefined();
    expect((fixi as any).registerPlugin).toBeUndefined();
    expect((fixi as any).use).toBeUndefined();
  });

  it('should still have essential module exports', async () => {
    // Test that essential modules can be dynamically imported
    const eventsModule = await fixi.modules.events();
    const attributesModule = await fixi.modules.attributes();
    const swappingModule = await fixi.modules.swapping();
    const utilsModule = await fixi.modules.utils();
    
    expect(eventsModule).toBeDefined();
    expect(attributesModule).toBeDefined(); 
    expect(swappingModule).toBeDefined();
    expect(utilsModule).toBeDefined();
  });
});