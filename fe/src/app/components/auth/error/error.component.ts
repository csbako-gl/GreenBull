import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
})
export class ErrorComponent { 

    constructor(public layoutService: LayoutService) {
        
    }
}