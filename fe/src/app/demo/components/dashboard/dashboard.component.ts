import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { NgxEchartsModule } from 'ngx-echarts'; // Importáld a ngx-echarts modult
import { ApexChartModule } from '../apex-chart/apex-chart.modules';
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
  };
  

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    
    options: any;
    
    items!: MenuItem[];
    
    products!: Product[];
    
    chartData2: any;
    
    chartOptions: any;
    pChartOptions: any;
    
    subscription!: Subscription;

    base: any;
    oneDay = 24 * 3600 * 1000;
    date: any = [];
    dataArray : any = [];

    @ViewChild("chart") chart!: ChartComponent;
    public apexChartOptions1!: Partial<ChartOptions> | any;
    public apexChartOptions2: Partial<ChartOptions> | any;


    constructor(private productService: ProductService, public layoutService: LayoutService, private elementRef: ElementRef) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
            this.initLineChartOptions();
        });

        this.apexChartOptions1 = {
            series: [
              {
                name: "series1",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              },
              {
                name: "series2",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              },
              {
                name: "series3",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              },
              {
                name: "series4",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              },
              {
                name: "series5",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              },
      
            ],
            chart: {
              id: "chart2",
              type: "line",
              height: 330,
              toolbar: {
                autoSelected: "pan",
                show: true
              }
            },
            colors: ["#546E7A", "#FF6E1A", "#006E1A", "#006E00", "#006EFF"],
            stroke: {
              width: 3,
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
            }
          };
      
          this.apexChartOptions2 = {
            series: [
              {
                name: "series1",
                data: this.generateDayWiseTimeSeries(
                  new Date("11 Feb 2017").getTime(),
                  185,
                  {
                    min: 30,
                    max: 90
                  }
                )
              }
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
                  min: new Date("19 Jun 2017").getTime(),
                  max: new Date("14 Aug 2017").getTime()
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
              tickAmount: 2
            }
          };
    }

    ngOnInit() {
        this.initChart();
        this.productService.getProductsSmall().then(data => this.products = data);
        
        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];

        this.initGaugeChartOptions();
        this.initLineChartOptions();
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

    initLineChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // documentation: https://echarts.apache.org/en/option.html#color
        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                position: function (pt: any[]) {
                    return [pt[0], '10%'];
                },
            },
            title: {
                left: 'center',
                text: 'Large Area Chart',
                textStyle: {
                    color: textColor
                }                
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                nameTextStyle: {
                    color: textColor
                },
                data: this.date
            },
            axisLine: {
                lineStyle: { color: 'red' }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                nameTextStyle: {
                    color: 'red'
                },
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 10
                },
                {
                    start: 0,
                    end: 10
                }
            ],
            series: []
        };

        this.initLineChartData();
    }

    initLineChartData() {
        this.base = +new Date(1968, 9, 3);
        this.oneDay = 24 * 3600 * 1000;

        for (let i = 1; i < 20000; i++) {
            const now = new Date((this.base += this.oneDay));
            this.date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
        }
        for (let dataSet = 0; dataSet < 5; dataSet++) {
            const data = [Math.random() * 300];
            for (let i = 1; i < 20000; i++) {
                data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
            }
            this.dataArray.push(data);

            this.chartOptions.series.push(
                {
                    name: 'Fake Data ' + dataSet,
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'lttb',
                    data: this.dataArray[this.dataArray.length-1]
                }
            );
        }
    }

    onDiagramLabelClick() {
        const data = [Math.random() * 300];

        for (let i = 1; i < 20000; i++) {
            data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
        }

        this.dataArray.push(data);

        this.chartOptions.series.push(
            {
                name: 'Fake Data x',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'lttb',
                data: this.dataArray[this.dataArray.length-1]
            });

        
        const chartContainer = this.elementRef.nativeElement.querySelector('#chart-container');
        if(chartContainer) {
            const chart = echarts.getInstanceByDom(chartContainer);
            chart?.setOption(this.chartOptions);
        }

        /*
        var chartDom = document.getElementById('chart-container')!;
        var myChart = echarts.init(chartDom, 'dark');
        myChart.setOption(this.chartOptions);
        */
    }

    initGaugeChartOptions() {
        this.options = { // source: https://echarts.apache.org/en/option.html
            series: [
                {
                    type: 'gauge',
                    clockwise: true,
                    min: 40,
                    max: 200,
                    radius: '95%',
                    startAngle: 225, // ez a default érték hogy bal oldalon milyen szöggel kezdődjön
                    endAngle: -45,
                    splitNumber: 16, //ennyi felé osztja el min és max közötti tartományt
                    //colorBy: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
                    detail: {
                        formatter: "{value}W" // ezzel mondom meg a mértékegység fomázását
                    },
                    data: [{ 
                        value: 150, 
                        name: 'Energy' 
                    }],
                    axisLine: { // a külső gyűrű tulajdonságai
                        show: true, //látszik-e a külső "gyűrű" mint vonal
                        roundCap: true, // a vonal végeket lekerekítjük vagy ne
                        lineStyle: { 
                            color: [
                                [0.1, 'rgba(255, 0, 0, 0.5)'], // 0~10% is red
                                [0.2, 'rgba(255, 128, 0, 0.5)'],  
                                [0.3, 'rgba(255, 255, 0, 0.5)'],  
                                [0.3, 'rgba(0, 0, 255, 0.5)'],  
                                [1.0, 'green'], 
                            ], 
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
                        formatter : '{value}A', 
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
    
    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        
        this.chartData2 = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Cella 1 eltérések',
                    data: [6, 9, 8, 1, 5, 5, 4, 6, 9, 10, 8, 5],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Cella 2 eltérések',
                    data: [2, 4, 4, 9, 8, 2, 9, 2, 8, 4, 1, 6],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.pChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }
    
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
