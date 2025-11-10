import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas';
import {
  Consulta,
  TipoDiagnostico,
  SeveridadDiagnostico,
  DiagnosticoIAResponse,
  CreateConsultaDto,
} from '../../../core/models/consulta';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-form.component.html',
  styleUrl: './consulta-form.component.scss'
})
export class ConsultaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private consultasService = inject(ConsultasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() pacienteId!: string;
  @Input() citaId?: string;

  consultaForm!: FormGroup;
  loading = false;
  error: string | null = null;
  sugerenciasIA: DiagnosticoIAResponse | null = null;
  cargandoIA = false;
  consultaId?: string; // Para trackear si estamos editando
  modoEdicion = false; // Flag para saber si es edición

  // Enums para templates
  tiposDiagnostico = Object.values(TipoDiagnostico);
  severidades = Object.values(SeveridadDiagnostico);

  // Estado de pestañas
  pestanaActiva: 'datos' | 'signos' | 'diagnosticos' | 'receta' = 'datos';

  ngOnInit(): void {
    // Obtener parámetros de query params (desde la agenda)
    this.route.queryParams.subscribe(params => {
      if (params['pacienteId']) {
        this.pacienteId = params['pacienteId'];
      }
      if (params['citaId']) {
        this.citaId = params['citaId'];
      }
      this.inicializarFormulario();

      // Si hay citaId, verificar si ya existe una consulta
      if (this.citaId) {
        this.verificarConsultaExistente();
      }
    });
  }

  /**
   * Verificar si ya existe una consulta para esta cita
   * Si existe, cargarla para edición
   */
  private verificarConsultaExistente(): void {
    if (!this.citaId) return;

    this.loading = true;
    this.consultasService.obtenerPorCitaId(this.citaId).subscribe({
      next: (consulta) => {
        if (consulta) {
          // Ya existe una consulta para esta cita, cargarla
          this.consultaId = consulta.id;
          this.modoEdicion = true;
          this.cargarConsultaEnFormulario(consulta);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al verificar consulta existente:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Cargar datos de consulta existente en el formulario
   */
  private cargarConsultaEnFormulario(consulta: Consulta): void {
    // Cargar datos generales
    this.consultaForm.patchValue({
      pacienteId: consulta.pacienteId,
      citaId: consulta.citaId,
      motivoConsulta: consulta.motivoConsulta,
      padecimientoActual: consulta.padecimientoActual,
      antecedentesFamiliares: consulta.antecedentesFamiliares,
      antecedentesPersonales: consulta.antecedentesPersonales,
      alergias: consulta.alergias,
      exploracionFisica: consulta.exploracionFisica,
      planTratamiento: consulta.planTratamiento,
      indicacionesRecomendaciones: consulta.indicacionesRecomendaciones,
      proximaConsulta: consulta.proximaConsulta,
    });

    // Cargar signos vitales
    if (consulta.signosVitales) {
      this.consultaForm.get('signosVitales')?.patchValue(consulta.signosVitales);
    }

    // Cargar diagnósticos
    if (consulta.diagnosticos && consulta.diagnosticos.length > 0) {
      consulta.diagnosticos.forEach(diag => {
        const diagnostico = this.fb.group({
          codigoCIE10: [diag.codigoCIE10 || ''],
          descripcion: [diag.descripcion, Validators.required],
          tipo: [diag.tipo, Validators.required],
          severidad: [diag.severidad, Validators.required],
          notas: [diag.notas || ''],
          sugeridoPorIA: [diag.sugeridoPorIA || false],
          confianzaIA: [diag.confianzaIA || null]
        });
        this.diagnosticos.push(diagnostico);
      });
    }

    // Cargar receta
    if (consulta.receta) {
      this.consultaForm.get('receta')?.patchValue({
        indicacionesGenerales: consulta.receta.indicacionesGenerales,
        recomendaciones: consulta.receta.recomendaciones,
        estudiosLaboratorio: consulta.receta.estudiosLaboratorio,
        proximaRevision: consulta.receta.proximaRevision
      });

      // Cargar medicamentos
      if (consulta.receta.medicamentos && consulta.receta.medicamentos.length > 0) {
        consulta.receta.medicamentos.forEach(med => {
          const medicamento = this.fb.group({
            nombre: [med.nombre, Validators.required],
            principioActivo: [med.principioActivo || ''],
            dosis: [med.dosis, Validators.required],
            via: [med.via, Validators.required],
            frecuencia: [med.frecuencia, Validators.required],
            duracion: [med.duracion, Validators.required],
            indicaciones: [med.indicaciones || '']
          });
          this.medicamentos.push(medicamento);
        });
      }
    }
  }

  private inicializarFormulario(): void {
    this.consultaForm = this.fb.group({
      pacienteId: [this.pacienteId, Validators.required],
      citaId: [this.citaId],
      motivoConsulta: ['', Validators.required],
      padecimientoActual: ['', Validators.required],
      antecedentesFamiliares: [''],
      antecedentesPersonales: [''],
      alergias: [''],
      exploracionFisica: [''],
      planTratamiento: [''],
      indicacionesRecomendaciones: [''],
      proximaConsulta: [''],

      // Signos vitales
      signosVitales: this.fb.group({
        presionSistolica: [null, [Validators.min(40), Validators.max(300)]],
        presionDiastolica: [null, [Validators.min(20), Validators.max(200)]],
        frecuenciaCardiaca: [null, [Validators.min(30), Validators.max(300)]],
        frecuenciaRespiratoria: [null, [Validators.min(5), Validators.max(60)]],
        temperatura: [null, [Validators.min(32), Validators.max(45)]],
        saturacionOxigeno: [null, [Validators.min(50), Validators.max(100)]],
        peso: [null, Validators.min(0)],
        talla: [null, Validators.min(0)],
        perimetroCefalico: [null],
        perimetroAbdominal: [null],
        glucosa: [null],
        observaciones: ['']
      }),

      // Diagnósticos
      diagnosticos: this.fb.array([]),

      // Receta
      receta: this.fb.group({
        medicamentos: this.fb.array([]),
        indicacionesGenerales: [''],
        recomendaciones: [''],
        estudiosLaboratorio: [''],
        proximaRevision: ['']
      })
    });
  }

  // Getters para FormArrays
  get diagnosticos(): FormArray {
    return this.consultaForm.get('diagnosticos') as FormArray;
  }

  get medicamentos(): FormArray {
    return this.consultaForm.get('receta.medicamentos') as FormArray;
  }

  // Agregar diagnóstico
  agregarDiagnostico(): void {
    const diagnostico = this.fb.group({
      codigoCIE10: [''],
      descripcion: ['', Validators.required],
      tipo: [TipoDiagnostico.PRESUNTIVO, Validators.required],
      severidad: [SeveridadDiagnostico.LEVE, Validators.required],
      notas: [''],
      sugeridoPorIA: [false],
      confianzaIA: [null]
    });
    this.diagnosticos.push(diagnostico);
  }

  // Eliminar diagnóstico
  eliminarDiagnostico(index: number): void {
    this.diagnosticos.removeAt(index);
  }

  // Agregar medicamento
  agregarMedicamento(): void {
    const medicamento = this.fb.group({
      nombre: ['', Validators.required],
      principioActivo: [''],
      dosis: ['', Validators.required],
      via: ['oral', Validators.required],
      frecuencia: ['', Validators.required],
      duracion: ['', Validators.required],
      indicaciones: ['']
    });
    this.medicamentos.push(medicamento);
  }

  // Eliminar medicamento
  eliminarMedicamento(index: number): void {
    this.medicamentos.removeAt(index);
  }

  // Obtener sugerencias de IA
  async obtenerSugerenciasIA(): Promise<void> {
    if (!this.consultaForm.get('padecimientoActual')?.value) {
      this.error = 'Por favor, ingresa el padecimiento actual antes de solicitar sugerencias';
      return;
    }

    this.cargandoIA = true;
    this.error = null;

    const dto = {
      sintomas: this.consultaForm.get('padecimientoActual')?.value,
      antecedentes: [
        this.consultaForm.get('antecedentesFamiliares')?.value,
        this.consultaForm.get('antecedentesPersonales')?.value,
        this.consultaForm.get('alergias')?.value ? `Alergias: ${this.consultaForm.get('alergias')?.value}` : ''
      ].filter(Boolean).join('\n'),
      exploracionFisica: this.consultaForm.get('exploracionFisica')?.value,
      signosVitales: this.formatearSignosVitales()
    };

    // Primero guardar la consulta para obtener un ID
    if (!this.consultaForm.get('id')?.value) {
      try {
        const consulta = await this.guardarBorrador();

        // Luego obtener sugerencias
        this.consultasService.obtenerSugerenciasIA(consulta.id!, dto).subscribe({
          next: (sugerencias) => {
            this.sugerenciasIA = sugerencias;
            this.cargandoIA = false;
          },
          error: (err) => {
            this.error = 'Error al obtener sugerencias de IA: ' + err.message;
            this.cargandoIA = false;
          }
        });
      } catch (err: any) {
        this.error = 'Error al guardar consulta: ' + err.message;
        this.cargandoIA = false;
      }
    }
  }

  // Aplicar diagnóstico sugerido por IA
  aplicarDiagnosticoIA(diagnostico: any): void {
    const nuevoDiagnostico = this.fb.group({
      codigoCIE10: [diagnostico.codigoCIE10 || ''],
      descripcion: [diagnostico.nombre, Validators.required],
      tipo: [TipoDiagnostico.PRESUNTIVO, Validators.required],
      severidad: [
        diagnostico.probabilidad > 0.7 ? SeveridadDiagnostico.MODERADO : SeveridadDiagnostico.LEVE,
        Validators.required
      ],
      notas: [diagnostico.justificacion],
      sugeridoPorIA: [true],
      confianzaIA: [diagnostico.probabilidad]
    });
    this.diagnosticos.push(nuevoDiagnostico);
  }

  // Guardar consulta como borrador
  private async guardarBorrador(): Promise<Consulta> {
    const dto: CreateConsultaDto = this.consultaForm.value;
    return new Promise((resolve, reject) => {
      this.consultasService.crear(dto).subscribe({
        next: (consulta) => resolve(consulta),
        error: (err) => reject(err)
      });
    });
  }

  // Guardar consulta
  async guardar(): Promise<void> {
    if (this.consultaForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      this.marcarCamposInvalidos();
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateConsultaDto = this.consultaForm.value;

    // Si estamos en modo edición, actualizar; si no, crear
    if (this.modoEdicion && this.consultaId) {
      this.consultasService.actualizar(this.consultaId, dto).subscribe({
        next: (consulta) => {
          this.loading = false;
          this.router.navigate(['/consultas', consulta.id]);
        },
        error: (err) => {
          this.error = 'Error al actualizar consulta: ' + err.message;
          this.loading = false;
        }
      });
    } else {
      this.consultasService.crear(dto).subscribe({
        next: (consulta) => {
          this.loading = false;
          this.router.navigate(['/consultas', consulta.id]);
        },
        error: (err) => {
          this.error = 'Error al guardar consulta: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  // Completar consulta
  async completar(): Promise<void> {
    await this.guardar();
    // Después de guardar, completar la consulta
    // Esto se manejará en el componente de detalle
  }

  // Formatear signos vitales para IA
  private formatearSignosVitales(): string {
    const signos = this.consultaForm.get('signosVitales')?.value;
    const vitales: string[] = [];

    if (signos.presionSistolica && signos.presionDiastolica) {
      vitales.push(`PA: ${signos.presionSistolica}/${signos.presionDiastolica} mmHg`);
    }
    if (signos.frecuenciaCardiaca) {
      vitales.push(`FC: ${signos.frecuenciaCardiaca} lpm`);
    }
    if (signos.frecuenciaRespiratoria) {
      vitales.push(`FR: ${signos.frecuenciaRespiratoria} rpm`);
    }
    if (signos.temperatura) {
      vitales.push(`Temp: ${signos.temperatura}°C`);
    }
    if (signos.saturacionOxigeno) {
      vitales.push(`SpO2: ${signos.saturacionOxigeno}%`);
    }

    return vitales.join(', ');
  }

  // Marcar campos inválidos
  private marcarCamposInvalidos(): void {
    Object.keys(this.consultaForm.controls).forEach(key => {
      const control = this.consultaForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  // Cambiar pestaña
  cambiarPestana(pestana: 'datos' | 'signos' | 'diagnosticos' | 'receta'): void {
    this.pestanaActiva = pestana;
  }
}
