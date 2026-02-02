import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatIndexComponent } from './cat-index.component';

describe('CatIndexComponent', () => {
  let component: CatIndexComponent;
  let fixture: ComponentFixture<CatIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
