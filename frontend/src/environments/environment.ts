export const environment = {
  production: false,
  apiUrl: '/api',
  enginesApiUrl: 'http://localhost:8081/engines',
  enginesWebSocketUrl: 'ws://localhost:8081/engines',
  enginesHttpUrl: 'http://localhost:8081/engines', // HTTP URL for SockJS connections

  
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
