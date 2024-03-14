import {NgModule} from '@angular/core';
import {MongoIdPipe} from './mongo-id.pipe';

@NgModule({
	exports: [MongoIdPipe],
	declarations: [MongoIdPipe]
})
export class MongoIdModule { }
