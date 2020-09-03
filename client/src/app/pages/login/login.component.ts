import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {StateService} from '../../shared/services/state.service';
import {LoginService} from './login.service';

@Component({
  selector: 'cc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginService]
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
