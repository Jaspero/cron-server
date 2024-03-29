import {ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {switchMap, tap} from 'rxjs/operators';
import {Account} from '../../shared/interfaces/account.interface';
import {confirmation} from '../../shared/utils/confirmation';
import {AccountsService} from './accounts.service';

@UntilDestroy()
@Component({
  selector: 'cc-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AccountsService],
  imports: [

    ReactiveFormsModule,
    RouterModule,

    LoadClickModule,

    MatToolbarModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatCardModule
  ],
  standalone: true
})
export class AccountsComponent {
  constructor(
    private accountsService: AccountsService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.accountsService.list()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((accounts: any[]) => {
        this.accounts = accounts;
        this.cdr.markForCheck();
      })
  }

  @ViewChild('cu', {static: true})
  cuDialog: TemplateRef<any> | undefined;

  accounts: Account[] = [];
  // @ts-ignore
  form: FormGroup;

  open(account?: Account) {
    this.form = this.createForm(account);

    this.dialog.open(
      this.cuDialog as TemplateRef<any>,
      {
        width: '500px'
      }
    )
  }

  save() {
    return () => {
      const {_id, ...data} = this.form.getRawValue();

      for (const key in data) {
        if (!data[key]) {
          delete data[key];
        }
      }

      if (_id) {
        return this.accountsService.update(_id, data)
          .pipe(
            tap(() => {
              const index = this.accounts.findIndex(it => it._id === _id);

              if (index !== -1) {
                this.accounts[index] = {
                  ...this.accounts[index],
                  ...data
                };
                this.cdr.markForCheck();
              }

              this.dialog.closeAll();
            })
          )
      } else {
        return this.accountsService.create(data)
          .pipe(
            tap(({_id}) => {
              this.accounts.push({
                ...data,
                _id
              });
              this.dialog.closeAll();
              this.cdr.markForCheck();
            })
          )
      }
    }
  }

  remove(id: string, index: number) {
    confirmation(
      [
        switchMap(() =>
          this.accountsService.delete(id)
        ),
        tap(() => {
          this.accounts.splice(index, 1);
          this.cdr.markForCheck();
        })
      ], {
      header: 'Are you sure?',
      description: 'You are about to delete an account.'
    }
    )
  }

  private createForm(account: Partial<Account> = {}) {
    return this.fb.group({
      _id: account._id,
      name: [account.name || '', Validators.required],
      description: account.description || '',
      apiKey: ['', [...account && [Validators.required]]]
    })
  }
}

