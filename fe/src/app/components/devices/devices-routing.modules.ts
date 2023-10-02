import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DevicesComponent } from './devices.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: DevicesComponent }
	])],
	exports: [RouterModule]
})
export class DevicesRoutingModule { }
