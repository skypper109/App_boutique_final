import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdIndexComponent } from './prod-index.component';

describe('ProdIndexComponent', () => {
  let component: ProdIndexComponent;
  let fixture: ComponentFixture<ProdIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
