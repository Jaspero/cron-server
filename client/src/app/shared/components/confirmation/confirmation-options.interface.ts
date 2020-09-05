import {ThemePalette} from '@angular/material/core';

export interface ConfirmationOptions {
  confirm: string;
  negate: string;
  header: string;
  description?: string;
  color?: ThemePalette;
  variables?: any;
}
