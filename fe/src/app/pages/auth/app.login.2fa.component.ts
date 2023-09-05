import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Params, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from 'src/app/auth/state/auth.actions';
import { AuthService } from 'src/app/service/authservice';

@Component({
  selector: 'app-login-2fa',
  templateUrl: './app.login.2fa.component.html',
})
export class AppLogin2faComponent implements OnInit {
    @ViewChild('pw') pwElement: ElementRef;
    password2fa: '';
    username: string;

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private store: Store,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params: Params) => this.username = params['username']);
        this.authService.invalid.subscribe(value => {
            if(value == true) {
                this.invalidUnPw();
            }
        })
    }

    ngOnDestroy(): void {
        this.authService.invalid.unsubscribe();
    }

    onSignIn() {
        this.store.dispatch({type: AuthActions.LOGIN2FA, payload: {username: this.username, password: this.password2fa}})
    }

    invalidUnPw() {
        this.pwElement.nativeElement.value = '';
        this.pwElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.pwElement.nativeElement.focus();
    }
}
