// Interfaces
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Address {
  street: string;
  city: string;
  county: string;
  postalCode: string;
}

export interface BillingInfo {
  preferredPaymentMethod: string[];
  mpesaNumber: string;
  bankName: string;
  requestInvoices: boolean;
  allowAutoPayment: boolean;
}

export interface CarOwnerProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  drivingLicenseNumber: string;
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  
  // Address Information
  address: Address;
  
  // Emergency Contacts
  emergencyContacts: EmergencyContact[];
  
  // Billing Information
  billingInfo: BillingInfo;
  
  // Service Preferences
  receiveMaintenanceReminders: boolean;
  receivePromotions: boolean;
  allowRatingRequests: boolean;
  shareLocationForEmergency: boolean;
  preferredContactTime: string;
  specialNotes: string;
}