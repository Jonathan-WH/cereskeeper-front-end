import { Component, Input } from '@angular/core';
import { LiveWeatherService } from '../../services/live-weather.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline, closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, thermometerOutline, waterOutline, speedometerOutline, sunnyOutline, partlySunnyOutline, snowOutline, rainyOutline, thunderstormOutline } from 'ionicons/icons';


@Component({
  selector: 'app-live-weather',
  templateUrl: './live-weather.component.html',
  styleUrls: ['./live-weather.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LiveWeatherComponent {
  @Input() gardenId!: string; // ✅ Ajouté l'Input gardenId
  @Input() gardenType!: string; // ✅ Ajouté l'Input gardenType
  liveWeather$!: Observable<any>;

  constructor(private liveWeatherService: LiveWeatherService) {
    addIcons({ searchOutline, hammerOutline, logOutOutline, personOutline, flowerOutline, folderOutline, home, cameraSharp, imagesSharp, closeCircleOutline,  closeCircleSharp, trashSharp, refreshOutline, trashBinOutline, thermometerOutline, waterOutline, speedometerOutline, sunnyOutline, partlySunnyOutline, snowOutline, rainyOutline, thunderstormOutline });
  }

  ngOnInit() {
    this.liveWeather$ = this.liveWeatherService.getLiveWeather(this.gardenId, this.gardenType);
    
  }
}