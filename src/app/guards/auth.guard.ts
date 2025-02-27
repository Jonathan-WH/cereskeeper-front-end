import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private menuCtrl: MenuController) {}

  canActivate(): Observable<boolean> {
    return new Observable(observer => {
      this.authService.isAuthenticated().then(isAuth => {
        if (isAuth) {
          //Forcer le menu a s'activer lors de changement de route
          this.menuCtrl.enable(true, 'menuId');
          console.log("✅ [AuthGuard] Accès autorisé");
          observer.next(true);
        } else {
          console.log("❌ [AuthGuard] Accès refusé → Redirection vers login");
          this.router.navigate(['/login']);
          observer.next(false);
        }
        observer.complete();
      }).catch(error => {
        console.error("❌ [AuthGuard] Erreur :", error);
        this.router.navigate(['/login']);
        observer.next(false);
        observer.complete();
      });
    });
  }
}