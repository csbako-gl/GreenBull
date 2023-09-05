import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducers';


export const selectAuthState = createFeatureSelector<AuthState>('authState')

export const selectUser = () =>
    createSelector(selectAuthState, (state: AuthState) => state.user);

export const selectToken = () =>
    createSelector(selectAuthState, (state: AuthState) => state.token);

export const selectData = () =>
    createSelector(selectAuthState, (state: AuthState) => state.data);

export const selectState = () =>
    createSelector(selectAuthState, (state: AuthState) => state);
