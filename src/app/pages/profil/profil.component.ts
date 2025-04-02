import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NoSpaceDirective } from '../../directive/no-space.directive';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, NoSpaceDirective]
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  confirmPassword: string = '';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  // Hook Ionic qui se déclenche à chaque fois que la vue est sur le point d'être affichée
  async ionViewWillEnter() {
   await this.loadUserData();
  }

  async loadUserData() {
  // ⏳ Initialisation immédiate pour éviter l'erreur
  this.profileForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(8)]],
    password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
    confirmPassword: ['']
  }, { validators: this.passwordMatchValidator });

  // ⏳ Ensuite, on charge les données utilisateur et on met à jour le formulaire
  const userData = await this.authService.getUserData();
  if (userData) {
    this.profileForm.patchValue({
      email: userData.email,
      username: userData.username
    });
  }
}

  // 🔥 Vérifie que les mots de passe correspondent
  passwordMatchValidator: ValidatorFn = (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      const { email, username, password, confirmPassword } = this.profileForm.value;
      const payload = {
        email,
        username,
        password: password || null,
        confirmPassword: confirmPassword || null  // ✅ Envoi de la confirmation du mot de passe
      };

      try {
        const response = await firstValueFrom(
          this.http.post<any>('http://127.0.0.1:5000/auth/update-profile', payload, {
            headers: {
              Authorization: `Bearer ${await this.authService.getToken()}`
            }
          })
        );

        this.successMessage = response.message;
        this.showToast('Profile updated successfully!', 'success');

         // ✅ Mettre à jour l'Observable du username pour rafraîchir le header
         this.authService.setUsername(username);

        // 🔄 Redirection vers home et forcer la mise à jour du header
        setTimeout(() => {
          this.router.navigate(['/home-connected']);
        }, 1500);

       

      } catch (error: any) {
        console.error('❌ Error updating profile:', error);
        this.errorMessage = error.error?.error || 'Failed to update profile';
        this.showToast(this.errorMessage, 'danger');
      }
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}