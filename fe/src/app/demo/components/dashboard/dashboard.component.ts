import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { NgxEchartsModule } from 'ngx-echarts'; // Importáld a ngx-echarts modult
import { ApexChartModule } from '../apex-chart/apex-chart.modules';
import { format } from 'date-fns';
import * as echarts from 'echarts'; 
import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexYAxis,
    ApexFill,
    ApexMarkers,
    ApexStroke,
    ApexNonAxisChartSeries
} from "ng-apexcharts";
import { BatteryDataService } from 'src/app/service/batterydataservice';
import { ApiResponse } from 'src/app/model/api.response.model';
import { BatteryData } from 'src/app/model/battery.data.model';
import * as ApexCharts from 'apexcharts';
import { Device } from 'src/app/model/device.model';
import { DeviceService } from 'src/app/service/deviceservice';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { TooltipOptions } from 'primeng/tooltip/tooltip';
import { SelectItem } from 'primeng/api';
import { type } from 'os';
//import { TooltipOptions } from 'chart.js';


export type ChartOptions = {
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart?: ApexChart;
    xaxis?: ApexXAxis | any;
    dataLabels?: ApexDataLabels | any;
    yaxis?: ApexYAxis | any;
    fill?: ApexFill | any;
    stroke?: ApexStroke | any;
    markers?: ApexMarkers | any;
    colors?: string[] | any;
    tooltip?: ApexTooltip;
};

const CHART_DELTA : number = 0.002;
const CHART_LIMIT : number = 1500;

export enum DataType {
    NONE = 'None',
    CELL_VOLTAGE = 'cellvoltage',
    TEMPERATURE = 'temperature',
    REMAIN_CAPACITY = 'remaincapacity',
    PACK_CURRENT = 'packcurrent',
    STAT = 'stat'    
};

export type Stats = {
    min: number;
    max: number;
    avg: number;
    delta: number;
};

@Component({
    templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit, OnDestroy {
    
    gaugeChartOptions1: any = {};
    gaugeChartOptions2: any = {};

    subscription!: Subscription;
    
    dataArray : any = [];
    batteryDataArray : BatteryData[] = [];
    lastBatteryData : BatteryData = {};
    averagevoltage: number = 0;
    deltaVoltage: number = 0;
    lastUpdateTime: string = "";
    devices: Device[] = [];
    device: Device = {};
    rangeDates: Date[] = [new Date(), new Date()];
    dateFrom: Date = new Date();
    dateTo: Date = new Date();
    dataTypes: SelectItem[] = [];
    dataType: string = DataType.CELL_VOLTAGE;
    
    public apexChartOptions1!: Partial<ChartOptions> | any;
    public apexChartOptions2!: Partial<ChartOptions> | any;

    constructor(
        public layoutService: LayoutService,
        private elementRef: ElementRef,
        private deviceService: DeviceService,
        private batteryDataService: BatteryDataService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        private router: Router,
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
        });

        // This is needed by this.router.navigate( ['/']); without this ngOnInit not runs on rerouting to this page
        this.router.routeReuseStrategy.shouldReuseRoute = function(){
            return false;
        }
    }

    ngOnInit() {

        this.batteryDataArray = [];
        this.lastBatteryData = {};
        this.averagevoltage = 0;
        this.deltaVoltage = 0;
        this.lastUpdateTime = "";
        this.devices = [];
        this.device = {};
        this.apexChartOptions1 = {};
        this.apexChartOptions2 = {};
        this.gaugeChartOptions1= {};
        this.gaugeChartOptions2 = {};

        this.dataTypes = [
            { label: 'Cell voltage', value: DataType.CELL_VOLTAGE },
            { label: 'Temperature', value: DataType.TEMPERATURE },
            { label: 'Remain capacity', value: DataType.REMAIN_CAPACITY /*'toltesszint'*/ }, //töltöttség
            { label: 'PACK current', value: DataType.PACK_CURRENT }, // 'toltesmerites'
            { label: 'Stat Values', value: DataType.STAT } // cella átlag, minimum, maximum, delta
        ];

        this.dataArray = [];
        for (let i = 0; i < 16; i++) {
            this.dataArray.push([]);
        }

        this.initChartOption1();
        this.initChartOption2();

        this.initDates();

        const deviceId = localStorage.getItem('device') ?? '-1';
        this.initDeviceList(parseInt(deviceId, 10));
    }

    initDates() {
        let now = new Date();
        let from: string | null = localStorage.getItem('dateFrom');
        let to: string | null = localStorage.getItem('dateTo');
        this.dateFrom = (from == null || from == 'Invalid Date') ? new Date(now) : new Date(parseInt(from));
        this.dateTo = (to == null || to == 'Invalid Date') ? new Date(now) : new Date(parseInt(to));
        
        let type: string | null = localStorage.getItem('dataType');
        this.dataType = (type == null) ? DataType.CELL_VOLTAGE : type;
    }

    setDefaultDate() {
        let now = new Date();
        this.dateFrom = new Date(now);
        this.dateTo = new Date(now);
        localStorage.setItem('dateFrom', this.dateFrom.getTime().toString());
        localStorage.setItem('dateTo', this.dateTo.getTime().toString());
    }

    initDeviceList(id: number) {
        this.deviceService.getDevicesByUser().subscribe((resp : Device[]) => {
            this.devices = resp;
            let found: boolean = false;
            for (let device of this.devices) {
                if (device.id == id) {
                    this.device = device;
                    found = true;
                    break;
                }
            }
            if (!found && this.devices.length > 0) {
                this.device = this.devices[0];
            }

            this.initApexChartData();
            this.initGaugeChartOptions();
            this.initLastData();
        });
    }

    initLastData() {
        this.batteryDataService.getLastBatteryData(this?.device?.id ?? -1).subscribe((resp : ApiResponse) => {
            if(resp?.data != null) {
                this.lastBatteryData = resp.data;
                if(this.lastBatteryData.pakfeszultseg) {
                    this.lastBatteryData.pakfeszultseg /= 100;
                }
                const voltages: number[] = [];
                if(this.lastBatteryData.cell && this.lastBatteryData.cell.length > 0) {
                    for (let i = 0; i < this?.lastBatteryData?.cell?.length; i++) {
                        voltages.push(this.lastBatteryData.cell[i]);
                    }
                }

                let sum : number = 0;
                let min : number = voltages[0];
                let max : number = voltages[0];
                for(let i = 0; i < voltages.length; i++) {
                    sum += voltages[i];
                    if(min > voltages[i]) min = voltages[i];
                    if(max < voltages[i]) max = voltages[i];
                }
                this.lastBatteryData = {...this.lastBatteryData};
                this.averagevoltage = (sum/1000) / (this.lastBatteryData.cell ? this.lastBatteryData.cell.length : 1);
                this.deltaVoltage = (max-min) /1000;
                if(this.lastBatteryData.date) this.lastUpdateTime = format(this.lastBatteryData.date, 'yyyy-MM-dd HH:mm:ss');

                this.gaugeChartOptions1.series[0].data[0].value = this.lastBatteryData.temperature ? this.lastBatteryData.temperature[5] : 0;
                this.gaugeChartOptions1.series[0].data[0].name = 'BMS Hőmérséklet';
                this.gaugeChartOptions2.series[0].data[0].value = this.lastBatteryData.temperature ? this.lastBatteryData.temperature[4] : 0;
                this.gaugeChartOptions2.series[0].data[0].name = 'Env Szenzor Hőmérséklet'
                this.gaugeChartOptions1 = {...this.gaugeChartOptions1};
                this.gaugeChartOptions2 = {...this.gaugeChartOptions2};
                
                this.zone.run(() => {
                    this.cdr.detectChanges(); // Kényszerítsük ki a Change Detection-öt a NgZone-ban belül
                });
            }
        });
    }

    setChartOptionData() {
        console.dir(this.dataArray);
        let min = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date().getTime();
        let max  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date().getTime()

        this.apexChartOptions1.series = [];
        for (let i = 0; i < this.dataArray.length; i++) {
            let name: string = '';
            switch(this.dataType) {
                case DataType.CELL_VOLTAGE:
                    name = `cell${i + 1}`;
                    break;
                case DataType.TEMPERATURE:
                    name = `temperature ${i + 1}`;
                    break;
                case DataType.REMAIN_CAPACITY:
                    name = `remain capacity`;
                    break;
                case DataType.PACK_CURRENT:
                    name = `pack current`;
                    break;
                case DataType.STAT:
                    switch (i) {
                        case 0: name = `min`; break;
                        case 1: name = `max`; break;
                        case 2: name = `delta`; break;
                        case 3: name = `avg`; break;
                    }
                    break;
            }
            this.apexChartOptions1.series.push({
                name: name,
                data: this.dataArray[i]
            });
        }

        this.apexChartOptions1 = { ...this.apexChartOptions1};

        this.apexChartOptions2 = { ...this.apexChartOptions2, ...{
            series: [
                { name: "series1", data: this.dataArray[0] },
            ],
            chart: {
                id: "chart1",
                height: 90,
                type: "area",
                brush: {
                    target: "chart2",
                    enabled: true
                },
                selection: {
                    enabled: true,
                    xaxis: {
                        min: min,
                        max: max
                    }
                }
            }
        }}

        console.log('Try to refresh');
        this.cdr.detectChanges();
        //window.dispatchEvent(new Event('resize'));
    }

    initChartOption1() {
        let min = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date(Date.now()-24*60*60*1000).getTime();
        let max  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date(Date.now()).getTime()
        this.apexChartOptions1 = { ...this.apexChartOptions1, ...{
            series: [],
            chart: {
                id: "chart2",
                type: "line",
                height: 530,
                zoom: {
                    enabled: true, // Engedélyezzük a zoom-ot
                    autoScaleYaxis: true, // Automatikus Y-tengely skála beállítás
                    zoomedArea: {
                        xaxis: {
                            min: min, // Kezdeti minimum érték
                            max: max  // Kezdeti maximum érték
                        }
                    }
                },
                toolbar: {
                    autoSelected: "zoom",
                    show: true,
                    reset: true
                },
                panning: {
                    enabled: true
                },
                events: {
                    updated: function(chartContext: any, config: any) {
                        if(config?.config?.tooltip?.x != null) {
                            config.config.tooltip.x.format = 'yyyy-MM-dd HH:mm:ss';
                        }
                    },
                    // custom function (not event)
                    findIndex : function(date : any, series : any[] ) : number {
                        let left = 0;
                        let right = series.length - 1;
                        let resultIndex = -1;
                        while (left <= right) {
                            let mid = Math.floor((left + right) / 2);
                            if (series[mid] >= date) {
                                resultIndex = mid;
                                right = mid - 1;
                            } else {
                                left = mid + 1;
                            }
                        }
                        return resultIndex;
                    },
                    // custom function (not event)
                    findMinMaxValue : function (series: any[], minIndex: number, maxIndex: number): { min: number, max: number } {
                        if (minIndex < 0 || minIndex >= series.length || maxIndex < 0 || maxIndex >= series.length || minIndex > maxIndex) {
                            throw new Error("Érvénytelen indexek. min:" + minIndex + " max:" + maxIndex + " size:" + series.length);
                        }
                    
                        let min = series[minIndex];
                        let max = series[minIndex];
                        for (let i = minIndex + 1; i <= maxIndex; i++) {
                            if (series[i] < min) {
                                min = series[i];
                            } else if (series[i] > max) {
                                max = series[i];
                            }
                        }
                        
                        return { min, max };
                    },
                    // TODO itt ki kell találni valamit hogy miért nem engedi ezt a függcényt használni
                    racalcVerticalZoom : function (chartContext: any, { xaxis }: any) {
                        const series : any[] = chartContext?.data?.twoDSeriesX;
                        const seriesY: any[] = chartContext?.data?.twoDSeries;
                        var minIndex : number = this.findIndex(new Date(xaxis?.min), series) - 1;
                        var maxIndex : number = this.findIndex(new Date(xaxis?.max), series) + 1;
                        minIndex = minIndex > 0 ? minIndex : 0;
                        maxIndex = maxIndex >= series.length ? series.length - 1 : maxIndex;
                        const minmax = this.findMinMaxValue(seriesY, minIndex, maxIndex);
                        let delta = (minmax.max - minmax.min) / 10.0;
                        delta = delta > CHART_DELTA ? delta : CHART_DELTA;
                        chartContext.updateOptions({
                            yaxis: {
                              min: minmax.min - delta * 2, // Új minimum érték
                              max: minmax.max + delta// Új maximum érték
                            }
                        });
                    },
                    /*scrolled: function(chartContext: any, { xaxis }: any) {
                        /*const series : any[] = chartContext?.data?.twoDSeriesX;
                        const seriesY: any[] = chartContext?.data?.twoDSeries;
                        var minIndex : number = this.findIndex(new Date(xaxis?.min), series) - 1;
                        var maxIndex : number = this.findIndex(new Date(xaxis?.max), series) + 1;
                        minIndex = minIndex > 0 ? minIndex : 0;
                        maxIndex = maxIndex >= series.length ? series.length - 1 : maxIndex;
                        const minmax = this.findMinMaxValue(seriesY, minIndex, maxIndex);
                        let delta = (minmax.max - minmax.min) / 10.0;
                        delta = delta > CHART_DELTA ? delta : CHART_DELTA;
                        chartContext.updateOptions({
                            yaxis: {
                              min: minmax.min - delta * 2, // Új minimum érték
                              max: minmax.max + delta// Új maximum érték
                            }
                        });
                        //this.racalcVerticalZoom(chartContext, xaxis);
                    },*/
                    /*zoomed: function(chartContext: any, { xaxis, yaxis }: any) {
                        const series : any[] = chartContext?.data?.twoDSeriesX;
                        const seriesY: any[] = chartContext?.data?.twoDSeries;
                        var minIndex : number = this.findIndex(new Date(xaxis?.min), series) - 1;
                        var maxIndex : number = this.findIndex(new Date(xaxis?.max), series) + 1;
                        minIndex = minIndex > 0 ? minIndex : 0;
                        maxIndex = maxIndex >= series.length ? series.length - 1 : maxIndex;
                        const minmax = this.findMinMaxValue(seriesY, minIndex, maxIndex);
                        let delta = (minmax.max - minmax.min) / 10.0;
                        delta = delta > CHART_DELTA ? delta : CHART_DELTA;
                        chartContext.updateOptions({
                            yaxis: {
                              min: minmax.min - delta * 2, // Új minimum érték
                              max: minmax.max + delta// Új maximum érték
                            }
                        });
                    },*/
                    /*brushScrolled: function(chartContext: any, { xaxis, yaxis }: any) {
                        console.log("brushScrolled");
                        console.dir(chartContext);
                    }*/
                }
            },
            tooltip: {
                x: {
                    format: 'MM-dd HH:mm:ss', // A dátumformátumot itt kell helyesen megadni
                    show: true,
                    formatter: function(timestamp: string | number | Date) {
                        return new Date(timestamp).toDateString();
                    }
                },
            },
            colors: [
                    "#f00",
                    "#ff5900",
                    "#f90",
                    "#ffd000",
                    "#fff700",
                    "#d4ff00",
                    "#95ff00",
                    "#2bff00",
                    "#00ff73",
                    "#00ffbf",
                    "#00eaff",
                    "#08f",
                    "#0026ff",
                    "#7300ff",
                    "#d400ff",
                    "#ff00b7",
                    "#f00",
                    "#ff5900",
                    "#f90",
                    "#ffd000",
                    "#fff700",
                    "#d4ff00",
                    "#95ff00",
                    "#2bff00",
                    "#00ff73",
                    "#00ffbf",
                    "#00eaff",
                    "#08f",
                    "#0026ff",
                    "#7300ff",
                    "#d400ff",
                    "#ff00b7",
                    "#f00",
                    "#ff5900",
                    "#f90",
                    "#ffd000",
                    "#fff700",
                    "#d4ff00",
                    "#95ff00",
                    "#2bff00",
                    "#00ff73",
                    "#00ffbf",
                    "#00eaff",
                    "#08f",
                    "#0026ff",
                    "#7300ff",
                    "#d400ff",
                    "#ff00b7",
                    "#f00",
                    "#ff5900",
                    "#f90",
                    "#ffd000",
                    "#fff700",
                    "#d4ff00",
                    "#95ff00",
                    "#2bff00",
                    "#00ff73",
                    "#00ffbf",
                    "#00eaff",
                    "#08f",
                    "#0026ff",
                    "#7300ff",
                    "#d400ff",
                    "#ff00b7"
                ],
            stroke: {
                width: 2,   // vonalvastagság
                curve: "smooth"
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                opacity: 1
            },
            markers: {
                size: 0
            },
            xaxis: {
                type: "datetime"
            },
            yaxis: {
                forceNiceScale: true,
                tickAmount: 5
            }
        }};
        this.cdr.detectChanges();
        window.dispatchEvent(new Event('resize'));
    }

    initChartOption2() {
        let minX = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date("19 Jun 2017").getTime();
        let maxX  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date("14 Aug 2017").getTime()
        this.apexChartOptions2 = { ...this.apexChartOptions2, ...{
            series: [
                //{ name: "series1", data: this.dataArray[0] },
            ],
            chart: {
                id: "chart1",
                height: 90,
                type: "area",
                brush: {
                    target: "chart2",
                    enabled: true
                },
                selection: {
                    enabled: true,
                    xaxis: {
                        min: minX,
                        max: maxX
                    }
                }
            },
            colors: ["#008FFB"],
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.91,
                    opacityTo: 0.1
                }
            },
            xaxis: {
                type: "datetime",
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                tickAmount: 5
            },
            zoom: {
                zoomedArea: {
                    // Kezdeti zoom érték beállítása
                    xaxis: {
                        min: minX, // Kezdeti minimum érték
                        max: maxX  // Kezdeti maximum érték
                    }
                }
            }
        }};
        this.cdr.detectChanges();
        window.dispatchEvent(new Event('resize'));
    }
                                
    public initApexChartData() {
        if(this.dateFrom == null ||this.dateTo == null || this.dateFrom.getTime() == this.dateTo.getTime()) {
            this.batteryDataService.getBatteryDataLimited(
                this?.device?.id ?? -1,
                CHART_LIMIT
            ).subscribe((data : BatteryData[]) => {
                this.initApexChartDataWithData(data);
                if(this.dataArray[0]?.length > 0) {
                    let now = new Date();
                    let from = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
                        ? this.dataArray[0][0][0] 
                        : now.getTime();
                    let to  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
                        ? this.dataArray[0][this.dataArray[0].length-1][0] 
                        : now.getTime();
                    this.dateFrom = from == null ? now : new Date(parseInt(from));
                    this.dateTo = to == null ? now : new Date(parseInt(to));
                }
            });
        } else {
            this.batteryDataService.getBatteryDataFromTo(
                this?.device?.id ?? -1,
                this.dateFrom,
                this.dateTo,
                CHART_LIMIT
            ).subscribe((data : BatteryData[]) => {
                this.initApexChartDataWithData(data);
            });
        }
    }

    private initApexChartDataWithData(data: BatteryData[]) {
        // TODO ide kell még egy újraméretezés:
        if(data?.length > 0) {
            this.batteryDataArray = data;
            this.dataArray = [];
            switch (this.dataType) {
                case DataType.CELL_VOLTAGE: {
                    for (let i = 0; this.batteryDataArray[0].cell != null && i < this.batteryDataArray[0]?.cell?.length; i++) {
                        this.dataArray.push([]);
                    }
                    break;
                }
    
                case DataType.TEMPERATURE:
                    for (let i = 0; this.batteryDataArray[0].temperature != null && i < this.batteryDataArray[0]?.temperature?.length; i++) {
                        this.dataArray.push([]);
                    }
                    break;

                case DataType.PACK_CURRENT:
                case DataType.REMAIN_CAPACITY:
                    this.dataArray.push([]);
                    break;
                
                case DataType.STAT:
                    this.dataArray.push([]);
                    this.dataArray.push([]);
                    this.dataArray.push([]);
                    this.dataArray.push([]);
                    break;
            }
        } else {
            for (let i = 0; i < this.dataArray.length; i++) {
                this.dataArray[i] = [];
            }
        }
        console.log('initApexChartDataWithData!!! - ' + this.dataType);
        if(data?.length > 0) {
            for(let item of this.batteryDataArray) {
                switch (this.dataType) {
                    case DataType.CELL_VOLTAGE: {
                        if (item.cell) {
                            for (let i = 0; i < item.cell.length; i++) {
                                this.dataArray[i].push([item.date, this.getChartValue(item.cell[i])]);
                            }
                        }
                        break;
                    }
                    
                    case DataType.TEMPERATURE: {
                        if (item.temperature) {
                            for (let i = 0; i < item.temperature.length; i++) {
                                this.dataArray[i].push([item.date, this.getChartTemperatureValue(item.temperature[i])]);
                            }
                        }
                        break;
                    }

                    case DataType.PACK_CURRENT:
                        this.dataArray[0].push([item.date, this.getChartValue(item.toltesmerites)]);
                        break;
                    
                    case DataType.REMAIN_CAPACITY:
                        this.dataArray[0].push([item.date, this.getChartValue(item.toltesszint)]);
                        break;

                    case DataType.STAT:
                        let stat = this.getStatValues(item.cell);
                        this.dataArray[0].push([item.date, this.getChartValue(stat.min)]); // min
                        this.dataArray[1].push([item.date, this.getChartValue(stat.max)]); // max
                        this.dataArray[2].push([item.date, this.getChartValue(stat.delta)]); // delta
                        this.dataArray[3].push([item.date, this.getChartValue(stat.avg)]); // avg
                        break;
                }
            }
        }
        //this.initChartOption1();
        //this.initChartOption2();
        this.setChartOptionData();
        // this is the MAGIC!!!
        //this.ugyletek = [...this.ugyletek];
    }

    private getChartValue(item: any) {
        if (item && typeof item === 'number') {
            return item / 1000;
        } else {
            return item;
        }
    }

    private getChartTemperatureValue(item: any) {
        if (item && typeof item === 'number') {
            return item / 10;
        } else {
            return item;
        }
    }

    private getStatValues(cells: number[] | undefined) {
        if(cells == undefined) {
            return {
                min: 0,
                max: 0,
                avg: 0,
                delta: 0
            };
        }
        
        let stat: Stats = {
            min: cells[0],
            max: cells[0],
            avg: 0,
            delta: 0
        };

        for (let cell of cells) {
            if(stat.min > cell) {
                stat.min = cell;
            }
            if(stat.max < cell) {
                stat.max = cell;
            }
            stat.avg += cell;
        }

        stat.avg = stat.avg/cells.length;
        stat.delta = stat.max - stat.min;
        return stat;
    }
                                
    public generateDayWiseTimeSeries(baseval: number, count: number, yrange: { min: any; max: any; }) {
        var i = 0;
        var series = [];
        while (i < count) {
            var x = baseval;
            var y =
            Math.floor(Math.random() * (yrange.max - yrange.min + 1)/10) + yrange.min;
            
            series.push([x, y]);
            baseval += 86400000;
            i++;
        }
        return series;
    }
    
    initGaugeChartOptions() {
        this.gaugeChartOptions1 = this.getDefaultGaugeChartOptions();
        this.gaugeChartOptions2 = this.getDefaultGaugeChartOptions();
        this.cdr.detectChanges();
    }

    getDefaultGaugeChartOptions() {
        return { // source: https://echarts.apache.org/en/option.html
            series: [
                {
                    type: 'gauge',
                    clockwise: true,
                    min: -20,
                    max: 60,
                    radius: '95%',
                    startAngle: 225, // ez a default érték hogy bal oldalon milyen szöggel kezdődjön
                    endAngle: -45,
                    splitNumber: 16, //ennyi felé osztja el min és max közötti tartományt
                    //colorBy: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
                    detail: {
                        formatter: "{value} °C" // ezzel mondom meg a mértékegység fomázását
                    },
                    data: [{ 
                        value: 42, 
                        name: 'Hőmérséklet' 
                    }],
                    axisLine: { // a külső gyűrű tulajdonságai
                        show: true, //látszik-e a külső "gyűrű" mint vonal
                        roundCap: false, // a vonal végeket lekerekítjük vagy ne
                        lineStyle: { 
                            color: (function() {
                                /*[0.7, 'green'], 'rgba(0, 255, 0)
                                [0.8, 'rgba(255, 255, 0, 0.5)'],    
                                [0.9, 'rgba(255, 128, 0)'],    
                                [1.0, 'rgba(255, 0, 0)']*/
                                var colorStops = [];
                                colorStops.push([0.7, 'rgba(117,220,117,1)']); // rgba(117,191,117)
                                for (var i = 70; i <= 100; i++) {
                                    var percent = (i - 70) / (100 - 70);
                                    var red = Math.min(Math.round(255 * percent * 2), 255);
                                    var green = Math.min(Math.round(255*2 - 255 * (percent) * 2), 255);
                                    var color = 'rgba(' + red + ',' + green + ',1)';
                                    colorStops.push([i/100, color]);
                                }
                                return colorStops;
                            })(), 
                            width: 15, // gyűrű vastagság
                            shadowColor: 'rgba(128, 255, 128, 0.8)', //árnyák színe
                            shadowBlur: 30, // árnyék szélessége
                            /*
                            shadowOffsetX , 
                            shadowOffsetY , */
                            opacity: 0.5 // az egész gyűrű átlétszósága 0-1ig
                        }
                    },
                    progress: { // 0-ból indulva egy ívet rajzol a tengelyt képező gyűrűre 
                        show : false,
                        overlap: false, // teljesen lefedi a gyűrűt vagy hagy egy hézagot
                        width: 35, // figyelmen kivül hagyja ha van overlap
                        roundCap : true, // a vonal végeket lekerekítjük vagy ne
                        clip : false,
                        //itemStyle: { color , borderColor , borderWidth , borderType , borderDashOffset , borderCap , borderJoin , borderMiterLimit , shadowBlur , shadowColor , shadowOffsetX , shadowOffsetY , opacity }
                    },
                    splitLine : { // a vastag osztások
                        show : true,
                        length : 15, //hossza
                        distance: 10, // távolság a gyűrűtől
                        //lineStyle: { color , width , type , dashOffset , cap , join , miterLimit , shadowBlur , shadowColor , shadowOffsetX , shadowOffsetY , opacity }
                    },
                    axisTick: { // kis osztások
                        show : true, 
                        splitNumber : 2, // kis osztások száma a nagyok között
                        length : 5,
                        distance :10, // távolság a gyűrűtől
                        //lineStyle : { color , width , type , dashOffset , cap , join , miterLimit , shadowBlur , shadowColor , shadowOffsetX , shadowOffsetY , opacity }
                    },
                    axisLabel: { // osztásokon a számok
                        show : true,
                        distance : 25,
                        rotate : 'tangential', // -90-+90, 'radial', 'tangential'
                        formatter : '{value}°',
                        /*color , fontStyle , fontWeight , fontFamily , fontSize , lineHeight , 
                        backgroundColor , borderColor , borderWidth , borderType , borderDashOffset ,
                        borderRadius , padding , shadowColor , shadowBlur , shadowOffsetX , shadowOffsetY,
                        width , height , textBorderColor , textBorderWidth , textBorderType , textBorderDashOffset ,
                        textShadowColor , textShadowBlur , textShadowOffsetX , textShadowOffsetY , overflow , ellipsis , rich */
                    },
                    pointer: {
                        show : true,
                        showAbove : true, //show the pointer above detail and title.
                        //icon : 'pin', // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none' It can be set to an image with 'image://http://example.website/a/b.png'
                        length: '80%',
                        width: 10,
                        // offsetCenter , 
                        // keepAspect , // ikon esetén meg tartja a képarányt
                        // itemStyle : { color , borderColor , borderWidth , borderType , borderDashOffset , borderCap , borderJoin , borderMiterLimit , shadowBlur , shadowColor , shadowOffsetX , shadowOffsetY , opacity }
                    }
                }
            ],
        };
    }
                                        
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onDeviceChange(event: any): void {
        for(var device of this.devices) {
            if (device.id === event.value) {
                localStorage.setItem('device', device.id == null ? '' : device.id?.toString());
                this.setDefaultDate();
                this.router.navigate( ['/']);
                // mindent is újra betölt reloadol!!! JOLY JOKER!!! 
                //location.reload();
                break;
            }
        }
    }

    onGetDataButton(event: any): void {
        localStorage.setItem('dateFrom', this.dateFrom.getTime().toString());
        localStorage.setItem('dateTo', this.dateTo.getTime().toString());
        this.router.navigate( ['/']);
    }

    onDataTypeChange(event: any): void {
        localStorage.setItem('dataType', this.dataType);
        this.router.navigate( ['/']);
    }
}    