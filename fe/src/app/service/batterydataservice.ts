import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";


@Injectable({providedIn: "root"})
export class BatteryDataService {

    constructor(
        private apiService: ApiService,
        public router: Router)
    {}

    getLastBatteryData(deviceId: number) {
        return this.apiService.get('/battery_data/last', {device_id : deviceId});
    }

    getBatteryDataLimited(deviceId: number, count: number) {
        return this.apiService.get('/battery_data/last_n', {device_id : deviceId, count : count});
    }

    getBatteryDataFrom(deviceId: number, from: Date) {
        return this.apiService.get('/battery_data/get_all_from', {device_id : deviceId, from : from});
    }

    getBatteryDataFromTo(deviceId: number, from: Date, to: Date) {
        return this.apiService.get('/battery_data/get_all_from_to', {device_id : deviceId, from : from, to: to});
    }

}
