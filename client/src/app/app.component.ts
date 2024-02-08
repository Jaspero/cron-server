import {HttpClientModule} from '@angular/common/http';
import {Component, Injector} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterOutlet} from '@angular/router';
import {GLOBALS} from './shared/consts/globals.const';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,

    MatDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    private injector: Injector
  ) {
    GLOBALS.injector = this.injector;
  }
}
