import { TestBed } from '@angular/core/testing';

import { LiveSensorService } from './live-sensor.service';

describe('LiveSensorService', () => {
  let service: LiveSensorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveSensorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
