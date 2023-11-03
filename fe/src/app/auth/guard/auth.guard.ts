import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "src/app/service/authservice";


@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard  {
    constructor(private router: Router, private auth: AuthService) {}
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.auth.isAuthenticated()) {
          this.router.navigate(['/landing']);
          return false;
        }
        return true;
    }
  }
