import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "../service/app.layout.service";
import { Renderer2, HostListener } from '@angular/core';
import { AuthActions } from '../../auth/state/auth.actions';
import { AuthService } from '../../service/authservice';
import { Store } from '@ngrx/store';
import { ApiResponse } from 'src/app/model/api.response.model';
import { LoggedUser } from 'src/app/model/user.model';
import { ApiSettingsService } from 'src/app/service/api.settings.service';


@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];

    isMenuVisible: boolean = false;

    version : string = '0.0.0';

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;


    constructor(
        public layoutService: LayoutService, 
        private renderer: Renderer2,
        private store: Store,
        private authService: AuthService,
        private settingsService: ApiSettingsService
        ) { }

    toggleMenu() {
        //console.log('váltáska');
        this.isMenuVisible = !this.isMenuVisible;
    }

    ngOnInit() {
        this.settingsService.getVersion().subscribe((ver : string) => {
            if (ver != null) {
                this.version = ver;
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        // Ellenőrizzük, hogy a kattintás az almenün kívül vagy az almenüt kinyitó gombon történt-e
        const targetElement = event.target as HTMLElement;
        const topBarMenu = document.getElementById('topbarmenu');
        const profileButton = document.getElementById('profileButton');

        if (!topBarMenu?.contains(targetElement) && targetElement !== profileButton) {
            this.isMenuVisible = false;
        }
    }

    onTopbarLogout() {
        this.store.dispatch({type: AuthActions.LOGOUT, payload: {}});
    }

    onTopbarSettings() {

    }

    onTopbarUser() {
        this.authService.loggedUser().subscribe((user : LoggedUser) => {
            if (user) {
                console.dir(user);
            }
        });
            // this is the MAGIC!!!
            //this.ugyletek = [...this.ugyletek];
    }
}
