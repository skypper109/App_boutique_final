import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdCreateComponent } from './prod-create.component';

describe('ProdCreateComponent', () => {
  let component: ProdCreateComponent;
  let fixture: ComponentFixture<ProdCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
