import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TokenService } from '../../../../core/services/token/token.service';
import { OwnerProfileService } from '../../../../core/services/user/owner/owner-profile.service';
import { CarOwnerProfile } from '../../../../core/models/owner-profile';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-profile',
  imports: [
      CommonModule,
      MatCardModule,
      MatIconModule,
      MatButtonModule,
      MatChipsModule,
      MatDividerModule,
      MatProgressSpinnerModule
    ],
  templateUrl: './owner-profile.component.html',
  styleUrl: './owner-profile.component.scss'
})
export class OwnerProfileComponent implements OnInit, OnDestroy{
  profile: CarOwnerProfile | null = null;
  isLoading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();
  private profileId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ownerProfileService: OwnerProfileService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.profileId = String(this.tokenService.getUser()?.id);
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.error = null;

    this.ownerProfileService.getProfile(this.profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          // Check if it's a 404 (profile not found) or other error
          if (error.status === 404 || error.message?.includes('not found')) {
            this.profile = null;
            this.error = null; // Don't show error for missing profile
          } else {
            this.error = 'Failed to load profile. Please try again.';
          }
          this.isLoading = false;
          console.error('Error loading profile:', error);
        }
      });
  }

  editProfile(): void {
    this.router.navigate(['edit', this.profileId],{ relativeTo: this.route }).then(
      (success) => {
        console.log('Navigation success:', success);
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
    }

  createProfile(): void {
    this.router.navigate(['edit', this.profileId],{ relativeTo: this.route }).then(
      (success) => {
        console.log('Navigation success:', success);
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
  }

  formatDate(date: string | Date): string {
    if (!date) return 'Not specified';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatGender(gender: string): string {
    const genderMap: { [key: string]: string } = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return genderMap[gender] || gender;
  }

  formatRelationship(relationship: string): string {
    const relationshipMap: { [key: string]: string } = {
      'spouse': 'Spouse',
      'parent': 'Parent',
      'sibling': 'Sibling',
      'child': 'Child',
      'friend': 'Friend',
      'colleague': 'Colleague',
      'other': 'Other'
    };
    return relationshipMap[relationship] || relationship;
  }

  formatPaymentMethod(method: string): string {
    const paymentMap: { [key: string]: string } = {
      'cash': 'Cash',
      'mpesa': 'M-Pesa',
      'bank_transfer': 'Bank Transfer',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card'
    };
    return paymentMap[method] || method;
  }

  formatContactTime(time: string): string {
    const timeMap: { [key: string]: string } = {
      'morning': 'Morning (8 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 5 PM)',
      'evening': 'Evening (5 PM - 8 PM)',
      'anytime': 'Anytime'
    };
    return timeMap[time] || time;
  }
}

