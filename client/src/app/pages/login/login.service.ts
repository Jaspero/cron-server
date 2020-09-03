import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class LoginService {
  constructor(
    private http: HttpClient
  ) { }

  createToken(data: {email: string, password: string}) {
    return this.http.post<{token: string}>('/api/users/login', data)
  }
}
