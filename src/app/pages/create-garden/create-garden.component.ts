import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-garden',
  templateUrl: './create-garden.component.html',
  styleUrls: ['./create-garden.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CreateGardenComponent implements OnInit {
  gardenForm!: FormGroup;
  location: { lat: number; lon: number } | null = null;
  isAuthenticated$: Observable<boolean>;
  showLocationOptions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {
    
    this.gardenForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      type: ['', Validators.required],
      useGPS: [false], 
      usePostalCode: [false], 
      postalCode: ['']
    });
  }

  ionViewWillEnter() {
    this.resetComponent();
  }

  resetComponent() {
    this.gardenForm.reset();
    this.showLocationOptions = false;
    this.location = null;
  }

  // 🔥 Quand l'utilisateur change le type de jardin
  onGardenTypeChange() {
    this.showLocationOptions = this.gardenForm.get('type')?.value === 'outdoor';
    if (!this.showLocationOptions) {
      this.gardenForm.patchValue({ useGPS: false, usePostalCode: false, postalCode: '' });
    }
  }

  // 🔥 Gestion des toggles (mise à jour correcte des valeurs)
  async toggleLocation(type: 'gps' | 'postal', event: any) {
    const checked = event.detail.checked;

    if (type === 'gps') {
      this.gardenForm.patchValue({ useGPS: checked, usePostalCode: false });
      if (checked) {
        this.gardenForm.patchValue({ postalCode: '' });
        await this.handleLocationSelection();
      }
    } else if (type === 'postal') {
      this.gardenForm.patchValue({ usePostalCode: checked, useGPS: false });
    }

    console.log(`🔄 Toggle ${type}:`, checked);
  }

  async handleLocationSelection() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      console.log("📍 GPS Location:", this.location);
    } catch (error: any) {
      console.error("❌ Failed to get location:", error);
  
      if (error.code === 1) { // Code 1 = Permission refusée
        this.presentPermissionAlert();
      } else {
        this.presentToast("Failed to get GPS location. Enter postal code instead.", "danger");
      }
    }
  }
  
  // 📌 Affiche une alerte expliquant comment réactiver la géolocalisation
  async presentPermissionAlert() {
    const alert = await this.alertController.create({
      header: "Location Permission Denied",
      message: "You have denied GPS access. To enable it again, please go to your browser settings and allow location access, or reload the page to try again.",
      buttons: [
        {
          text: "Use Postal Code Instead",
          handler: () => {
            this.gardenForm.patchValue({ useGPS: false, usePostalCode: true });
          }
        },
        {
          text: "Reload Page",
          handler: () => {
            window.location.reload(); // 🔥 Recharge la page automatiquement
          }
        },
        {
          text: "OK",
          role: "cancel"
        }
      ]
    });
  
    await alert.present();
  }

  async onCreateGarden() {
    if (this.gardenForm.invalid) {
      this.presentToast("Please fill in all required fields.", "danger");
      return;
    }

    const user = await this.authService.getUserData();
    if (!user?.uid) {
      console.error("❌ User not authenticated.");
      this.presentToast("Authentication error.", "danger");
      return;
    }

    // 🔥 Création de l'objet jardin
    const gardenData = {
      name: this.gardenForm.value.name,
      startDate: this.gardenForm.value.startDate,
      type: this.gardenForm.value.type,
      postalCode: this.gardenForm.value.usePostalCode ? this.gardenForm.value.postalCode : null,
      location: this.gardenForm.value.useGPS ? this.location : null,
      createdAt: new Date().toISOString(),
      userId: user.uid
    };

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error("❌ No token found.");
      this.presentToast("Authentication error.", "danger");
      return;
    }

    // ✅ Spinner de chargement
    const loading = await this.loadingController.create({
      message: 'Creating your garden...',
      spinner: 'crescent',
    });
    await loading.present();

    // ✅ Envoi au serveur Flask
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('http://127.0.0.1:5000/garden/create', gardenData, { headers }).subscribe({
      next: async (response) => {
        console.log("✅ Garden created:", response);
        await loading.dismiss();
        this.presentToast("Garden successfully created!", "success");
        this.router.navigate(['/my-garden']);
      },
      error: async (error) => {
        console.error("❌ Error creating garden:", error);
        await loading.dismiss();
        this.presentToast("Failed to create garden.", "danger");
      }
    });
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }
}