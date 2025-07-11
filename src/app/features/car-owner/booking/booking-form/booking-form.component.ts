import { Component,OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material Imports
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

// Custom Imports
import {  } from '../../../../core/models/vehicle.model';
import { MapComponent } from '../../../reusables/map/map.component';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { Vehicle, ServiceProvider, BookingRequest } from '../../../../core/models/booking.models';
import { MapCenter, MarkerClickEvent } from '../../../../core/models/maps.models';
import { VehicleService } from '../../../../core/services/vehicle/vehicle.service';
import { ServiceProviderService } from '../../../../core/services/booking/service-provider.service';

@Component({
  selector: 'app-booking-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MapComponent
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  // Form Groups
  vehicleDetailsForm!: FormGroup;
  customerDetailsForm!: FormGroup;
  serviceDetailsForm!: FormGroup;

  // Data Properties
  startDate = new Date();
  vehicle: Vehicle | null = null;
  serviceProviders: ServiceProvider[] = [];
  selectedServiceProvider: ServiceProvider | null = null;

  // Map Properties
  vehicleLocation: MapCenter | null = null;
  selectedMarkerId: string | null = null;
  mapLoading = false;

  // UI State
  loading = false;
  formSubmitted = false;

  // Time slots for service booking
  timeSlots = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private bookingService: ServiceProviderService,
    private bookingServices: BookingService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('vehicleId');
    if (vehicleId) {
      this.loadVehicleDetails(vehicleId);
    } else {
      this.snackBar.open('Vehicle ID is required', 'Close', { duration: 3000 });
      this.router.navigate(['/vehicles']);
    }
  }

  private initializeForms() {
    // Vehicle Details Form (Read-only)
    this.vehicleDetailsForm = this.fb.group({
      registrationNumber: [{ value: '', disabled: true }],
      make: [{ value: '', disabled: true }],
      model: [{ value: '', disabled: true }],
      year: [{ value: '', disabled: true }],
      registrationLocation: [{ value: '', disabled: true }]
    });

    // Customer Details Form
    this.customerDetailsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Service Details Form
    this.serviceDetailsForm = this.fb.group({
      preferredDate: ['', Validators.required],
      preferredTime: ['', Validators.required],
      issueDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  private loadVehicleDetails(vehicleId: string) {
    this.loading = true;
    this.vehicleService.getVehicleById(vehicleId).subscribe({
      next: (vehicles) => {
        // Initialize this.vehicle before assigning properties
        this.vehicle = {
          id: vehicles.vin ?? vehicles.id ?? '',
          registrationNumber: vehicles.licensePlate,
          make: vehicles.make,
          model: vehicles.model,
          year: vehicles.year,
          ownerId: String(vehicles.ownerId),
          registrationLocation: {
            lat: -1.272007,
            lng: 36.81425,
            address: ''
          }
        };
        
        this.populateVehicleForm(this.vehicle);
        this.setupVehicleLocation(this.vehicle);
        this.loadNearbyServiceProviders(this.vehicle);
      },
      error: (error) => {
        console.error('Error loading vehicle:', error);
        this.snackBar.open('Failed to load vehicle details', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/vehicles']);
      }
    });
  }

  private populateVehicleForm(vehicle: Vehicle) {
    this.vehicleDetailsForm.patchValue({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      registrationLocation: vehicle.registrationLocation.address
    });
  }

  private setupVehicleLocation(vehicle: Vehicle) {
    this.vehicleLocation = {
      //lat: vehicle.registrationLocation.lat,
      //lng: vehicle.registrationLocation.lng
      lat: -1.2701708,
      lng: 36.8203516 // Default to Nairobi for testing
    };
  }

  private loadNearbyServiceProviders(vehicle: Vehicle) {
    this.mapLoading = true;
    this.bookingService.getNearbyServiceProviders(
      vehicle.registrationLocation.lat,
      vehicle.registrationLocation.lng,
      20 // 20km radius
    ).subscribe({
      next: (providers) => {
        this.serviceProviders = providers;
        this.mapLoading = false;
        this.loading = false;
        
        if (providers.length === 0) {
          this.snackBar.open('No service providers found in your area', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Error loading service providers:', error);
        this.snackBar.open('Failed to load nearby service providers', 'Close', { duration: 3000 });
        this.mapLoading = false;
        this.loading = false;
      }
    });
  }

  // Map Event Handlers
  onProviderMarkerClick(event: MarkerClickEvent) {
    if (event.marker.id === 'vehicle') return;

    const provider = event.marker.data as ServiceProvider;
    this.selectServiceProvider(provider);
  }

  private selectServiceProvider(provider: ServiceProvider) {
    this.selectedServiceProvider = provider;
    this.selectedMarkerId = provider.id;

    // Calculate and show distance
    if (this.vehicle) {
      this.bookingService.calculateDistance(
        this.vehicle.registrationLocation.lat,
        this.vehicle.registrationLocation.lng,
        provider.location.lat,
        provider.location.lng
      ).subscribe((distance: number) => {
        this.snackBar.open(
          `Selected: ${provider.name} (${distance.toFixed(1)} km away)`,
          'Close',
          { duration: 3000 }
        );
      });
    }
  }

  // Form Validation Helpers
  isStepValid(step: number): boolean {
    switch (step) {
      case 0: return this.vehicleDetailsForm.valid && this.vehicle !== null;
      case 1: return this.selectedServiceProvider !== null;
      case 2: return this.customerDetailsForm.valid;
      case 3: return this.serviceDetailsForm.valid;
      default: return false;
    }
  }

  canProceedToConfirmation(): boolean {
    return this.isStepValid(0) && 
           this.isStepValid(1) && 
           this.isStepValid(2) && 
           this.isStepValid(3);
  }

  // Form Submission
  onSubmitBooking() {
    if (!this.canProceedToConfirmation()) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.formSubmitted = true;
    this.loading = true;

    const booking: BookingRequest = {
      vehicleId: this.vehicle!.id,
      customerId: 'current-user-id', // TODO: Get from authentication service
      serviceProviderId: this.selectedServiceProvider!.id,
      preferredDate: new Date(this.serviceDetailsForm.value.preferredDate),
      preferredTime: this.serviceDetailsForm.value.preferredTime,
      issueDescription: this.serviceDetailsForm.value.issueDescription,
      customerDetails: this.customerDetailsForm.value,
      status: 'pending'
    };

    this.bookingServices.createBooking(booking).subscribe({
      next: (response) => {
        this.snackBar.open(
          'Booking request submitted successfully! You will receive a confirmation soon.',
          'Close',
          { duration: 5000 }
        );
        //this.router.navigate(['/bookings', response.id || 'latest']);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.snackBar.open('Failed to submit booking request. Please try again.', 'Close', { duration: 3000 });
        this.loading = false;
        this.formSubmitted = false;
      }
    });
  }

  // Navigation
  goBack() {
    this.router.navigate(['/vehicles']);
  }

  // Utility Methods
  getProviderDistance(provider: ServiceProvider, callback: (distance: number) => void): void {
    if (!this.vehicle) {
      callback(0);
      return;
    }
    
    this.bookingService.calculateDistance(
      this.vehicle.registrationLocation.lat,
      this.vehicle.registrationLocation.lng,
      provider.location.lat,
      provider.location.lng
    ).subscribe({
      next: (distance: number) => callback(distance),
      error: () => callback(0)
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatTime(time: string): string {
    const slot = this.timeSlots.find(t => t.value === time);
    return slot ? slot.label : time;
  }

  // Form Error Getters
  getFieldError(formGroup: FormGroup, fieldName: string): string | null {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    const errors = field.errors;
    
    if (errors['required']) return `${fieldName} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['pattern']) return 'Please enter a valid phone number (10 digits)';
    if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    
    return 'Invalid input';
  }
}