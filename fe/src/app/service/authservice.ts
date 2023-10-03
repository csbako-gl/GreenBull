import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Subject, take } from 'rxjs';
import { ApiService } from './api.service';
//import { ApiResponse } from '../model/api.response.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
//import { AuthActions } from '../auth/state/auth.actions';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { LoggedUser, UserCreateData } from '../model/user.model';
import { ApiResponse } from '../model/api.response.model';

@Injectable({providedIn: "root"})
export class AuthService {
    public invalid: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    localLoggedUser : LoggedUser | null = null;

    constructor(
        private http: HttpClient,
        private apiService: ApiService,
        public router: Router,
        private jwtHelper: JwtHelperService,
        private store: Store)
    {}

    invalidate(invalid: boolean) {
        this.invalid.next(invalid);
    }

    login(user: string, pw: string) {
        //console.log('login: un:' + user + ' pw:' + pw);
        const formData = new FormData();
        formData.append('username', user);
        formData.append('password', pw);
        formData.append('submit', 'Submit');
        return this.apiService.post('/login', formData);
    }

    logout() {
        this.localLoggedUser = null;
    }

    login2fa(user: string, code: string) {
        const formData = new FormData();
        formData.append('username', user);
        formData.append('2fa', code);
        formData.append('submit', 'Submit');
        return this.apiService.post('/login2fa', formData);
    }

    enable2fa(enable: Boolean) {
        return this.apiService.post(`/user/update/2fa?use2FA=${enable}`);
    }

    register(userdata: UserCreateData) {
        //console.log('reg: un:' + userdata.username + ' pw:' + userdata.password);
        const formData = new FormData();
        formData.append('email', userdata.username);
        formData.append('firstName', userdata.firstname);
        formData.append('lastName', userdata.lastname);
        formData.append('password', userdata.password);
        formData.append('matchingPassword', userdata.matchingPassword);
        return this.apiService.post('/user/registration', formData);
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token') ?? '';
        // Check whether the token is expired and return
        // true or false
        return !this.jwtHelper.isTokenExpired(token);
    }

    loggedUser() :  Observable<LoggedUser> {
        if (this.localLoggedUser !== null) {
            // Ha van helyi (cache-ben tárolt) felhasználó, térj vissza vele
            return of(this.localLoggedUser);
        } else {
            const formData = new FormData();
            return this.apiService.get('/user/logged', formData)
                .pipe(
                    map((resp: ApiResponse) => {
                        const user = resp.data as LoggedUser;
                        // Tárold el a kapott felhasználót a localLoggedUser változóban
                        this.localLoggedUser = user;
                        return user;
                    }),
                    catchError(error => {
                        // Kezeld a hibát, ha szükséges
                        console.error('Hiba történt a felhasználó lekérésekor:', error);
                        throw error;
                    })
                );
        }
    }
}
