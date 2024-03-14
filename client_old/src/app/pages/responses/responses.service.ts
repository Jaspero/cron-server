import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Response} from '../../shared/interfaces/response.interface';

@Injectable()
export class ResponsesService {
  constructor(
    private http: HttpClient
  ) { }

  list(
    account: string,
    job: string,
    page: number
  ) {
    return this.http.get<{hasMore: boolean, items: Response[]}>(`/api/responses/${job}`, {
      params: {
        account,
        page: page.toString()
      }
    })
  }

  delete(
    account: string,
    response: string
  ) {
    return this.http.delete(`/api/responses/${response}`, {
      params: {
        account
      }
    })
  }
}
