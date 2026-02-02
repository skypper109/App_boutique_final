import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdEditComponent } from './prod-edit.component';

describe('ProdEditComponent', () => {
  let component: ProdEditComponent;
  let fixture: ComponentFixture<ProdEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
