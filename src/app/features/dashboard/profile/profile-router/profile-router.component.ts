// features/profile/profile-router.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../../../core/services/token/token.service';

@Component({
  selector: 'app-profile-router',
  standalone: true,
  template: `
    <div class="loading-profile">
      <p>Loading profile...</p>
    </div>
  `,
  styles: [`
    .loading-profile {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 1.1rem;
      color: #6c757d;
    }
  `]
})
export class ProfileRouterComponent implements OnInit {

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userRole = this.tokenService.getUserRole();
    
    // Route to appropriate profile based on role
    switch (userRole) {
      case 'ROLE_ADMIN':
        this.router.navigate(['admin'], { relativeTo: this.route });
        break;
      case 'ROLE_CAR_OWNER':
        this.router.navigate(['car-owner'], { relativeTo: this.route });
        break;
      case 'ROLE_MECHANIC':
        this.router.navigate(['mechanic'], { relativeTo: this.route });
        break;
      case 'ROLE_PART_DEALER':
        this.router.navigate(['part-dealer'], { relativeTo: this.route });
        break;
      default:
        console.error('Unknown user role:', userRole);
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}