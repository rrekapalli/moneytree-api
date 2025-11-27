/**
 * Polyfill for Node.js globals required by sockjs-client
 * This ensures compatibility with browser environments
 * MUST BE LOADED BEFORE ANY OTHER MODULES
 */

// Set global to window to prevent "global is not defined" errors
(window as any).global = window;

// Polyfill for 'process' (Node.js process object)
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {},
    version: '',
    platform: 'browser',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
}

// Polyfill for 'Buffer' (Node.js Buffer)
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = {
    isBuffer: (obj: any) => false,
    alloc: (size: number) => new Uint8Array(size),
    from: (data: any) => new Uint8Array(data)
  };
}

// Polyfill for 'util' (Node.js util module)
if (typeof (window as any).util === 'undefined') {
  (window as any).util = {
    inherits: (ctor: any, superCtor: any) => {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
}

// Polyfill for 'events' (Node.js events module)
if (typeof (window as any).events === 'undefined') {
  (window as any).events = {
    EventEmitter: class EventEmitter {
      private listeners: { [key: string]: Function[] } = {};
      
      on(event: string, listener: Function) {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return this;
      }
      
      emit(event: string, ...args: any[]) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(listener => listener(...args));
        }
        return this;
      }
      
      removeListener(event: string, listener: Function) {
        if (this.listeners[event]) {
          this.listeners[event] = this.listeners[event].filter(l => l !== listener);
        }
        return this;
      }
    }
  };
}

// Polyfill for 'querystring' (Node.js querystring module)
if (typeof (window as any).querystring === 'undefined') {
  (window as any).querystring = {
    parse: (str: string) => {
      const params = new URLSearchParams(str);
      const result: { [key: string]: string } = {};
      params.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    },
    stringify: (obj: { [key: string]: any }) => {
      return new URLSearchParams(obj).toString();
    }
  };
}

// Polyfill for 'url' (Node.js url module)
if (typeof (window as any).url === 'undefined') {
  (window as any).url = {
    parse: (url: string) => {
      try {
        return new URL(url);
      } catch {
        return null;
      }
    },
    resolve: (from: string, to: string) => {
      try {
        return new URL(to, from).href;
      } catch {
        return to;
      }
    }
  };
}

// Polyfill for 'crypto' (Node.js crypto module)
if (typeof (window as any).crypto === 'undefined') {
  (window as any).crypto = window.crypto || {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  };
}

// Additional crypto polyfills for sockjs-client
if (typeof (window as any).crypto !== 'undefined') {
  // Ensure crypto.getRandomValues is available
  if (!(window as any).crypto.getRandomValues) {
    (window as any).crypto.getRandomValues = (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}



export {}; 