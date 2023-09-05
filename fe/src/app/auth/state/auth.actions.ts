import { Action, createAction, props } from '@ngrx/store';
import { User } from 'src/app/model/user.model';

export enum AuthActions {
    NONE = '[AUTH] None',
    LOGIN = '[AUTH] Login',
    LOGIN_SUCCESS = '[AUTH] Login success',
    LOGIN_FAILURE = '[AUTH] Login Failure',
    LOGIN2FA = '[AUTH] Login2fa',
    LOGIN2FA_FAILURE = '[AUTH] Login 2fa Failure',
    LOGIN2FANEEDED = '[AUTH] Login2fa needed',
    LOGOUT = '[AUTH] Logout',
    CREATE_USER = '[AUTH] Create User',
    ENABLE_2FA = '[AUTH] Enable 2FA',
}

export const loginAction = createAction(
    AuthActions.LOGIN,
    props<{ user: User }>()
);

export const loginActionSuccess = createAction(
    AuthActions.LOGIN_SUCCESS,
    props<{ token: string }>()
);

export const loginActionFailure = createAction(
    AuthActions.LOGIN_FAILURE,
    props<{ data: any }>()
);

export const loginAction2fa = createAction(
    AuthActions.LOGIN2FA,
    props<{ user: User }>()
);

export const loginAction2faFailure = createAction(
    AuthActions.LOGIN2FA_FAILURE,
    props<{ data: any }>()
);

export const loginAction2faNeeded = createAction(
    AuthActions.LOGIN2FANEEDED,
    props<{ user: User }>()
);

export const enable2fa = createAction(
    AuthActions.ENABLE_2FA,
    props<{ enable: boolean }>()
);
