import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-connected',
  templateUrl: './home-connected.component.html',
  styleUrls: ['./home-connected.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomeConnectedComponent implements OnInit {

  constructor(
    private AuthService: AuthService, 
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async logout() {
    try {
      await this.AuthService.logout();

      // ✅ Afficher le message de confirmation (toast)
      const toast = await this.toastController.create({
        message: 'You have been logged out successfully.',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });

      await toast.present();

      // ✅ Supprimer les champs auto-remplis (email & password)
      setTimeout(() => {
        localStorage.clear(); // Efface les données stockées localement
        sessionStorage.clear(); // Efface les données de session
        this.router.navigate(['/login']);
      }, 500); // ⏳ Délai avant redirection
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
}