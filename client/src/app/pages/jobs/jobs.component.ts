import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {merge, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Job} from '../../shared/interfaces/job.interface';
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

  @ViewChild('newJob', {static: true})
  newJobDialog: TemplateRef<any> | undefined;

  jobs: Array<FormGroup> = [];
  subscriptions = new Subscription();
  form: FormGroup | undefined;
  acc: string = '';

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

        this.subscriptions.unsubscribe();

        this.jobs = jobs.map(job => {

          const form = this.creatForm(job);

          this.subscriptions.add(
            merge(
              Object.entries(form.controls).map(([key, control]) =>
                control.valueChanges
                  .pipe(
                    switchMap(value =>
                      this.jobsService.update(
                        this.acc,
                        {
                          name: job.name,
                          [key]: value
                        }
                      )
                    )
                  )
              )
            ).subscribe()
          );

          return form;
        });

        this.cdr.markForCheck();
      });
  }

  creatForm(job: Partial<Job> = {}) {
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
    })
  }

  openDialog() {
    this.form = this.creatForm();

    this.dialog.open(
      this.newJobDialog as TemplateRef<any>,
      {
        width: '800px'
      }
    )
  }

  save() {
    return () => {
      const data = this.form?.getRawValue();

      this.jobsService.create(this.acc, data)
        .pipe(
          tap(() => {
            const nForm = this.creatForm(data);

            this.subscriptions.add(
              this.connectListeners(
                data.name,
                nForm
              ).subscribe()
            );

            this.jobs.push(nForm);

            this.dialog.closeAll();
          })
        )
    }
  }

  private connectListeners(name: string, form: FormGroup) {
    return merge(
      Object.entries(form.controls).map(([key, control]) =>
        control.valueChanges
          .pipe(
            switchMap(value =>
              this.jobsService.update(
                this.acc,
                {
                  name,
                  [key]: value
                }
              )
            )
          )
      )
    );
  }
}
