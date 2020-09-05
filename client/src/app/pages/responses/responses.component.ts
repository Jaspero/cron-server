import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {BehaviorSubject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Response} from '../../shared/interfaces/response.interface';
import {confirmation} from '../../shared/utils/confirmation';
import {ResponsesService} from './responses.service';

@UntilDestroy()
@Component({
  selector: 'cc-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResponsesService]
})
export class ResponsesComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private responsesService: ResponsesService,
    private cdr: ChangeDetectorRef
  ) { }

  responses: Response[] = [];
  account: string = '';
  job: string = '';
  hasMore = true;
  page = 0;

  loading$ = new BehaviorSubject(false);

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(params => {
        this.account = params.account;
        this.job = params.job;
        this.page = 0;
        this.hasMore = true;
        this.responses = [];

        this.loadPage();
      })
  }

  loadPage() {
    this.page++;
    this.loading$.next(true);

    this.responsesService
      .list(
        this.account,
        this.job,
        this.page
      )
      .subscribe(data => {
        this.hasMore = data.hasMore;
        this.responses.push(...data.items);
        this.loading$.next(false);
        this.cdr.markForCheck();
      })
  }

  remove(id: string, index: number) {
    confirmation(
      [
        this.responsesService.delete(
          this.account,
          id
        ),
        tap(() => {
          this.responses.splice(index, 1);
          this.cdr.markForCheck();
        })
      ],
      {
        header: 'Delete Response',
        description: 'Are you sure, this action can not be reverted?'
      }
    )
  }
}
