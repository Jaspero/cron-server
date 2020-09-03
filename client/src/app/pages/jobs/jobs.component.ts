import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Job} from '../../shared/interfaces/job.interface';
import {JobsService} from './jobs.service';

@Component({
  selector: 'cc-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JobsService]
})
export class JobsComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private jobsService: JobsService
  ) {
    this.jobs$ = this.activatedRoute.params
      .pipe(
        switchMap(({account}) =>
          this.jobsService.list(account)
        )
      )
  }

  jobs$: Observable<Job[]>;
}
