import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteCreateComponent } from './vente-create.component';

describe('VenteCreateComponent', () => {
  let component: VenteCreateComponent;
  let fixture: ComponentFixture<VenteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
