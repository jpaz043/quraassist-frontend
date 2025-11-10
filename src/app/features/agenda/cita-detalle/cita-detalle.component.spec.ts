import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaDetalleComponent } from './cita-detalle.component';

describe('CitaDetalleComponent', () => {
  let component: CitaDetalleComponent;
  let fixture: ComponentFixture<CitaDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
