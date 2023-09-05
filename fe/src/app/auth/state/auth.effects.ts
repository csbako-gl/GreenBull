import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/service/authservice';
import { User } from 'src/app/model/user.model';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {

    loginUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN),
            mergeMap(((data: {type: string, payload: User}) => this.authService.login(data.payload.username, data.payload.password)
                .pipe(
                map(data => {
                    switch (data.status) {
                        case 'success': return { type: AuthActions.LOGIN_SUCCESS, token: data.token };
                        case '2fa': return { type: AuthActions.LOGIN2FANEEDED, payload: {username: data.data, password:''}};
                        case 'invalid_user_pw': return { type: AuthActions.LOGIN_FAILURE, username: data.data };
                        default: return { type: AuthActions.LOGIN_FAILURE, token: data.token };
                    }
                }),
                catchError(async (data) => ({ type: AuthActions.LOGIN_FAILURE, error: data.error }))
                ))
            ))
        }, {dispatch: true}
    );

    loginUserSuccess$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN_SUCCESS),
            tap((data) => {
                this.router.navigate(['/']);
            }),
            )
        }, {dispatch: false}
    );

    loginUserFailure$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN_FAILURE),
            tap((data) => {
                this.authService.invalidate(true);
            }),
            )
        }, {dispatch: false}
    );

    login2faNeeded$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN2FANEEDED),
            tap((data: {type: string, payload: User}) => {
                this.authService.invalidate(false);
                this.router.navigate(['auth/login2fa', data.payload.username]);
            }),
            )
        }, {dispatch: false}
    );

    login2faUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN2FA),
            mergeMap(((data: {type: string, payload: User}) => this.authService.login2fa(data.payload.username, data.payload.password)
            .pipe(
                map(data => {
                    switch (data.status) {
                        case 'success': return {type: AuthActions.LOGIN_SUCCESS, token: data.token};
                        case 'invalid_verification': return { type: AuthActions.LOGIN2FA_FAILURE, payload: {username: data.data, password:''} };
                        default: return { type: AuthActions.LOGIN2FA_FAILURE, payload: {username: data.data, password:''} };
                    }
                }),
                catchError(async (data) => ({ type: AuthActions.LOGIN2FA_FAILURE, payload: {username: data.data, password:''} }))
                ))
            ))
        }, {dispatch: true}
    );

    login2faUserFailure$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN2FA_FAILURE),
            tap((data: {type: string, payload: User}) => {
                this.authService.invalidate(true);
            }),
            )
        }, {dispatch: false}
    );

    enable2fa$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.ENABLE_2FA),
            mergeMap(((data: {type: string, payload: Boolean}) => this.authService.enable2fa(data.payload)
            .pipe(
                //tap(() => console.log('enable 2FA response:')),
                //tap(data => console.dir(data)),
                map(data => ({ type: AuthActions.NONE, data: data })),
                //tap(() =>  this.router.navigate(['ugylet/kiszallitott'])),
                catchError(async (data) => ({ type: AuthActions.LOGIN_FAILURE, error: data.error }))
                ))
            ))
        }, {dispatch: true}
    );

    logOutUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGOUT),
            //tap(() => console.log('logout()')),
            tap(() => localStorage.removeItem("token")),
            tap(() => this.router.navigate(['auth/login']))
            )
        }, {dispatch: false}
    );

    createUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.CREATE_USER),
            mergeMap(((data: {type: string, payload: User}) => this.authService.register(data.payload.username, data.payload.password)
            .pipe(
                tap(() =>  this.router.navigate(['auth/login'])),
                catchError(async (data) => ({ type: AuthActions.LOGIN_FAILURE, error: data.error }))
            ))
            ))
        }, {dispatch: true}
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router
    ) {}
}
