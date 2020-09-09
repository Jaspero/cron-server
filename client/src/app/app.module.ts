import {APP_BASE_HREF} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule, MatCardTitleGroup} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccountsComponent} from './pages/accounts/accounts.component';
import {JobsComponent} from './pages/jobs/jobs.component';
import {LoginComponent} from './pages/login/login.component';
import {ResponsesComponent} from './pages/responses/responses.component';
import {ConfirmationComponent} from './shared/components/confirmation/confirmation.component';
import {JsonEditorComponent} from './shared/components/json-editor/json-editor.component';
import {MongoIdPipe} from './shared/pipes/mongo-id.pipe';
import {InterceptorService} from './shared/services/interceptor.service';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatGridListModule} from "@angular/material/grid-list";

@NgModule({
  declarations: [
    AppComponent,

    /**
     * Pages
     */
    LoginComponent,
    AccountsComponent,
    JobsComponent,
    ResponsesComponent,

    JsonEditorComponent,
    ConfirmationComponent,
    MongoIdPipe
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
    MatSelectModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatChipsModule,
    MatToolbarModule,
    MatGridListModule,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
