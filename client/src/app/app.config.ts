import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {APP_BASE_HREF} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {environment} from '../environments/environment';
import {routes} from './app.routes';
import {InterceptorService} from './shared/services/interceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),

    {
      provide: HTTP_INTERCEPTORS,
      useExisting: InterceptorService,
      multi: true
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      }
    },
    {
      provide: APP_BASE_HREF,
      useValue: environment.baseHref
    }
  ]
};
