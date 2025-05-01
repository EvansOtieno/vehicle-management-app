import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarOwnerDashboardComponent } from './car-owner-dashboard.component';

describe('CarOwnerDashboardComponent', () => {
  let component: CarOwnerDashboardComponent;
  let fixture: ComponentFixture<CarOwnerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarOwnerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarOwnerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
