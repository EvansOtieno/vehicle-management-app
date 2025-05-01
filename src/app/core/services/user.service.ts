import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { API_BASE_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private http: HttpClient) { }
  
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/me`);
  }
  
  // Add more user-related methods as needed
}