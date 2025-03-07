import { TestBed } from '@angular/core/testing';
import { LiveWeatherService } from './live-weather.service';

describe('LiveWeatherService', () => {
  let service: LiveWeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveWeatherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
