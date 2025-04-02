import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';
import { LiveWeatherComponent } from '../../weather component/live-weather/live-weather.component';
import { WeatherHistoryComponent } from '../../weather component/weather-history/weather-history.component';
import { LiveSensorComponent } from '../../live-sensor/live-sensor.component';


@Component({
  selector: 'app-single-garden',
  templateUrl: './singlegarden.component.html',
  styleUrls: ['./singlegarden.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LiveWeatherComponent, WeatherHistoryComponent, LiveSensorComponent]
})
export class SingleGardenComponent implements OnInit {
  gardenId!: string;
  gardenData: any = null;
  loading = true;
  isAuthenticated$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit() {
    this.gardenId = this.route.snapshot.paramMap.get('id')!;
    console.log("🆔 Garden ID:", this.gardenId); // ✅ Vérifie l'ID récupéré
    if (this.gardenId) {
      this.loadGardenData();
    } else {
      console.error("❌ No garden ID found in URL!");
    }

    // appel data meteo
    this.updateWeatherData();
  }

  async loadGardenData() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error("❌ No token found.");
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      console.log(`🛠 URL envoyée à Flask: http://127.0.0.1:5000/garden/get?id=${this.gardenId}`);
      const response = await firstValueFrom(this.http.get<any>(`http://127.0.0.1:5000/garden/get?id=${this.gardenId}`, { headers }));
      this.gardenData = response;
      console.log("✅ Garden data loaded:", this.gardenData);
    } catch (error) {
      console.error("❌ Error loading garden data:", error);
    } finally {
      this.loading = false;
    }
  }

  async updateWeatherData() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.error("❌ No token found.");
        return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
        console.log(`🌤 Mise à jour des données météo pour le jardin ${this.gardenId}...`);
        const response = await firstValueFrom(this.http.post(`http://127.0.0.1:5000/weather/update`, 
            { gardenId: this.gardenId }, { headers }));

        console.log("✅ Weather data updated:", response);
    } catch (error) {
        console.error("❌ Error updating weather data:", error);
    }
}
}