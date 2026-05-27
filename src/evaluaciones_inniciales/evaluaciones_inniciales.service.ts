import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionesIniciales } from './entities/evaluaciones_inniciale.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { CreateEvaluacionesInnicialeInput } from './dto/create-evaluaciones_inniciale.input';
import { UpdateEvaluacionesInnicialeInput } from './dto/update-evaluaciones_inniciale.input';
import { CategoriaSemaforo } from '../compartido/enums';

/** Minutos de sesión por categoría semáforo según protocolo clínico */
const TIEMPO_POR_SEMAFORO: Record<CategoriaSemaforo, number> = {
  [CategoriaSemaforo.ROJO]: 120,
  [CategoriaSemaforo.AMARILLO]: 90,
  [CategoriaSemaforo.VERDE]: 45,
};

@Injectable()
export class EvaluacionesInnicialesService {
  constructor(
    @InjectRepository(EvaluacionesIniciales)
    private readonly evaluacionesRepository: Repository<EvaluacionesIniciales>,
  ) {}

  /**
   * Registra la evaluación inicial del paciente y calcula
   * el tiempo de sesión según la categoría semáforo.
   *
   * @param datos - Datos de la evaluación inicial.
   * @returns La evaluación inicial creada con el tiempo calculado.
   */
  async crearEvaluacionesIniciales(
    datos: CreateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    const tiempo_sesion_minutos = TIEMPO_POR_SEMAFORO[datos.categoria_semaforo];

    // Marca evaluaciones previas como no vigentes
    await this.evaluacionesRepository.update(
      { paciente: { id: datos.pacienteId }, es_vigente: true },
      { es_vigente: false },
    );

    const evaluacion = this.evaluacionesRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      empleado_id: datos.empleadoId,
      fecha_evaluacion: datos.fecha_evaluacion,
      categoria_semaforo: datos.categoria_semaforo,
      justificacion_semaforo: datos.justificacion_semaforo,
      categoria_trabajo: datos.categoria_trabajo,
      categoria_enfermedad: datos.categoria_enfermedad,
      descripcion_enfermedad: datos.descripcion_enfermedad,
      tiempo_sesion_minutos,
      frecuencia_sesion: datos.frecuencia_sesion,
      observaciones: datos.observaciones,
      es_vigente: datos.es_vigente ?? true,
    });
    return this.evaluacionesRepository.save(evaluacion);
  }

  /**
   * Retorna todas las evaluaciones iniciales del sistema.
   *
   * @returns Lista de evaluaciones.
   */
  async listarEvaluacionesIniciales(): Promise<EvaluacionesIniciales[]> {
    return this.evaluacionesRepository.find();
  }

  /**
   * Retorna las evaluaciones iniciales de un paciente específico.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de evaluaciones del paciente.
   */
  async listarEvaluacionesPorPaciente(
    pacienteId: number,
  ): Promise<EvaluacionesIniciales[]> {
    return this.evaluacionesRepository.find({
      where: { paciente: { id: pacienteId } },
    });
  }

  /**
   * Busca una evaluación inicial por su identificador único.
   *
   * @param id - ID de la evaluación.
   * @returns La evaluación encontrada.
   * @throws NotFoundException si la evaluación no existe.
   */
  async verEvaluacionInicial(id: number): Promise<EvaluacionesIniciales> {
    const evaluacion = await this.evaluacionesRepository.findOne({ where: { id } });
    if (!evaluacion)
      throw new NotFoundException(`Evaluación inicial con id ${id} no encontrada`);
    return evaluacion;
  }

  /**
   * Actualiza campos de una evaluación inicial existente.
   * Si se cambia la categoría semáforo, recalcula el tiempo de sesión.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns La evaluación actualizada.
   */
  async editarEvaluacionInicial(
    datos: UpdateEvaluacionesInnicialeInput,
  ): Promise<EvaluacionesIniciales> {
    const { id, ...campos } = datos;
    await this.verEvaluacionInicial(id);

    if (campos.categoria_semaforo) {
      (campos as any).tiempo_sesion_minutos =
        TIEMPO_POR_SEMAFORO[campos.categoria_semaforo];
    }

    await this.evaluacionesRepository.update(id, campos);
    return this.verEvaluacionInicial(id);
  }

  /**
   * Elimina una evaluación inicial del sistema.
   *
   * @param id - ID de la evaluación a eliminar.
   * @returns La evaluación eliminada.
   */
  async eliminarEvaluacionInicial(id: number): Promise<EvaluacionesIniciales> {
    const evaluacion = await this.verEvaluacionInicial(id);
    await this.evaluacionesRepository.delete(id);
    return evaluacion;
  }
}
