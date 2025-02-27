import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { heart, logoApple, settingsSharp, star, walkOutline, personAddOutline, leafOutline,waterOutline, thermometerOutline, analyticsOutline } from 'ionicons/icons';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-home-unconnected',
  templateUrl: './home-unconnected.component.html',
  styleUrls: ['./home-unconnected.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomeUnconnectedComponent  implements OnInit {

  constructor(
    private router: Router,
    private menuCtrl: MenuController
  ) {
    addIcons({ heart, logoApple, settingsSharp, star, walkOutline, personAddOutline, leafOutline,waterOutline, thermometerOutline, analyticsOutline }); 
   }


   ngOnInit() {
    // Désactive le menu quand on est sur cette page
    this.menuCtrl.enable(false, 'menuId');
  }

  ngOnDestroy() {
    // Réactive le menu quand on quitte cette page
    this.menuCtrl.enable(true, 'menuId');
  }

   goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
