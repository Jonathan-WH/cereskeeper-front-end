// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { MenuController } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline, closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, cloudDoneOutline, cloudOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ IonicModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cereskeeper';
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string>;

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private authService: AuthService,
    public toastController: ToastController
  ) {
    addIcons({ searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline,  closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, cloudDoneOutline, cloudOutline });

    // Initialisation des Observables
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    // Gestion du username$ avec switchMap pour résoudre la promesse
    this.username$ = this.authService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.authService.getUserData().then(userData => userData?.username || 'Utilisateur');
        }
        return Promise.resolve(''); // Retourne une chaîne vide si non authentifié
      })
    );
  }

  ngOnInit() {
    
  }

  async logout() {
    try {
      await this.menuCtrl.close();
      await this.authService.logout();
      const toast = await this.toastController.create({
        message: 'You have been logged out successfully.',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }, 500);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  navigateTo(url: string) {
    this.menuCtrl.close();
    this.router.navigate([url]);
  }

}

