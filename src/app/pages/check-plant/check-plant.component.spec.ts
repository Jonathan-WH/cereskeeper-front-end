import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckPlantComponent } from './check-plant.component';

describe('CheckPlantComponent', () => {
  let component: CheckPlantComponent;
  let fixture: ComponentFixture<CheckPlantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CheckPlantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckPlantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
