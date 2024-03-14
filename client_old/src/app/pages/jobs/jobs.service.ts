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
    return this.http.get<{items: Job[]}>(`/api/jobs`, {
      params: {
        account
      }
    })
  }

  create(
    account: string,
    data: Job
  ) {
    const {name, ...dt} = data;
    return this.http.post<{id: string}>(`/api/jobs/${name}?account=${account}`, dt)
  }

  update(
    account: string,
    data: Partial<Job>
  ) {
    const {name, ...dt} = data;
    return this.http.post<void>(`/api/jobs/${name}`, dt, {
      params: {
        account
      }
    });
  }

  delete(
    account: string,
    name: string
  ) {
    return this.http.delete<void>(`/api/jobs/${name}`, {
      params: {
        account
      }
    });
  }

  run(
    account: string,
    name: string
  ) {
    return this.http.get(`/api/jobs/${name}/run`, {
      params: {
        account
      }
    });
  }
}
