import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-access',
    templateUrl: './access.component.html',
})
export class AccessComponent { 

    constructor(public layoutService: LayoutService) {
    }
}
