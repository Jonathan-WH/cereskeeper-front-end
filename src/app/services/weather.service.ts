import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  getWeatherHistory(gardenId: string): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    return this.http.get<any>(`${this.apiUrl}/weather/history?gardenId=${gardenId}`, { headers });
  }
}