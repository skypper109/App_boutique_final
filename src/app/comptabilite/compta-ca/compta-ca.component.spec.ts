import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptaCAComponent } from './compta-ca.component';

describe('ComptaCAComponent', () => {
  let component: ComptaCAComponent;
  let fixture: ComponentFixture<ComptaCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComptaCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptaCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
