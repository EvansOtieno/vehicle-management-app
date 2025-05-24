export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080',
    vehicleApiUrl: 'http://localhost:8081',
    googleMapsApiKey: 'AIzaSyC4eBV3YWw9z3L5GMSLVAFJ8NgbX-Anqx4',

    // Optional: Add other configuration
    imageUploadMaxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    
    // Pagination defaults
    defaultPageSize: 10,
    maxPageSize: 100,
    
    // Map configuration (if using maps)
    defaultLocation: {
      latitude: -1.2921,
      longitude: 36.8219,
      city: 'Nairobi',
      country: 'Kenya'
    }
  };