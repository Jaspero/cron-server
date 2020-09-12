import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {switchMap, tap} from 'rxjs/operators';
import {METHODS} from '../../shared/consts/methods.const';
import {TIMEZONES} from '../../shared/consts/timezones.const';
import {Job} from '../../shared/interfaces/job.interface';
import {confirmation} from '../../shared/utils/confirmation';
import {JobsService} from './jobs.service';

@UntilDestroy()
@Component({
  selector: 'cc-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JobsService]
})
export class JobsComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private jobsService: JobsService,
    private dialog: MatDialog
  ) {}

  @ViewChild('jobDialog', {static: true})
  dialogTemplate: TemplateRef<any> | undefined;

  jobs: Job[] = [];
  // @ts-ignore
  form: FormGroup;
  entryValue: Partial<Job> | undefined;
  acc: string = '';
  index: number | undefined;
  loading = true;
  methods = METHODS;
  timezones = TIMEZONES;

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap(({account}) => {

          this.acc = account;

          return this.jobsService.list(account);
        }),
        untilDestroyed(this)
      )
      .subscribe(jobs => {
        this.jobs = jobs;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  open(job?: Job, index?: number) {
    this.index = index;
    this.form = this.createForm(job);

    if (job) {
      this.entryValue = job;
      delete this.entryValue.name;
    }

    this.dialog.open(
      this.dialogTemplate as TemplateRef<any>,
      {
        width: '800px'
      }
    )
  }

  save() {
    return () => {
      const data = this.form?.getRawValue();

      if (this.index !== undefined) {

        for (const key in this.entryValue) {
          // @ts-ignore
          if (this.entryValue[key] === data[key]) {
            delete data[key];
          }
        }

        return this.jobsService.update(this.acc, data)
          .pipe(
            tap(() => {
              this.jobs[this.index as number] = {
                ...this.jobs[this.index as number],
                ...data
              };
              this.dialog.closeAll();
              this.cdr.markForCheck();
            })
          );
      } else {
        /**
         * Prevent sending defaults
         */
        [
          'storeBody',
          'storeHeaders'
        ].forEach(key => {
          if (data[key] === false) {
            delete data[key];
          }
        });
      }


      return this.jobsService.create(this.acc, data)
        .pipe(
          tap((resp) => {
            this.jobs.push({
              ...resp,
              ...data
            });

            this.dialog.closeAll();
            this.cdr.markForCheck();
          })
        )
    }
  }

  remove(name: string, index: number) {
    confirmation([
      switchMap(() =>
        this.jobsService.delete(
          this.acc,
          name
        )
      ),
      tap(() => {
        this.jobs.splice(index, 1);
        this.cdr.markForCheck();
      })
    ], {
      header: 'Delete job',
      description: 'Are you sure, this action can not be undone?'
    })
  }

  private createForm(job: Partial<Job> = {}) {
    return this.fb.group({
      name: [job.name || '', [Validators.required, Validators.pattern(/[a-b0-9A-B\-]/)]],
      method: job.method || 'GET',
      url: [job.url || '', [Validators.required]],
      schedule: [job.schedule || '', [Validators.required]],
      timeZone: [job.timeZone || 'UTC'],
      body: job.body || '',
      headers: job.headers || '',
      storeBody: job.storeBody || false,
      storeHeaders: job.storeHeaders || false
    }, {
      updateOn: 'blur'
    })
  }
}
