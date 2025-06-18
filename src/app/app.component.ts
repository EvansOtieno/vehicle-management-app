
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'user-authentication-app';
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Check authentication status when the app starts
    this.authService.checkAuthStatus();
  }
}