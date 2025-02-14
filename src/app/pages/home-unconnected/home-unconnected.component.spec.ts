import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeUnconnectedComponent } from './home-unconnected.component';

describe('HomeUnconnectedComponent', () => {
  let component: HomeUnconnectedComponent;
  let fixture: ComponentFixture<HomeUnconnectedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomeUnconnectedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeUnconnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
