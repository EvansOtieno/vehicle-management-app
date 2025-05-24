export interface Vehicle {
    id?: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    color: string;
    ownerId?: number;
    additionalDetails?: Record<string, any>;
  }