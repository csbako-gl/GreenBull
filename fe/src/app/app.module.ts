import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';

// custom componenets
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {APP_INITIALIZER, isDevMode} from '@angular/core';
import {AutoFocusModule} from 'primeng/autofocus';
import {JwtModule} from '@auth0/angular-jwt';
import {EffectsModule} from '@ngrx/effects';
import {ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {localStorageSync} from 'ngrx-store-localstorage';

import {ConfigService} from './config/config.service';
import {AuthService} from './service/authservice'
import {ApiService} from './service/api.service';

import {AuthEffects} from './auth/state/auth.effects';
import {authReducer} from './auth/state/auth.reducers';

import {HeaderInterceptor} from './interceptors/header.interceptor'


import {AppLoginExtComponent} from './pages/auth/app.login.ext.component';
import { UnderConstructionComponent } from './components/under_construction/under.construction.component';
//import {AppLogin2faComponent} from './pages/auth/app.login.2fa.component';
//import {AppRegistrationExtComponent} from './pages/auth/app.registration.component';


//import {UgyletService} from './service/ugyletservice';
//import {UgyletKiszallitottComponent} from './pages/ugylet/ugylet.kiszallitott.component'

export function initializeApp(appConfig: ConfigService) {
    return () => appConfig.load();
}

export function tokenGetter() {
    return localStorage.getItem("token");
}

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({keys: ['token']})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];


@NgModule({
    declarations: [
        AppComponent, 
        NotfoundComponent,
        UnderConstructionComponent,
        AppLoginExtComponent,
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        AutoFocusModule,
        HttpClientModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        JwtModule.forRoot({/*for JwtHelperService*/ config: {tokenGetter}}),
        EffectsModule.forRoot([]),
        StoreModule.forFeature('authState', authReducer, {metaReducers}),
        StoreModule.forRoot({}, {}),
        EffectsModule.forFeature([AuthEffects]),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
    ],
    providers: [
        {provide: APP_INITIALIZER, useFactory: initializeApp, deps: [ConfigService], multi: true },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },

        CountryService, EventService, IconService, NodeService, PhotoService, ProductService,
        
        AuthService, 
        ApiService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
