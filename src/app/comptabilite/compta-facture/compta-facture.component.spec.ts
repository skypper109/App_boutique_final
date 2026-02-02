import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptaFactureComponent } from './compta-facture.component';

describe('ComptaFactureComponent', () => {
  let component: ComptaFactureComponent;
  let fixture: ComponentFixture<ComptaFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComptaFactureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptaFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
