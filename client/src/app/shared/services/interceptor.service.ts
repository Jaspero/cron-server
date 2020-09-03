import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {StateService} from './state.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  constructor(
    private state: StateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(
      req.clone({
        ...this.state.token && {
          setHeaders: {
            authorization: `Bearer ${this.state.token}`
          }
        }
      })
    )
  }
}
