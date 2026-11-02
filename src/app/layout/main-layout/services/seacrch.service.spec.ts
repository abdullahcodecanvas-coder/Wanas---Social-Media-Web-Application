import { TestBed } from '@angular/core/testing';

import { SeacrchService } from './seacrch.service';

describe('SeacrchService', () => {
  let service: SeacrchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeacrchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
