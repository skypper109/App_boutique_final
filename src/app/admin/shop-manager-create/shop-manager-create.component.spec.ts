import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopManagerCreateComponent } from './shop-manager-create.component';

describe('ShopManagerCreateComponent', () => {
  let component: ShopManagerCreateComponent;
  let fixture: ComponentFixture<ShopManagerCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopManagerCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopManagerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
