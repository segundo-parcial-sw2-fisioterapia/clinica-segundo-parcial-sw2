import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Citas } from './entities/cita.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { CreateCitaInput } from './dto/create-cita.input';
import { UpdateCitaInput } from './dto/update-cita.input';
import { EstadoCita, OrigenCita } from '../compartido/enums';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Citas)
    private readonly citasRepository: Repository<Citas>,
  ) {}

  /**
   * Agenda una nueva cita presencial o desde flujo automatizado.
   *
   * @param datos - Datos de la cita, incluye pacienteId y empleadoId.
   * @returns La cita creada.
   */
  async crearCitas(datos: CreateCitaInput): Promise<Citas> {
    const cita = this.citasRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      empleado_id: datos.empleadoId,
      fecha_hora: datos.fecha_hora,
      duracion_minutos: datos.duracion_minutos,
      tipo: datos.tipo,
      origen: datos.origen ?? OrigenCita.RECEPCION,
      estado: datos.estado ?? EstadoCita.PROGRAMADA,
      observaciones: datos.observaciones,
    });
    return this.citasRepository.save(cita);
  }

  /**
   * Retorna todas las citas registradas en el sistema.
   *
   * @returns Lista de citas con sus pacientes.
   */
  async listarCitas(): Promise<Citas[]> {
    return this.citasRepository.find({ order: { fecha_hora: 'ASC' } });
  }

  /**
   * Retorna las citas de un paciente específico.
   *
   * @param pacienteId - ID del paciente.
   * @returns Lista de citas del paciente ordenadas por fecha.
   */
  async listarCitasPorPaciente(pacienteId: number): Promise<Citas[]> {
    return this.citasRepository.find({
      where: { paciente: { id: pacienteId } },
      order: { fecha_hora: 'ASC' },
    });
  }

  /**
   * Retorna las citas de un fisioterapeuta en una fecha determinada.
   *
   * @param empleadoId - ID del fisioterapeuta.
   * @param fecha - Fecha a consultar (YYYY-MM-DD).
   * @returns Lista de citas del fisioterapeuta en esa fecha.
   */
  async listarCitasPorEmpleadoYFecha(
    empleadoId: number,
    fecha: string,
  ): Promise<Citas[]> {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59`);
    return this.citasRepository.find({
      where: {
        empleado_id: empleadoId,
        fecha_hora: Between(inicio, fin),
      },
      order: { fecha_hora: 'ASC' },
    });
  }

  /**
   * Retorna citas próximas con estado PROGRAMADA o CONFIRMADA
   * (usadas por n8n para enviar recordatorios).
   *
   * @param horasAntelacion - Ventana de horas hacia el futuro.
   * @returns Lista de citas próximas.
   */
  async listarCitasProximas(horasAntelacion: number = 24): Promise<Citas[]> {
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + horasAntelacion * 60 * 60 * 1000);
    return this.citasRepository.find({
      where: [
        { estado: EstadoCita.PROGRAMADA, fecha_hora: Between(ahora, limite) },
        { estado: EstadoCita.CONFIRMADA, fecha_hora: Between(ahora, limite) },
      ],
      order: { fecha_hora: 'ASC' },
    });
  }

  /**
   * Busca una cita por su identificador único.
   *
   * @param id - ID de la cita.
   * @returns La cita encontrada.
   * @throws NotFoundException si la cita no existe.
   */
  async verCita(id: number): Promise<Citas> {
    const cita = await this.citasRepository.findOne({ where: { id } });
    if (!cita) throw new NotFoundException(`Cita con id ${id} no encontrada`);
    return cita;
  }

  /**
   * Actualiza los datos de una cita existente.
   *
   * @param datos - Campos a actualizar, incluye el id.
   * @returns La cita actualizada.
   */
  async editarCita(datos: UpdateCitaInput): Promise<Citas> {
    const { id, ...campos } = datos;
    await this.verCita(id);
    await this.citasRepository.update(id, campos);
    return this.verCita(id);
  }

  /**
   * Confirma una cita cambiando su estado a CONFIRMADA.
   *
   * @param id - ID de la cita.
   * @returns La cita con estado CONFIRMADA.
   */
  async confirmarCita(id: number): Promise<Citas> {
    await this.verCita(id);
    await this.citasRepository.update(id, { estado: EstadoCita.CONFIRMADA });
    return this.verCita(id);
  }

  /**
   * Cancela una cita cambiando su estado a CANCELADA.
   *
   * @param id - ID de la cita.
   * @returns La cita con estado CANCELADA.
   */
  async cancelarCita(id: number): Promise<Citas> {
    await this.verCita(id);
    await this.citasRepository.update(id, { estado: EstadoCita.CANCELADA });
    return this.verCita(id);
  }

  /**
   * Elimina una cita del sistema de forma permanente.
   *
   * @param id - ID de la cita a eliminar.
   * @returns La cita eliminada.
   */
  async eliminarCita(id: number): Promise<Citas> {
    const cita = await this.verCita(id);
    await this.citasRepository.delete(id);
    return cita;
  }
}
