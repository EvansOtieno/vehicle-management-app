import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuardFn } from './core/guards/auth.guard';
import { roleGuardFn } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import { MechanicProfileComponent } from './features/mechanic/profile/mechanic-profile/mechanic-profile.component';
import { ProfileFormComponent } from './features/mechanic/profile/profile-form/profile-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuardFn]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [() => roleGuardFn(['ADMIN' as UserRole])]
  },
  {
    path: 'vehicles',
    canActivate: [authGuardFn],
    children: [
      {
        path: 'add',
        loadComponent: () => import('./features/vehicle/add-vehicle/add-vehicle.component').then(m => m.AddVehicleComponent)
      }
    ]
  },
  // Mechanic Profile Routes
  {
  path: 'mechanic',
    canActivate: [authGuardFn, () => roleGuardFn(['ROLE_MECHANIC' as UserRole])],
    children: [
      {
        path: 'profile',
        component: MechanicProfileComponent,
        data: { title: 'Mechanic Profile' }
      },
      {
        path: 'profile/create',
        component: ProfileFormComponent,
        data: { title: 'Create Profile' }
      },
      {
        path: 'profile/edit/:id',
        component: ProfileFormComponent,
        data: { title: 'Edit Profile' }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },
      { 
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  /*
  {
    path: 'car-owner/profile',
    loadComponent: () => import('./features/car-owner/profile/car-owner-profile.component').then(m => m.CarOwnerProfileComponent),
    canActivate: [authGuardFn, () => roleGuardFn(['ROLE_CAR_OWNER' as UserRole])]
  },
  {
    path: 'appointments',
    canActivate: [authGuardFn],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/appointments/create-appointment/create-appointment.component').then(m => m.CreateAppointmentComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/appointments/appointment-detail/appointment-detail.component').then(m => m.AppointmentDetailComponent)
      }
    ]
  },
  {
    path: 'services',
    canActivate: [authGuardFn, () => roleGuardFn(['ROLE_MECHANIC' as UserRole])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/services/service-list/service-list.component').then(m => m.ServiceListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./features/services/add-service/add-service.component').then(m => m.AddServiceComponent)
      }
    ]
  },*/
  { path: '**', redirectTo: '/dashboard' }
];