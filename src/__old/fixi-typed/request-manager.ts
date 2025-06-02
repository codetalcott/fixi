/**
 * Request management module - handles request lifecycle and tracking
 */
import { FixiConfig, FixiElement } from './types';
import { dispatchFixiEvent } from './events';

/**
 * Manages active requests for an element
 */
export class RequestManager {
  private requests = new WeakMap<Element, Set<FixiConfig>>();
  
  /**
   * Get active requests for an element
   */
  getRequests(element: Element): Set<FixiConfig> {
    let reqs = this.requests.get(element);
    if (!reqs) {
      reqs = new Set();
      this.requests.set(element, reqs);
    }
    return reqs;
  }
  
  /**
   * Add a request to tracking
   */
  addRequest(element: Element, config: FixiConfig): void {
    this.getRequests(element).add(config);
  }
  
  /**
   * Remove a request from tracking
   */
  removeRequest(element: Element, config: FixiConfig): void {
    this.getRequests(element).delete(config);
  }
  
  /**
   * Check if request should be dropped
   */
  shouldDropRequest(element: Element, config: FixiConfig): boolean {
    return config.drop > 0 && this.getRequests(element).size > 0;
  }
}

/**
 * Execute a request with proper lifecycle events
 */
export async function executeRequest(
  element: FixiElement,
  config: FixiConfig,
  requestManager: RequestManager
): Promise<void> {
  const requests = requestManager.getRequests(element);
  
  // Dispatch config event
  if (!dispatchFixiEvent(element, 'config', { cfg: config, requests: Array.from(requests) })) {
    return;
  }
  
  // Check drop condition
  if (requestManager.shouldDropRequest(element, config)) {
    return;
  }
  
  // Check confirm
  if (config.confirm) {
    const confirmed = await config.confirm();
    if (!confirmed) {
      return;
    }
  }
  
  // Add to active requests
  requestManager.addRequest(element, config);
  
  // Dispatch before event
  if (!dispatchFixiEvent(element, 'before', { cfg: config, requests: Array.from(requests) })) {
    requestManager.removeRequest(element, config);
    dispatchFixiEvent(element, 'finally', { cfg: config });
    return;
  }
  
  try {
    // Make request
    config.response = await config.fetch(config.action, {
      method: config.method,
      body: config.body,
      headers: config.headers,
      signal: config.signal
    });
    
    config.text = await config.response.text();
    
    // Dispatch after event
    if (!dispatchFixiEvent(element, 'after', { cfg: config })) {
      return;
    }
  } catch (error) {
    // Only dispatch error event if not aborted
    if (error instanceof Error && error.name !== 'AbortError') {
      dispatchFixiEvent(element, 'error', { cfg: config, error });
    }
    throw error;
  } finally {
    requestManager.removeRequest(element, config);
    dispatchFixiEvent(element, 'finally', { cfg: config });
  }
}