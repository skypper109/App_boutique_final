import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptaInventaireComponent } from './compta-inventaire.component';

describe('ComptaInventaireComponent', () => {
  let component: ComptaInventaireComponent;
  let fixture: ComponentFixture<ComptaInventaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComptaInventaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptaInventaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
