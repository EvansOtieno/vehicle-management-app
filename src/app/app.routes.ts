import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuardFn } from './core/guards/auth.guard';
import { roleGuardFn } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Main Dashboard with nested routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuardFn],
    children: [
      // Default dashboard home
      { 
        path: '', 
        redirectTo: 'home', 
        pathMatch: 'full' 
      },
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      
      // Profile routes
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/profile/profile-router/profile-router.component').then(m => m.ProfileRouterComponent)
          },
          {
            path: 'car-owner',
            canActivate: [() => roleGuardFn(['ROLE_CAR_OWNER' as UserRole])],
            loadComponent: () => import('./features/car-owner/profile/owner-profile/owner-profile.component').then(m => m.OwnerProfileComponent)
          },
          {
            path: 'car-owner/edit/:id', 
            canActivate: [() => roleGuardFn(['ROLE_CAR_OWNER' as UserRole])],
            loadComponent: () => import('./features/car-owner/profile/profile-form/profile-form.component').then(m => m.ProfileFormComponent)
          },
          {
            path: 'mechanic',
            canActivate: [() => roleGuardFn(['ROLE_MECHANIC' as UserRole])],
            loadComponent: () => import('./features/mechanic/profile/mechanic-profile/mechanic-profile.component').then(m => m.MechanicProfileComponent)
          },
          {
             path: 'mechanic/edit/:id',
            canActivate: [() => roleGuardFn(['ROLE_MECHANIC' as UserRole])],
            loadComponent: () => import('./features/mechanic/profile/profile-form/profile-form.component').then(m => m.ProfileFormComponent)
          }
          
        ]
      },

      // Vehicle routes add navigation to vehicle/add
      {
        path: 'vehicle/add',
        canActivate: [() => roleGuardFn(['ROLE_CAR_OWNER' as UserRole])],
        loadComponent: () => import('./features/vehicle/add-vehicle/add-vehicle.component').then(m => m.AddVehicleComponent)
      },
      {
        path: 'vehicle/booking/:vehicleId',
        canActivate: [() => roleGuardFn(['ROLE_CAR_OWNER' as UserRole])],
        loadComponent: () => import('./features/car-owner/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      }

      
    ]
  },

  // Legacy redirects
  { 
    path: 'admin', 
    redirectTo: '/dashboard/admin',
    pathMatch: 'full'
  },
  { 
    path: 'vehicles', 
    redirectTo: '/dashboard/vehicles',
    pathMatch: 'full'
  },
  { 
    path: 'mechanic', 
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Catch all
  { path: '**', redirectTo: '/dashboard' }
];