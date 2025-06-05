import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRouterComponent } from './profile-router.component';

describe('ProfileRouterComponent', () => {
  let component: ProfileRouterComponent;
  let fixture: ComponentFixture<ProfileRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileRouterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
