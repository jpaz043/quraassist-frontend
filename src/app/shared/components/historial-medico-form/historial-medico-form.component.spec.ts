import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialMedicoFormComponent } from './historial-medico-form.component';

describe('HistorialMedicoFormComponent', () => {
  let component: HistorialMedicoFormComponent;
  let fixture: ComponentFixture<HistorialMedicoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialMedicoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistorialMedicoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
