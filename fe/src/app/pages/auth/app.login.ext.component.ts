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
  selector: 'app-login-ext',
  templateUrl: './app.login.ext.component.html',
})
export class AppLoginExtComponent implements OnInit {
    @ViewChild('pw') pwElement!: ElementRef;
    @ViewChild('un') unElement!: ElementRef;
    submitEmitter = new EventEmitter();

    username: string = ''
    password: string = '';
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

    onSignIn() {
        const user: User = {username: this.username, password: this.password};
        this.store.dispatch({type: AuthActions.LOGIN, payload: user});
        return;


        this.authService.login(this.username, this.password).toPromise()
        .then((res: ApiResponse) => {
            console.log('van valasz');
            console.dir(res);
            if(res?.status == 'success') {
                this.router.navigate(['ugylet/kiszallitott']);
            } else if(res?.status == '2fa') {
                this.router.navigate(['auth/login2fa']);
            } else if(res?.status == 'invalid_user_pw') {
                this.invalidUnPw();
                //this.router.navigate(['auth/login2fa']);
            } else {
                console.log('error: unknown status:', res?.status );
            }
        })
        .catch((error: HttpErrorResponse) => {
            if (!error.status || error.status === 504) {
                console.log('http 504 error. status:' + error.status);
                this.router.navigate(['auth/error']);
            } else {
                console.log('unknown http error');
                // TODO all type of error handling
                this.router.navigate(['auth/error']);
            }
        })
        .catch(error => console.log('unknown error!!!', error));
    }

    invalidUnPw() {
        this.pwElement.nativeElement.value = '';
        this.pwElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.classList += "ng-dirty ng-invalid";
        this.unElement.nativeElement.focus();
    }

    onEnter() {
        this.pwElement.nativeElement.focus();
    }
}
