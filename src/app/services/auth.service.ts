import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, fetchSignInMethodsForEmail, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usernameSubject = new BehaviorSubject<string | null>(null);
  public username$ = this.usernameSubject.asObservable();
  private apiUrl = 'http://127.0.0.1:5000'; // URL du backend Flask
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false); // État d'authentification réactif
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); // Observable pour les abonnés

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore,
    private http: HttpClient,
    private toastController: ToastController,
    private menuCtrl: MenuController
  ) {
    this.checkInitialAuthState(); // Vérifie l'état initial au démarrage
  }

  

  // Vérifie l'état d'authentification initial basé sur le token
  private async checkInitialAuthState() {
    const isAuth = await this.isAuthenticated();
    this.isAuthenticatedSubject.next(isAuth);
  }


  /** 📌 Fonction d'inscription avec vérification préalable */
  async register(email: string, password: string, username: string) {
    try {
      email = email.trim();
      password = password.trim();
      username = username.trim();

      console.log('📤 [DEBUG] Envoi de la requête à Flask pour créer l\'utilisateur...', { email, password, username });

      // 1. Envoi des données à Flask (et récupération du token)
      const backendResponse = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/register`, { email, password, username })
      );

      console.log('✅ [DEBUG] Réponse du backend:', backendResponse);

      // 2. Stockage du token et mise à jour de l'état
      const idToken = backendResponse.idToken;
      localStorage.setItem('jwt_token', idToken);
      this.isAuthenticatedSubject.next(true); // Mise à jour de l'état réactif

      console.log('🔑 [DEBUG] Token stocké :', idToken);
      console.log('🔄 [DEBUG] Redirection vers /home-connected...');
      this.router.navigate(['/home-connected']);
      return backendResponse;
    } catch (error: any) {
      console.error('❌ [ERROR] Registration error:', error);
      throw new Error(error?.error?.message || 'Registration failed');
    }
  }

  /** 📌 Fonction de connexion */
  async login(email: string, password: string) {
    try {
      email = email.trim();
      password = password.trim();

      console.log('📤 [DEBUG] Envoi de la requête à Flask pour login...');

      const response = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      );

      console.log('✅ [DEBUG] Réponse du backend :', response);

      if (!response.idToken) {
        throw new Error('No idToken received from backend.');
      }

      localStorage.setItem('jwt_token', response.idToken);
      this.isAuthenticatedSubject.next(true); // Mise à jour de l'état réactif

      console.log('🔑 [DEBUG] Token stocké :', response.idToken);
      console.log('🔄 [DEBUG] Redirection vers /home-connected...');
      this.router.navigate(['/home-connected']);
      console.log('🔄 [DEBUG] Redirection après réussi vers /home-connected...');
    } catch (error: any) {
      console.error('❌ [ERROR] Login error:', error);
      throw new Error('Invalid email or password.');
    }
  }

  /** 📌 Fonction de déconnexion */
  async logout() {
    try {
      await signOut(this.auth); // Déconnexion de Firebase Auth
      localStorage.removeItem('jwt_token'); // Suppression du token
      this.isAuthenticatedSubject.next(false); // Mise à jour de l'état réactif

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /** ✅ Vérifie si un token est déjà présent et valide */
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      await lastValueFrom(this.http.get<any>(`${this.apiUrl}/auth/home-connected`, { headers }));
      return true;
    } catch (error) {
      console.error('Token error', error);
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.logoutWithMessage('Your session has expired. Please log in again.');
      }
      return false;
    }
  }

  /** 📌 Déconnexion avec message */
  async logoutWithMessage(message: string) {
    await this.logout();

    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'warning'
    });

    await toast.present();
    this.router.navigate(['/login']);
  }

  /** 📌 Fonction de réinitialisation du mot de passe */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to send password reset email.');
    }
  }

  /** 📌 Récupération des données utilisateur */
  async getUserData(): Promise<any> {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No token found');

      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const response = await lastValueFrom(this.http.get<any>(`${this.apiUrl}/auth/home-connected`, { headers }));

       // ✅ Mise à jour du usernameSubject en cas de changement
       if (response.user && response.user.username) {
        this.usernameSubject.next(response.user.username);
      }

      return response.user; // Retourne les infos utilisateur
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  getToken(): string | null { 
    return localStorage.getItem('jwt_token');
  }

  // ✅ Permet de mettre à jour le username après modification du profil
setUsername(newUsername: string) {
  this.usernameSubject.next(newUsername);
}
}