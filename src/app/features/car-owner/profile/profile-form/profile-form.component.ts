import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material Imports needed for profile-form.component.ts
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../../core/services/token/token.service';
import { OwnerProfileService } from '../../../../core/services/user/owner/owner-profile.service';
import { CarOwnerProfile } from '../../../../core/models/owner-profile';


@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  private destroy$ = new Subject<void>();

  profileId: string = ''; 
  
  // Kenya Counties for dropdown
  kenyaCounties: string[] = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
    'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
    'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
    'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ownerProfileService: OwnerProfileService,
    private tokenService: TokenService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.profileId = String(this.tokenService.getUser()?.id);
    // Check if we're in edit mode
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loadProfile(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: [''],
      drivingLicenseNumber: ['', [Validators.required]],
      
      // Contact Information
      primaryPhone: ['', [Validators.required, Validators.pattern(/^\+254\d{9}$/)]],
      secondaryPhone: [''],
      email: ['', [Validators.required, Validators.email]],
      
      // Address Information
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        county: ['', [Validators.required]],
        postalCode: ['', [Validators.required]]
      }),
      
      // Emergency Contacts (FormArray)
      emergencyContacts: this.fb.array([]),
      
      // Billing Information
      billingInfo: this.fb.group({
        preferredPaymentMethod: [[]],
        mpesaNumber: [''],
        bankName: [''],
        requestInvoices: [false],
        allowAutoPayment: [false]
      }),
      
      // Service Preferences
      receiveMaintenanceReminders: [true],
      receivePromotions: [false],
      allowRatingRequests: [true],
      shareLocationForEmergency: [false],
      preferredContactTime: ['anytime'],
      specialNotes: ['']
    });
  }

  // Emergency Contacts FormArray getters and methods
  get emergencyContacts(): FormArray {
    return this.profileForm.get('emergencyContacts') as FormArray;
  }

  addEmergencyContact(): void {
    const contactGroup = this.fb.group({
      name: ['', [Validators.required]],
      relationship: ['', [Validators.required]],
      phone: ['', [Validators.required]]
    });
    
    this.emergencyContacts.push(contactGroup);
  }

  removeEmergencyContact(index: number): void {
    this.emergencyContacts.removeAt(index);
  }

  private loadProfile(userId: string): void {
    this.isLoading = true;
     this.ownerProfileService.getProfile(userId).subscribe({
       next: (profile) => {
         this.populateForm(profile);
         this.isLoading = false;
       },
       error: (error) => {
        this.isEditMode= false; 
         this.error = 'Failed to load profile';
         this.isLoading = false;
       }
     });
  }

  private populateForm(profile: CarOwnerProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      drivingLicenseNumber: profile.drivingLicenseNumber,
      primaryPhone: profile.primaryPhone,
      secondaryPhone: profile.secondaryPhone,
      email: profile.email,
      address: profile.address,
      billingInfo: profile.billingInfo,
      receiveMaintenanceReminders: profile.receiveMaintenanceReminders,
      receivePromotions: profile.receivePromotions,
      allowRatingRequests: profile.allowRatingRequests,
      shareLocationForEmergency: profile.shareLocationForEmergency,
      preferredContactTime: profile.preferredContactTime,
      specialNotes: profile.specialNotes
    });

    // Populate emergency contacts
    this.emergencyContacts.clear();
    profile.emergencyContacts.forEach(contact => {
      const contactGroup = this.fb.group({
        name: [contact.name, [Validators.required]],
        relationship: [contact.relationship, [Validators.required]],
        phone: [contact.phone, [Validators.required]]
      });
      this.emergencyContacts.push(contactGroup);
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const formData = this.profileForm.value as CarOwnerProfile;
      
      if (this.isEditMode) {
        this.updateProfile(formData);
      } else {
        this.createProfile(formData);
      }
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  private createProfile(profileData: CarOwnerProfile): void {
    console.log('Creating profile with data:', profileData);
       this.ownerProfileService.createProfile(profileData).subscribe({
       next: (response) => {
         this.successMessage = 'Profile created successfully!';
         this.isLoading = false;     
         setTimeout(() => {
           this.router.navigate(['/owner/profile']);
         }, 2000);
       },
       error: (error) => {
         this.error = 'Failed to create profile. Please try again.';
         this.isLoading = false;
       }
     });
  }

  private updateProfile(profileData: CarOwnerProfile): void {
     this.ownerProfileService.updateProfile(this.profileId,profileData).subscribe({
       next: (response) => {
         this.populateForm(response);
         this.successMessage = 'Profile updated successfully!';
         this.isLoading = false;
       },
       error: (error) => {
         this.error = 'Failed to update profile. Please try again.';
         this.isLoading = false;
       }
     });
  }

  onCancel(): void {
    // Navigate back or show confirmation dialog
    this.router.navigate(['/dashboard']);
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }
}