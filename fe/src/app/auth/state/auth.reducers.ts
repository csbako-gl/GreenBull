import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from 'src/app/model/user.model';

export interface AuthState {
    user: User | null;
    token: string;
    data: any;
}

export const initialState: AuthState = {
    user: null,
    token: '',
    data: null
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loginAction, (state, { user }) => {
        state.user = user;
        state.data = null;
        state.token = '';
        return state;
    }),
    on(AuthActions.loginAction2fa, (state, { user }) => {
        state.user = user;
        state.data = null;
        state.token = '';
        return state;
    }),
    on(AuthActions.loginActionSuccess, (state, { token }) => {
        state.token = token;
        state.data = null;
        return state;
    }),
    on(AuthActions.loginActionFailure, (state, { data }) => {
        state.token = '';
        state.data = data;
        return state;
    })
);
