import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentelistComponent } from './ventelist.component';

describe('VentelistComponent', () => {
  let component: VentelistComponent;
  let fixture: ComponentFixture<VentelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
