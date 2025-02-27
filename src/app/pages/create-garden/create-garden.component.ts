import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-create-garden',
  templateUrl: './create-garden.component.html',
  styleUrls: ['./create-garden.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CreateGardenComponent  implements OnInit {
   isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService
  ) { 
    // Initialisation des Observables
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {}

}
