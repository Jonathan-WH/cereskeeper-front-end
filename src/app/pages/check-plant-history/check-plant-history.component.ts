import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ToastController, AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-check-plant-history',
  templateUrl: './check-plant-history.component.html',
  styleUrls: ['./check-plant-history.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})

export class CheckPlantHistoryComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string>;
  private analysisHistorySubject = new BehaviorSubject<any[]>([]);
  analysisHistory$ = this.analysisHistorySubject.asObservable();
  filteredAnalysis$: Observable<any[]> = this.analysisHistory$;
  selectedDate: string | null = null;
  markedDates: string[] = [];
  highlightedDates: { date: string, textColor: string, backgroundColor: string }[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    this.username$ = this.authService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.authService.getUserData().then(userData => userData?.username || 'Utilisateur');
        }
        return Promise.resolve('');
      })
    );
  }

  ionViewWillEnter() {
    this.loadAnalysisHistory().then(() => {
      this.setTodayAsSelected(); // 🔥 Filtre automatiquement les analyses du jour
    });

    this.resetFilter();
  }

  ngOnInit() {
    this.loadAnalysisHistory().then(() => {
      this.setTodayAsSelected(); // 🔥 Filtre automatiquement les analyses du jour
    });
    this.resetFilter();
  }
// extraction du titre de l'analyse via ion card title
  extractTitleFromHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const titleElement = doc.querySelector("ion-card-title");
  
    return titleElement ? titleElement.textContent?.trim() || "Unknown Title" : "Unknown Title";
  }

  extractSubtitleFromHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const subtitleElement = doc.querySelector("ion-card-subtitle");

    return subtitleElement ? subtitleElement.textContent?.trim() || "Unknown Subtitle" : "Unknown Subtitle";
  }

  setTodayAsSelected() {
    const now = new Date();
    now.setHours(now.getHours() + 1); // 🔥 Corrige l'heure
    const today = now.toISOString().split('T')[0]; // 📅 Récupère uniquement YYYY-MM-DD
    this.selectedDate = today; // 🟢 Définit la date sélectionnée
  
    console.log(`📅 Sélection automatique du jour : ${this.selectedDate}`);
  
    // 🔥 Mise à jour réactive de `filteredAnalysis$`
    this.filteredAnalysis$ = this.analysisHistory$.pipe(
      map(history => history.filter(analysis => analysis.date === today))
    );
  }

  // 📌 Charger l'historique des analyses
async loadAnalysisHistory() {
  const userData = await this.authService.getUserData();
  if (!userData?.uid) {
    console.error("❌ No UID found, unable to fetch analysis history.");
    return;
  }

  console.log(`📡 Fetching analysis history for UID: ${userData.uid}`);

  const token = localStorage.getItem('jwt_token');
  if (!token) {
    console.error("❌ No token found, cannot fetch analysis history.");
    return;
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  try {
    const response = await lastValueFrom(
      this.http.get<any[]>('http://127.0.0.1:5000/analysis/get-analysis-history', { headers })
    );

    // ✅ Nettoyage et formatage des données
    const cleanedAnalysis = response.map(analysis => ({
      ...analysis,
      analysis: this.cleanHtml(analysis.analysis),
      date: analysis.date.split(' ')[0], // 🔥 Garde uniquement `YYYY-MM-DD`
      extractedTitle: this.extractTitleFromHtml(analysis.analysis),
      extractedSubtitle: this.extractSubtitleFromHtml(analysis.analysis)
    }));

    // ✅ Stocker uniquement les dates uniques des analyses
    this.markedDates = [...new Set(cleanedAnalysis.map(analysis => analysis.date))];

    // ✅ Transformer `markedDates` en format attendu par `[highlightedDates]`
    this.highlightedDates = this.markedDates.map(date => ({
      date: date,
      textColor: '#fff',
      backgroundColor: 'rgba(255, 0, 0, 0.19)' // 🔴 Point rouge sur les jours d'analyse
    }));

    // ✅ Mettre à jour le BehaviorSubject
    this.analysisHistorySubject.next(cleanedAnalysis);

    console.log("📜 Cleaned Analysis history received:", cleanedAnalysis);
    console.log("📅 Marked Dates:", this.markedDates);
    console.log("🎨 Highlighted Dates:", this.highlightedDates);

    // ✅ Sélectionne automatiquement les analyses du jour après le chargement
    this.setTodayAsSelected();

  } catch (error) {
    console.error("❌ Error loading analysis history:", error);
    this.analysisHistorySubject.next([]);
  }
}

  // 📌 Filtrer les analyses par date sélectionnée
  filterByDate(event: any) {
    const selectedDate = event.detail.value.split('T')[0];
    this.selectedDate = selectedDate;

    this.filteredAnalysis$ = this.analysisHistory$.pipe(
      map(history => history.filter(analysis => analysis.date === selectedDate))
    );

    console.log(`📅 Filtering analysis for date: ${selectedDate}`);
  }

  // 📌 Réinitialiser le filtre
  resetFilter() {
    //-1h
    const now = new Date();
now.setHours(now.getHours() + 1); // Retire 1 heure
const oneHourAgoISO = now.toISOString();
console.log(oneHourAgoISO); // Format complet ISO
    this.selectedDate = oneHourAgoISO.split('T')[0];
    this.filteredAnalysis$ = this.analysisHistory$

  }

  cleanHtml(html: string): string {
    return html.replace(/```html/g, '').replace(/```/g, '').trim();
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  // 📌 Fonction pour supprimer une analyse
  async deleteAnalysis(analysisId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this analysis? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('❌ [CANCEL] Suppression annulée');
          }
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const token = localStorage.getItem('jwt_token');
              if (!token) throw new Error('No token found');

              const userData = await this.authService.getUserData();
              if (!userData?.uid) throw new Error('User UID not found');

              const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

              await lastValueFrom(
                this.http.delete(`http://127.0.0.1:5000/delete-analysis?analysisId=${analysisId}&uid=${userData.uid}`, { headers })
              );

              // ✅ Mise à jour des données locales après suppression
              const updatedHistory = this.analysisHistorySubject.getValue().filter(analysis => analysis.id !== analysisId);
              this.analysisHistorySubject.next(updatedHistory);
              this.filterByDate({ detail: { value: this.selectedDate } });

              const toast = await this.toastController.create({
                message: 'Your analysis has been deleted.',
                duration: 2000,
                color: 'success'
              });
              toast.present();
            } catch (error) {
              console.error('❌ [ERROR] Failed to delete analysis:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
