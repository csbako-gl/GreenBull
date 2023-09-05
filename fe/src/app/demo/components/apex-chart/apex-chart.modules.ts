import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApexChartComponent} from "./apex-chart.component"
import { NgApexchartsModule } from "ng-apexcharts";
  
@NgModule({
    imports: [
        CommonModule,
        NgApexchartsModule
    ],
    declarations: [
        ApexChartComponent]
})
export class ApexChartModule { }