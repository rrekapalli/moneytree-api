export const environment = {
  production: true,
  // Use absolute Tailscale URLs for production deployment
  // Note: Both Backend and SocketEngine run on HTTP (not HTTPS) - Tailscale provides encryption at network level
  apiUrl: 'http://backend.tailce422e.ts.net:8080/api',
  enginesApiUrl: 'http://socketengine.tailce422e.ts.net:8081/engines',
  enginesWebSocketUrl: 'ws://socketengine.tailce422e.ts.net:8081', // Base WebSocket URL (append /ws/indices/all)
  enginesHttpUrl: 'http://socketengine.tailce422e.ts.net:8081', // Base HTTP URL for SockJS connections (append /ws/indices/all)

  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: 'your-google-client-id', // Replace with your Google Client ID
      redirectUri: 'https://moneytree.tailce422e.ts.net'
    },
    microsoft: {
      clientId: 'your-microsoft-client-id', // Replace with your Microsoft Azure AD Client ID
      redirectUri: 'https://moneytree.tailce422e.ts.net'
    }
  }
};
