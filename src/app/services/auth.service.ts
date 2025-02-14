import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, fetchSignInMethodsForEmail, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000'; // 🔥 URL du backend Flask

  constructor(private auth: Auth, private router: Router, private firestore: Firestore, private http: HttpClient) { }

  /** 🔍 Vérifie si un email est déjà utilisé sur Firebase Auth */
  async isEmailTaken(email: string): Promise<boolean> {
    const methods = await fetchSignInMethodsForEmail(this.auth, email);
    return methods.length > 0;
  }

  /** 🔍 Vérifie si un username existe déjà dans Firestore */
  async isUsernameTaken(username: string): Promise<boolean> {
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // True si le username existe déjà
  }


/** 📌 Fonction d'inscription avec vérification préalable */
async register(email: string, password: string, username: string) {
  try {
    console.log("📤 [DEBUG] Envoi de la requête à Flask pour créer l'utilisateur...", { email, password, username });

    // ✅ 1. Envoi des données à Flask pour créer l'utilisateur
    const backendResponse = await lastValueFrom(
      this.http.post<any>(`${this.apiUrl}/register`, { email, password, username })
    );

    console.log('✅ [DEBUG] Réponse du backend:', backendResponse);

    // ✅ 2. Connexion à Firebase pour récupérer le token (sans recréer l’utilisateur)
    console.log("🔥 [DEBUG] Connexion à Firebase pour récupérer le Token...");
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    console.log("🔑 [DEBUG] Token Firebase récupéré:", idToken);

    // ✅ 3. Stocker le token et rediriger
    localStorage.setItem('jwt_token', idToken);
    this.router.navigate(['/home-connected']);

    return userCredential;
    
  } catch (error: any) {
    console.error('❌ [ERROR] Registration error:', error);

    // 🔥 Intercepter l'erreur Firebase et renvoyer un message personnalisé
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use. Please use another or log in.');
    } else {
      throw error; // Renvoie les autres erreurs normalement
    }
  }
}

  /** 📌 Fonction de connexion */
  async login(email: string, password: string) {
    try {
      // 🔥 Connexion avec Firebase
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
  
      // 🔥 Récupération du Token Firebase
      const idToken = await user.getIdToken();
      console.log("🚀 Token Firebase récupéré :", idToken);
  
      // ✅ Stocke le token
      localStorage.setItem('jwt_token', idToken);
  
      // ✅ Envoie le token au backend pour validation
      const headers = new HttpHeaders({ Authorization: `Bearer ${idToken}` });
  
      console.log("📡 Envoi de la requête avec Header :", headers);
  
      const response = await lastValueFrom(
        this.http.get<any>(`${this.apiUrl}/home-connected`, { headers })
      );
  
      console.log('✅ Login success:', response);
      this.router.navigate(['/home-connected']);
      return response;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error("Invalid email or password.");
    }
  }

  /** 📌 Fonction de déconnexion */
  async logout() {
    try {
      await signOut(this.auth);

      // ❌ Supprimer le token JWT du localStorage
      localStorage.removeItem('jwt_token');

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // ✅ Vérifie si un token est déjà présent et valide
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      await lastValueFrom(this.http.get<any>(`${this.apiUrl}/home-connected`, { headers }));
      return true;
    } catch (error) {
      console.error('Auth validation error:', error);
      this.logout(); // 🔴 Déconnecte l'utilisateur si le token est invalide
      return false;
    }
  }

  /** 📌 Fonction de reset du mot de passe */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log("Password reset email sent");
    } catch (error) {
      console.error("Reset password error:", error);
      throw new Error("Failed to send password reset email.");
    }
  }
}