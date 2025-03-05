import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-garden',
  templateUrl: './mygarden.component.html',
  styleUrls: ['./mygarden.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MyGardenComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  gardens: any[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {
    this.loadUserGardens();
  }

  ionViewWillEnter() {
    this.loadUserGardens();
  }


   // 🔥 Charger les jardins de l'utilisateur
   async loadUserGardens() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error("❌ No token found.");
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      const response = await firstValueFrom(this.http.get<any[]>('http://127.0.0.1:5000/get-user-gardens', { headers }));
      this.gardens = response || [];
      console.log("✅ Gardens loaded:", this.gardens);
    } catch (error) {
      console.error("❌ Error fetching gardens:", error);
    }
  }

  // 📌 Redirection vers la page SingleGarden
  viewGarden(gardenId: string) {
    this.router.navigate(['/single-garden', gardenId]);
  }

  // 🔥 Supprimer un jardin avec confirmation
  async confirmDeleteGarden(gardenId: string) {
    const alert = await this.alertController.create({
      header: "Confirm Deletion",
      message: "Are you sure you want to delete this garden? This action is irreversible.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => this.deleteGarden(gardenId)
        }
      ]
    });

    await alert.present();
  }

  // 🗑️ Supprimer un jardin
  async deleteGarden(gardenId: string) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error("❌ No token found.");
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const loading = await this.loadingController.create({
      message: 'Deleting garden...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await this.http.delete(`http://127.0.0.1:5000/delete-garden?gardenId=${gardenId}`, { headers }).toPromise();
      this.gardens = this.gardens.filter(g => g.id !== gardenId);
      console.log(`✅ Garden ${gardenId} deleted`);
      this.presentToast("Garden deleted successfully!", "success");
    } catch (error) {
      console.error("❌ Error deleting garden:", error);
      this.presentToast("Failed to delete garden.", "danger");
    } finally {
      await loading.dismiss();
    }
  }

  // 📌 Notification Toast
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  goToCreateGarden() {
    this.router.navigate(['/create-garden']);
  }
}