import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
})
export class NotfoundComponent implements OnInit {
    originalUrl: string | null = null;
  
    constructor(private route: ActivatedRoute, public layoutService: LayoutService) {}
  
    ngOnInit() {
        this.originalUrl = this.route.snapshot.url.map(segment => segment.path).join('/');
        console.log('Hibás útvonal:', this.originalUrl);
    }
  }