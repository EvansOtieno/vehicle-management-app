export interface ServiceOffered {
  id?: string;
  name: string;
  description: string;
  estimatedPrice: number;
  estimatedDuration: number; // in minutes
  category: ServiceCategory;
}

export enum ServiceCategory {
  ENGINE = 'ENGINE',
  TRANSMISSION = 'TRANSMISSION',
  BRAKES = 'BRAKES',
  ELECTRICAL = 'ELECTRICAL',
  SUSPENSION = 'SUSPENSION',
  EXHAUST = 'EXHAUST',
  COOLING = 'COOLING',
  FUEL_SYSTEM = 'FUEL_SYSTEM',
  TIRES_WHEELS = 'TIRES_WHEELS',
  BODY_PAINT = 'BODY_PAINT',
  GENERAL_MAINTENANCE = 'GENERAL_MAINTENANCE',
  DIAGNOSTIC = 'DIAGNOSTIC'
}

export enum BusinessType {
  INDIVIDUAL = 'INDIVIDUAL', 
  GARAGE = 'GARAGE', 
  DEALERSHIP = 'DEALERSHIP'
}

export interface WorkingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Certification {
  id?: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  certificateNumber: string;
}

export interface MechanicProfile {
  id?: string;
  userId: string;
  businessName: string;
  businessType: 'INDIVIDUAL' | 'GARAGE' | 'DEALERSHIP';
  description: string;
  specializations: string[];
  yearsOfExperience: number;
  location: import('./location.model').Location;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  profileImageUrl?: string;
  
  // Services
  servicesOffered: ServiceOffered[];
  
  // Working hours
  workingHours: WorkingHours[];
  
  // Certifications
  certifications: Certification[];
  
  // Business details
  licenseNumber?: string;
  insuranceProvider?: string;
  emergencyService: boolean;
  mobileMechanic: boolean;
  
  // Ratings and reviews
  averageRating?: number;
  totalReviews?: number;
  
  // Profile status
  isProfileComplete: boolean;
  isVerified: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}