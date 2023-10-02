import { Action, createAction, props } from '@ngrx/store';
import { User, UserCreateData } from 'src/app/model/user.model';

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
    CREATE_USER_FAILURE = '[AUTH] Create User Failure',
    CREATE_USER_SUCCESS = '[AUTH] Create User Success',
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

export const createUserAction = createAction(
    AuthActions.CREATE_USER,
    props<{ userdata: UserCreateData }>()
);

export const createUserActionSuccess = createAction(
    AuthActions.CREATE_USER_SUCCESS,
    props<{ user: User }>()
);

export const createUserActionFailure = createAction(
    AuthActions.CREATE_USER_FAILURE,
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
