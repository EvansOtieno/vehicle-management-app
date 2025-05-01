export interface LoginRequest {
    identifier: string;
    password: string;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roles: string;
    address?: string;
    phoneNumber: string;
  }
  
  export interface AuthResponse {
    token: string;
    expiry: string;
    username: string;
    email: string;
    roles: string[];
    userId: number;
  }