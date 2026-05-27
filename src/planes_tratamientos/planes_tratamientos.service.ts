import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanesTratamientos } from './entities/planes_tratamiento.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { EvaluacionesIniciales } from '../evaluaciones_inniciales/entities/evaluaciones_inniciale.entity';
import { CreatePlanesTratamientoInput } from './dto/create-planes_tratamiento.input';
import { UpdatePlanesTratamientoInput } from './dto/update-planes_tratamiento.input';
import { EstadoPlanTratamiento } from '../compartido/enums';

@Injectable()
export class PlanesTratamientosService {
  constructor(
    @InjectRepository(PlanesTratamientos)
    private readonly planesRepository: Repository<PlanesTratamientos>,
  ) {}

  /**
   * Crea un plan de tratamiento vinculado a un paciente y opcionalmente
   * a su evaluación inicial.
   *
   * @param datos - Datos del plan de tratamiento.
   * @returns El plan de tratamiento creado.
   */
  async crearPlanesTratamientos(
    datos: CreatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    const plan = this.planesRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      evaluacion_inicial: datos.evaluacionInicialId
        ? ({ id: datos.evaluacionInicialId } as EvaluacionesIniciales)
        : undefined,
      empleado_id: datos.empleadoId,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin_estimada: datos.fecha_fin_estimada,
      objetivo_terapeutico: datos.objetivo_terapeutico,
      estado: datos.estado ?? EstadoPlanTratamiento.ACTIVO,
      observaciones: datos.observaciones,
    });
    return this.planesRepository.save(plan);
  }

  /**
   * Retorna todos los planes de tratamiento registrados.
   *
   * @returns Lista de planes de tratamiento.
   */
  async listarPlanesTratamientos(): Promise<PlanesTratamientos[]> {
    return this.planesRepository.find();
  }

  /**
   * Retorna los planes de tratamiento de un paciente específico.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de planes del paciente.
   */
  async listarPlanesPorPaciente(pacienteId: number): Promise<PlanesTratamientos[]> {
    return this.planesRepository.find({
      where: { paciente: { id: pacienteId } },
    });
  }

  /**
   * Busca un plan de tratamiento por su identificador único.
   *
   * @param id - ID del plan.
   * @returns El plan encontrado.
   * @throws NotFoundException si el plan no existe.
   */
  async verPlanTratamiento(id: number): Promise<PlanesTratamientos> {
    const plan = await this.planesRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan de tratamiento con id ${id} no encontrado`);
    return plan;
  }

  /**
   * Actualiza un plan de tratamiento existente.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns El plan actualizado.
   */
  async editarPlanTratamiento(
    datos: UpdatePlanesTratamientoInput,
  ): Promise<PlanesTratamientos> {
    const { id, evaluacionInicialId, ...campos } = datos;
    await this.verPlanTratamiento(id);

    const actualizacion: any = { ...campos };
    if (evaluacionInicialId !== undefined) {
      actualizacion.evaluacion_inicial = { id: evaluacionInicialId };
    }

    await this.planesRepository.update(id, actualizacion);
    return this.verPlanTratamiento(id);
  }

  /**
   * Elimina un plan de tratamiento del sistema.
   *
   * @param id - ID del plan a eliminar.
   * @returns El plan eliminado.
   */
  async eliminarPlanTratamiento(id: number): Promise<PlanesTratamientos> {
    const plan = await this.verPlanTratamiento(id);
    await this.planesRepository.delete(id);
    return plan;
  }
}
