import { Routes } from '@angular/router';
import { HomeUnconnectedComponent } from './pages/home-unconnected/home-unconnected.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeConnectedComponent } from './pages/home-connected/home-connected.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeUnconnectedComponent }, // Page d'accueil par défaut
  { path: 'register', component: RegisterComponent }, // Page d'inscription
  { path: 'login', component: LoginComponent}, // Page de connexion
  { path: 'home-connected', component: HomeConnectedComponent, canActivate: [AuthGuard]  }, // Page d'accueil connectée protégé par un guard 
  { path: '**', redirectTo: '' } // Redirection des pages inconnues vers l'accueil
];