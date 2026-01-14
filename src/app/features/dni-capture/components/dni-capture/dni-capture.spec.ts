import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DniCapture } from './dni-capture';

describe('DniCapture', () => {
  let component: DniCapture;
  let fixture: ComponentFixture<DniCapture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DniCapture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DniCapture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
