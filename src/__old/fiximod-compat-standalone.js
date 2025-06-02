/**
 * fiximod-compat-standalone.js
 * Standalone version of fiximod-compat that can be loaded with a regular script tag
 * Includes all dependencies inlined - no modules required
 */
(function() {
    'use strict';

    // Core utility functions (from fixi-core.js)
    function dispatchFxEvent(element, type, detail, bubbles = true) {
        const event = new CustomEvent(`fx:${type}`, {
            detail,
            cancelable: true,
            bubbles,
            composed: true
        });
        return element.dispatchEvent(event);
    }

    function getAttribute(element, name, defaultValue = '') {
        return element.getAttribute(name) || defaultValue;
    }

    function parseAttributes(element) {
        const action = element.getAttribute('fx-action') || '';
        const method = normalizeMethod(element.getAttribute('fx-method') || 'GET');
        const target = element.getAttribute('fx-target') || '';
        const swap = element.getAttribute('fx-swap') || 'outerHTML';
        const explicitTrigger = element.getAttribute('fx-trigger');
        
        let trigger;
        if (explicitTrigger) {
            trigger = explicitTrigger;
        } else if (element.tagName === 'FORM') {
            trigger = 'submit';
        } else if (element.tagName === 'INPUT') {
            const inputType = element.type?.toLowerCase() || '';
            // Button-type inputs use click, others use change
            trigger = ['button', 'submit', 'reset', 'image'].includes(inputType) ? 'click' : 'change';
        } else if (['TEXTAREA', 'SELECT'].includes(element.tagName)) {
            trigger = 'change';
        } else {
            trigger = 'click';
        }
        
        return {
            action,
            method,
            target,
            swap,
            trigger
        };
    }

    function normalizeMethod(method) {
        const normalized = method.toUpperCase();
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        return validMethods.includes(normalized) ? normalized : 'GET';
    }

    function shouldIgnore(element) {
        if (!element)
            return false;
        return element.closest('[fx-ignore]') !== null;
    }

    function hasFxAction(element) {
        return element.hasAttribute('fx-action');
    }

    // Swap strategies (from swap-strategies.js)
    async function executeSwap(config) {
        const { target, swap, text = '' } = config;
        if (isSwapFunction(swap)) {
            await swap(config);
            return;
        }
        const swapStr = swap;
        if (/(before|after)(begin|end)/.test(swapStr)) {
            target.insertAdjacentHTML(swapStr, text);
            return;
        }
        if (swapStr === 'innerHTML') {
            target.innerHTML = text;
            return;
        }
        if (swapStr === 'outerHTML') {
            target.outerHTML = text;
            return;
        }
        if (swapStr.includes('.')) {
            setNestedProperty(target, swapStr, text);
            return;
        }
        if (swapStr in target) {
            target[swapStr] = text;
            return;
        }
        throw new Error(`Invalid swap strategy: ${swapStr}`);
    }

    function isSwapFunction(swap) {
        return typeof swap === 'function';
    }

    function setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!key)
                continue;
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        const finalKey = keys[keys.length - 1];
        if (finalKey) {
            current[finalKey] = value;
        }
    }

    // Main fiximod-compat functionality
    const processedElements = new WeakSet();
    const activeRequests = new WeakMap();

    function processElement(element) {
        if (processedElements.has(element) || shouldIgnore(element)) {
            return;
        }
        if (!hasFxAction(element)) {
            return;
        }
        processedElements.add(element);
        const config = parseAttributes(element);
        const eventName = config.trigger;
        if (config.trigger === 'fx:inited') {
            setTimeout(() => {
                element.dispatchEvent(new Event('fx:inited', { bubbles: true }));
            }, 0);
        }
        const handler = async (evt) => {
            if (element.disabled) {
                return;
            }
            let formData = null;
            const form = element.tagName === 'FORM' ? element : element.closest('form');
            if (form && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
                formData = new FormData(form);
            }
            let url = config.action;
            if (form && ['GET', 'DELETE'].includes(config.method)) {
                const params = new URLSearchParams(new FormData(form));
                const separator = url.includes('?') ? '&' : '?';
                if (params.toString()) {
                    url = url + separator + params.toString();
                }
            }
            const abortController = new AbortController();
            const requestConfig = {
                trigger: evt,
                action: url,
                method: config.method,
                target: config.target ? document.querySelector(config.target) || element : element,
                swap: config.swap,
                body: formData,
                drop: 1,
                headers: {},
                abort: () => abortController.abort(),
                signal: abortController.signal,
                preventTrigger: false,
                fetch: window.fetch
            };
            let requests = activeRequests.get(element);
            if (!requests) {
                requests = new Set();
                activeRequests.set(element, requests);
            }
            const configEvent = new CustomEvent('fx:config', {
                detail: { cfg: requestConfig, requests },
                bubbles: true,
                cancelable: true
            });
            if (!element.dispatchEvent(configEvent)) {
                if (requestConfig.preventTrigger !== false) {
                    evt.preventDefault();
                }
                return;
            }
            if (requestConfig.drop && requests.size > 0) {
                return;
            }
            evt.preventDefault();
            if (requestConfig.confirm) {
                const confirmed = await requestConfig.confirm();
                if (!confirmed) {
                    return;
                }
            }
            requests.add(requestConfig);
            const beforeEvent = new CustomEvent('fx:before', {
                detail: { cfg: requestConfig, requests },
                bubbles: true,
                cancelable: true
            });
            if (!element.dispatchEvent(beforeEvent)) {
                requests.delete(requestConfig);
                return;
            }
            try {
                const response = await requestConfig.fetch(requestConfig.action, {
                    method: requestConfig.method,
                    body: requestConfig.body,
                    headers: requestConfig.headers,
                    signal: requestConfig.signal
                });
                const text = await response.text();
                requestConfig.response = response;
                requestConfig.text = text;
                element.dispatchEvent(new CustomEvent('fx:after', {
                    detail: { cfg: requestConfig },
                    bubbles: true
                }));
                if (requestConfig.transition && 'startViewTransition' in document) {
                    document.startViewTransition(async () => {
                        await executeSwap(requestConfig);
                    });
                }
                else {
                    await executeSwap(requestConfig);
                }
                document.dispatchEvent(new CustomEvent('fx:swapped', {
                    detail: { cfg: requestConfig },
                    bubbles: true
                }));
            }
            catch (error) {
                element.dispatchEvent(new CustomEvent('fx:error', {
                    detail: { cfg: requestConfig, error },
                    bubbles: true
                }));
            }
            finally {
                requests.delete(requestConfig);
                element.dispatchEvent(new CustomEvent('fx:finally', {
                    detail: { cfg: requestConfig },
                    bubbles: true
                }));
            }
        };
        element.__fixi = handler;
        element.addEventListener(eventName, handler);
        element.dispatchEvent(new CustomEvent('fx:inited', {
            detail: {},
            bubbles: true
        }));
    }

    function processNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        const element = node;
        processElement(element);
        element.querySelectorAll('[fx-action]').forEach(processElement);
    }

    function init() {
        document.documentElement.dispatchEvent(new CustomEvent('fx:init', {
            detail: { options: {} },
            bubbles: true
        }));
        document.querySelectorAll('[fx-action]').forEach(processElement);
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(processNode);
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.__fixiObserver = observer;
        document.documentElement.dispatchEvent(new CustomEvent('fx:inited', {
            detail: {},
            bubbles: true
        }));
    }

    // Public API
    const fixi = {
        version: '0.7.0-compat-standalone',
        init,
        parseAttributes,
        dispatchEvent: dispatchFxEvent,
        shouldIgnore,
        hasFxAction,
        executeSwap,
        config: {
            defaultHeaders: {},
            autoInit: true,
            observe: true
        }
    };

    // Auto-initialize when the DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        }
        else {
            init();
        }
    }

    // Expose fixi globally
    if (typeof window !== 'undefined') {
        window.fixi = fixi;
    }

})();