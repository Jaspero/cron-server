import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Job} from '../../shared/interfaces/job.interface';

@Injectable()
export class JobsService {
  constructor(
    private http: HttpClient
  ) { }

  list(
    account: string
  ) {
    return this.http.get<Job[]>(`/api/jobs`, {
      params: {
        account
      }
    })
  }
}
