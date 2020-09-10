import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {merge, Subscription} from 'rxjs';
import {distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {METHODS} from '../../shared/consts/methods.const';
import {TIMEZONES} from '../../shared/consts/timezones.const';
import {Job} from '../../shared/interfaces/job.interface';
import {METHOD_COLORS} from '../../shared/method-colors.const';
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
export class JobsComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private jobsService: JobsService,
    private dialog: MatDialog
  ) {}

  @ViewChild('newJob', {static: true})
  newJobDialog: TemplateRef<any> | undefined;

  @ViewChild('editJob', {static: true})
  editJobDialog: TemplateRef<any> | undefined;
  editJobDialogRef: MatDialogRef<any> | undefined;

  jobs: Array<FormGroup> = [];
  subscriptions = new Subscription();
  // @ts-ignore
  form: FormGroup;
  acc: string = '';
  hasSubscriptions = false;

  methods = METHODS;
  methodColors: any = METHOD_COLORS;
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

        if (this.hasSubscriptions) {
          this.subscriptions.unsubscribe();
        }

        this.jobs = jobs.map(job => {

          const form = this.createForm(job);

          this.subscriptions.add(
            this.connectListeners(
              job.name,
              form
            )
          );

          return form;
        });

        if (this.jobs.length) {
          this.hasSubscriptions = true;
        }

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openDialog() {
    this.form = this.createForm();

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

      return this.jobsService.create(this.acc, data)
        .pipe(
          tap(() => {
            const nForm = this.createForm(data);

            this.subscriptions.add(
              this.connectListeners(
                data.name,
                nForm
              )
            );

            this.jobs.push(nForm);

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

  private connectListeners(name: string, form: FormGroup) {
    return merge(
      ...Object.entries(form.controls).map(([key, control]) =>
        control.valueChanges
          .pipe(
            distinctUntilChanged(),
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
    ).subscribe();
  }

  edit(job: FormGroup) {
    this.form = job;
    this.editJobDialogRef = this.dialog.open(
        this.editJobDialog as TemplateRef<any>,
        {
          width: '800px'
        }
    )
  }

  update() {
    return () => {
      const form = this.form.getRawValue();
      return this.jobsService.update(this.acc, form)
          .pipe(
              tap(() => {
                (this.jobs.find(job => job.get('name')?.value === form.name) as FormGroup).setValue(form);
                (this.editJobDialogRef as MatDialogRef<any>).close();
                this.cdr.markForCheck();
              })
          );
    }
  }
}
