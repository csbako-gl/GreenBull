import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { Device, DeviceType } from "../model/device.model";
import { Observable, catchError, map } from "rxjs";
import { ApiResponse } from "../model/api.response.model";
import { de } from "date-fns/locale";


@Injectable({providedIn: "root"})
export class DeviceService {

    constructor(
        private apiService: ApiService,
        public router: Router)
    {}

    getDevicesByUser() : Observable<Device[]> {
        return this.apiService.get('/device/by_user')
        .pipe(
            map((resp: ApiResponse) => {
                const devices = resp.data as Device[];
                return devices;
            }),
            catchError(error => {
                console.error('Error while get devices by user:', error);
                throw error;
            })
        );
    }

    getDeviceTypes() : Observable<DeviceType[]> {
        return this.apiService.get('/device_type/get_all')
        .pipe(
            map((resp: ApiResponse) => {
                const device_types = resp.data as DeviceType[];
                return device_types;
            }),
            catchError(error => {
                console.error('Error while get device types:', error);
                throw error;
            })
        );
    }

    addDevice(device : Device) : Observable<ApiResponse> {
        return this.apiService.put('/device/add', device)
        .pipe(
            map((resp: ApiResponse) => {
                return resp;
            }),
            catchError(error => {
                console.error('Error while get device types:', error);
                throw error;
            })
        );
    }

}
