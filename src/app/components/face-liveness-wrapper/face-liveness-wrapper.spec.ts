import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceLivenessWrapper } from './face-liveness-wrapper';

describe('FaceLivenessWrapper', () => {
  let component: FaceLivenessWrapper;
  let fixture: ComponentFixture<FaceLivenessWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceLivenessWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceLivenessWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
