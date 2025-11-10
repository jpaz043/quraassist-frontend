import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas';
import { HistoriaClinicaResponse } from '../../../core/models/consulta';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.scss'
})
export class HistoriaClinicaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private consultasService = inject(ConsultasService);

  historia: HistoriaClinicaResponse | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const pacienteId = this.route.snapshot.paramMap.get('pacienteId');
    if (pacienteId) {
      this.cargarHistoriaClinica(pacienteId);
    }
  }

  cargarHistoriaClinica(pacienteId: string): void {
    this.loading = true;
    this.error = null;

    this.consultasService.obtenerHistoriaClinica(pacienteId).subscribe({
      next: (historia) => {
        this.historia = historia;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la historia clínica: ' + err.message;
        this.loading = false;
      }
    });
  }

  imprimirHistoria(): void {
    window.print();
  }
}
