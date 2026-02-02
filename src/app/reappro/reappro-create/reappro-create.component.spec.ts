import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReapproCreateComponent } from './reappro-create.component';

describe('ReapproCreateComponent', () => {
  let component: ReapproCreateComponent;
  let fixture: ComponentFixture<ReapproCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReapproCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReapproCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
