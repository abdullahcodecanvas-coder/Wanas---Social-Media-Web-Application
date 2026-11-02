import { TestBed } from '@angular/core/testing';

import { ChangePaasswordService } from './change-paassword.service';

describe('ChangePaasswordService', () => {
  let service: ChangePaasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangePaasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
