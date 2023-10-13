import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: DashboardComponent },
        { path: ':id', component: DashboardComponent, data: { defaultId: '-1' } }
    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
