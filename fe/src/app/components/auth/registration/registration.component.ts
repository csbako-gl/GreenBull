import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/service/authservice';
import { Store } from '@ngrx/store';
import { AuthActions } from 'src/app/auth/state/auth.actions';
import * as selectors from 'src/app/auth/state/auth.selectors';
import { User, UserCreateData } from 'src/app/model/user.model';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class RegistrationComponent implements OnInit {
    @ViewChild('fn') fnElement!: ElementRef;
    @ViewChild('ln') lnElement!: ElementRef;
    @ViewChild('un') unElement!: ElementRef;
    @ViewChild('pw') pwElement!: ElementRef;
    @ViewChild('pw2') pw2Element!: ElementRef;

    valCheck: string[] = ['remember'];

    firstname!: string;
    lastname!: string;
    username!: string;
    password!: string;
    password2!: string;

    invalidate: boolean = false;

    constructor(
        public layoutService: LayoutService, 
        private authService: AuthService,
        private store: Store
    ) {}
    
    ngOnInit(): void {
        this.authService.invalid.subscribe(value => {
            if(value == true) {
                this.invalidUnPw();
            }
        })
    }

    invalidUnPw() {
        this.pwElement.nativeElement.value = '';
        this.pwElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.focus();
    }

    onSignUp() {
        const user: UserCreateData = {
            username: this.username, 
            password: this.password, 
            matchingPassword : this.password2, 
            firstname: this.firstname, 
            lastname: this.lastname
        };
        this.store.dispatch({type: AuthActions.CREATE_USER, payload: user});
    }

    onEnter(index: number) {
        switch (index) {
            case 1: this.fnElement.nativeElement.focus(); break;
            case 2: this.unElement.nativeElement.focus(); break;
            case 3: this.pwElement.nativeElement.focus(); break;
            case 4: this.pw2Element.nativeElement.focus(); break;
            case 5: this.onSignUp(); break;
            default: this.lnElement.nativeElement.focus(); break;
        }
    }
}
