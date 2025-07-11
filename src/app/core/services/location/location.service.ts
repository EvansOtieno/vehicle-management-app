// core/services/location.service.ts (Mock version)
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Location } from '../../models/location.models';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() {}

  // Get current user location
  getCurrentLocation(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next(position);
          observer.complete();
        },
        error => observer.error(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Reverse geocoding - convert coordinates to address
  reverseGeocode(latitude: number, longitude: number): Observable<Location> {
    return new Observable(observer => {
      if (!this.isGoogleMapsLoaded()) {
        // Return mock location if Google Maps not available
        const mockLocation: Location = {
          latitude,
          longitude,
          address: `${latitude}, ${longitude}`,
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        };
        observer.next(mockLocation);
        observer.complete();
        return;
      }

      try {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };

        geocoder.geocode({ location: latlng }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const location: Location = this.parseGoogleMapsResult(result, latitude, longitude);
            observer.next(location);
            observer.complete();
          } else {
            // Fallback to simple location
            const fallbackLocation: Location = {
              latitude,
              longitude,
              address: `${latitude}, ${longitude}`,
              city: 'Nairobi',
              state: 'Nairobi County',
              zipCode: '00100',
              country: 'Kenya'
            };
            observer.next(fallbackLocation);
            observer.complete();
          }
        });
      } catch (error) {
        observer.error('Geocoding failed: ' + error);
      }
    });
  }

  // Forward geocoding - convert address to coordinates
  geocodeAddress(address: string): Observable<Location> {
    return new Observable(observer => {
      if (!this.isGoogleMapsLoaded()) {
        // Return mock location for Nairobi
        const mockLocation: Location = {
          latitude: -1.2921,
          longitude: 36.8219,
          address: address,
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        };
        observer.next(mockLocation);
        observer.complete();
        return;
      }

      try {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            const parsedLocation: Location = this.parseGoogleMapsResult(
              result, 
              location.lat(), 
              location.lng()
            );
            observer.next(parsedLocation);
            observer.complete();
          } else {
            observer.error('Geocoding failed: ' + status);
          }
        });
      } catch (error) {
        observer.error('Geocoding failed: ' + error);
      }
    });
  }

  // Check if Google Maps is loaded
  private isGoogleMapsLoaded(): boolean {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           window.google.maps.Geocoder;
  }

  // Parse Google Maps geocoding result
  private parseGoogleMapsResult(result: any, lat: number, lng: number): Location {
    const addressComponents = result.address_components || [];
    
    const getComponent = (type: string): string => {
      const component = addressComponents.find((comp: any) => comp.types.includes(type));
      return component ? component.long_name : '';
    };

    return {
      latitude: lat,
      longitude: lng,
      address: result.formatted_address || `${lat}, ${lng}`,
      city: getComponent('locality') || 
            getComponent('administrative_area_level_2') || 
            getComponent('sublocality') || 
            'Nairobi',
      state: getComponent('administrative_area_level_1') || 'Nairobi County',
      zipCode: getComponent('postal_code') || '00100',
      country: getComponent('country') || 'Kenya'
    };
  }

  // Calculate distance between two points
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Get places autocomplete suggestions
  getPlaceSuggestions(input: string): Observable<any[]> {
    return new Observable(observer => {
      if (!this.isGoogleMapsLoaded() || !window.google.maps.places) {
        observer.next([]);
        observer.complete();
        return;
      }

      try {
        const service = new window.google.maps.places.AutocompleteService();
        
        service.getPlacePredictions(
          {
            input,
            types: ['address'],
            componentRestrictions: { country: 'ke' } // Restrict to Kenya
          },
          (predictions: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              observer.next(predictions);
            } else {
              observer.next([]);
            }
            observer.complete();
          }
        );
      } catch (error) {
        observer.next([]);
        observer.complete();
      }
    });
  }
}