import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ConfirmationOptions} from './confirmation-options.interface';

@Component({
  selector: 'cc-confrimation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  standalone: true
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
