import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MygardenComponent } from './mygarden.component';

describe('MygardenComponent', () => {
  let component: MygardenComponent;
  let fixture: ComponentFixture<MygardenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MygardenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MygardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
