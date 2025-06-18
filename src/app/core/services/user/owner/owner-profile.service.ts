import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { TokenService } from '../../token/token.service';
import { API_ENDPOINTS } from '../../../utils/constants';
import { CarOwnerProfile } from '../../../models/owner-profile';

@Injectable({
  providedIn: 'root'
})
export class OwnerProfileService {

  private readonly baseUrl = API_ENDPOINTS.CAR_OWNER;
  
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
  getProfile(userId: string): Observable<CarOwnerProfile> {
    return this.http.get<CarOwnerProfile>(`${this.baseUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Get profile by profile ID
  getProfileById(profileId: string): Observable<CarOwnerProfile> {
    return this.http.get<CarOwnerProfile>(`${this.baseUrl}/${profileId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Create new profile
  createProfile(profile: Partial<CarOwnerProfile>): Observable<CarOwnerProfile> {
    // Ensure user ID is set from current user
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const profileData = {
      ...profile,
      userId: currentUser.id || currentUser.username
    };

    return this.http.post<CarOwnerProfile>(this.baseUrl, profileData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Update existing profile
  updateProfile(profileId: string, updates: Partial<CarOwnerProfile>): Observable<CarOwnerProfile> {
    return this.http.put<CarOwnerProfile>(`${this.baseUrl}/${profileId}`, updates, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Delete profile
  deleteProfile(profileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${profileId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
}
