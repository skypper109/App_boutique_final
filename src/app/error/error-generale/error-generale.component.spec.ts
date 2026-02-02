import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorGeneraleComponent } from './error-generale.component';

describe('ErrorGeneraleComponent', () => {
  let component: ErrorGeneraleComponent;
  let fixture: ComponentFixture<ErrorGeneraleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorGeneraleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorGeneraleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
