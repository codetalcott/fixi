/**
 * Core type definitions for the modular fixi library
 */

export interface FxAttributes {
  'fx-action': string;
  'fx-method'?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  'fx-target'?: string;
  'fx-swap'?: SwapStrategy | string;
  'fx-trigger'?: string;
  'fx-ignore'?: boolean;
}

export type SwapStrategy = 
  | 'innerHTML' 
  | 'outerHTML' 
  | 'beforebegin' 
  | 'afterbegin' 
  | 'beforeend' 
  | 'afterend'
  | SwapFunction;

export type SwapFunction = (config: RequestConfig) => void | Promise<void>;

export interface RequestConfig {
  trigger: Event;
  action: string;
  method: string;
  target: Element;
  swap: SwapStrategy | string;
  body: FormData | null;
  drop: number;
  headers: Record<string, string>;
  abort: () => void;
  signal: AbortSignal;
  preventTrigger: boolean;
  transition?: ViewTransitionFunction;
  fetch: typeof fetch;
  response?: Response;
  text?: string;
  confirm?: () => Promise<boolean>;
}

export type ViewTransitionFunction = (callback: () => void | Promise<void>) => { finished: Promise<void> };

// Event payload types for all 9 fixi events
export interface FxInitEvent { 
  options: Record<string, any>;
}

export interface FxInitedEvent {}

export interface FxProcessEvent {}

export interface FxConfigEvent { 
  cfg: RequestConfig; 
  requests: Set<RequestConfig>;
}

export interface FxBeforeEvent { 
  cfg: RequestConfig; 
  requests: Set<RequestConfig>;
}

export interface FxAfterEvent { 
  cfg: RequestConfig;
}

export interface FxErrorEvent { 
  cfg: RequestConfig; 
  error: Error;
}

export interface FxFinallyEvent { 
  cfg: RequestConfig;
}

export interface FxSwappedEvent { 
  cfg: RequestConfig;
}

export interface FxEventMap {
  'fx:init': CustomEvent<FxInitEvent>;
  'fx:inited': CustomEvent<FxInitedEvent>;
  'fx:process': CustomEvent<FxProcessEvent>;
  'fx:config': CustomEvent<FxConfigEvent>;
  'fx:before': CustomEvent<FxBeforeEvent>;
  'fx:after': CustomEvent<FxAfterEvent>;
  'fx:error': CustomEvent<FxErrorEvent>;
  'fx:finally': CustomEvent<FxFinallyEvent>;
  'fx:swapped': CustomEvent<FxSwappedEvent>;
}

export type FxEventType = keyof FxEventMap;

// Plugin system types
export interface Plugin {
  name: string;
  version?: string;
  init?: (fixi: FixiInstance) => void | Promise<void>;
  hooks?: Partial<PluginHooks>;
}

export interface PluginHooks {
  beforeInit: (element: Element, options: Record<string, any>) => boolean | void;
  afterInit: (element: Element) => void;
  beforeRequest: (config: RequestConfig) => boolean | void;
  afterRequest: (config: RequestConfig) => void;
  beforeSwap: (config: RequestConfig) => boolean | void;
  afterSwap: (config: RequestConfig) => void;
  onError: (config: RequestConfig, error: Error) => void;
}

export interface FixiInstance {
  process: (node: Node) => void;
  init: (element: Element) => void;
  plugins: PluginManager;
  observer?: MutationObserver;
  destroy: () => void;
}

export interface PluginManager {
  register: (plugin: Plugin) => void;
  unregister: (name: string) => void;
  executeHook: <T extends keyof PluginHooks>(
    hook: T, 
    ...args: Parameters<NonNullable<PluginHooks[T]>>
  ) => boolean;
  getPlugin: (name: string) => Plugin | undefined;
  listPlugins: () => string[];
}

// Utility types for DOM elements with fixi data
export interface FxElement extends Element {
  __fixi?: FxElementHandler;
}

export interface FxElementHandler {
  (event: Event): Promise<void>;
  evt: string;
  requests?: Set<RequestConfig>;
}

// Configuration options
export interface FixiConfig {
  autoInit?: boolean;
  observe?: boolean;
  defaultHeaders?: Record<string, string>;
  plugins?: Plugin[];
}