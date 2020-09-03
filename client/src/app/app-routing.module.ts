import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountsComponent} from './pages/accounts/accounts.component';
import {JobsComponent} from './pages/jobs/jobs.component';
import {LoginComponent} from './pages/login/login.component';
import {ResponsesComponent} from './pages/responses/responses.component';
import {AuthGuard} from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'accounts',
    component: AccountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/:account/jobs',
    component: JobsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/:account/jobs/:job',
    component: ResponsesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
