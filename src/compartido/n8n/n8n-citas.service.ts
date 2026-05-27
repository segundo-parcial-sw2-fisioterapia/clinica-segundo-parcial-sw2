import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pacientes } from '../../pacientes/entities/paciente.entity';
import { Personas } from '../../personas/entities/persona.entity';
import { Citas } from '../../citas/entities/cita.entity';
import { RegistrarPacienteN8nDto } from './dto/registrar-paciente-n8n.dto';
import { SolicitarCitaN8nDto } from './dto/solicitar-cita-n8n.dto';
import { EstadoCita, EstadoPaciente, OrigenCita, TipoCita } from '../enums';

@Injectable()
export class N8nCitasService {
  constructor(
    @InjectRepository(Personas)
    private readonly personasRepository: Repository<Personas>,
    @InjectRepository(Pacientes)
    private readonly pacientesRepository: Repository<Pacientes>,
    @InjectRepository(Citas)
    private readonly citasRepository: Repository<Citas>,
  ) {}

  /**
   * Registra una persona y su paciente desde el flujo automatizado de WhatsApp.
   * Si la CI ya existe, retorna el paciente vinculado existente.
   *
   * @param datos - Datos básicos del paciente enviados por n8n.
   * @returns El paciente creado o encontrado.
   */
  async registrarPacienteDesdeWhatsApp(
    datos: RegistrarPacienteN8nDto,
  ): Promise<{ persona: Personas; paciente: Pacientes; esNuevo: boolean }> {
    const personaExistente = await this.personasRepository.findOne({
      where: { ci: datos.ci },
    });

    if (personaExistente) {
      const pacienteExistente = await this.pacientesRepository.findOne({
        where: { persona: { id: personaExistente.id } },
      });
      if (pacienteExistente) {
        return { persona: personaExistente, paciente: pacienteExistente, esNuevo: false };
      }
    }

    const persona = await this.personasRepository.save(
      this.personasRepository.create({
        nombre: datos.nombre,
        apellido: datos.apellido,
        ci: datos.ci,
        telefono: datos.telefono,
      }),
    );

    const paciente = await this.pacientesRepository.save(
      this.pacientesRepository.create({
        persona,
        fecha_nacimiento: datos.fecha_nacimiento,
        direccion: datos.direccion,
        estado: EstadoPaciente.ACTIVO,
      }),
    );

    return { persona, paciente, esNuevo: true };
  }

  /**
   * Consulta los horarios disponibles de un fisioterapeuta en una fecha dada.
   * Devuelve los bloques libres comparando la agenda existente con la jornada.
   *
   * @param empleadoId - ID del fisioterapeuta.
   * @param fecha - Fecha a consultar en formato YYYY-MM-DD.
   * @param duracionMinutos - Duración estándar de la sesión (por defecto 60 min).
   * @returns Lista de objetos con inicio/fin de cada bloque libre.
   */
  async consultarDisponibilidad(
    empleadoId: number,
    fecha: string,
    duracionMinutos: number = 60,
  ): Promise<{ inicio: string; fin: string }[]> {
    const inicio = new Date(`${fecha}T08:00:00`);
    const fin = new Date(`${fecha}T18:00:00`);

    const citasOcupadas = await this.citasRepository.find({
      where: {
        empleado_id: empleadoId,
        fecha_hora: Between(inicio, fin),
        estado: EstadoCita.PROGRAMADA,
      },
      order: { fecha_hora: 'ASC' },
    });

    const bloques: { inicio: string; fin: string }[] = [];
    let cursor = new Date(inicio);

    for (const cita of citasOcupadas) {
      if (cursor < cita.fecha_hora) {
        bloques.push({
          inicio: cursor.toISOString(),
          fin: cita.fecha_hora.toISOString(),
        });
      }
      const finCita = new Date(
        cita.fecha_hora.getTime() + (cita.duracion_minutos ?? duracionMinutos) * 60_000,
      );
      if (finCita > cursor) cursor = finCita;
    }

    if (cursor < fin) {
      bloques.push({ inicio: cursor.toISOString(), fin: fin.toISOString() });
    }

    return bloques;
  }

  /**
   * Agenda una cita desde el flujo automatizado de n8n/WhatsApp.
   *
   * @param datos - Datos de la cita con origen WHATSAPP.
   * @returns La cita creada.
   */
  async agendarCitaDesdeN8n(datos: SolicitarCitaN8nDto): Promise<Citas> {
    const cita = this.citasRepository.create({
      paciente: { id: datos.pacienteId } as Pacientes,
      empleado_id: datos.empleadoId,
      fecha_hora: new Date(datos.fecha_hora),
      tipo: TipoCita.PRIMERA_VEZ,
      origen: OrigenCita.WHATSAPP,
      estado: EstadoCita.PROGRAMADA,
      observaciones: datos.observaciones,
    });
    return this.citasRepository.save(cita);
  }

  /**
   * Confirma una cita cambiando su estado a CONFIRMADA.
   *
   * @param citaId - ID de la cita a confirmar.
   * @returns La cita confirmada.
   */
  async confirmarCita(citaId: number): Promise<Citas> {
    await this.citasRepository.update(citaId, { estado: EstadoCita.CONFIRMADA });
    const cita = await this.citasRepository.findOne({ where: { id: citaId } });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
    }
    return cita;
  }

  /**
   * Cancela una cita cambiando su estado a CANCELADA.
   *
   * @param citaId - ID de la cita a cancelar.
   * @returns La cita cancelada.
   */
  async cancelarCita(citaId: number): Promise<Citas> {
    await this.citasRepository.update(citaId, { estado: EstadoCita.CANCELADA });
    const cita = await this.citasRepository.findOne({ where: { id: citaId } });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
    }
    return cita;
  }

  /**
   * Retorna las citas próximas para que n8n pueda enviar recordatorios.
   *
   * @param horasAntelacion - Ventana de tiempo hacia el futuro.
   * @returns Lista de citas próximas con datos de paciente.
   */
  async obtenerCitasParaRecordatorio(horasAntelacion: number = 24): Promise<Citas[]> {
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + horasAntelacion * 3_600_000);
    return this.citasRepository.find({
      where: [
        { estado: EstadoCita.PROGRAMADA, fecha_hora: Between(ahora, limite) },
        { estado: EstadoCita.CONFIRMADA, fecha_hora: Between(ahora, limite) },
      ],
      order: { fecha_hora: 'ASC' },
    });
  }
}
