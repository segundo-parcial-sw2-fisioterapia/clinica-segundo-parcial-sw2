import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanesTratamientos } from './entities/planes_tratamiento.entity';
import { EvaluacionesInnicialesService } from '../evaluaciones_inniciales/evaluaciones_inniciales.service';
import { SesionesService } from '../sesiones/sesiones.service';
import { CreatePlanesTratamientoInput } from './dto/create-planes_tratamiento.input';
import { UpdatePlanesTratamientoInput } from './dto/update-planes_tratamiento.input';
import { EstadoPlanTratamiento } from '../compartido/enums';

@Injectable()
export class PlanesTratamientosService {
  constructor(
    @InjectRepository(PlanesTratamientos)
    private readonly planesRepository: Repository<PlanesTratamientos>,
    @Inject(forwardRef(() => EvaluacionesInnicialesService))
    private readonly evaluacionesService: EvaluacionesInnicialesService,
    @Inject(forwardRef(() => SesionesService))
    private readonly sesionesService: SesionesService,
  ) {}

  /**
   * Crea un plan de tratamiento vinculado a una evaluación inicial.
   * Genera automáticamente N sesiones en estado PROGRAMADA.
   * El precio del plan está determinado por la tarifa referenciada (en gestion-administrativa).
   */
  async crearPlanesTratamientos(
    datos: CreatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    // 1. Obtener la evaluación para heredar el empleado_id
    const evaluacion = await this.evaluacionesService.verEvaluacionInicial(datos.evaluacionInicialId);

    // 2. Crear y guardar el plan
    const plan = this.planesRepository.create({
      evaluacion_inicial: evaluacion,
      fecha_inicio: datos.fecha_inicio,
      duracion_meses_estimada: datos.duracionMesesEstimada,
      numero_sesiones_mes: datos.numeroSesionesMes,
      objetivo_terapeutico: datos.objetivo_terapeutico,
      estado: datos.estado ?? EstadoPlanTratamiento.ACTIVO,
      tarifa_id: datos.tarifaId,
      observaciones: datos.observaciones,
    });
    const planGuardado = await this.planesRepository.save(plan);

    // Las sesiones se crean desde el frontend con las fechas exactas del calendario acordado con el paciente.
    return planGuardado;
  }

  /** Retorna todos los planes de tratamiento registrados. */
  async listarPlanesTratamientos(): Promise<PlanesTratamientos[]> {
    return this.planesRepository.find();
  }

  /** Retorna los planes de un paciente específico. */
  async listarPlanesPorPaciente(pacienteId: number): Promise<PlanesTratamientos[]> {
    return this.planesRepository.find({
      where: { evaluacion_inicial: { paciente: { id: pacienteId } } },
    });
  }

  /** Busca un plan de tratamiento por su ID. */
  async verPlanTratamiento(id: number): Promise<PlanesTratamientos> {
    const plan = await this.planesRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan de tratamiento con id ${id} no encontrado`);
    return plan;
  }

  /** Actualiza un plan de tratamiento existente. */
  async editarPlanTratamiento(
    datos: UpdatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    const {
      id,
      evaluacionInicialId,
      duracionMesesEstimada,
      numeroSesionesMes,
      tarifaId,
      ...campos
    } = datos;
    await this.verPlanTratamiento(id);

    const actualizacion: any = { ...campos };
    if (evaluacionInicialId !== undefined) {
      actualizacion.evaluacion_inicial = { id: evaluacionInicialId };
    }
    if (duracionMesesEstimada !== undefined) {
      actualizacion.duracion_meses_estimada = duracionMesesEstimada;
    }
    if (numeroSesionesMes !== undefined) {
      actualizacion.numero_sesiones_mes = numeroSesionesMes;
    }
    if (tarifaId !== undefined) {
      actualizacion.tarifa_id = tarifaId;
    }

    await this.planesRepository.update(id, actualizacion);
    return this.verPlanTratamiento(id);
  }

  /** Elimina un plan de tratamiento del sistema. */
  async eliminarPlanTratamiento(id: number): Promise<PlanesTratamientos> {
    const plan = await this.verPlanTratamiento(id);
    await this.planesRepository.delete(id);
    return plan;
  }
}
