// features/mechanic/services/mechanic-profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MechanicProfile, ServiceOffered, Certification } from '../../../core/models/mechanic-profile.model';
import { TokenService } from '../../../core/services/token.service';
import { environment } from '../../../../environment/environment';
import { API_ENDPOINTS  } from '../../../core/utils/constants';

@Injectable({
  providedIn: 'root'
})
export class MechanicProfileService {
  private readonly baseUrl = API_ENDPOINTS.MECHANIC_PROFILES;

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
          errorMessage = 'Bad Request: Please check your input data';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          this.tokenService.clearStorage();
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Profile not found';
          break;
        case 409:
          errorMessage = 'Profile already exists for this user';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('MechanicProfileService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };

  // Get profile by user ID
  getProfile(userId: string): Observable<MechanicProfile> {
    return this.http.get<MechanicProfile>(`${this.baseUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Get profile by profile ID
  getProfileById(profileId: string): Observable<MechanicProfile> {
    return this.http.get<MechanicProfile>(`${this.baseUrl}/${profileId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Create new profile
  createProfile(profile: Partial<MechanicProfile>): Observable<MechanicProfile> {
    // Ensure user ID is set from current user
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const profileData = {
      ...profile,
      userId: currentUser.id || currentUser.username
    };

    return this.http.post<MechanicProfile>(this.baseUrl, profileData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Update existing profile
  updateProfile(profileId: string, updates: Partial<MechanicProfile>): Observable<MechanicProfile> {
    return this.http.put<MechanicProfile>(`${this.baseUrl}/${profileId}`, updates, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Delete profile
  deleteProfile(profileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${profileId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Add service to profile
  addService(profileId: string, service: ServiceOffered): Observable<ServiceOffered> {
    return this.http.post<ServiceOffered>(`${this.baseUrl}/${profileId}/services`, service, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Update service
  updateService(profileId: string, serviceId: string, service: Partial<ServiceOffered>): Observable<ServiceOffered> {
    return this.http.put<ServiceOffered>(`${this.baseUrl}/${profileId}/services/${serviceId}`, service, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Remove service
  removeService(profileId: string, serviceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${profileId}/services/${serviceId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Add certification
  addCertification(profileId: string, certification: Certification): Observable<Certification> {
    return this.http.post<Certification>(`${this.baseUrl}/${profileId}/certifications`, certification, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Update certification
  updateCertification(profileId: string, certificationId: string, certification: Partial<Certification>): Observable<Certification> {
    return this.http.put<Certification>(`${this.baseUrl}/${profileId}/certifications/${certificationId}`, certification, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Remove certification
  removeCertification(profileId: string, certificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${profileId}/certifications/${certificationId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Upload profile image
  uploadProfileImage(profileId: string, imageFile: File): Observable<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
      // Don't set Content-Type for FormData, let browser set it with boundary
    });

    return this.http.post<{imageUrl: string}>(`${this.baseUrl}/${profileId}/image`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Search mechanics with filters
  searchMechanics(searchParams: {
    location?: string;
    service?: string;
    specialization?: string;
    radius?: number;
    latitude?: number;
    longitude?: number;
    emergencyService?: boolean;
    mobileMechanic?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Observable<{
    content: MechanicProfile[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined)
    );

    return this.http.get<{
      content: MechanicProfile[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`${this.baseUrl}/search`, {
      ...this.getHttpOptions(),
      params: cleanParams
    }).pipe(catchError(this.handleError));
  }

  // Get mechanics by location (nearby)
  getNearbyMechanics(latitude: number, longitude: number, radiusKm: number = 10): Observable<MechanicProfile[]> {
    return this.http.get<MechanicProfile[]>(`${this.baseUrl}/nearby`, {
      ...this.getHttpOptions(),
      params: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusKm.toString()
      }
    }).pipe(catchError(this.handleError));
  }

  // Get featured/top-rated mechanics
  getFeaturedMechanics(limit: number = 10): Observable<MechanicProfile[]> {
    return this.http.get<MechanicProfile[]>(`${this.baseUrl}/featured`, {
      ...this.getHttpOptions(),
      params: { limit: limit.toString() }
    }).pipe(catchError(this.handleError));
  }

  // Verify mechanic profile (admin only)
  verifyProfile(profileId: string): Observable<MechanicProfile> {
    return this.http.patch<MechanicProfile>(`${this.baseUrl}/${profileId}/verify`, {}, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Get profile completion status
  getProfileCompletionStatus(profileId: string): Observable<{
    isComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
  }> {
    return this.http.get<{
      isComplete: boolean;
      completionPercentage: number;
      missingFields: string[];
    }>(`${this.baseUrl}/${profileId}/completion-status`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Clear profile cache (for logout)
  clearProfile(): void {
    // Clear any cached profile data if you implement caching
    console.log('Clearing profile cache');
  }

  // Utility method to check if current user can edit profile
  canEditProfile(profile: MechanicProfile): boolean {
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) return false;

    const userRole = this.tokenService.getUserRole();
    return profile.userId === (currentUser.id || currentUser.username) || 
           userRole === 'ADMIN';
  }

  // Get current user's profile
  getCurrentUserProfile(): Observable<MechanicProfile> {
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.getProfile(String(currentUser.id) || currentUser.username);
  }
}