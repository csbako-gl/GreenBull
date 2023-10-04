import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";


@Injectable({providedIn: "root"})
export class ApiSettingsService {

    constructor(
        private apiService: ApiService,
        public router: Router)
    {}

    getConfigTest() {
        return this.apiService.get('/settings/test');
    }


    getConfig() {
        return this.apiService.get('/settings/get');
    }

}
