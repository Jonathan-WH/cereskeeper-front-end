import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveSensorService {
  private apiUrl = 'http://127.0.0.1:5000/live-sensor-data';

  constructor(private http: HttpClient) {}

  getLiveSensorData(): Observable<any> {  // ✅ Pas besoin de sensorId
    return timer(0, 5000).pipe( // 🔥 Rafraîchit toutes les 5 secondes
      switchMap(() => {
        const token = localStorage.getItem('jwt_token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        return this.http.get<any>(this.apiUrl, { headers }).pipe(
          catchError(() => of({ error: "No live data available" })) // 🔥 Gestion erreur
        );
      })
    );
  }
}