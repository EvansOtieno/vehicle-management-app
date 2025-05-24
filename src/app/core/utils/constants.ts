import { environment } from "../../../environment/environment";

export const API_BASE_URL_USER = environment.apiUrl;
export const API_BASE_URL_VEHICLE = environment.vehicleApiUrl;

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL_USER}/api/auth/login`,
  REGISTER: `${API_BASE_URL_USER}/api/auth/register`,
  USER_INFO: `${API_BASE_URL_USER}/users/me`,
  MECHANIC_PROFILES: `${API_BASE_URL_USER}/api/mechanic-profiles`,
  VEHICLE_REGISTER: `${API_BASE_URL_VEHICLE}/api/vehicles/register`,
  VEHICLE_LIST: `${API_BASE_URL_VEHICLE}/api/vehicles`
  
};

export const TOKEN_KEY = 'zH+WQ3f1G2pX5kL9Rq7wT1vY8uN4iB0jK7oE2dC5aMlP6xVn9S';
export const USER_KEY = 'user_info';