export const environment = {
  production: true,
  apiUrl: '/api', // In production, the API is typically served from the same domain
  enginesApiUrl: '/engines', // In production, engines might be served from the same domain
  enginesWebSocketUrl: '/engines', // In production, engines WebSocket is served from the same domain
  enginesHttpUrl: '/engines', // HTTP URL for SockJS connections in production
  useMockData: false,
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: 'your-google-client-id', // Replace with your Google Client ID
      redirectUri: window.location.origin
    },
    microsoft: {
      clientId: 'your-microsoft-client-id', // Replace with your Microsoft Azure AD Client ID
      redirectUri: window.location.origin
    }
  }
};
