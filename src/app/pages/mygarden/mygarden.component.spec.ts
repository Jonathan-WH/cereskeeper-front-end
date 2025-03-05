import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyGardenComponent } from './mygarden.component';

describe('MygardenComponent', () => {
  let component: MyGardenComponent;
  let fixture: ComponentFixture<MyGardenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MyGardenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
