/**
 * Test file to verify Node.js globals polyfill is working
 * This can be used to debug polyfill issues
 */

export function testNodeGlobalsPolyfill(): void {
  // Test global
  if (typeof (window as any).global === 'undefined') {
    console.error('❌ global polyfill failed');
  }
  
  // Test process
  if (typeof (window as any).process === 'undefined') {
    console.error('❌ process polyfill failed');
  }
  
  // Test Buffer
  if (typeof (window as any).Buffer === 'undefined') {
    console.error('❌ Buffer polyfill failed');
  }
  
  // Test util
  if (typeof (window as any).util === 'undefined') {
    console.error('❌ util polyfill failed');
  }
  
  // Test events
  if (typeof (window as any).events === 'undefined') {
    console.error('❌ events polyfill failed');
  }
  
  // Test querystring
  if (typeof (window as any).querystring === 'undefined') {
    console.error('❌ querystring polyfill failed');
  }
  
  // Test url
  if (typeof (window as any).url === 'undefined') {
    console.error('❌ url polyfill failed');
  }
  
  // Test crypto
  if (typeof (window as any).crypto === 'undefined') {
    console.error('❌ crypto polyfill failed');
  }
} 