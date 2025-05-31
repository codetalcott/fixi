import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dispatchFxEvent } from './events';
import type { FxEventType, FxInitEvent, FxConfigEvent, RequestConfig } from './types';

describe('Events', () => {
  let element: HTMLDivElement;
  let eventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    eventListener = vi.fn();
  });

  describe('dispatchFxEvent', () => {
    it('should dispatch custom events with correct name format', () => {
      element.addEventListener('fx:init', eventListener);
      
      const result = dispatchFxEvent(element, 'init', { options: {} });
      
      expect(result).toBe(true);
      expect(eventListener).toHaveBeenCalledTimes(1);
      
      const event = eventListener.mock.calls[0][0];
      expect(event.type).toBe('fx:init');
      expect(event.detail).toEqual({ options: {} });
    });

    it('should create cancelable events', () => {
      element.addEventListener('fx:init', eventListener);
      
      dispatchFxEvent(element, 'init', { options: {} });
      
      const event = eventListener.mock.calls[0][0];
      expect(event.cancelable).toBe(true);
    });

    it('should create bubbling events by default', () => {
      element.addEventListener('fx:init', eventListener);
      
      dispatchFxEvent(element, 'init', { options: {} });
      
      const event = eventListener.mock.calls[0][0];
      expect(event.bubbles).toBe(true);
    });

    it('should create non-bubbling events when specified', () => {
      element.addEventListener('fx:inited', eventListener);
      
      dispatchFxEvent(element, 'inited', {}, false);
      
      const event = eventListener.mock.calls[0][0];
      expect(event.bubbles).toBe(false);
    });

    it('should create composed events', () => {
      element.addEventListener('fx:init', eventListener);
      
      dispatchFxEvent(element, 'init', { options: {} });
      
      const event = eventListener.mock.calls[0][0];
      expect(event.composed).toBe(true);
    });

    it('should return false when event is prevented', () => {
      element.addEventListener('fx:config', (event: Event) => {
        event.preventDefault();
      });
      
      const mockConfig = {
        action: 'test',
        method: 'GET'
      } as RequestConfig;
      
      const result = dispatchFxEvent(element, 'config', { 
        cfg: mockConfig, 
        requests: new Set() 
      });
      
      expect(result).toBe(false);
    });

    it('should return true when event is not prevented', () => {
      element.addEventListener('fx:config', eventListener);
      
      const mockConfig = {
        action: 'test',
        method: 'GET'
      } as RequestConfig;
      
      const result = dispatchFxEvent(element, 'config', { 
        cfg: mockConfig, 
        requests: new Set() 
      });
      
      expect(result).toBe(true);
    });

    it('should handle all event types correctly', () => {
      const eventTypes: FxEventType[] = [
        'init', 'inited', 'process', 'config', 
        'before', 'after', 'error', 'finally', 'swapped'
      ];
      
      eventTypes.forEach(type => {
        const listener = vi.fn();
        element.addEventListener(`fx:${type}`, listener);
        
        const result = dispatchFxEvent(element, type, {} as any);
        
        expect(result).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
        
        const event = listener.mock.calls[0][0];
        expect(event.type).toBe(`fx:${type}`);
      });
    });
  });
});