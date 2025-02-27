import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Observable  } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-check-plant-history',
  templateUrl: './check-plant-history.component.html',
  styleUrls: ['./check-plant-history.component.scss'],
  standalone: true,
  imports : [CommonModule, IonicModule]
})
export class CheckPlantHistoryComponent  implements OnInit {
  username: string = "";
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string>;

  constructor(
    private AuthService: AuthService
  ) {   
    // Initialisation des Observables
    this.isAuthenticated$ = this.AuthService.isAuthenticated$;
    
    // Gestion du username$ avec switchMap pour résoudre la promesse
    this.username$ = this.AuthService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.AuthService.getUserData().then(userData => userData?.username || 'Utilisateur');
        }
        return Promise.resolve(''); // Retourne une chaîne vide si non authentifié
      })
    );
  }

  ngOnInit() {}

}
