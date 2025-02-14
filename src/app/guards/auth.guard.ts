import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          observer.next(true); // L'utilisateur est connecté → accès autorisé
          observer.complete();
        } else {
          this.router.navigate(['/login']); // Redirection si non connecté
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}