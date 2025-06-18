// features/mechanic/profile/profile-form/profile-form.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { 
  MechanicProfile, 
  ServiceOffered, 
  ServiceCategory, 
  WorkingHours, 
  Certification,
  BusinessType 
} from '../../../../core/models/mechanic-profile.model';
import { Location } from '../../../../core/models/location.model';
import { MechanicProfileService } from '../../../../core/services/user/mechanic/mechanic-profile.service';
import { TokenService } from '../../../../core/services/token/token.service';

// Declare global google variable
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  profileForm!: FormGroup;
  serviceCategories = Object.values(ServiceCategory);
  businessTypes = Object.values(BusinessType);
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  map: any;
  marker: any;
  selectedLocation: Location | null = null;
  
  isLoading = false;
  isEditMode = false;
  profileId: string | null = null;
  currentProfile: MechanicProfile | null = null;
  isGoogleMapsLoaded = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  private destroy$ = new Subject<void>();
  private readonly GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private mechanicProfileService: MechanicProfileService,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsAPI();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode(): void {
    this.profileId = this.route.snapshot.paramMap.get('id');
    if (this.profileId) {
      this.isEditMode = true;
      this.loadProfileForEdit(this.profileId);
    } else {
      // Check if user already has a profile
      this.checkExistingProfile();
    }
  }

  private checkExistingProfile(): void {
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      return;
    }

    const userId = currentUser.id?.toString() || currentUser.username;
    
    this.mechanicProfileService.getProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          // Profile exists, redirect to edit mode
          this.router.navigate(['/mechanic/profile/edit', profile.id]);
        },
        error: (error) => {
          // No profile exists, continue with creation
          console.log('No existing profile found, showing creation form');
        }
      });
  }

  private loadProfileForEdit(profileId: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.mechanicProfileService.getProfileById(profileId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (profile) => {
          this.currentProfile = profile;
          this.populateForm(profile);
          console.log('Profile loaded for editing:', profile);
        },
        error: (error) => {
          this.error = `Failed to load profile: ${error.message}`;
          console.error('Error loading profile:', error);
        }
      });
  }

  private loadGoogleMapsAPI(): void {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      this.isGoogleMapsLoaded = true;
      setTimeout(() => this.initializeMap(), 100);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      this.waitForGoogleMaps();
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      this.isGoogleMapsLoaded = true;
      // Add a small delay to ensure everything is ready
      setTimeout(() => this.initializeMap(), 100);
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
      this.isGoogleMapsLoaded = false;
    };

    document.head.appendChild(script);
  }

  private waitForGoogleMaps(): void {
    const checkGoogle = () => {
      if (window.google && window.google.maps) {
        this.isGoogleMapsLoaded = true;
        setTimeout(() => this.initializeMap(), 100);
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      businessName: ['', [Validators.required, Validators.minLength(2)]],
      businessType: [BusinessType.INDIVIDUAL, Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      specializations: this.fb.array([]),
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      
      // Contact Information
      contactPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      website: [''],
      
      // Location
      location: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['Kenya', Validators.required],
        latitude: [0, Validators.required],
        longitude: [0, Validators.required]
      }),
      
      // Services
      servicesOffered: this.fb.array([]),
      
      // Working Hours - Initialize as empty array first
      workingHours: this.fb.array([]),
      
      // Certifications
      certifications: this.fb.array([]),
      
      // Business Details
      licenseNumber: [''],
      insuranceProvider: [''],
      emergencyService: [false],
      mobileMechanic: [false]
    });

    // Initialize working hours after form is created
    this.initializeWorkingHours();
  }

  private populateForm(profile: MechanicProfile): void {
    this.profileForm.patchValue({
      businessName: profile.businessName,
      businessType: profile.businessType,
      description: profile.description,
      yearsOfExperience: profile.yearsOfExperience,
      contactPhone: profile.contactPhone,
      contactEmail: profile.contactEmail,
      website: profile.website,
      location: profile.location,
      licenseNumber: profile.licenseNumber,
      insuranceProvider: profile.insuranceProvider,
      emergencyService: profile.emergencyService,
      mobileMechanic: profile.mobileMechanic
    });

    // Populate specializations
    const specializationsArray = this.profileForm.get('specializations') as FormArray;
    specializationsArray.clear();
    profile.specializations?.forEach(spec => {
      specializationsArray.push(this.fb.control(spec, Validators.required));
    });

    // Populate services
    const servicesArray = this.profileForm.get('servicesOffered') as FormArray;
    servicesArray.clear();
    profile.servicesOffered?.forEach(service => {
      servicesArray.push(this.createServiceFormGroup(service));
    });

    // Populate working hours - clear existing and repopulate
    const workingHoursArray = this.profileForm.get('workingHours') as FormArray;
    workingHoursArray.clear();
    if (profile.workingHours && profile.workingHours.length > 0) {
      profile.workingHours.forEach(hours => {
        workingHoursArray.push(this.createWorkingHoursFormGroup(hours));
      });
    } else {
      this.initializeWorkingHours();
    }

    // Populate certifications
    const certificationsArray = this.profileForm.get('certifications') as FormArray;
    certificationsArray.clear();
    profile.certifications?.forEach(cert => {
      certificationsArray.push(this.createCertificationFormGroup(cert));
    });

    this.selectedLocation = profile.location;
    
    // Update map if it's loaded
    if (this.map && profile.location) {
      const position = { 
        lat: profile.location.latitude, 
        lng: profile.location.longitude 
      };
      this.map.setCenter(position);
      this.marker.setPosition(position);
    }
  }

  // Form Array Getters
  get specializations(): FormArray {
    return this.profileForm.get('specializations') as FormArray;
  }

  get servicesOffered(): FormArray {
    return this.profileForm.get('servicesOffered') as FormArray;
  }

  get workingHours(): FormArray {
    return this.profileForm.get('workingHours') as FormArray;
  }

  get certifications(): FormArray {
    return this.profileForm.get('certifications') as FormArray;
  }

  // Specializations
  addSpecialization(): void {
    this.specializations.push(this.fb.control('', Validators.required));
  }

  removeSpecialization(index: number): void {
    this.specializations.removeAt(index);
  }

  // Services
  addService(): void {
    this.servicesOffered.push(this.createServiceFormGroup());
  }

  removeService(index: number): void {
    this.servicesOffered.removeAt(index);
  }

  private createServiceFormGroup(service?: ServiceOffered): FormGroup {
    return this.fb.group({
      id: [service?.id || null],
      name: [service?.name || '', Validators.required],
      description: [service?.description || '', Validators.required],
      basePrice: [service?.estimatedPrice || 0, [Validators.required, Validators.min(0)]],
      estimatedDuration: [service?.estimatedDuration || 60, [Validators.required, Validators.min(15)]],
      category: [service?.category || ServiceCategory.GENERAL_MAINTENANCE, Validators.required]
    });
  }

  // Working Hours
  private initializeWorkingHours(): void {
    const workingHoursArray = this.profileForm.get('workingHours') as FormArray;
    this.daysOfWeek.forEach(day => {
      const workingHourGroup = this.createWorkingHoursFormGroup({
        day,
        openTime: '08:00',
        closeTime: '17:00',
        isOpen: day !== 'Sunday'
      });
      workingHoursArray.push(workingHourGroup);
    });
  }

  private createWorkingHoursFormGroup(hours?: WorkingHours): FormGroup {
    return this.fb.group({
      day: [hours?.day || '', Validators.required],
      openTime: [hours?.openTime || '08:00', Validators.required],
      closeTime: [hours?.closeTime || '17:00', Validators.required],
      isOpen: [hours?.isOpen !== undefined ? hours.isOpen : false]
    });
  }

  // Certifications
  addCertification(): void {
    this.certifications.push(this.createCertificationFormGroup());
  }

  removeCertification(index: number): void {
    this.certifications.removeAt(index);
  }

  private createCertificationFormGroup(cert?: Certification): FormGroup {
    return this.fb.group({
      id: [cert?.id || null],
      name: [cert?.name || '', Validators.required],
      issuingOrganization: [cert?.issuingOrganization || '', Validators.required],
      issueDate: [cert?.issueDate || '', Validators.required],
      expiryDate: [cert?.expirationDate || ''],
      certificateNumber: [cert?.certificateNumber || '', Validators.required]
    });
  }

  // Map functionality
  private initializeMap(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isGoogleMapsLoaded) {
      return;
    }

    // Use ngAfterViewInit logic with a timeout to ensure the view is ready
    setTimeout(() => {
      if (this.mapContainer?.nativeElement && window.google?.maps) {
        try {
          const mapOptions = {
            zoom: 13,
            center: { lat: -1.2921, lng: 36.8219 }, // Nairobi default
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            scaleControl: true
          };

          this.map = new window.google.maps.Map(this.mapContainer.nativeElement, mapOptions);
          
          this.marker = new window.google.maps.Marker({
            map: this.map,
            draggable: true,
            title: 'Your Business Location'
          });

          // Set initial location if available
          if (this.selectedLocation && this.selectedLocation.latitude && this.selectedLocation.longitude) {
            const position = { 
              lat: this.selectedLocation.latitude, 
              lng: this.selectedLocation.longitude 
            };
            this.map.setCenter(position);
            this.marker.setPosition(position);
          } else {
            this.getCurrentLocation();
          }

          // Handle marker drag
          this.marker.addListener('dragend', () => {
            const position = this.marker.getPosition();
            if (position) {
              this.updateLocationFromCoordinates(position.lat(), position.lng());
            }
          });

          // Handle map click
          this.map.addListener('click', (event: any) => {
            if (event.latLng) {
              this.marker.setPosition(event.latLng);
              this.updateLocationFromCoordinates(event.latLng.lat(), event.latLng.lng());
            }
          });

          console.log('Google Maps initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
        }
      } else {
        console.error('Map container or Google Maps not available');
      }
    }, 500);
  }

  getCurrentLocation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const location = { lat, lng };
          if (this.map) {
            this.map.setCenter(location);
            this.marker.setPosition(location);
          }
          
          this.updateLocationFromCoordinates(lat, lng);
        },
        (error) => {
          console.warn('Could not get current location:', error);
          // Fall back to default location
          this.updateLocationFromCoordinatesSimple(-1.2921, 36.8219);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
      this.updateLocationFromCoordinatesSimple(-1.2921, 36.8219);
    }
  }

  private updateLocationFromCoordinates(lat: number, lng: number): void {
    if (window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: lat, lng: lng };

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location: Location = this.parseGoogleMapsResult(result, lat, lng);
          this.selectedLocation = location;
          this.profileForm.patchValue({ location });
        } else {
          console.warn('Geocoding failed:', status);
          this.updateLocationFromCoordinatesSimple(lat, lng);
        }
      });
    } else {
      this.updateLocationFromCoordinatesSimple(lat, lng);
    }
  }

  private updateLocationFromCoordinatesSimple(lat: number, lng: number): void {
    const location: Location = {
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    };
    
    this.selectedLocation = location;
    this.profileForm.patchValue({ location });
  }

  private parseGoogleMapsResult(result: any, lat: number, lng: number): Location {
    const addressComponents = result.address_components || [];
    
    const getComponent = (type: string): string => {
      const component = addressComponents.find((comp: any) => comp.types.includes(type));
      return component ? component.long_name : '';
    };

    return {
      latitude: lat,
      longitude: lng,
      address: result.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: getComponent('locality') || getComponent('administrative_area_level_2') || 'Nairobi',
      state: getComponent('administrative_area_level_1') || 'Nairobi County',
      zipCode: getComponent('postal_code') || '00100',
      country: getComponent('country') || 'Kenya'
    };
  }

  onAddressChange(event: any): void {
    const address = event.target.value;
    if (address.length > 5 && window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          const parsedLocation: Location = this.parseGoogleMapsResult(
            result, 
            location.lat(), 
            location.lng()
          );
          
          this.selectedLocation = parsedLocation;
          this.profileForm.patchValue({ location: parsedLocation });
          
          if (this.map) {
            const position = { lat: parsedLocation.latitude, lng: parsedLocation.longitude };
            this.map.setCenter(position);
            this.marker.setPosition(position);
          }
        }
      });
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
      
      const profileData = this.prepareProfileData();
      
      const operation = this.isEditMode && this.profileId
        ? this.mechanicProfileService.updateProfile(this.profileId, profileData)
        : this.mechanicProfileService.createProfile(profileData);

      operation
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (profile) => {
            this.successMessage = `Profile ${this.isEditMode ? 'updated' : 'created'} successfully!`;
            console.log('Profile saved successfully:', profile);
            
            // Navigate back to profile view after a short delay
            setTimeout(() => {
              this.router.navigate(['/mechanic/profile']);
            }, 2000);
          },
          error: (error) => {
            this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} profile: ${error.message}`;
            console.error('Profile save error:', error);
          }
        });
    } else {
      this.markFormGroupTouched(this.profileForm);
      this.error = 'Please fix the form errors before submitting.';
    }
  }

  private prepareProfileData(): Partial<MechanicProfile> {
    const formValue = this.profileForm.value;
    const currentUser = this.tokenService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return {
      ...formValue,
      userId: currentUser.id?.toString() || currentUser.username,
      // Filter out empty specializations
      specializations: formValue.specializations.filter((spec: string) => spec.trim() !== ''),
      // Filter out services without required fields
      servicesOffered: formValue.servicesOffered.filter((service: any) => 
        service.name && service.category && service.basePrice >= 0
      ),
      // Filter out certifications without required fields
      certifications: formValue.certifications.filter((cert: any) => 
        cert.name && cert.issuingOrganization && cert.issueDate && cert.certificateNumber
      ),
      // Filter working hours to only include properly configured days
      workingHours: formValue.workingHours.filter((hours: any) => 
        hours.day && hours.openTime && hours.closeTime
      )
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be a positive number`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  // Navigation methods
  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/mechanic/profile']);
    } else {
      this.router.navigate(['/mechanic/dashboard']);
    }
  }

  // Clear messages
  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  // Check if current user can edit this profile
  canEditProfile(): boolean {
    if (!this.currentProfile) return !this.isEditMode; // Can create if not editing
    return this.mechanicProfileService.canEditProfile(this.currentProfile);
  }

  private getCurrentUserId(): string {
    const user = this.tokenService.getCurrentUser();
    return user?.id?.toString() || user?.username || 'unknown';
  }
}