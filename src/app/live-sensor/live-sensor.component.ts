import { Component } from '@angular/core';
import { LiveSensorService } from '../services/live-sensor.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { thermometerOutline, waterOutline, speedometerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-live-sensor',
  templateUrl: './live-sensor.component.html',
  styleUrls: ['./live-sensor.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LiveSensorComponent {
  liveSensor$!: Observable<any>; // ✅ Supprimé l'Input sensorId

  constructor(private liveSensorService: LiveSensorService) {
    addIcons({ thermometerOutline, waterOutline, speedometerOutline });
  }

  ngOnInit() {
    this.liveSensor$ = this.liveSensorService.getLiveSensorData(); // ✅ Appelle sans sensorId
  }
}