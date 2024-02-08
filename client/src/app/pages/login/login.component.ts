import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Router} from '@angular/router';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {tap} from 'rxjs/operators';
import {StateService} from '../../shared/services/state.service';
import {LoginService} from './login.service';

@Component({
  selector: 'cc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginService],
  imports: [

    // CommonModule,
    ReactiveFormsModule,

    LoadClickModule,

    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  standalone: true
})
export class LoginComponent {
  constructor(
    private loginService: LoginService,
    private state: StateService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  form: FormGroup;

  login() {
    return () =>
      this.loginService.createToken(this.form.getRawValue())
        .pipe(
          tap(({token}) => {
            this.state.token = token;
            localStorage.setItem('token', token);
            this.router.navigate(['/accounts']);
          })
        )
  }
}
