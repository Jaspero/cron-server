import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {ConfirmationOptions} from '../components/confirmation/confirmation-options.interface';
import {ConfirmationComponent} from '../components/confirmation/confirmation.component';
import {GLOBALS} from '../consts/globals.const';

export function confirmation(
  pipes: any[],
  options: Partial<ConfirmationOptions> = {}
) {
  
  const dialog: MatDialog = GLOBALS.injector!.get(MatDialog);

  (dialog
    .open(ConfirmationComponent, {
      width: '400px',
      data: options
    })
    .afterClosed()
    .pipe as any)(
      filter(val => !!val),
      ...pipes
    )
    .subscribe();
}
