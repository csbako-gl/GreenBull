import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { BatteryData } from "../model/battery.data.model";
import { Observable, catchError, map } from "rxjs";
import { ApiResponse } from "../model/api.response.model";


@Injectable({providedIn: "root"})
export class BatteryDataService {

    constructor(
        private apiService: ApiService,
        public router: Router)
    {}

    getLastBatteryData(deviceId: number) {
        return this.apiService.get('/battery_data/last', {device_id : deviceId});
    }

    getBatteryDataLimited(deviceId: number, count: number) : Observable<BatteryData[]> {
        return this.apiService.get('/battery_data/last_n', {device_id : deviceId, count : count})
        .pipe(
            map((resp: ApiResponse) => {
                const battery_data = resp.data as BatteryData[];
                return battery_data;
            }),
            catchError(error => {
                console.error('Error while get battery data limited:' + count, error);
                throw error;
            })
        );
    }

    getBatteryDataFrom(deviceId: number, from: Date) {
        return this.apiService.get('/battery_data/get_all_from', {device_id : deviceId, from : from});
    }

    getBatteryDataFromTo(deviceId: number, from: Date, to: Date, limit: number) : Observable<BatteryData[]> {
        return this.apiService.get('/battery_data/get_from_to', {device_id : deviceId, from : from, to: to, limit: limit})
        .pipe(
            map((resp: ApiResponse) => {
                const battery_data = resp.data as BatteryData[];
                return battery_data;
            }),
            catchError(error => {
                console.error('Error while get battery data from:' + from + ' to:' + to, error);
                throw error;
            })
        );
    }
}
