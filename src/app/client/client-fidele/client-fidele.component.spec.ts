import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFideleComponent } from './client-fidele.component';

describe('ClientFideleComponent', () => {
  let component: ClientFideleComponent;
  let fixture: ComponentFixture<ClientFideleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFideleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientFideleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
