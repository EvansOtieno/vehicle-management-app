import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  userRoles: { value: string, label: string }[] = [
    { value: 'ROLE_CAR_OWNER', label: 'Car Owner' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_MECHANIC', label: 'Mechanic' },
    { value: 'ROLE_PART_DEALER', label: 'Part Dealer' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      phoneNumber: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(10)] }),
      email: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.email] }),
      password: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: this.fb.nonNullable.control('', { validators: [Validators.required] }),
      firstName: this.fb.nonNullable.control(''),
      lastName: this.fb.nonNullable.control(''),
      role: this.fb.nonNullable.control('ROLE_CAR_OWNER', { validators: [Validators.required] })
    }, {
      validators: [(control) => this.passwordMatchValidator(control as FormGroup)]
    });
  }
  
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    const formValue = this.registerForm.value;
    const registerRequest: RegisterRequest = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      roles: formValue.role,
      phoneNumber: formValue.phoneNumber,
      address: formValue.address
    };
    
    this.authService.register(registerRequest).subscribe({
      next: () => {
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'success' }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}