import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable  } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home-connected',
  templateUrl: './home-connected.component.html',
  styleUrls: ['./home-connected.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomeConnectedComponent implements OnInit {
  username: string = "";
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController,

  ) {
     // Initialisation des Observables
        this.isAuthenticated$ = this.authService.isAuthenticated$;
    
        // ✅ Solution propre : Utilisation directe de l'Observable username$
        this.username$ = this.authService.username$.pipe(
          map(username => username ?? '') // Convertit `null` en chaîne vide ''
        );
  }

  async ngOnInit() {
    const userData = await this.authService.getUserData();
    if (userData) {
      this.username = userData.username;
      
    }
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(true, 'menuId');
    console.log("✅ [HomeConnected] Menu activé");
  }

  goToCheckPlant() {
    this.router.navigate(['/check-plant']);
  }

  goToCreateGarden() {
    this.router.navigate(['/create-garden']);
  }
}