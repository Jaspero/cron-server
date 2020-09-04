import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ResponsesService} from './responses.service';

@Component({
  selector: 'cc-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResponsesService]
})
export class ResponsesComponent implements OnInit {
  constructor(
    private responsesService: ResponsesService
  ) { }

  ngOnInit() {
  }

}
