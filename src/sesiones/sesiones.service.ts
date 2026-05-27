import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesiones } from './entities/sesione.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { Citas } from '../citas/entities/cita.entity';
import { CreateSesioneInput } from './dto/create-sesione.input';
import { UpdateSesioneInput } from './dto/update-sesione.input';
import { EstadoSesion } from '../compartido/enums';

@Injectable()
export class SesionesService {
  constructor(
    @InjectRepository(Sesiones)
    private readonly sesionesRepository: Repository<Sesiones>,
  ) {}

  /**
   * Abre una sesión de fisioterapia vinculada a una cita.
   *
   * @param datos - Datos de la sesión, incluye citaId (opcional) y pacienteId.
   * @returns La sesión creada con estado ABIERTA.
   */
  async crearSesiones(datos: CreateSesioneInput): Promise<Sesiones> {
    const sesion = this.sesionesRepository.create({
      cita: datos.citaId ? ({ id: datos.citaId } as Citas) : undefined,
      paciente: { id: datos.pacienteId } as Pacientes,
      empleado_id: datos.empleadoId,
      fecha_hora_inicio: datos.fecha_hora_inicio,
      fecha_hora_fin: datos.fecha_hora_fin,
      observaciones_clinicas: datos.observaciones_clinicas,
      nivel_dolor_reportado: datos.nivel_dolor_reportado,
      nivel_dolor_post: datos.nivel_dolor_post,
      estado_sesion: datos.estado_sesion ?? EstadoSesion.ABIERTA,
      url_documento_firmado: datos.url_documento_firmado,
      hash_blockchain: datos.hash_blockchain,
    });
    return this.sesionesRepository.save(sesion);
  }

  /**
   * Retorna todas las sesiones registradas en el sistema.
   *
   * @returns Lista de sesiones.
   */
  async listarSesiones(): Promise<Sesiones[]> {
    return this.sesionesRepository.find({ order: { fecha_hora_inicio: 'DESC' } });
  }

  /**
   * Retorna el historial de sesiones de un paciente específico.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de sesiones del paciente, más recientes primero.
   */
  async listarSesionesPorPaciente(pacienteId: number): Promise<Sesiones[]> {
    return this.sesionesRepository.find({
      where: { paciente: { id: pacienteId } },
      order: { fecha_hora_inicio: 'DESC' },
    });
  }

  /**
   * Busca una sesión por su identificador único.
   *
   * @param id - ID de la sesión.
   * @returns La sesión encontrada.
   * @throws NotFoundException si la sesión no existe.
   */
  async verSesion(id: number): Promise<Sesiones> {
    const sesion = await this.sesionesRepository.findOne({ where: { id } });
    if (!sesion) throw new NotFoundException(`Sesión con id ${id} no encontrada`);
    return sesion;
  }

  /**
   * Actualiza datos de una sesión (evolución clínica, niveles de dolor, etc.).
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns La sesión actualizada.
   */
  async editarSesion(datos: UpdateSesioneInput): Promise<Sesiones> {
    const { id, citaId, ...campos } = datos;
    await this.verSesion(id);

    const actualizacion: any = { ...campos };
    if (citaId !== undefined) {
      actualizacion.cita = { id: citaId };
    }

    await this.sesionesRepository.update(id, actualizacion);
    return this.verSesion(id);
  }

  /**
   * Cierra y firma digitalmente una sesión, registrando el hash de blockchain.
   *
   * @param id - ID de la sesión.
   * @param urlDocumento - Ruta en S3 del documento firmado.
   * @param hashBlockchain - Hash devuelto por blockchain-firmas.
   * @returns La sesión con estado FIRMADA.
   */
  async cerrarYFirmarSesion(
    id: number,
    urlDocumento: string,
    hashBlockchain: string,
  ): Promise<Sesiones> {
    await this.verSesion(id);
    await this.sesionesRepository.update(id, {
      estado_sesion: EstadoSesion.FIRMADA,
      fecha_hora_fin: new Date(),
      url_documento_firmado: urlDocumento,
      hash_blockchain: hashBlockchain,
    });
    return this.verSesion(id);
  }

  /**
   * Elimina una sesión del sistema de forma permanente.
   *
   * @param id - ID de la sesión a eliminar.
   * @returns La sesión eliminada.
   */
  async eliminarSesion(id: number): Promise<Sesiones> {
    const sesion = await this.verSesion(id);
    await this.sesionesRepository.delete(id);
    return sesion;
  }
}
