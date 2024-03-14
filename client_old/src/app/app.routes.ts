import { Routes } from '@angular/router';
import {AuthGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent) },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts.component').then(mod => mod.AccountsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/:account/jobs',
    loadChildren: () => import('./pages/jobs/jobs.component').then(mod => mod.JobsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/:account/jobs/:job',
    loadChildren: () => import('./pages/responses/responses.component').then(mod => mod.ResponsesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
