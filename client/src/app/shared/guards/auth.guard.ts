import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {StateService} from '../services/state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private state: StateService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    if (!this.state.token) {
      this.router.navigate(['/']);
      return false;
    }

    if (state.url === '/') {
      this.router.navigate(['/accounts']);
      return false;
    }

    return true;
  }
  
}
