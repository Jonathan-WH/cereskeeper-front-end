import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckPlantHistoryComponent } from './check-plant-history.component';

describe('CheckPlantHistoryComponent', () => {
  let component: CheckPlantHistoryComponent;
  let fixture: ComponentFixture<CheckPlantHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CheckPlantHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckPlantHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
