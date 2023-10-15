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
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipOptions } from 'primeng/tooltip/tooltip';
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
    
    public apexChartOptions1!: Partial<ChartOptions> | any;
    public apexChartOptions2!: Partial<ChartOptions> | any;

    constructor(
        public layoutService: LayoutService,
        private elementRef: ElementRef,
        private deviceService: DeviceService,
        private batteryDataService: BatteryDataService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
        });
    }

    ngOnInit() {

        this.dataArray = [];
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

        this.dataArray = [];
        for (let i = 0; i < 16; i++) {
            this.dataArray.push([]);
        }

        this.initChartOption1();
        this.initChartOption2();

        this.route.params.subscribe(params => {
            const productId = params['id'];
            this.initDeviceList(productId);
        });
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
                if (this.lastBatteryData.c1) voltages.push(this.lastBatteryData.c1);
                if (this.lastBatteryData.c2) voltages.push(this.lastBatteryData.c2);
                if (this.lastBatteryData.c3) voltages.push(this.lastBatteryData.c3);
                if (this.lastBatteryData.c4) voltages.push(this.lastBatteryData.c4);
                if (this.lastBatteryData.c5) voltages.push(this.lastBatteryData.c5);
                if (this.lastBatteryData.c6) voltages.push(this.lastBatteryData.c6);
                if (this.lastBatteryData.c7) voltages.push(this.lastBatteryData.c7);
                if (this.lastBatteryData.c8) voltages.push(this.lastBatteryData.c8);
                if (this.lastBatteryData.c9) voltages.push(this.lastBatteryData.c9);
                if (this.lastBatteryData.c10) voltages.push(this.lastBatteryData.c10);
                if (this.lastBatteryData.c11) voltages.push(this.lastBatteryData.c11);
                if (this.lastBatteryData.c12) voltages.push(this.lastBatteryData.c12);
                if (this.lastBatteryData.c13) voltages.push(this.lastBatteryData.c13);
                if (this.lastBatteryData.c14) voltages.push(this.lastBatteryData.c14);
                if (this.lastBatteryData.c15) voltages.push(this.lastBatteryData.c15);
                if (this.lastBatteryData.c16) voltages.push(this.lastBatteryData.c16);
                let sum : number = 0;
                let min : number = voltages[0];
                let max : number = voltages[0];
                for(let i = 0; i < voltages.length; i++) {
                    sum += voltages[i];
                    if(min > voltages[i]) min = voltages[i];
                    if(max < voltages[i]) max = voltages[i];
                }
                this.lastBatteryData = {...this.lastBatteryData};
                this.averagevoltage = (sum/16/1000);
                this.deltaVoltage = (max-min) /1000;
                if(this.lastBatteryData.date) this.lastUpdateTime = format(this.lastBatteryData.date, 'yyyy-MM-dd HH:mm:ss');

                this.gaugeChartOptions1.series[0].data[0].value = this.lastBatteryData.bmshomerseklet;
                this.gaugeChartOptions1.series[0].data[0].name = 'BMS Hőmérséklet';
                this.gaugeChartOptions2.series[0].data[0].value = this.lastBatteryData.szenzorho1;
                this.gaugeChartOptions2.series[0].data[0].name = '1. Szenzor Hőmérséklet'
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
            : new Date("19 Jun 2017").getTime();
        let max  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date("14 Aug 2017").getTime()

        this.apexChartOptions1 = { ...this.apexChartOptions1, ...{
            series: [
                { name: "c1", data: this.dataArray[0] },
                { name: "c2", data: this.dataArray[1] },
                { name: "c3", data: this.dataArray[2] },
                { name: "c4", data: this.dataArray[3] },
                { name: "c5", data: this.dataArray[4] },
                { name: "c6", data: this.dataArray[5] },
                { name: "c7", data: this.dataArray[6] },
                { name: "c8", data: this.dataArray[7] },
                { name: "c9", data: this.dataArray[8] },
                { name: "c10", data: this.dataArray[9] },
                { name: "c11", data: this.dataArray[10] },
                { name: "c12", data: this.dataArray[11] },
                { name: "c13", data: this.dataArray[12] },
                { name: "c14", data: this.dataArray[13] },
                { name: "c15", data: this.dataArray[14] },
                { name: "c16", data: this.dataArray[15] },
            ],
            /*chart: {
                zoom: {
                    zoomedArea: {
                        xaxis: {
                            min: min, // Kezdeti minimum érték
                            max: max  // Kezdeti maximum érték
                        }
                    }
                },
            }*/
        }}

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

        this.cdr.detectChanges();
        //window.dispatchEvent(new Event('resize'));
    }

    initChartOption1() {
        let min = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][0][0] 
            : new Date("19 Jun 2017").getTime();
        let max  = this.dataArray[0]?.length > 0 && this.dataArray[0][0].length > 0 
            ? this.dataArray[0][this.dataArray[0].length-1][0] 
            : new Date("14 Aug 2017").getTime()
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
                    //format: 'MM-dd HH:mm:ss', // A dátumformátumot itt kell helyesen megadni
                    show: true,
                    format: "dd MMM yyyy",
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
                    "#ff00b7"
                ],
            stroke: {
                width: 1,
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
                                
    public onApexLabelClick() {
    }
    
    public initApexChartData() {
        this.batteryDataService.getBatteryDataLimited(this?.device?.id ?? -1, CHART_LIMIT).subscribe((resp : ApiResponse) => {
            for (let i = 0; i < this.dataArray.length; i++) {
                this.dataArray[i] = [];
            }
            if(resp?.data?.length > 0) {
                this.batteryDataArray = resp.data;
                for(let item of this.batteryDataArray) {
                    this.dataArray[0].push([item.date, this.getChartValue(item.c1)]);
                    this.dataArray[1].push([item.date, this.getChartValue(item.c2)]);
                    this.dataArray[2].push([item.date, this.getChartValue(item.c3)]);
                    this.dataArray[3].push([item.date, this.getChartValue(item.c4)]);
                    this.dataArray[4].push([item.date, this.getChartValue(item.c5)]);
                    this.dataArray[5].push([item.date, this.getChartValue(item.c6)]);
                    this.dataArray[6].push([item.date, this.getChartValue(item.c7)]);
                    this.dataArray[7].push([item.date, this.getChartValue(item.c8)]);
                    this.dataArray[8].push([item.date, this.getChartValue(item.c9)]);
                    this.dataArray[9].push([item.date, this.getChartValue(item.c10)]);
                    this.dataArray[10].push([item.date, this.getChartValue(item.c11)]);
                    this.dataArray[11].push([item.date, this.getChartValue(item.c12)]);
                    this.dataArray[12].push([item.date, this.getChartValue(item.c13)]);
                    this.dataArray[13].push([item.date, this.getChartValue(item.c14)]);
                    this.dataArray[14].push([item.date, this.getChartValue(item.c15)]);
                    this.dataArray[15].push([item.date, this.getChartValue(item.c16)]);
                }
            }
            //this.initChartOption1();
            //this.initChartOption2();
            this.setChartOptionData();
            // this is the MAGIC!!!
            //this.ugyletek = [...this.ugyletek];
        });
    }

    private getChartValue(item: any) {
        if (item && typeof item === 'number') {
            return item / 1000;
        } else {
            return item;
        }
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
                
                /*this.device = device;
                this.initApexChartData();
                this.initGaugeChartOptions();
                this.initLastData();
                this.cdr.detectChanges();*/
                this.router.navigate(['/' + device.id]);
                break;
            }
        }
    }
}
                                    