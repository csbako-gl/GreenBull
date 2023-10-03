import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { AuthService } from 'src/app/service/authservice';
import { LoggedUser } from 'src/app/model/user.model';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService, private authService: AuthService) { }

    ngOnInit() {
        this.authService.loggedUser().subscribe((user : LoggedUser) => {
            if (user) {
                const isAdminPresent: boolean = user.privileges.some(privilege => privilege.name === 'WRITE_PRIVILEGE');
                //console.log('isAdminPresent: ' + isAdminPresent);
                this.model = [
                    {
                        label: 'Home',
                        items: [
                            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                        ]
                    },
                    {
                        label: 'Pages',
                        icon: 'pi pi-fw pi-briefcase',
                        items: [
                            {
                                label: 'My Devices',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/pages/devices']
                            },
                        ]
                    },
                ];

                if(isAdminPresent) {
                    this.model.push({
                            label: 'Admin',
                            icon: 'pi pi-fw pi-briefcase',
                            items: [
                                {
                                    label: 'User Admin',
                                    icon: 'pi pi-fw pi-user-edit',
                                    routerLink: ['/under-construction']
                                },
                                {
                                    label: 'Devices Types',
                                    icon: 'pi pi-fw pi-building',
                                    routerLink: ['/under-construction']
                                },
                            ]
                        }
                    );
                }
            }
        });
    }
}
