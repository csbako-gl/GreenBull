import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, NgZone, AfterViewInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
//import { ApexChartModule } from '../apex-chart/apex-chart.modules';
import { format } from 'date-fns';
//import * as echarts from 'echarts'; 
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
import { Router } from '@angular/router';
//import { type } from 'os';
import { CHART_COLORS } from 'src/app/demo/components/dashboard/dashboard.component.chart.color';
import * as echarts from 'echarts/types/dist/echarts';


export type ChartOptions = {
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart?: ApexChart;
    xaxis?: ApexXAxis | any;
    dataLabels?: ApexDataLabels | any;
    yaxis?: ApexYAxis | any;
    fill?: ApexFill | any;
    stroke?: ApexStroke | any;
    markers?: ApexMarkers | any;
    tooltip?: ApexTooltip;
    colors?: string[] | any;
};

const CHART_DELTA : number = 0.002;
const CHART_LIMIT : number = 1500;

export enum DataType {
    NONE = 'None',
    CELL_VOLTAGE = 'cellvoltage',
    TEMPERATURE = 'temperature',
    REMAIN_CAPACITY = 'remaincapacity',
    PACK_CURRENT = 'packcurrent',
    STAT = 'stat',
    DELTA = 'delta'
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

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
    
    gaugeChartOptions1: any;
    gaugeChartOptions2: any;

    subscription!: Subscription;
    
    dataArray : any = [];
    batteryDataArray : BatteryData[] = [];
    lastBatteryData : BatteryData = {id : 0, deviceId : 0, cell : [], temperature : [], date : new Date()};
    averagevoltage: number = 0;
    deltaVoltage: number = 0;
    lastUpdateTime: string = "";
    devices: Device[] = [];
    device: Device = {};
    dateFrom: Date = new Date();
    dateTo: Date = new Date();
    dataTypes: any[] = [];
    curveTypes: any[] = [];
    dataType: string = DataType.CELL_VOLTAGE;
    apexChart1?: ApexCharts;
    cellCount: number = 0;
    initialized : boolean = false;
    curveType: string = 'smooth';
    
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
        /*this.router.routeReuseStrategy.shouldReuseRoute = function(){
            return false;
        }*/
    }

    ngOnInit() {
        console.log("ngOnInit");
        this.batteryDataArray = [];
        this.averagevoltage = 0;
        this.deltaVoltage = 0;
        this.lastUpdateTime = "";
        this.devices = [];
        this.device = {};

        this.dataTypes = [
            { label: 'Cell voltage', value: DataType.CELL_VOLTAGE },
            { label: 'Temperature', value: DataType.TEMPERATURE },
            { label: 'Remain capacity', value: DataType.REMAIN_CAPACITY /*'toltesszint'*/ }, //töltöttség
            { label: 'PACK current', value: DataType.PACK_CURRENT }, // 'toltesmerites'
            { label: 'Stat Values', value: DataType.STAT }, // cella átlag, minimum, maximum, delta
            { label: 'Max Delta voltage', value: DataType.DELTA }
        ];

        this.curveTypes = [
            { label: 'stepline', value: 'stepline' },
            { label: 'straight', value: 'straight' },
            { label: 'smooth', value: 'smooth'}
        ];

        this.dataArray = [];
        for (let i = 0; i < 16; i++) {
            this.dataArray.push([]);
        }

        console.log("initChartOption1");
        this.initChartOption1();
        console.log("initChartOption2");
        this.initChartOption2();

        console.log("initDates");
        this.initDates();

        // TODO ez itt csak egy elkeseredett kisérlet, de sajnos valami nem jó
        /*let myElement = document.getElementById('mychart');
        if (myElement !== null) {
            console.log("myElement");
            let myChart1 = echarts.init(myElement);
            myChart1.setOption(this.gaugeChartOptions1, true);
        }*/
    }

    ngAfterViewInit() {
        console.log("ngAfterViewInit");
        const deviceId = localStorage.getItem('device') ?? '-1';
        this.initDeviceList(parseInt(deviceId, 10));
        this.cdr.detectChanges();


        /*if (this.apexChart1) {
            this.apexChart1?.destroy();
        }
        this.apexChart1 = new ApexCharts(document.querySelector("#chart1"), this.apexChartOptions1);
        this.apexChart1.render();*/
        //this.apexChart1.resetSeries();

        this.initialized = true;
        console.log("ngAfterViewInit end");
    }

    startUpdateTimer() {
        setTimeout(() => {
            this.checkDataChangesInDb();
            this.startUpdateTimer(); // Rekurzív hívás az időzítő újra beállításához
        }, 10000); // 10000 ms = 10 másodperc    }
    }

    checkDataChangesInDb() {
        if (this.initialized == false) {
            return;
        }
        console.log("checkDataChangesInDb");

        this.initLastData();
        this.updateChartWithLastValues();
    }

    updateChartWithLastValues() {
        this.batteryDataService.getBatteryDataFrom(
            this?.device?.id ?? -1,
            this.dateTo,
            CHART_LIMIT
        ).subscribe((data : BatteryData[]) => {
            console.log("updateChartWithLastValues:");
            console.log("this.dateTo before:", data, this.dateTo);
            if (data.length > 20 || data.length == 0) {
                return;
            }

            for(let item of data) {
                if (this.batteryDataArray[this.batteryDataArray.length - 1].date.getTime() < item.date?.getTime()) {
                    this.batteryDataArray.push(item);
                    this.addBatteryDataToDataArray(item);
                    this.dataArray = [...this.dataArray];
                }
            }

            console.log("this.dateTo after --- :", this.batteryDataArray[this.batteryDataArray.length - 1]);
            this.dateTo = new Date(this.batteryDataArray[this.batteryDataArray.length - 1].date);
            console.log("this.dateTo after:", this.dateTo);
            this.dateTo = {...this.dateTo};

            //this.initApexChartDataWithData(data);
            // TODO
        });
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
                if (device.id === id) {
                    this.device = {...device};
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
            this.startUpdateTimer();
        });
    }

    initLastData() {
        this.batteryDataService.getLastBatteryData(this?.device?.id ?? -1).subscribe((resp : ApiResponse) => {
            if(resp?.data != null) {
                this.lastBatteryData = resp.data;
                if(this.lastBatteryData.packTotal) {
                    this.lastBatteryData.packTotal = parseFloat((this.lastBatteryData.packTotal /= 1000).toFixed(2));
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
                
                this.averagevoltage = parseFloat(((sum/1000) / (this.lastBatteryData.cell ? this.lastBatteryData.cell.length : 1)).toFixed(3));
                this.deltaVoltage = (max-min);
                if(this.lastBatteryData.date) this.lastUpdateTime = format(this.lastBatteryData.date, 'yyyy-MM-dd HH:mm:ss');

                this.gaugeChartOptions1.series[0].data[0].value = this.lastBatteryData?.temperature ? this.lastBatteryData.temperature[5] / 10 : 0;
                this.gaugeChartOptions1.series[0].data[1].value = this.lastBatteryData?.temperature ? this.lastBatteryData.temperature[4] / 10 : 0;
                this.gaugeChartOptions2.series[0].data[0].value = this.lastBatteryData?.packCurrent ? this.lastBatteryData.packCurrent / 100 : 0;

                // TODO lehet hogy ez nem kell ide, de ezzel sem és enélkül sem működik
                this.gaugeChartOptions2.series[0] = {...this.gaugeChartOptions2.series[0]};
                this.gaugeChartOptions1.series[0] = {...this.gaugeChartOptions1.series[0]};
                //TODO this.cdr.detectChanges();

                //console.dir(this.lastBatteryData);
                //console.log('Amper: ' + this.gaugeChartOptions2.series[0].data[0].value);

                if (this.lastBatteryData.cell) {
                    this.cellCount =  this.lastBatteryData.cell?.length;
                }                

                // ezt itt nem szabad használni, mert akkor azt hiszi hogy újra akarom inicializálni és szépen warningol, de nagyon
                //this.gaugeChartOptions1 = {...this.gaugeChartOptions1};
                //this.gaugeChartOptions2 = {...this.gaugeChartOptions2};
            }
        });
    }

    setChartOptionData() {
        let minX : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date().getTime();
        let maxX : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
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
                case DataType.DELTA: 
                    name = `delta`; 
                    break;
                case DataType.STAT:
                    switch (i) {
                        case 0: name = `min`; break;
                        case 1: name = `max`; break;
                        case 2: name = `avg`; break;
                    }
                    break;
            }
            this.apexChartOptions1.series.push({
                name: name,
                data: this.dataArray[i]
            });
        }

        this.apexChartOptions2.series = [];
        this.apexChartOptions2.series.push({
            name: "data",
            data: this.dataArray[0]
        });

        this.apexChartOptions2.chart.selection.xaxis = {
            min: minX,
            max: maxX
        };

        this.apexChartOptions1.chart.selection.xaxis = {
            min: minX,
            max: maxX
        };

        this.apexChartOptions1.chart = JSON.parse(JSON.stringify(this.apexChartOptions1.chart));
        this.apexChartOptions1.tooltip.x.format = 'yyyy-MM-dd HH:mm:ss';
        this.apexChartOptions1.tooltip.enabled = true;
        this.apexChartOptions1.tooltip.x = JSON.parse(JSON.stringify(this.apexChartOptions1.tooltip.x));
        this.apexChartOptions2.chart = JSON.parse(JSON.stringify(this.apexChartOptions2.chart));

        /* TODO ezzel a felső jelenik meg
        this.apexChartOptions2.chart.selection.xaxis = { ...this.apexChartOptions2.chart.selection.xaxis};
        this.apexChartOptions1.chart.selection.xaxis = { ...this.apexChartOptions1.chart.selection.xaxis};
        this.apexChartOptions2.xaxis = { ...this.apexChartOptions2.xaxis};
        this.apexChartOptions1.xaxis = { ...this.apexChartOptions1.xaxis};
        */
        
        //this.apexChartOptions2.series = { ...this.apexChartOptions2.series};
        /*this.apexChartOptions2.chart.selection.enabled = true;
        this.apexChartOptions2 = { ...this.apexChartOptions2};
        this.apexChartOptions2.chart.selection.xaxis = { ...this.apexChartOptions2.chart.selection.xaxis};
        this.apexChartOptions2.chart = { ...this.apexChartOptions2.chart};
        this.apexChartOptions2.xaxis = { ...this.apexChartOptions2.xaxis};*/

        //window.dispatchEvent(new Event('resize'));
    }

    initChartOption1() {
        let min : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date(Date.now()-24*60*60*1000).getTime();
        let max : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date(Date.now()).getTime()
        this.apexChartOptions1 = { //...this.apexChartOptions1, ...{
            series: [],
            chart: {
                id: "chart1",
                type: "line",
                height: 530,
                animations: {
                    enabled : false,
                    dynamicAnimation: false,
                },
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
                selection: {
                    enabled: true,
                    xaxis: {
                        min: 0,
                        max: 0
                    }
                },
                events: {
                    mounted: function(chartContext: any, config: any) {
                        console.log("mounted", chartContext, config);
                        if(config?.config?.tooltip?.x != null) {
                            //console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                            config.config.tooltip.x.format = 'yyyy-MM-dd HH:mm:ss';
                            config.config.tooltip.enabled = true;
                            config.config.tooltip.formatter = function(timestamp: string | number | Date) {
                                //console.log("DDDDDDDDDDDDDDDDDDD");
                                return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                            };
                            config.config.tooltip = { ...config.config.tooltip};
                        }
                    },
                    updated: function(chartContext: any, config: any) {
                        console.log('updated1:', chartContext, config);
                    },
                    zoomed: function(chartContext: any, { xaxis, yaxis }: any) {
                        console.log('zoomed1:', chartContext, xaxis);
                    }
                    /*updated: function(chartContext: any, config?: any): void {
                        console.log("updated", chartContext, config);
                        if(config?.config?.tooltip?.x != null) {
                            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                            config.config.tooltip.x.format = 'yyyy-MM-dd HH:mm:ss';
                            config.config.tooltip.enabled = true;
                            config.config.tooltip.formatter = function(timestamp: string | number | Date) {
                                console.log("DDDDDDDDDDDDDDDDDDD");
                                return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                            };
                            config.config.tooltip = { ...config.config.tooltip};
                        }
                    }*/
                }
            },
            tooltip: {
                enabled: true,
                x: {
                    format: 'yyyy-MM-dd HH:mm:ss', // A dátumformátumot itt kell helyesen megadni
                    show: true,
                    formatter: function(timestamp: string | number | Date) {
                        //console.log("OOOOOOOOOOOOOOOOOOOOO");
                        return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                    }
                },
            },
            colors: CHART_COLORS,
            stroke: {
                width: 2,   // vonalvastagság
                curve: this.curveType   // stepline, straight, smooth
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
                type: "datetime",
                labels: {
                    datetimeUTC: false,
                },
                tooltip: {
                    enabled: true,
                    formatter: function(timestamp: string | number | Date) {
                        return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                    }
                }
            },
            yaxis: {
                forceNiceScale: true,
                tickAmount: 5
            }
        };
    }

    initChartOption2() {
        let minX : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0
            ? this.dataArray[0][0][0] 
            : new Date("19 Jun 2017").getTime();
        let maxX : number = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date("14 Aug 2017").getTime()
        this.apexChartOptions2 = { //...this.apexChartOptions2, ...{ 
            series: [],
            chart: {
                id: "chart2",
                height: 90,
                type: "area",
                brush: {
                    target: "chart1",
                    enabled: true
                },
                animations: {
                    enabled : false,
                    dynamicAnimation: false,
                },
                selection: {
                    enabled: true,
                    xaxis: {
                        min: minX,
                        max: maxX
                    }
                },
                events: {
                    selection: function(chartContext: any, { xaxis, yaxis }: any) {
                        console.log('selection:', chartContext, xaxis, yaxis);
                    },
                    updated: function(chartContext: any, config: any) {
                        console.log('updated2:', chartContext, config);
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
                },
                labels: {
                    datetimeUTC: false,
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
        };
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
                case DataType.DELTA:
                    this.dataArray.push([]);
                    break;
                
                case DataType.STAT:
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

        if(data?.length > 0) {
            for(let item of this.batteryDataArray) {
                this.addBatteryDataToDataArray(item);
            }
        }

        this.setChartOptionData();
    }

    private addBatteryDataToDataArray(item: BatteryData) {
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
                this.dataArray[0].push([item.date, this.getPackCurrentValue(item.packCurrent).toFixed(2)]);
                break;
            
            case DataType.REMAIN_CAPACITY:
                this.dataArray[0].push([item.date, this.getPackCurrentValue(item.packRemain).toFixed(2)]);
                break;

            case DataType.DELTA:
                let statDelta = this.getStatValues(item.cell);
                this.dataArray[0].push([item.date, this.getChartValue(statDelta.delta)]); // delta
                break;

            case DataType.STAT:
                let stat = this.getStatValues(item.cell);
                this.dataArray[0].push([item.date, this.getChartValue(stat.min)]); // min
                this.dataArray[1].push([item.date, this.getChartValue(stat.max)]); // max
                this.dataArray[2].push([item.date, this.getChartValue(stat.avg)]); // avg
                break;
        }
    }

    private getChartValue(item: any) {
        if (item && typeof item === 'number') {
            return item / 1000;
        } else {
            return item;
        }
    }

    private getPackCurrentValue(item: any) {
        if (item && typeof item === 'number') {
            return item / 100;
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
        this.gaugeChartOptions1.series[0].data[0] = {
            value: 10.5,
            name: 'Environment',
            title: {
                offsetCenter: ['40%', '80%']
              },
              detail: {
                offsetCenter: ['40%', '95%']
              }
        };
        this.gaugeChartOptions1.series[0].data.push({
            value: 10.5,
            name: 'BMS',
            title: {
                offsetCenter: ['-40%', '80%']
            },
            detail: {
                offsetCenter: ['-40%', '95%']
            }
        });

        console.log("gaugeChartOptions2 init");
        this.gaugeChartOptions2 = this.getDefaultGaugeChartOptions();
        this.gaugeChartOptions2.series[0].data[0] = {
            value: 0,
            name: 'PACK current',
            title: {
                offsetCenter: ['0%', '80%']
              },
              detail: {
                offsetCenter: ['0%', '95%']
              }
        };
        this.gaugeChartOptions2.series[0].min = -50;
        this.gaugeChartOptions2.series[0].max = 50;
        this.gaugeChartOptions2.series[0].splitNumber = 20;
        this.gaugeChartOptions2.series[0].detail.formatter = "{value} A";
        this.gaugeChartOptions2.series[0].axisLabel.formatter = "{value} A";
        let colors: any [] = []; 
        let percent = 0;
        for(let i = this.gaugeChartOptions2.series[0].axisLine.lineStyle.color.length-1; i >= 0; i--) {
            colors.push([1-this.gaugeChartOptions2.series[0].axisLine.lineStyle.color[i][0], this.gaugeChartOptions2.series[0].axisLine.lineStyle.color[i][1]]);
        }
        for(let i = 0; i < this.gaugeChartOptions2.series[0].axisLine.lineStyle.color.length; i++) {
            colors.push([this.gaugeChartOptions2.series[0].axisLine.lineStyle.color[i][0], this.gaugeChartOptions2.series[0].axisLine.lineStyle.color[i][1]]);
        }
        this.gaugeChartOptions2.series[0].axisLine.lineStyle.color;
        this.gaugeChartOptions2.series[0].axisLine.lineStyle.color = colors;
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
                        },
                    ],
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
        if(this.initialized == false || event?.originalEvent == undefined) {
            console.log("onDeviceChange: not initialized!");
            //console.trace();
            return;
        }
        for(var device of this.devices) {
            if (device.id === event.value) {
                console.log("selected device: ", device.id);
                localStorage.setItem('device', device.id == null ? '' : device.id?.toString());
                this.setDefaultDate();
                this.device = {...device};
                this.refreshDashboard();
                // mindent is újra betölt reloadol!!! JOLY JOKER!!! 
                location.reload();
                break;
            }
        }
    }

    refreshDashboard() {
        if(this.initialized == false) {
            return;            
        }
        this.router.navigate( ['/']);
    }

    onGetDataButton(event: any): void {
        localStorage.setItem('dateFrom', this.dateFrom.getTime().toString());
        localStorage.setItem('dateTo', this.dateTo.getTime().toString());
        this.refreshDashboard();
        location.reload();
    }
    
    onDataTypeChange(event: any): void {
        if(this.initialized == false || event?.originalEvent == undefined) {
            console.log("onDeviceChange: not initialized!");
            return;
        }
        localStorage.setItem('dataType', this.dataType);
        //this.refreshDashboard();
        // mindent is újra betölt reloadol!!! JOLY JOKER!!! 
        location.reload();
    }

    onCurveTypeChange(event : any): void {
        if(this.initialized == false || event?.originalEvent == undefined) {
            return;
        }
        console.log('onCurveTypeChange: ', this.curveType);
        this.apexChartOptions1.stroke = {...this.apexChartOptions1.stroke, ...{curve :  this.curveType}}

        //location.reload();
    }
}    

function sleep(milliseconds: number) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < milliseconds) {
        // Blokkolja a futást
    }
}
