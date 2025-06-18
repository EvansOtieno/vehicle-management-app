import { TestBed } from '@angular/core/testing';

import { MechanicProfileService } from './mechanic-profile.service';

describe('MechanicProfileService', () => {
  let service: MechanicProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MechanicProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
