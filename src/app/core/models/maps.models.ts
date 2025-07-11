export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  icon?: string;
  data?: any;
  clickable?: boolean;
  draggable?: boolean;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface MapOptions {
  zoom?: number;
  center?: MapCenter;
  mapTypeId?: google.maps.MapTypeId;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  mapTypeControl?: boolean;
}

export interface MapConfiguration {
  center?: MapCenter;
  zoom?: number;
  markers?: MapMarker[];
  showCurrentLocation?: boolean;
  allowMapClick?: boolean;
  fitBounds?: boolean;
  clusteredMarkers?: boolean;
  mapOptions?: MapOptions;
}

export type MapMode = 
  | 'vehicle-registration'
  | 'service-booking'
  | 'provider-selection'
  | 'location-picker'
  | 'provider-profile'
  | 'tracking'
  | 'directory'
  | 'custom';

  export interface MapInitializationConfig {
  mode: MapMode;
  center?: MapCenter;
  zoom?: number;
  vehicleLocation?: MapCenter;
  providerLocation?: MapCenter;
  serviceProviders?: any[];
  customConfig?: MapConfiguration;
}

export interface MarkerClickEvent {
  marker: MapMarker;
  mapMarker: google.maps.Marker;
}

export interface MapClickEvent {
  latLng: google.maps.LatLng;
  coordinates: {
    lat: number;
    lng: number;
  };
}