import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas';
import { Consulta, EstadoConsulta } from '../../../core/models/consulta';

@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-detalle.component.html',
  styleUrl: './consulta-detalle.component.scss'
})
export class ConsultaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultasService = inject(ConsultasService);

  consulta: Consulta | null = null;
  loading = true;
  error: string | null = null;

  // Enum para template
  EstadoConsulta = EstadoConsulta;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarConsulta(id);
    }
  }

  cargarConsulta(id: string): void {
    this.loading = true;
    this.error = null;

    this.consultasService.obtenerPorId(id).subscribe({
      next: (consulta) => {
        this.consulta = consulta;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la consulta: ' + err.message;
        this.loading = false;
      }
    });
  }

  completarConsulta(): void {
    if (!this.consulta?.id) return;

    if (confirm('¿Está seguro de que desea completar esta consulta?')) {
      this.consultasService.completar(this.consulta.id).subscribe({
        next: (consulta) => {
          this.consulta = consulta;
          alert('Consulta completada exitosamente');
        },
        error: (err) => {
          alert('Error al completar la consulta: ' + err.message);
        }
      });
    }
  }

  imprimirReceta(): void {
    window.print();
  }

  formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      'EN_CURSO': 'En Curso',
      'COMPLETADA': 'Completada',
      'CANCELADA': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
