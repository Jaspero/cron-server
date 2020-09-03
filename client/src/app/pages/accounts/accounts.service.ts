import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Account, CAAccount} from '../../shared/interfaces/account.interface';

@Injectable()
export class AccountsService {
  constructor(
    private http: HttpClient
  ) { }

  list() {
    return this.http.get<Account[]>('/api/accounts');
  }

  create(account: CAAccount) {
    return this.http.post<void>('/api/accounts', account);
  }

  update(id: string, account: Partial<CAAccount>) {
    return this.http.put<void>(`/api/accounts/${id}`, account);
  }

  delete(id: string) {
    return this.http.delete<void>(`/api/accounts/${id}`);
  }
}
