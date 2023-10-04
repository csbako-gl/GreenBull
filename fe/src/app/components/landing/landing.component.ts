import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ApiResponse } from 'src/app/model/api.response.model';
import { ApiSettingsService } from 'src/app/service/api.settings.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html'
})
export class LandingComponent {

    constructor(public layoutService: LayoutService, public router: Router, public apiSettingsService: ApiSettingsService) { }

    onRegistring() {
        this.router.navigate(['auth/registration']);
    }

    onLogin() {
        this.router.navigate(['auth/login']);
    }

    onGetStarted() {
        this.apiSettingsService.getConfigTest().subscribe((resp : ApiResponse) => {
            if(resp?.data != null) {
                console.log('test success');
                console.dir(resp.data);
            } else {
                console.log('test failed');
            }
        });

        this.apiSettingsService.getConfig().subscribe((resp : ApiResponse) => {
            if(resp?.data != null) {
                console.dir(resp.data);
            }
        });
    }
}
