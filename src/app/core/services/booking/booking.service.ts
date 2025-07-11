import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Vehicle, ServiceProvider, BookingRequest, GroupedHours, ServiceProviderDetails } from '../../models/booking.models';
import { BusinessType, MechanicProfile, ServiceCategory, WorkingHours } from '../../models/mechanic-profile.model';
import { API_ENDPOINTS } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = API_ENDPOINTS.SERVICE_PROVIDERS;

  constructor(private http: HttpClient) {}

  private transformToServiceProvider(mechanicProfile: MechanicProfile): ServiceProvider {
    // Extract coordinates from the new GeoJSON format
    const coordinates = this.extractCoordinates(mechanicProfile.location);
    
    return {
      id: mechanicProfile.id || '',
      name: mechanicProfile.businessName,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: mechanicProfile.location.address
      },
      services: mechanicProfile.servicesOffered.map(service => service.name),
      rating: mechanicProfile.averageRating || 0,
      phoneNumber: mechanicProfile.contactPhone,
      email: mechanicProfile.contactEmail,
      workingHours: this.formatWorkingHours(mechanicProfile.workingHours),
      description: mechanicProfile.description
    };
  }

  /**
   * Extracts lat/lng coordinates from the new GeoJSON Location format
   * with fallback support for legacy format during migration
   */
  private extractCoordinates(location: any): { lat: number; lng: number } {
    // New GeoJSON format
    if (location?.coordinates?.coordinates && Array.isArray(location.coordinates.coordinates)) {
      const [lng, lat] = location.coordinates.coordinates;
      return { lat, lng };
    }
    
    // Legacy format fallback (for backward compatibility during migration)
    if (location?.latitude !== undefined && location?.longitude !== undefined) {
      return { 
        lat: location.latitude, 
        lng: location.longitude 
      };
    }
    
    // Default fallback to Nairobi coordinates if no valid coordinates found
    console.warn('No valid coordinates found in location object, using default Nairobi coordinates');
    return { 
      lat: -1.2921, 
      lng: 36.8219 
    };
  }

  private formatWorkingHours(workingHours: WorkingHours[]): string {
    if (!workingHours || workingHours.length === 0) {
      return 'Hours not specified';
    }

    const openDays = workingHours.filter(wh => wh.isOpen);
    
    if (openDays.length === 0) {
      return 'Closed';
    }

    // Group consecutive days with same hours
    const groupedHours = this.groupConsecutiveDays(openDays);
    
    return groupedHours.map(group => {
      const timeRange = `${group.openTime} - ${group.closeTime}`;
      if (group.days.length === 1) {
        return `${group.days[0]}: ${timeRange}`;
      } else {
        return `${group.days[0]} - ${group.days[group.days.length - 1]}: ${timeRange}`;
      }
    }).join(', ');
  }

  private groupConsecutiveDays(workingHours: WorkingHours[]): GroupedHours[] {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedHours = workingHours.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    
    const groups: GroupedHours[] = [];
    let currentGroup: GroupedHours | null = null;

    for (const wh of sortedHours) {
      if (!currentGroup || 
          currentGroup.openTime !== wh.openTime || 
          currentGroup.closeTime !== wh.closeTime) {
        currentGroup = {
          days: [wh.day],
          openTime: wh.openTime,
          closeTime: wh.closeTime
        };
        groups.push(currentGroup);
      } else {
        currentGroup.days.push(wh.day);
      }
    }

    return groups;
  }

  private transformToServiceProviderDetails(mechanicProfile: MechanicProfile): ServiceProviderDetails {
    return {
      ...this.transformToServiceProvider(mechanicProfile),
      businessType: mechanicProfile.businessType as BusinessType,
      specializations: mechanicProfile.specializations,
      yearsOfExperience: mechanicProfile.yearsOfExperience,
      servicesOffered: mechanicProfile.servicesOffered,
      certifications: mechanicProfile.certifications,
      emergencyService: mechanicProfile.emergencyService,
      mobileMechanic: mechanicProfile.mobileMechanic,
      website: mechanicProfile.website,
      profileImageUrl: mechanicProfile.profileImageUrl,
      isVerified: mechanicProfile.isVerified,
      totalReviews: mechanicProfile.totalReviews || 0
    };
  }

  createBooking(booking: BookingRequest): Observable<BookingRequest> {
    return this.http.post<BookingRequest>(`${this.apiUrl}/bookings`, booking);
  }
}