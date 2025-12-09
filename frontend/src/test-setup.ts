// Polyfill for SockJS global issue in tests
// This must run before any imports that use SockJS
(globalThis as any).global = globalThis;
