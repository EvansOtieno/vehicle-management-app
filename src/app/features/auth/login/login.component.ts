import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    const loginRequest: LoginRequest = this.loginForm.value;
    
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Login Success - Microservice Response:', {
          status: 'Success',
          timestamp: new Date().toISOString(),
          responseData: response,
          token: response?.token ? '***REDACTED***' : null, // Redact sensitive token
          userDetails: {
            username: response?.username,
            role: response?.roles[0]
          }
        });
        
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login Error - Microservice Response:', {
          status: 'Error',
          timestamp: new Date().toISOString(),
          errorDetails: {
            statusCode: error.status,
            message: error.message,
            fullError: error.error, // Be cautious with logging full error in production
            url: error.url
          },
          requestPayload: loginRequest // Log what was sent to the microservice
        });
    
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to login. Please check your credentials.';
      },
      complete: () => {
        console.debug('Login Observable completed');
      }
    });
  }
}