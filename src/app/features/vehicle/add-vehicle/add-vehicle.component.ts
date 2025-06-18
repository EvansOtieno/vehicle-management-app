import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle/vehicle.service';
import { Router } from '@angular/router';
import { Vehicle } from '../../../core/models/vehicle.model';
import { TokenService } from '../../../core/services/token/token.service';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss']
})
export class AddVehicleComponent {
  vehicleForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();
  
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.vehicleForm = this.fb.group({
      make: ['', [Validators.required]],
      model: ['', [Validators.required]],
      year: [this.currentYear, [Validators.required, Validators.min(1900), Validators.max(this.currentYear + 1)]],
      vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      licensePlate: ['', [Validators.required]],
      color: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    const user = this.tokenService.getUser();

    const vehicleData: Vehicle = this.vehicleForm.value;
    
    vehicleData.ownerId = user?.id; 

    this.vehicleService.registerVehicle(vehicleData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Redirect back to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to register vehicle. Please try again.';
        console.error('Vehicle registration error:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}