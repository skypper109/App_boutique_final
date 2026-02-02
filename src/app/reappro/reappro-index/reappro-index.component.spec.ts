import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReapproIndexComponent } from './reappro-index.component';

describe('ReapproIndexComponent', () => {
  let component: ReapproIndexComponent;
  let fixture: ComponentFixture<ReapproIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReapproIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReapproIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
