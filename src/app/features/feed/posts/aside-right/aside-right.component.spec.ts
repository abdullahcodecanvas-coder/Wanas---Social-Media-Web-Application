import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideRightComponent } from './aside-right.component';

describe('AsideRightComponent', () => {
  let component: AsideRightComponent;
  let fixture: ComponentFixture<AsideRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideRightComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsideRightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
