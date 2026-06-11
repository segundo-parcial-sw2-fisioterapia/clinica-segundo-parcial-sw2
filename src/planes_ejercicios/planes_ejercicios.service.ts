import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanesEjercicios } from './entities/planes_ejercicio.entity';
import { PlanesTratamientos } from '../planes_tratamientos/entities/planes_tratamiento.entity';
import { Ejercicios } from '../ejercicios/entities/ejercicio.entity';
import { CreatePlanesEjercicioInput } from './dto/create-planes_ejercicio.input';
import { UpdatePlanesEjercicioInput } from './dto/update-planes_ejercicio.input';

@Injectable()
export class PlanesEjerciciosService {
  constructor(
    @InjectRepository(PlanesEjercicios)
    private readonly planesEjerciciosRepository: Repository<PlanesEjercicios>,
  ) {}

  /**
   * Asigna un ejercicio a un plan de tratamiento con parámetros personalizados.
   *
   * @param datos - Datos del plan-ejercicio, incluye IDs de plan y ejercicio.
   * @returns El plan-ejercicio creado.
   */
  async crearPlanesEjercicios(
    datos: CreatePlanesEjercicioInput,
  ): Promise<PlanesEjercicios> {
    const planEjercicio = this.planesEjerciciosRepository.create({
      plan_tratamiento: { id: datos.planTratamientoId } as PlanesTratamientos,
      ejercicio: { id: datos.ejercicioId } as Ejercicios,
      repeticiones: datos.repeticiones,
      series: datos.series,
      frecuencia: datos.frecuencia,
      orden: datos.orden,
      activo: datos.activo ?? true,
    });
    return this.planesEjerciciosRepository.save(planEjercicio);
  }

  /**
   * Retorna todos los planes de ejercicio registrados.
   *
   * @returns Lista de planes de ejercicio.
   */
  async listarPlanesEjercicios(): Promise<PlanesEjercicios[]> {
    return this.planesEjerciciosRepository.find();
  }

  /**
   * Retorna los ejercicios asignados a un plan de tratamiento específico.
   *
   * @param planTratamientoId - ID del plan de tratamiento.
   * @returns Lista de planes de ejercicio del plan indicado.
   */
  async listarEjerciciosDePlan(planTratamientoId: number): Promise<PlanesEjercicios[]> {
    return this.planesEjerciciosRepository.find({
      where: { plan_tratamiento: { id: planTratamientoId } },
      order: { orden: 'ASC' },
    });
  }

  /**
   * Retorna los ejercicios asignados a todos los planes de un paciente.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de planes de ejercicio del paciente indicado.
   */
  async listarPlanesEjerciciosPorPaciente(pacienteId: number): Promise<PlanesEjercicios[]> {
    return this.planesEjerciciosRepository.createQueryBuilder('plan_ejercicio')
      .leftJoinAndSelect('plan_ejercicio.plan_tratamiento', 'plan_tratamiento')
      .leftJoinAndSelect('plan_ejercicio.ejercicio', 'ejercicio')
      .leftJoinAndSelect('plan_tratamiento.evaluacion_inicial', 'evaluacion_inicial')
      .leftJoinAndSelect('evaluacion_inicial.paciente', 'paciente')
      .where('paciente.id = :pacienteId', { pacienteId })
      .orderBy('plan_ejercicio.orden', 'ASC')
      .getMany();
  }

  /**
   * Busca un plan-ejercicio por su identificador único.
   *
   * @param id - ID del plan-ejercicio.
   * @returns El plan-ejercicio encontrado.
   * @throws NotFoundException si no existe.
   */
  async verPlanEjercicio(id: number): Promise<PlanesEjercicios> {
    const planEjercicio = await this.planesEjerciciosRepository.findOne({ where: { id } });
    if (!planEjercicio)
      throw new NotFoundException(`Plan-ejercicio con id ${id} no encontrado`);
    return planEjercicio;
  }

  /**
   * Actualiza los parámetros personalizados de un ejercicio en el plan.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns El plan-ejercicio actualizado.
   */
  async editarPlanEjercicio(
    datos: UpdatePlanesEjercicioInput,
  ): Promise<PlanesEjercicios> {
    const { id, ...campos } = datos;
    await this.verPlanEjercicio(id);
    await this.planesEjerciciosRepository.update(id, campos);
    return this.verPlanEjercicio(id);
  }

  /**
   * Elimina un ejercicio del plan de tratamiento.
   *
   * @param id - ID del plan-ejercicio a eliminar.
   * @returns El plan-ejercicio eliminado.
   */
  async eliminarPlanEjercicio(id: number): Promise<PlanesEjercicios> {
    const planEjercicio = await this.verPlanEjercicio(id);
    await this.planesEjerciciosRepository.delete(id);
    return planEjercicio;
  }
}
