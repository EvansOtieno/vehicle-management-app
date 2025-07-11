import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServiceProvider, ServiceProviderDetails, GroupedHours, NearbySearchParams } from '../../models/booking.models';
import { ServiceCategory, BusinessType } from '../../models/mechanic-profile.model';
import { TokenService } from '../../../core/services/token/token.service';
import { API_ENDPOINTS  } from '../../utils/constants';


@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {
  private readonly baseUrl = API_ENDPOINTS.SERVICE_PROVIDERS;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.tokenService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Please check your search parameters';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          this.tokenService.clearStorage();
          break;
        case 404:
          errorMessage = 'Service providers not found';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('ServiceProviderService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Main method to get nearby service providers - matches your original interface
   */
  getNearbyServiceProviders(lat: number, lng: number, radius: number = 20): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get service provider details by ID
   */
  getServiceProviderDetails(providerId: string): Observable<ServiceProviderDetails> {
    return this.http.get<ServiceProviderDetails>(`${this.baseUrl}/${providerId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   * Get nearby service providers by category
   */
  getNearbyServiceProvidersByCategory(
    lat: number, 
    lng: number, 
    category: ServiceCategory, 
    radius: number = 20
  ): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby/category/${category}`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get nearby emergency services
   */
  getNearbyEmergencyServices(lat: number, lng: number, radius: number = 50): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby/emergency`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get nearby mobile services
   */
  getNearbyMobileServices(lat: number, lng: number, radius: number = 30): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby/mobile`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Search service providers by service name
   */
  searchServiceProvidersByService(
    serviceName: string, 
    lat: number, 
    lng: number, 
    radius: number = 25
  ): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('serviceName', serviceName.trim())
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/search`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get top-rated nearby services
   */
  getTopRatedNearbyServices(
    lat: number, 
    lng: number, 
    radius: number = 20, 
    minRating: number = 4
  ): Observable<ServiceProvider[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString())
      .set('minRating', minRating.toString());

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby/top-rated`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Observable<number> {
    const params = new HttpParams()
      .set('lat1', lat1.toString())
      .set('lng1', lng1.toString())
      .set('lat2', lat2.toString())
      .set('lng2', lng2.toString());

    return this.http.get<number>(`${this.baseUrl}/distance`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

  // CONVENIENCE METHODS FOR COMMON USE CASES

  /**
   * Find nearby mechanics with specific service (convenience method)
   */
  findNearbyMechanicsWithService(
    lat: number, 
    lng: number, 
    serviceName: string, 
    radius: number = 20
  ): Observable<ServiceProvider[]> {
    return this.searchNearbyServiceProviders({
      lat,
      lng,
      radius,
      serviceName
    });
  }

  /**
   * Find nearby emergency mechanics (convenience method)
   */
  findNearbyEmergencyMechanics(
    lat: number, 
    lng: number, 
    radius: number = 50
  ): Observable<ServiceProvider[]> {
    return this.searchNearbyServiceProviders({
      lat,
      lng,
      radius,
      emergencyService: true,
      sortBy: 'distance'
    });
  }

  /**
   * Find nearby mobile mechanics (convenience method)
   */
  findNearbyMobileMechanics(
    lat: number, 
    lng: number, 
    radius: number = 30
  ): Observable<ServiceProvider[]> {
    return this.searchNearbyServiceProviders({
      lat,
      lng,
      radius,
      mobileMechanic: true,
      sortBy: 'rating',
      sortDirection: 'DESC'
    });
  }

  /**
   * Find top-rated nearby mechanics (convenience method)
   */
  findTopRatedNearbyMechanics(
    lat: number, 
    lng: number, 
    radius: number = 20,
    minRating: number = 4
  ): Observable<ServiceProvider[]> {
    return this.searchNearbyServiceProviders({
      lat,
      lng,
      radius,
      minRating,
      isVerified: true,
      sortBy: 'rating',
      sortDirection: 'DESC',
      size: 10
    });
  }

  /**
   * Find nearby mechanics by category with pagination
   */
  findNearbyMechanicsByCategory(
    lat: number,
    lng: number,
    category: ServiceCategory,
    page: number = 0,
    size: number = 20,
    radius: number = 20
  ): Observable<ServiceProvider[]> {
    return this.searchNearbyServiceProviders({
      lat,
      lng,
      radius,
      category,
      page,
      size,
      sortBy: 'distance'
    });
  }

  /**
   * Advanced search with all filters
   */
  advancedNearbySearch(searchCriteria: {
    lat: number;
    lng: number;
    radius?: number;
    category?: ServiceCategory;
    serviceName?: string;
    businessType?: BusinessType;
    emergencyService?: boolean;
    mobileMechanic?: boolean;
    minRating?: number;
    isVerified?: boolean;
    sortBy?: 'distance' | 'rating' | 'name';
    sortDirection?: 'ASC' | 'DESC';
    page?: number;
    size?: number;
  }): Observable<ServiceProvider[]> {
    const params: NearbySearchParams = {
      lat: searchCriteria.lat,
      lng: searchCriteria.lng,
      radius: searchCriteria.radius || 20,
      page: searchCriteria.page || 0,
      size: searchCriteria.size || 20,
      sortBy: searchCriteria.sortBy || 'distance',
      sortDirection: searchCriteria.sortDirection || 'ASC'
    };

    // Add optional search criteria
    if (searchCriteria.category) params.category = searchCriteria.category;
    if (searchCriteria.serviceName) params.serviceName = searchCriteria.serviceName;
    if (searchCriteria.businessType) params.businessType = searchCriteria.businessType.toString();
    if (searchCriteria.emergencyService !== undefined) params.emergencyService = searchCriteria.emergencyService;
    if (searchCriteria.mobileMechanic !== undefined) params.mobileMechanic = searchCriteria.mobileMechanic;
    if (searchCriteria.minRating !== undefined) params.minRating = searchCriteria.minRating;
    if (searchCriteria.isVerified !== undefined) params.isVerified = searchCriteria.isVerified;

    return this.searchNearbyServiceProviders(params);
  }

  // UTILITY METHODS

  /**
   * Format working hours from GroupedHours array to readable string
   */
  formatWorkingHours(groupedHours: GroupedHours[]): string {
    if (!groupedHours || groupedHours.length === 0) {
      return 'Hours not specified';
    }

    return groupedHours.map(group => {
      const timeRange = `${group.openTime} - ${group.closeTime}`;
      if (group.days.length === 1) {
        return `${group.days[0]}: ${timeRange}`;
      } else {
        return `${group.days[0]} - ${group.days[group.days.length - 1]}: ${timeRange}`;
      }
    }).join(', ');
  }

  /**
   * Get user's current location and find nearby services
   */
  findNearbyServicesAtCurrentLocation(radius: number = 20): Observable<ServiceProvider[]> {
    return new Observable(observer => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            this.getNearbyServiceProviders(lat, lng, radius).subscribe({
              next: (providers) => observer.next(providers),
              error: (error) => observer.error(error),
              complete: () => observer.complete()
            });
          },
          (error) => {
            observer.error(new Error('Unable to get current location: ' + error.message));
          }
        );
      } else {
        observer.error(new Error('Geolocation is not supported by this browser'));
      }
    });
  }

  /**
   * Filter service providers by distance
   */
  filterByDistance(providers: ServiceProvider[], maxDistanceKm: number): ServiceProvider[] {
    return providers.filter(provider => {
      // Assuming you add distanceKm to ServiceProvider interface or calculate it client-side
      return !provider.location || this.calculateDistanceClientSide(
        provider.location.lat, 
        provider.location.lng, 
        // You'll need to pass current location coordinates
        0, 0 // Replace with actual current location
      ) <= maxDistanceKm;
    });
  }

  /**
   * Client-side distance calculation using Haversine formula
   */
  private calculateDistanceClientSide(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Advanced nearby search with all filters
   */
  searchNearbyServiceProviders(searchParams: NearbySearchParams): Observable<ServiceProvider[]> {
    let params = new HttpParams()
      .set('lat', searchParams.lat.toString())
      .set('lng', searchParams.lng.toString())
      .set('radius', (searchParams.radius || 20).toString())
      .set('page', (searchParams.page || 0).toString())
      .set('size', (searchParams.size || 20).toString())
      .set('sortBy', searchParams.sortBy || 'distance')
      .set('sortDirection', searchParams.sortDirection || 'ASC');

    // Add optional parameters
    if (searchParams.category !== undefined) {
      params = params.set('category', searchParams.category);
    }
    if (searchParams.serviceName !== undefined && searchParams.serviceName.trim()) {
      params = params.set('serviceName', searchParams.serviceName.trim());
    }
    if (searchParams.emergencyService !== undefined) {
      params = params.set('emergencyService', searchParams.emergencyService.toString());
    }
    if (searchParams.mobileMechanic !== undefined) {
      params = params.set('mobileMechanic', searchParams.mobileMechanic.toString());
    }
    if (searchParams.minRating !== undefined) {
      params = params.set('minRating', searchParams.minRating.toString());
    }
    if (searchParams.isVerified !== undefined) {
      params = params.set('isVerified', searchParams.isVerified.toString());
    }
    if (searchParams.businessType !== undefined) {
      params = params.set('businessType', searchParams.businessType);
    }

    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/nearby`, {
      ...this.getHttpOptions(),
      params
    }).pipe(catchError(this.handleError));
  }

}

  