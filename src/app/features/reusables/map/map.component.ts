import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { 
  MapMarker, 
  MapCenter, 
  MapOptions, 
  MarkerClickEvent, 
  MapClickEvent, 
  MapInitializationConfig, 
  MapMode, 
  MapConfiguration 
} from '../../../core/models/maps.models';

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy, OnChanges{
@ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // Inputs - Enhanced for flexible initialization
  @Input() height: string = '400px';
  @Input() width: string = '100%';
  @Input() markers: MapMarker[] = [];
  @Input() center: MapCenter = { lat: -1.2921, lng: 36.8219 }; // Default to Nairobi
  @Input() zoom: number = 12;
  @Input() mapOptions: MapOptions = {};
  @Input() loading: boolean = false;
  @Input() showCurrentLocation: boolean = false;
  @Input() allowMapClick: boolean = false;
  @Input() clusteredMarkers: boolean = false;
  @Input() selectedMarkerId: string | null = null;
  @Input() fitBounds: boolean = false;
  
  // NEW: Initialization configuration
  @Input() initConfig: MapInitializationConfig | null = null;
  @Input() mode: MapMode = 'custom';
  @Input() vehicleLocation: MapCenter | null = null;
  @Input() providerLocation: MapCenter | null = null;
  @Input() serviceProviders: any[] = [];

  // Outputs
  @Output() markerClick = new EventEmitter<MarkerClickEvent>();
  @Output() mapClick = new EventEmitter<MapClickEvent>();
  @Output() mapReady = new EventEmitter<google.maps.Map>();
  @Output() currentLocationFound = new EventEmitter<MapCenter>();
  @Output() configurationApplied = new EventEmitter<MapConfiguration>();

  // Internal properties
  map: google.maps.Map | null = null;
  mapMarkers: google.maps.Marker[] = [];
  currentLocationMarker: google.maps.Marker | null = null;
  infoWindow: google.maps.InfoWindow | null = null;
  markerClusterer: any = null;
  appliedConfig: MapConfiguration | null = null;

  // Default marker icons for different modes
  private defaultIcons = {
  default: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  selected: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  currentLocation: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  vehicle: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  garage: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  garageSelected: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  location: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
};

  ngOnInit() {
    this.applyInitializationConfig();
    this.initializeMap();
  }

  ngOnDestroy() {
    this.clearMarkers();
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle initialization config changes
    if (changes['initConfig'] || changes['mode'] || changes['vehicleLocation'] || 
        changes['providerLocation'] || changes['serviceProviders']) {
      this.applyInitializationConfig();
      if (this.map) {
        this.updateMapFromConfig();
      }
    }

    if (this.map) {
      if (changes['markers']) {
        this.updateMarkers();
      }
      
      if (changes['center']) {
        this.updateCenter();
      }
      
      if (changes['zoom']) {
        this.map.setZoom(this.zoom);
      }
      
      if (changes['selectedMarkerId']) {
        this.updateSelectedMarker();
      }
      
      if (changes['fitBounds'] && this.fitBounds) {
        this.fitMapToBounds();
      }
    }
  }

  private applyInitializationConfig() {
    let config: MapConfiguration;

    if (this.initConfig) {
      config = this.buildConfigFromInitConfig(this.initConfig);
    } else {
      config = this.buildConfigFromMode();
    }

    this.appliedConfig = config;
    this.applyConfiguration(config);
    this.configurationApplied.emit(config);
  }

  private buildConfigFromInitConfig(initConfig: MapInitializationConfig): MapConfiguration {
    const config: MapConfiguration = {
      center: initConfig.center || this.center,
      zoom: initConfig.zoom || this.zoom,
      ...initConfig.customConfig
    };

    const modeConfig = this.getModeConfiguration(initConfig.mode, {
      vehicleLocation: initConfig.vehicleLocation,
      providerLocation: initConfig.providerLocation,
      serviceProviders: initConfig.serviceProviders || []
    });

    return { ...modeConfig, ...config };
  }

  private buildConfigFromMode(): MapConfiguration {
    return this.getModeConfiguration(this.mode, {
      vehicleLocation: this.vehicleLocation,
      providerLocation: this.providerLocation,
      serviceProviders: this.serviceProviders
    });
  }

  private getModeConfiguration(mode: MapMode, data: any): MapConfiguration {
    const configs: Record<MapMode, MapConfiguration> = {
      'vehicle-registration': {
        center: data.vehicleLocation || this.center,
        zoom: 15,
        showCurrentLocation: true,
        allowMapClick: true,
        fitBounds: false,
        clusteredMarkers: false,
        markers: data.vehicleLocation ? [{
          id: 'vehicle-location',
          position: data.vehicleLocation,
          title: 'Vehicle Registration Location',
          icon: this.defaultIcons.vehicle,
          clickable: false
        }] : []
      },

      'service-booking': {
        center: data.vehicleLocation || this.center,
        zoom: 12,
        showCurrentLocation: false,
        allowMapClick: false,
        fitBounds: true,
        clusteredMarkers: false,
        markers: this.buildServiceBookingMarkers(data)
      },

      'provider-selection': {
        center: data.vehicleLocation || this.center,
        zoom: 12,
        showCurrentLocation: false,
        allowMapClick: false,
        fitBounds: true,
        clusteredMarkers: data.serviceProviders?.length > 10,
        markers: this.buildProviderSelectionMarkers(data)
      },

      'location-picker': {
        center: this.center,
        zoom: 12,
        showCurrentLocation: true,
        allowMapClick: true,
        fitBounds: false,
        clusteredMarkers: false,
        markers: []
      },

      'provider-profile': {
        center: data.providerLocation || this.center,
        zoom: 15,
        showCurrentLocation: false,
        allowMapClick: false,
        fitBounds: false,
        clusteredMarkers: false,
        markers: data.providerLocation ? [{
          id: 'provider-location',
          position: data.providerLocation,
          title: 'Service Provider Location',
          icon: this.defaultIcons.garage,
          clickable: false
        }] : []
      },

      'tracking': {
        center: data.vehicleLocation || this.center,
        zoom: 13,
        showCurrentLocation: true,
        allowMapClick: false,
        fitBounds: true,
        clusteredMarkers: false,
        markers: this.buildTrackingMarkers(data)
      },

      'directory': {
        center: this.center,
        zoom: 11,
        showCurrentLocation: true,
        allowMapClick: false,
        fitBounds: true,
        clusteredMarkers: true,
        markers: this.buildDirectoryMarkers(data)
      },

      'custom': {
        center: this.center,
        zoom: this.zoom,
        showCurrentLocation: this.showCurrentLocation,
        allowMapClick: this.allowMapClick,
        fitBounds: this.fitBounds,
        clusteredMarkers: this.clusteredMarkers,
        markers: this.markers
      }
    };

    return configs[mode];
  }

  private buildServiceBookingMarkers(data: any): MapMarker[] {
    const markers: MapMarker[] = [];

    if (data.vehicleLocation) {
      markers.push({
        id: 'vehicle',
        position: data.vehicleLocation,
        title: 'Your Vehicle Location',
        icon: this.defaultIcons.vehicle,
        clickable: false
      });
    }

    if (data.serviceProviders?.length) {
      const providerMarkers = data.serviceProviders.map((provider: any, index: number) => {
        const position = {
          lat: provider.location?.latitude || provider.location?.lat || provider.lat,
          lng: provider.location?.longitude || provider.location?.lng || provider.lng
        };
        
        return {
          id: provider.id || `provider-${index}`,
          position: position,
          title: provider.name || `Service Provider ${index + 1}`,
          icon: this.defaultIcons.garage,
          data: provider,
          clickable: true
        };
      });
      
      markers.push(...providerMarkers);
    }

    return markers;
  }

  private buildProviderSelectionMarkers(data: any): MapMarker[] {
    const markers: MapMarker[] = [];

    if (data.vehicleLocation) {
      markers.push({
        id: 'vehicle',
        position: data.vehicleLocation,
        title: 'Your Vehicle',
        icon: this.defaultIcons.vehicle,
        clickable: false
      });
    }

    if (data.serviceProviders?.length) {
      const providerMarkers = data.serviceProviders.map((provider: any) => ({
        id: provider.id,
        position: {
          lat: provider.location?.latitude || provider.location?.lat || provider.lat,
           lng: provider.location?.longitude || provider.location?.lng || provider.lng
        },
        title: provider.name,
        icon: this.defaultIcons.garage,
        data: provider,
        clickable: true
      }));
      markers.push(...providerMarkers);
    }

    return markers;
  }

  private buildTrackingMarkers(data: any): MapMarker[] {
    const markers: MapMarker[] = [];

    if (data.vehicleLocation) {
      markers.push({
        id: 'vehicle-current',
        position: data.vehicleLocation,
        title: 'Vehicle Current Location',
        icon: this.defaultIcons.vehicle,
        clickable: true
      });
    }

    if (data.providerLocation) {
      markers.push({
        id: 'provider',
        position: data.providerLocation,
        title: 'Service Provider',
        icon: this.defaultIcons.garage,
        clickable: true
      });
    }

    return markers;
  }

  private buildDirectoryMarkers(data: any): MapMarker[] {
    if (!data.serviceProviders?.length) return [];

    return data.serviceProviders.map((provider: any) => ({
      id: provider.id,
      position: {
        lat: provider.location?.lat || provider.lat,
        lng: provider.location?.lng || provider.lng
      },
      title: provider.name,
      icon: this.defaultIcons.garage,
      data: provider,
      clickable: true
    }));
  }

  private applyConfiguration(config: MapConfiguration) {
    if (config.center) {
      this.center = config.center;
    }
    if (config.zoom) {
      this.zoom = config.zoom;
    }
    if (config.markers) {
      this.markers = config.markers;
    }
    if (config.showCurrentLocation !== undefined) {
      this.showCurrentLocation = config.showCurrentLocation;
    }
    if (config.allowMapClick !== undefined) {
      this.allowMapClick = config.allowMapClick;
    }
    if (config.fitBounds !== undefined) {
      this.fitBounds = config.fitBounds;
    }
    if (config.clusteredMarkers !== undefined) {
      this.clusteredMarkers = config.clusteredMarkers;
    }
    if (config.mapOptions) {
      this.mapOptions = { ...this.mapOptions, ...config.mapOptions };
    }
  }

  private updateMapFromConfig() {
    if (!this.appliedConfig) return;

    if (this.appliedConfig.center) {
      this.map?.setCenter(this.appliedConfig.center);
    }
    if (this.appliedConfig.zoom) {
      this.map?.setZoom(this.appliedConfig.zoom);
    }

    this.updateMarkers();

    if (this.appliedConfig.fitBounds) {
      this.fitMapToBounds();
    }
  }

  private initializeMap() {
    const defaultOptions: google.maps.MapOptions = {
      center: this.center,
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      mapTypeControl: true,
      ...this.mapOptions
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, defaultOptions);

    if (this.allowMapClick) {
      this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          this.mapClick.emit({
            latLng: event.latLng,
            coordinates: {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            }
          });
        }
      });
    }

    this.updateMarkers();

    if (this.showCurrentLocation) {
      this.getCurrentLocation();
    }

    if (this.fitBounds) {
      this.fitMapToBounds();
    }

    this.mapReady.emit(this.map);
  }

  private updateMarkers() {
    this.clearMarkers();
    
    this.markers.forEach((markerData, index) => {
      // Validate coordinates
      if (!markerData.position?.lat || !markerData.position?.lng || 
          markerData.position.lat === undefined || markerData.position.lng === undefined ||
          isNaN(markerData.position.lat) || isNaN(markerData.position.lng)) {
        return;
      }

      const marker = new google.maps.Marker({
        position: markerData.position,
        map: this.map,
        title: markerData.title,
        icon: this.getMarkerIcon(markerData),
        clickable: markerData.clickable !== false,
        draggable: markerData.draggable || false
      });

      if (markerData.clickable !== false) {
        marker.addListener('click', () => {
          this.markerClick.emit({
            marker: markerData,
            mapMarker: marker
          });
        });
      }

      this.mapMarkers.push(marker);
    });
  }

  private getMarkerIcon(markerData: MapMarker): string | google.maps.Icon {
    if (markerData.icon) {
      return markerData.icon;
    }
    
    if (this.selectedMarkerId === markerData.id) {
      return this.defaultIcons.selected;
    }
    
    return this.defaultIcons.default;
  }

  private updateSelectedMarker() {
    this.mapMarkers.forEach((marker, index) => {
      const markerData = this.markers[index];
      marker.setIcon(this.getMarkerIcon(markerData));
    });
  }

  private updateCenter() {
    if (this.map) {
      this.map.setCenter(this.center);
    }
  }

  private clearMarkers() {
    this.mapMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.mapMarkers = [];
  }

  public getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this.currentLocationMarker = new google.maps.Marker({
            position: currentLocation,
            map: this.map,
            title: 'Your Current Location',
            icon: this.defaultIcons.currentLocation
          });

          this.currentLocationFound.emit(currentLocation);
        },
        (error) => {
          console.warn('Error getting current location:', error);
        }
      );
    }
  }

  private fitMapToBounds() {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    this.markers.forEach(marker => {
      bounds.extend(marker.position);
    });

    if (this.currentLocationMarker) {
      bounds.extend(this.currentLocationMarker.getPosition()!);
    }

    this.map?.fitBounds(bounds);
  }

  // Public methods for external control
  public updateMapConfiguration(newConfig: Partial<MapInitializationConfig>) {
    if (newConfig.mode) {
      this.mode = newConfig.mode;
    }
    if (newConfig.center) {
      this.center = newConfig.center;
    }
    if (newConfig.zoom) {
      this.zoom = newConfig.zoom;
    }
    if (newConfig.vehicleLocation) {
      this.vehicleLocation = newConfig.vehicleLocation;
    }
    if (newConfig.providerLocation) {
      this.providerLocation = newConfig.providerLocation;
    }
    if (newConfig.serviceProviders) {
      this.serviceProviders = newConfig.serviceProviders;
    }

    this.applyInitializationConfig();
    if (this.map) {
      this.updateMapFromConfig();
    }
  }

  public addMarker(markerData: MapMarker): google.maps.Marker {
    const marker = new google.maps.Marker({
      position: markerData.position,
      map: this.map,
      title: markerData.title,
      icon: this.getMarkerIcon(markerData),
      clickable: markerData.clickable !== false,
      draggable: markerData.draggable || false
    });

    if (markerData.clickable !== false) {
      marker.addListener('click', () => {
        this.markerClick.emit({
          marker: markerData,
          mapMarker: marker
        });
      });
    }

    this.mapMarkers.push(marker);
    return marker;
  }

  public removeMarker(markerId: string) {
    const index = this.markers.findIndex(m => m.id === markerId);
    if (index >= 0 && this.mapMarkers[index]) {
      this.mapMarkers[index].setMap(null);
      this.mapMarkers.splice(index, 1);
    }
  }

  public centerOnMarker(markerId: string) {
    const marker = this.markers.find(m => m.id === markerId);
    if (marker && this.map) {
      this.map.setCenter(marker.position);
      this.map.setZoom(15);
    }
  }

  public showInfoWindow(markerId: string, content: string) {
    const index = this.markers.findIndex(m => m.id === markerId);
    if (index >= 0 && this.mapMarkers[index]) {
      if (this.infoWindow) {
        this.infoWindow.close();
      }
      
      this.infoWindow = new google.maps.InfoWindow({
        content: content
      });
      
      this.infoWindow.open(this.map, this.mapMarkers[index]);
    }
  }

  public closeInfoWindow() {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }

  public getMap(): google.maps.Map | null {
    return this.map;
  }

  public refreshMap() {
    if (this.map) {
      google.maps.event.trigger(this.map, 'resize');
      this.map.setCenter(this.center);
    }
  }
}