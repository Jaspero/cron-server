import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  token: string | null;
}
