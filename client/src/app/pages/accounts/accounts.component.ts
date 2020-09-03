import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable} from 'rxjs';
import {AccountsService} from './accounts.service';
import {Account} from '../../shared/interfaces/account.interface';

@Component({
  selector: 'cc-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AccountsService]
})
export class AccountsComponent {
  constructor(
    private accountsService: AccountsService
  ) {
    this.accounts$ = this.accountsService.list()
  }

  accounts$: Observable<Account[]>;
}
