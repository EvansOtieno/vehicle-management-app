import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { MechanicProfile, ServiceCategory } from '../../../../core/models/mechanic-profile.model';
import { MechanicProfileService } from '../../services/mechanic-profile.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-mechanic-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mechanic-profile.component.html',
  styleUrls: ['./mechanic-profile.component.scss']
})
export class MechanicProfileComponent implements OnInit, OnDestroy {
  profile: MechanicProfile | null = null;
  isLoading = true;
  profileExists = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private mechanicProfileService: MechanicProfileService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    const currentUser = this.tokenService.getCurrentUser();
    
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    const userId = currentUser.id || currentUser.username;
    
    this.isLoading = true;
    this.error = null;

    this.mechanicProfileService.getProfile(String(userId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.profileExists = true;
          console.log('Profile loaded successfully:', profile);
        },
        error: (error) => {
          console.log('Profile not found, user needs to create one:', error.message);
          this.profileExists = false;
          this.profile = null;
          
          // Only set error for non-404 errors
          if (!error.message.includes('not found')) {
            this.error = error.message;
          }
        }
      });
  }

  // Retry loading profile after error
  retryLoadProfile(): void {
    this.loadProfile();
  }

  // Refresh profile data
  refreshProfile(): void {
    if (this.profileExists) {
      this.loadProfile();
    }
  }

  // Navigate to create profile (you'll need to implement routing)
  createProfile(): void {
    this.router.navigate(['/profile/edit']).then(
      (success) => {
        console.log('Navigation success:', success);
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
  }

  // Navigate to edit profile
  editProfile(): void {
    const userId = this.tokenService.getCurrentUserId();
    
    if (this.profile) {
      this.router.navigate([`edit/${userId}`], { relativeTo: this.route }).then(
      (success) => {
        console.log('Navigation success:', success);
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
    }
  }

  // Check if current user can edit this profile
  canEditProfile(): boolean {
    return this.profile ? this.mechanicProfileService.canEditProfile(this.profile) : false;
  }

  // Get services grouped by category
  getServicesByCategory(): { [key: string]: any[] } {
    if (!this.profile?.servicesOffered) return {};
    
    return this.profile.servicesOffered.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as { [key: string]: any[] });
  }

  // Format category name for display
  getFormattedCategory(category: string): string {
    return category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get working days text
  getWorkingDaysText(): string {
    if (!this.profile?.workingHours) return 'Not specified';
    
    const openDays = this.profile.workingHours
      .filter(h => h.isOpen)
      .map(h => h.day);
    
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) return 'All days';
    
    // Group consecutive days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const openDayIndices = openDays.map(day => days.indexOf(day)).sort((a, b) => a - b);
    
    const ranges: string[] = [];
    let start = openDayIndices[0];
    let end = start;
    
    for (let i = 1; i < openDayIndices.length; i++) {
      if (openDayIndices[i] === end + 1) {
        end = openDayIndices[i];
      } else {
        ranges.push(start === end ? days[start] : `${days[start]} - ${days[end]}`);
        start = end = openDayIndices[i];
      }
    }
    ranges.push(start === end ? days[start] : `${days[start]} - ${days[end]}`);
    
    return ranges.join(', ');
  }

  // Get working hours text
  getWorkingHoursText(): string {
    if (!this.profile?.workingHours) return 'Not specified';
    
    const openHours = this.profile.workingHours.filter(h => h.isOpen);
    if (openHours.length === 0) return 'Closed';
    
    // Check if all open days have the same hours
    const firstHours = openHours[0];
    const sameHours = openHours.every(h => 
      h.openTime === firstHours.openTime && h.closeTime === firstHours.closeTime
    );
    
    if (sameHours) {
      return `${firstHours.openTime} - ${firstHours.closeTime}`;
    }
    
    return 'Varies by day';
  }

  // Get profile completion percentage
  getCompletionPercentage(): number {
    if (!this.profile) return 0;
    
    const requiredFields = [
      'businessName',
      'businessType',
      'description',
      'contactPhone',
      'contactEmail',
      'location',
      'specializations',
      'servicesOffered',
      'workingHours'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = (this.profile as any)[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  // Check if profile is verified
  isProfileVerified(): boolean {
    return this.profile?.isVerified || false;
  }

  // Get verification status text
  getVerificationStatusText(): string {
    if (!this.profile) return '';
    
    if (this.profile.isVerified) {
      return 'Verified';
    } else if (this.profile.isProfileComplete) {
      return 'Pending Verification';
    } else {
      return 'Complete Profile for Verification';
    }
  }

  // Format experience years
  getExperienceText(): string {
    if (!this.profile?.yearsOfExperience) return 'Not specified';
    
    const years = this.profile.yearsOfExperience;
    if (years === 1) return '1 year';
    return `${years} years`;
  }

  // Get specializations as comma-separated string
  getSpecializationsText(): string {
    if (!this.profile?.specializations || this.profile.specializations.length === 0) {
      return 'Not specified';
    }
    
    return this.profile.specializations
      .map(spec => this.getFormattedCategory(spec))
      .join(', ');
  }

  // Helper method to convert object to key-value pairs for *ngFor
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Helper method to get values from object by key
  getValuesByKey(obj: any, key: string): any[] {
    return obj[key] || [];
  }

  // Handle profile image upload
  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.profile) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select a valid image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image size should be less than 5MB';
        return;
      }
      
      this.mechanicProfileService.uploadProfileImage(this.profile.id!, file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (this.profile) {
              // Update profile with new image URL
              this.profile = { ...this.profile, profileImageUrl: response.imageUrl };
            }
            console.log('Image uploaded successfully');
          },
          error: (error) => {
            this.error = `Failed to upload image: ${error.message}`;
            console.error('Image upload error:', error);
          }
        });
    }
  }

  // Clear error message
  clearError(): void {
    this.error = null;
  }
}