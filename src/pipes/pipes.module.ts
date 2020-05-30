import { NgModule } from '@angular/core';
import { TimeAgoPipe } from './time-ago/time-ago';
import { SliceAddressPipe } from './slice-address/slice-address';
@NgModule({
	declarations: [TimeAgoPipe,
    SliceAddressPipe],
	imports: [],
	exports: [TimeAgoPipe,
    SliceAddressPipe]
})
export class PipesModule {}
