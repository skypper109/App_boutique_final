import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeIndexComponent } from './annee-index.component';

describe('AnneeIndexComponent', () => {
  let component: AnneeIndexComponent;
  let fixture: ComponentFixture<AnneeIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnneeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
