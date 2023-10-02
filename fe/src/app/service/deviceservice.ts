import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";


@Injectable({providedIn: "root"})
export class DeviceService {

    constructor(
        private apiService: ApiService,
        public router: Router)
    {}

    getDevicesByUser() {
        return this.apiService.get('/device/by_user');
    }

}
