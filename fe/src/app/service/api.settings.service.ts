import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { Observable, catchError, map } from "rxjs";
import { ApiResponse } from "../model/api.response.model";


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

    getVersion() : Observable<string> {
        return this.apiService.get('/settings/version')
        .pipe(
            map((resp: ApiResponse) => {
                const version = resp.data as string;
                return version;
            }),
            catchError(error => {
                console.error('Hiba történt a verzió lekérésekor:', error);
                throw error;
            })
        );
    }

}
