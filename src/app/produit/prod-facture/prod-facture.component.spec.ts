import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdFactureComponent } from './prod-facture.component';

describe('ProdFactureComponent', () => {
  let component: ProdFactureComponent;
  let fixture: ComponentFixture<ProdFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdFactureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
