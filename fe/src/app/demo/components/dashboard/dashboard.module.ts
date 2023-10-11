import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { ApexChartModule } from '../apex-chart/apex-chart.modules';
import { ApexChartComponent } from '../apex-chart/apex-chart.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DashboardsRoutingModule,
        ApexChartModule,
        NgApexchartsModule,
        DropdownModule,
        
        NgxEchartsModule.forRoot({ echarts: () => import('echarts') }) // Hozzáadás az importálthoz
    ],
    declarations: [
        DashboardComponent,
    ]
})
export class DashboardModule { }
