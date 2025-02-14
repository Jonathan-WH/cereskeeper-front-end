import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { heart, logoApple, settingsSharp, star, walkOutline, personAddOutline, leafOutline,waterOutline, thermometerOutline, analyticsOutline } from 'ionicons/icons';
@Component({
  selector: 'app-home-unconnected',
  templateUrl: './home-unconnected.component.html',
  styleUrls: ['./home-unconnected.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomeUnconnectedComponent  implements OnInit {

  constructor(
    private router: Router
  ) {
    addIcons({ heart, logoApple, settingsSharp, star, walkOutline, personAddOutline, leafOutline,waterOutline, thermometerOutline, analyticsOutline }); 
   }


   ngOnInit() {}

   goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
