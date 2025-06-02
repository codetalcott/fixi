/**
 * Core types for fixi - a hypermedia control library
 */

export interface FixiConfig {
  trigger: Event;
  action: string;
  method: string;
  target: Element;
  swap: string | SwapFunction;
  body: FormData | null;
  drop: number;
  headers: Record<string, string>;
  abort: () => void;
  signal: AbortSignal;
  preventTrigger: boolean;
  transition?: (callback: () => void | Promise<void>) => { finished: Promise<void> };
  fetch: typeof fetch;
  // Runtime additions
  response?: Response;
  text?: string;
  confirm?: () => boolean | Promise<boolean>;
}

export type SwapFunction = (config: FixiConfig) => void | Promise<void>;

export interface FixiElement extends Element {
  __fixi?: {
    (evt: Event): Promise<void>;
    evt?: string;
    requests?: Set<FixiConfig>;
  };
}

export interface FixiEventDetail {
  cfg?: FixiConfig;
  requests?: FixiConfig[] | Set<FixiConfig>;
  options?: Record<string, any>;
  error?: Error;
}

export interface FixiEvent extends CustomEvent {
  detail: FixiEventDetail;
}

export type FixiEventType = 
  | 'init' 
  | 'config' 
  | 'before' 
  | 'after' 
  | 'error' 
  | 'finally' 
  | 'swapped' 
  | 'inited'
  | 'process';

export interface FixiOptions {
  observe?: boolean;
  autoInit?: boolean;
  defaultHeaders?: Record<string, string>;
}