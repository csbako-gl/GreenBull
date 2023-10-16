import { RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";


// custom components
import { AuthGuard } from './auth/guard/auth.guard';
import {AppLoginExtComponent} from './pages/auth/app.login.ext.component';
import { UnderConstructionComponent } from './components/under_construction/under.construction.component';

// TODO itt majd hozzá kell adni a saját oldalakat

const routes: Routes = [
    {
        path: '', component: AppLayoutComponent,
        children: [
            { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
            { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) }
        ],
        canActivate: [AuthGuard]
    },
    { path: 'login2', component: AppLoginExtComponent},
    { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
    { path: 'landing', loadChildren: () => import('./components/landing/landing.module').then(m => m.LandingModule) },
    { path: 'notfound', component: NotfoundComponent },
    { path: 'under-construction', component: UnderConstructionComponent },
    { path: '**', redirectTo: '/notfound' },
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            onSameUrlNavigation: 'reload' 
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor() {
        //console.log('itt valami átirányitás vót');
    }
}
