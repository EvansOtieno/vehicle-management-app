import { environment } from "../../../environment/environment";

export const API_BASE_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  USER_INFO: `${API_BASE_URL}/users/me`
};

export const TOKEN_KEY = 'zH+WQ3f1G2pX5kL9Rq7wT1vY8uN4iB0jK7oE2dC5aMlP6xVn9S';
export const USER_KEY = 'user_info';