import { Routes } from '@angular/router';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { LoginComponent } from './pages/login/login.component';
import {AuthGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '',
    component: LoginComponent,
    // loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent)
  },
  {
    path: 'accounts',
    component: AccountsComponent,
    // loadComponent: () => import('./pages/accounts/accounts.component').then(mod => mod.AccountsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/:account/jobs',
    component: JobsComponent,
    // loadChildren: () => import('./pages/jobs/jobs.component').then(mod => mod.JobsComponent),
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
