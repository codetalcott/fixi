/**
 * Configuration builder module - creates request configurations
 */
import { FixiConfig, FixiElement } from './types.js';
import { getAttribute, getDefaultTrigger, findForm } from './dom-utils.js';
import { querySelector } from './dom-utils.js';

/**
 * Build configuration for a request
 */
export function buildConfig(element: FixiElement, event: Event): FixiConfig {
  const form = findForm(element);
  const formData = createFormData(element, form, event);
  const method = getAttribute(element, 'fx-method', 'GET').toUpperCase();
  
  // Create abort controller
  const abortController = new AbortController();
  
  // Build base configuration
  const config: FixiConfig = {
    trigger: event,
    action: getAttribute(element, 'fx-action'),
    method,
    target: resolveTarget(element),
    swap: getAttribute(element, 'fx-swap', 'outerHTML'),
    body: formData,
    drop: 0, // Will be set by request manager
    headers: { 'FX-Request': 'true' },
    abort: () => abortController.abort(),
    signal: abortController.signal,
    preventTrigger: true,
    transition: document.startViewTransition?.bind(document),
    fetch: fetch.bind(window)
  };
  
  // Process URL parameters for GET/DELETE
  if (['GET', 'DELETE'].includes(method) && formData) {
    config.action = appendFormDataToUrl(config.action, formData);
    config.body = null;
  }
  
  return config;
}

/**
 * Create FormData for the request
 */
function createFormData(
  element: Element,
  form: HTMLFormElement | null,
  event: Event
): FormData | null {
  if (!form) {
    // If element has name/value, create FormData with just that
    if ('name' in element && 'value' in element) {
      const formData = new FormData();
      formData.append(
        (element as HTMLInputElement).name,
        (element as HTMLInputElement).value
      );
      return formData;
    }
    return null;
  }
  
  // Create FormData from form with submitter if available
  const submitter = (event as SubmitEvent).submitter || undefined;
  return new FormData(form, submitter);
}

/**
 * Resolve target element from fx-target attribute
 */
function resolveTarget(element: Element): Element {
  const targetSelector = getAttribute(element, 'fx-target');
  if (targetSelector) {
    return querySelector(targetSelector) || element;
  }
  return element;
}

/**
 * Append FormData parameters to URL
 */
function appendFormDataToUrl(url: string, formData: FormData): string {
  const params = new URLSearchParams(formData as any);
  if (params.toString()) {
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + params.toString();
  }
  return url;
}

/**
 * Get trigger event name for element
 */
export function getTriggerEvent(element: Element): string {
  return getAttribute(element, 'fx-trigger') || getDefaultTrigger(element);
}