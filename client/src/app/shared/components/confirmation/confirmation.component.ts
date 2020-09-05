import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ConfirmationOptions} from './confirmation-options.interface';

@Component({
  selector: 'cc-confrimation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public inputOptions: Partial<ConfirmationOptions>
  ) {
    this.options = {
      ...this.defaultOptions,
      ...(this.inputOptions || {})
    };
  }

  defaultOptions: ConfirmationOptions = {
    header: '',
    confirm: 'Yes',
    negate: 'No',
    color: 'warn',
    variables: {}
  };

  options: ConfirmationOptions;
}
