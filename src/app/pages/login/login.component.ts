import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController  } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NoSpaceDirective } from '../../directive/no-space.directive';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule, NoSpaceDirective]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showResetPassword: boolean = false;
  resetEmail: string = '';
  resetSuccessMessage: string = '';
  resetErrorMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false; // ✅ Ajout du spinner


  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private loadingController: LoadingController) { }

    async ngOnInit() {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      });
    
      this.isLoading = true;
    
      try {
        const loggedIn = await this.authService.isAuthenticated();
        if (loggedIn) {
          // ⏳ Attends que la navigation soit bien terminée
          await this.router.navigate(['/home-connected']);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
      this.isLoading = false; // ✅ Cache le spinner
    }

  // Utilisez ionViewWillEnter pour réinitialiser le formulaire chaque fois que la vue est affichée
  async ionViewWillEnter() {
    this.loginForm.reset();
    this.errorMessage = '';
    this.isLoading = true;
  
    try {
      const loggedIn = await this.authService.isAuthenticated();
      if (loggedIn) {
        await this.router.navigate(['/home-connected']);
      }
    } catch (e) {
      console.error("Erreur auth dans ionViewWillEnter:", e);
    } finally {
      this.isLoading = false;
    }
  }

  // async showLoading() {
  //   const loading = await this.loadingController.create({
  //     message: 'Connecting to your account...', // ✅ Texte de chargement
  //     spinner: 'crescent',
  //     duration: 5000 // Timeout de sécurité si jamais il reste bloqué
  //   });

  //   await loading.present();
  //   return loading;
  // }

  async onLogin() {

    if (this.loginForm.valid) {
      this.isLoading = true; // ✅ Affiche le spinner
      const { email, password } = this.loginForm.value;
      try {
        await this.authService.login(email, password);
        this.isLoading = false; // ✅ Cache le spinner
        this.router.navigate(['/home-connected']); // Redirection après connexion
       
      } catch (error: any) {
        this.isLoading = false; // ✅ Cache le spinner
        console.error("Login error:", error);
        this.errorMessage = error.message; // Affiche le message d'erreur personnalisé
      }
    }
  }

  // 🔄 Affiche/cache le champ de reset password
  toggleResetPassword() {
    this.showResetPassword = !this.showResetPassword;
    this.resetSuccessMessage = '';
    this.resetErrorMessage = '';
  }

  // 📧 Envoie un email de réinitialisation du mot de passe
  async sendResetPasswordEmail() {
    if (!this.resetEmail) {
      this.resetErrorMessage = "Please enter your email.";
      return;
    }

    try {
      await this.authService.resetPassword(this.resetEmail);
      this.resetSuccessMessage = "Reset email sent! Check your inbox.";
      this.resetErrorMessage = '';
    } catch (error) {
      console.error("Reset password error:", error);
      this.resetErrorMessage = "Failed to send reset email. Please try again.";
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}