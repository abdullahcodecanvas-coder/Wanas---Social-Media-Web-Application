import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notBackReturnGuard } from './not-back-return-guard';

describe('notBackReturnGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => notBackReturnGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
