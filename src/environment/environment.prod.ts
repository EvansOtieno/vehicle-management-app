export const environment = {
    production: true,
    apiUrl: 'https://your-production-api.com',
    apiVersion: 'v1',
    tokenKey: 'auth_token',
    userKey: 'user_data',
    
    imageUploadMaxSize: 5 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    
    defaultPageSize: 10,
    maxPageSize: 100,
    
    googleMapsApiKey: 'AIzaSyC4eBV3YWw9z3L5GMSLVAFJ8NgbX-Anqx4',
    defaultLocation: {
      latitude: -1.2921,
      longitude: 36.8219,
      city: 'Nairobi',
      country: 'Kenya'
    }
  };