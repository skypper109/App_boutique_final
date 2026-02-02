import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeCreateComponent } from './annee-create.component';

describe('AnneeCreateComponent', () => {
  let component: AnneeCreateComponent;
  let fixture: ComponentFixture<AnneeCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnneeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
