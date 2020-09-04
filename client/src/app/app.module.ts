import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoadClickModule} from '@jaspero/ng-helpers';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccountsComponent} from './pages/accounts/accounts.component';
import {JobsComponent} from './pages/jobs/jobs.component';
import {LoginComponent} from './pages/login/login.component';
import {ResponsesComponent} from './pages/responses/responses.component';
import {InterceptorService} from './shared/services/interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AccountsComponent,
    JobsComponent,
    ResponsesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,

    /**
     * Material
     */
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatDialogModule,

    /**
     * Ng Helpers
     */
    LoadClickModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: InterceptorService,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
