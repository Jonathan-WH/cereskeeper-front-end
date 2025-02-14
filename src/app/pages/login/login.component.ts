import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showResetPassword: boolean = false;
  resetEmail: string = '';
  resetSuccessMessage: string = '';
  resetErrorMessage: string = '';
  errorMessage: string = '';
  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) { }

  async ngOnInit() {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    if (await this.authService.isAuthenticated()) {
      this.router.navigate(['/home-connected']);
    }
  }

  // Utilisez ionViewWillEnter pour réinitialiser le formulaire chaque fois que la vue est affichée
  ionViewWillEnter() {
    this.loginForm.reset();
    this.errorMessage = '';
  }

  async onLogin() {

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        await this.authService.login(email, password);
        this.router.navigate(['/home-connected']); // Redirection après connexion
      } catch (error: any) {
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