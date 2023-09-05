import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Subject, take } from 'rxjs';
import { ApiService } from './api.service';
//import { ApiResponse } from '../model/api.response.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
//import { AuthActions } from '../auth/state/auth.actions';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: "root"})
export class AuthService {
    public invalid: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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

    register(user: string, pw: string) {
        const formData = new FormData();
        formData.append('username', user);
        formData.append('password', pw);
        formData.append('submit', 'Submit');
        return this.apiService.post('/user/registration', formData);
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token') ?? '';
        // Check whether the token is expired and return
        // true or false
        return !this.jwtHelper.isTokenExpired(token);
    }
}
