import { Routes } from '@angular/router';
import { HomeUnconnectedComponent } from './pages/home-unconnected/home-unconnected.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeConnectedComponent } from './pages/home-connected/home-connected.component';
import { CheckPlantComponent } from './pages/check-plant/check-plant.component';
import { CheckPlantHistoryComponent } from './pages/check-plant-history/check-plant-history.component';
import { CreateGardenComponent } from './pages/create-garden/create-garden.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeUnconnectedComponent }, // Page d'accueil par défaut
  { path: 'register', component: RegisterComponent }, // Page d'inscription
  { path: 'login', component: LoginComponent}, // Page de connexion
  { path: 'home-connected', component: HomeConnectedComponent, canActivate: [AuthGuard]  },
  { path: 'check-plant', component: CheckPlantComponent, canActivate: [AuthGuard]  }, 
  { path: 'check-plant-history', component: CheckPlantHistoryComponent, canActivate: [AuthGuard]  },
  { path: 'create-garden', component: CreateGardenComponent, canActivate: [AuthGuard]  },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } // Redirection des pages inconnues vers l'accueil
];