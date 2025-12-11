export const environment = {
  production: false,
  apiUrl: '/api',
  enginesApiUrl: 'http://localhost:8081/engines',
  enginesWebSocketUrl: 'ws://localhost:8081', // Base WebSocket URL (append /ws/indices/all)
  enginesHttpUrl: 'http://localhost:8081', // Base HTTP URL for SockJS connections (append /ws/indices/all)

  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: 'your-google-client-id', // Replace with your Google Client ID
      redirectUri: 'http://localhost:4200'
    },
    microsoft: {
      clientId: 'your-microsoft-client-id', // Replace with your Microsoft Azure AD Client ID
      redirectUri: 'http://localhost:4200'
    }
  }
};
