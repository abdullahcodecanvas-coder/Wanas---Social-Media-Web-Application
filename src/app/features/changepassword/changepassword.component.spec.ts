import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangepasswordComponent } from './changepassword.component';

describe('ChangepasswordComponent', () => {
  let component: ChangepasswordComponent;
  let fixture: ComponentFixture<ChangepasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangepasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangepasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
