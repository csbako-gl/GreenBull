import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/service/authservice';
import { Store } from '@ngrx/store';
import { User } from 'src/app/model/user.model';
import { AuthActions } from 'src/app/auth/state/auth.actions';
import * as selectors from 'src/app/auth/state/auth.selectors';
import { ApiResponse } from 'src/app/model/api.response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { Message, MessageService } from 'primeng/api';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [MessageService],
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit {
    @ViewChild('pw') pwElement!: ElementRef;
    @ViewChild('un') unElement!: ElementRef;
    submitEmitter = new EventEmitter();

    valCheck: string[] = ['remember'];
    
    password!: string;
    username!: string;
    invalidate: boolean = false;

    msgs: Message[] = [];

    constructor(
        public layoutService: LayoutService,
        public router: Router,
        private authService: AuthService,
        private store: Store,
        private activatedRoute: ActivatedRoute,
        private primengConfig: PrimeNGConfig,
        private msgService: MessageService
    ) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.authService.invalid.subscribe(value => {
            if(value == true) {
                this.invalidUnPw();
            }
        })
    }

    onSignIn() {
        //console.log("onSignIn un:" + this.username + " pw:" + this.password);
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
        console.log("invalidUnPw()");
        this.showErrorViaMessages("Login error!","Invalid username or password!");
        if (this.pwElement && this.pwElement.nativeElement) {
            console.log("invalidate pwElement()");
            this.pwElement.nativeElement.value = "";
            this.pwElement.nativeElement.classList += "ng-dirty ng-invalid";
        }
        if (this.unElement && this.unElement.nativeElement) {
            console.log("invalidate unElement()");
            this.unElement.nativeElement.classList += "ng-dirty ng-invalid";
            this.unElement.nativeElement.focus();
        }
    }

    onEnter() {
        this.pwElement.nativeElement.focus();
    }

    onRegistring() {
        this.router.navigate(['auth/registration']);
    }

    showErrorViaMessages(summary : string, msg : string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: summary, detail: msg });
    }
}
