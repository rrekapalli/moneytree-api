export const environment = {
  production: true,
  // Use absolute Tailscale URLs for production deployment
  apiUrl: 'https://backend.tailce422e.ts.net:8080/api',
  enginesApiUrl: 'https://socketengine.tailce422e.ts.net:8081/engines',
  enginesWebSocketUrl: 'wss://socketengine.tailce422e.ts.net:8081/engines',
  enginesHttpUrl: 'https://socketengine.tailce422e.ts.net:8081/engines', // HTTP URL for SockJS connections

  
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
