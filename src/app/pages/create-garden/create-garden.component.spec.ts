import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateGardenComponent } from './create-garden.component';

describe('CreateGardenComponent', () => {
  let component: CreateGardenComponent;
  let fixture: ComponentFixture<CreateGardenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreateGardenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
