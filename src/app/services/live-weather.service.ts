import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, switchMap, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveWeatherService {
  private apiUrl = 'http://127.0.0.1:5000/weather/live';

  constructor(private http: HttpClient) {}

  getLiveWeather(gardenId: string, gardenType: string | undefined): Observable<any> {
    console.log(`🛠️ Debug: gardenType reçu ->`, gardenType);

    // if (!gardenType) {
    //     console.error(`❌ Erreur: gardenType est undefined pour gardenId: ${gardenId}`);
    //     return throwError(() => new Error(`Invalid garden type for gardenId: ${gardenId}`));
    // }

    // if (gardenType !== 'outdoor') {
    //     console.warn(`❌ Live weather is only available for outdoor gardens (Type: ${gardenType})`);
    //     return throwError(() => new Error('Live weather is only available for outdoor gardens'));
    // }

    return timer(0, 300000).pipe( // 🔥 Rafraîchit toutes les 5 minutes
      switchMap(() => {
        const token = localStorage.getItem('jwt_token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post<any>(this.apiUrl, { gardenId }, { headers });
      })
    );
  }
}