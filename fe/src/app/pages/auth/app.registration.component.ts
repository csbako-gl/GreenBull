import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { AuthActions } from 'src/app/auth/state/auth.actions';
import * as selectors from 'src/app/auth/state/auth.selectors';
import { ApiResponse } from 'src/app/model/api.response.model';
import { User } from 'src/app/model/user.model';
import { AuthService } from 'src/app/service/authservice';


@Component({
  selector: 'app-registration',
  templateUrl: './app.registration.component.html',
})
export class AppRegistrationExtComponent implements OnInit {
    @ViewChild('fn') fnElement!: ElementRef;
    @ViewChild('ln') lnElement!: ElementRef;
    @ViewChild('un') unElement!: ElementRef;
    @ViewChild('pw') pwElement!: ElementRef;
    @ViewChild('pw2') pw2Element!: ElementRef;
    submitEmitter = new EventEmitter();

    username!: ''; //email
    password!: '';
    password2!: '';
    firstname!: '';
    lastname!: '';

    invalidate: boolean = false;

    constructor(public router: Router, private authService: AuthService, private store: Store, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.authService.invalid.subscribe(value => {
            if(value == true) {
                this.invalidUnPw();
            }
        })
    }

    ngOnDestroy(): void {
        //this.authService.invalid.unsubscribe();
    }

    onSignUp() {
        const user: User = {username: this.username, password: this.password};
        //this.store.dispatch({type: AuthActions.LOGIN, payload: user});
        return;
    }

    invalidUnPw() {
        this.pwElement.nativeElement.value = '';
        this.pwElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.focus();
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
