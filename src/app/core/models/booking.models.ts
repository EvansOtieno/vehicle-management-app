import { BusinessType, Certification, ServiceCategory, ServiceOffered } from "./mechanic-profile.model";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  registrationLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  ownerId: string;
}

export interface ServiceProviderDetails extends ServiceProvider {
  businessType: BusinessType;
  specializations: string[];
  yearsOfExperience: number;
  servicesOffered: ServiceOffered[];
  certifications: Certification[];
  emergencyService: boolean;
  mobileMechanic: boolean;
  website?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  totalReviews: number;
}

// Helper interface for grouping working hours
export interface GroupedHours {
  days: string[];
  openTime: string;
  closeTime: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  services: string[];
  rating: number;
  phoneNumber: string;
  email: string;
  workingHours: string;
  description: string;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: ServiceCategory;
  serviceName?: string;
  emergencyService?: boolean;
  mobileMechanic?: boolean;
  minRating?: number;
  isVerified?: boolean;
  businessType?: string;
  page?: number;
  size?: number;
  sortBy?: 'distance' | 'rating' | 'name';
  sortDirection?: 'ASC' | 'DESC';
}

export interface BookingRequest {
  vehicleId: string;
  customerId: string;
  serviceProviderId: string;
  preferredDate: Date;
  preferredTime: string;
  issueDescription: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
}
