import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartDealerDashboardComponent } from './part-dealer-dashboard.component';

describe('PartDealerDashboardComponent', () => {
  let component: PartDealerDashboardComponent;
  let fixture: ComponentFixture<PartDealerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartDealerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartDealerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
