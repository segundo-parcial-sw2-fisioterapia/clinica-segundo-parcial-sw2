import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionesDomiciliarias } from './entities/sesiones_docmiciliaria.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { PlanesEjercicios } from '../planes_ejercicios/entities/planes_ejercicio.entity';
import { CreateSesionesDocmiciliariaInput } from './dto/create-sesiones_docmiciliaria.input';
import { UpdateSesionesDocmiciliariaInput } from './dto/update-sesiones_docmiciliaria.input';

@Injectable()
export class SesionesDocmiciliariasService {
  constructor(
    @InjectRepository(SesionesDomiciliarias)
    private readonly sesionesDomiciliariasRepository: Repository<SesionesDomiciliarias>,
  ) {}

  /**
   * Registra una sesión domiciliaria completada por el paciente,
   * con los resultados del análisis de Deep Learning.
   *
   * @param datos - Datos de la sesión domiciliaria, incluye pacienteId y planEjercicioId.
   * @returns La sesión domiciliaria creada.
   */
  async crearSesionesDomiciliarias(
    datos: CreateSesionesDocmiciliariaInput,
  ): Promise<SesionesDomiciliarias> {
    const sesion = this.sesionesDomiciliariasRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      plan_ejercicio: { id: datos.planEjercicioId } as PlanesEjercicios,
      fecha_hora: datos.fecha_hora,
      repeticiones_completadas: datos.repeticiones_completadas,
      puntuacion: datos.puntuacion,
      xp_ganado: datos.xp_ganado,
      correcciones_emitidas: datos.correcciones_emitidas,
    });
    return this.sesionesDomiciliariasRepository.save(sesion);
  }

  /**
   * Retorna todas las sesiones domiciliarias registradas.
   *
   * @returns Lista de sesiones domiciliarias.
   */
  async listarSesionesDomiciliarias(): Promise<SesionesDomiciliarias[]> {
    return this.sesionesDomiciliariasRepository.find({
      order: { fecha_hora: 'DESC' },
    });
  }

  /**
   * Retorna las sesiones domiciliarias completadas por un paciente.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de sesiones domiciliarias del paciente.
   */
  async listarSesionesDomiciliariasPorPaciente(
    pacienteId: number,
  ): Promise<SesionesDomiciliarias[]> {
    return this.sesionesDomiciliariasRepository.find({
      where: { paciente: { id: pacienteId } },
      order: { fecha_hora: 'DESC' },
    });
  }

  /**
   * Busca una sesión domiciliaria por su identificador único.
   *
   * @param id - ID de la sesión domiciliaria.
   * @returns La sesión domiciliaria encontrada.
   * @throws NotFoundException si no existe.
   */
  async verSesionDomiciliaria(id: number): Promise<SesionesDomiciliarias> {
    const sesion = await this.sesionesDomiciliariasRepository.findOne({ where: { id } });
    if (!sesion)
      throw new NotFoundException(`Sesión domiciliaria con id ${id} no encontrada`);
    return sesion;
  }

  /**
   * Actualiza los datos de una sesión domiciliaria (por ejemplo,
   * cuando se sincroniza desde modo offline).
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns La sesión domiciliaria actualizada.
   */
  async editarSesionDomiciliaria(
    datos: UpdateSesionesDocmiciliariaInput,
  ): Promise<SesionesDomiciliarias> {
    const { id, ...campos } = datos;
    await this.verSesionDomiciliaria(id);
    await this.sesionesDomiciliariasRepository.update(id, campos);
    return this.verSesionDomiciliaria(id);
  }

  /**
   * Elimina una sesión domiciliaria del sistema.
   *
   * @param id - ID de la sesión a eliminar.
   * @returns La sesión eliminada.
   */
  async eliminarSesionDomiciliaria(id: number): Promise<SesionesDomiciliarias> {
    const sesion = await this.verSesionDomiciliaria(id);
    await this.sesionesDomiciliariasRepository.delete(id);
    return sesion;
  }
}
