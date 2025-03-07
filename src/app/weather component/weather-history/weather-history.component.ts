import {
  Component, OnInit, Input, ViewChild, ElementRef,
  AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges, HostListener
} from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import Chart from 'chart.js/auto';
import { Observable, firstValueFrom } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import annotationPlugin from 'chartjs-plugin-annotation';
import { LineAnnotationOptions } from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-weather-history',
  templateUrl: './weather-history.component.html',
  styleUrls: ['./weather-history.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WeatherHistoryComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() gardenId!: string;
  weatherData$!: Observable<any>;
  @ViewChild('weatherChart') weatherChart!: ElementRef<HTMLCanvasElement>;
  chart: any;
  private chartInitialized = false;
  selectedFilter: string = '1h';
  selectedCurves: string[] = ['temperature', 'humidity', 'pressure'];

  constructor(
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.gardenId) {
      this.weatherData$ = this.weatherService.getWeatherHistory(this.gardenId);
    }
  }

  ngAfterViewInit() {
    this.loadWeatherData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gardenId'] && !changes['gardenId'].firstChange) {
      this.loadWeatherData();
    }
  }

  updateChartVisibility() {
    if (!this.chart) return;
    this.chart.data.datasets.forEach((dataset: any) => {
      dataset.hidden = !this.selectedCurves.includes(dataset.label.toLowerCase().split(' ')[1]);
    });
    this.chart.update();
  }

  async loadWeatherData() {
    if (!this.gardenId || this.chartInitialized) return;

    try {
      const weatherData = await firstValueFrom(this.weatherData$);
      const filteredData = this.filterWeatherData(weatherData);
      console.log('Données envoyées au graphique :', filteredData);
      this.createChart(filteredData);
      this.chartInitialized = true;
      this.cdr.detectChanges();
    } catch (error) {
      console.error("❌ Erreur de chargement des données météo :", error);
    }
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    if (this.weatherData$) {
      firstValueFrom(this.weatherData$).then(weatherData => {
        const filteredData = this.filterWeatherData(weatherData);
        console.log('Données filtrées pour filtre', filter, ':', filteredData);
        this.createChart(filteredData);
      });
    }
  }

  filterWeatherData(weatherData: any) {
    const transformedData = this.transformWeatherData(weatherData);
    let interval: number;

    switch (this.selectedFilter) {
      case '1h':
        interval = 1;
        break;
      case '4h':
        interval = 4;
        break;
      case '12h':
        interval = 12;
        break;
      case '24h':
        interval = 24;
        break;
      default:
        interval = 1;
    }

    const filteredData = [];
    for (let i = 0; i < transformedData.length; i++) {
      const currentEntry = transformedData[i];
      const currentTime = currentEntry.date.split(' ')[1];
      const hour = parseInt(currentTime.substring(0, 2));

      if (currentTime === '00:00') {
        filteredData.push(currentEntry);
      }
      else if (hour % interval === 0) {
        filteredData.push(currentEntry);
      }
    }

    return filteredData;
  }

  transformWeatherData(weatherData: any) {
    let transformedData: any[] = [];

    weatherData.forEach((day: any) => {
      if (!day.data || !Array.isArray(day.data)) {
        console.warn("⚠️ Données incorrectes pour le jour :", day);
        return;
      }

      day.data.forEach((entry: any) => {
        transformedData.push({
          date: `${day.date} ${entry.time}`,
          temperature: entry.temperature ?? null,
          humidity: entry.humidity ?? null,
          pressure: entry.pressure ?? null
        });
      });
    });

    return transformedData;
  }

  createChart(weatherData: any) {
    setTimeout(() => {
      if (!this.weatherChart?.nativeElement) return;

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.weatherChart.nativeElement.getContext('2d');
      if (!ctx) {
        console.error("❌ Impossible d'obtenir le contexte 2D du canvas !");
        return;
      }

      const labels = weatherData.map((entry: any) => entry.date);
      const temperatures = weatherData.map((entry: any) => entry.temperature ?? null);
      const humidities = weatherData.map((entry: any) => entry.humidity ?? null);
      const pressures = weatherData.map((entry: any) => entry.pressure ?? null);

      console.log('Labels:', labels);
      console.log('Temperatures:', temperatures);
      console.log('Humidities:', humidities);
      console.log('Pressures:', pressures);

      // Détection des changements de jour pour les annotations
      const dayChangeValues: string[] = [];
      for (let i = 1; i < labels.length; i++) {
        const currentDate = labels[i].split(' ')[0];
        const prevDate = labels[i - 1].split(' ')[0];
        if (currentDate !== prevDate) {
          const nextMidnight = labels.find((label: string, idx: number) => idx >= i && label.endsWith('00:00'));
          dayChangeValues.push(nextMidnight || labels[i]);
          console.log(`Changement de jour détecté à l’index ${i}: ${labels[i - 1]} -> ${labels[i]}`);
        }
      }

      console.log('dayChangeValues:', dayChangeValues);

      // Annotations pour les lignes verticales avec date
      const annotations: LineAnnotationOptions[] = dayChangeValues.map((value) => ({
        type: 'line' as const,
        xMin: value,
        xMax: value,
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 2,
        label: {
          display: true, // Utiliser "display" au lieu de "enabled" pour plus de compatibilité
          content: value.split(' ')[0].substring(5), // Affiche "MM-DD" (ex. "03-06")
          position: 'start', // Haut de la ligne
          yAdjust: -5, // Ajuster légèrement vers le haut pour visibilité
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          font: { size: 14 } // Augmenter la taille pour lisibilité
        }
      }));

      // Intervalle pour les ticks
      let hourInterval: number;
      switch (this.selectedFilter) {
        case '1h':
          hourInterval = 2;
          break;
        case '4h':
          hourInterval = 4;
          break;
        case '12h':
          hourInterval = 12;
          break;
        case '24h':
          hourInterval = 24;
          break;
        default:
          hourInterval = 2;
      }

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Température (°C)',
              data: temperatures,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              fill: true,
              yAxisID: 'left-axis'
            },
            {
              label: 'Humidité (%)',
              data: humidities,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
              fill: true,
              yAxisID: 'left-axis'
            },
            {
              label: 'Pression (hPa)',
              data: pressures,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              fill: true,
              yAxisID: 'right-axis'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            annotation: {
              annotations: annotations
            }
          },
          scales: {
            x: {
              title: { display: true, text: "Date" },
              ticks: {
                callback: (value: any, index: number): string | null => {
                  const dateStr = labels[index];
                  const [date, time] = dateStr.split(' ');
                  const hour = parseInt(time.substring(0, 2));
                  // if (hour === 0) return date.substring(5); // Afficher MM-DD à minuit
                  if (hour % hourInterval === 0) return time.substring(0, 5); // Afficher HH:mm strictement sur l’intervalle
                  return null;
                },
                maxTicksLimit: 12,
                autoSkip: true
              },
              grid: {
                drawOnChartArea: true,
                color: 'rgba(0, 0, 0, 0.2)',
                lineWidth: 1
              }
            },
            'left-axis': {
              position: 'left',
              title: { display: true, text: "Température (°C) / Humidité (%)" },
              grid: { drawOnChartArea: true }
            },
            'right-axis': {
              position: 'right',
              title: { display: true, text: "Pression (hPa)" },
              grid: { drawOnChartArea: true }
            }
          }
        }
      });
    }, 200);
  }

  @HostListener('window:resize')
  onResize() {
    this.chartInitialized = false;
    setTimeout(() => {
      if (this.chart) {
        this.chart.destroy();
      }
      this.loadWeatherData();
    }, 500);
  }
}