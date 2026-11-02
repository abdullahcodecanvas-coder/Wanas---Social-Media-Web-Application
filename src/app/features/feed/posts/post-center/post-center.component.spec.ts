import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCenterComponent } from './post-center.component';

describe('PostCenterComponent', () => {
  let component: PostCenterComponent;
  let fixture: ComponentFixture<PostCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCenterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
