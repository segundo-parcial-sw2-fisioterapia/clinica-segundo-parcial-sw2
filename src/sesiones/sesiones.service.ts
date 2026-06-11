import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesiones } from './entities/sesione.entity';
import { PlanesTratamientos } from '../planes_tratamientos/entities/planes_tratamiento.entity';
import { CreateSesioneInput } from './dto/create-sesione.input';
import { UpdateSesioneInput } from './dto/update-sesione.input';
import { EstadoSesion } from '../compartido/enums';
import { SesionesGateway } from './sesiones.gateway';
import { BlockchainClientService } from '../blockchain/blockchain-client.service';
import { BiClientService } from '../compartido/bi-client.service';

const ESTADOS_SOLO_LECTURA = [
  EstadoSesion.CERRADA,
  EstadoSesion.FIRMADA,
  EstadoSesion.CANCELADA,
];

@Injectable()
export class SesionesService {
  private readonly logger = new Logger(SesionesService.name);

  constructor(
    @InjectRepository(Sesiones)
    private readonly sesionesRepository: Repository<Sesiones>,
    private readonly gateway: SesionesGateway,
    private readonly blockchainClient: BlockchainClientService,
    private readonly biClient: BiClientService,
  ) {}

  /**
   * Crea una sesión de fisioterapia vinculada a un plan de tratamiento.
   * Las sesiones nacen en estado PROGRAMADA; pasan a HABILITADA al recibir
   * el evento mensualidad_pagada desde gestion-administrativa.
   */
  async crearSesiones(datos: CreateSesioneInput): Promise<Sesiones> {
    const sesion = this.sesionesRepository.create({
      plan_tratamiento: { id: datos.planTratamientoId } as PlanesTratamientos,
      mensualidad_id: datos.mensualidadId,
      numero_sesion: datos.numeroSesion,
      empleado_id: datos.empleadoId,
      fecha_hora_programada: new Date(datos.fechaHoraProgramada),
      fecha_hora_inicio: datos.fecha_hora_inicio,
      fecha_hora_fin: datos.fecha_hora_fin,
      observaciones_clinicas: datos.observaciones_clinicas,
      nivel_dolor_reportado: datos.nivel_dolor_reportado,
      nivel_dolor_post: datos.nivel_dolor_post,
      estado_sesion: datos.estado_sesion ?? EstadoSesion.PROGRAMADA,
      url_documento_firmado: datos.url_documento_firmado,
      hash_blockchain: datos.hash_blockchain,
    });
    return this.sesionesRepository.save(sesion);
  }

  /**
   * Retorna todas las sesiones registradas, ordenadas por fecha programada ascendente.
   */
  async listarSesiones(): Promise<Sesiones[]> {
    return this.sesionesRepository.find({ order: { fecha_hora_programada: 'ASC' } });
  }

  /**
   * Retorna las sesiones asignadas a un fisioterapeuta específico, ordenadas por número de sesión.
   * Filtra directamente por empleado_id sin navegar relaciones.
   *
   * @param empleadoId - ID del empleado (fisioterapeuta) en gestion-administrativa.
   */
  async listarSesionesPorEmpleado(empleadoId: number): Promise<Sesiones[]> {
    return this.sesionesRepository.find({
      where: { empleado_id: empleadoId },
      order: { numero_sesion: 'ASC' },
    });
  }

  /**
   * Retorna el historial de sesiones de un paciente navegando la relación
   * sesion → plan_tratamiento → evaluacion_inicial → paciente.
   */
  async listarSesionesPorPaciente(pacienteId: number): Promise<Sesiones[]> {
    return this.sesionesRepository.createQueryBuilder('sesion')
      .leftJoinAndSelect('sesion.plan_tratamiento', 'plan_tratamiento')
      .leftJoinAndSelect('plan_tratamiento.evaluacion_inicial', 'evaluacion_inicial')
      .leftJoinAndSelect('evaluacion_inicial.paciente', 'paciente')
      .where('paciente.id = :pacienteId', { pacienteId })
      .orderBy('sesion.fecha_hora_programada', 'ASC')
      .getMany();
  }

  /**
   * Retorna todas las sesiones de un plan de tratamiento específico.
   */
  async listarSesionesPorPlan(planTratamientoId: number): Promise<Sesiones[]> {
    return this.sesionesRepository.find({
      where: { plan_tratamiento: { id: planTratamientoId } },
      order: { numero_sesion: 'ASC' },
    });
  }

  /**
   * Retorna las sesiones cubiertas por una mensualidad específica.
   */
  async listarSesionesPorMensualidad(mensualidadId: number): Promise<Sesiones[]> {
    return this.sesionesRepository.find({
      where: { mensualidad_id: mensualidadId },
      order: { numero_sesion: 'ASC' },
    });
  }

  /**
   * Busca una sesión por su identificador único.
   *
   * @throws NotFoundException si la sesión no existe.
   */
  async verSesion(id: number): Promise<Sesiones> {
    const sesion = await this.sesionesRepository.findOne({ where: { id } });
    if (!sesion) throw new NotFoundException(`Sesión con id ${id} no encontrada`);
    return sesion;
  }

  /**
   * Actualiza datos clínicos de una sesión (observaciones, dolor, estado, etc.).
   * Rechaza la edición si la sesión ya está CERRADA, FIRMADA o CANCELADA.
   * Mapea los campos camelCase del DTO a los nombres snake_case de la entidad.
   */
  async editarSesion(datos: UpdateSesioneInput): Promise<Sesiones> {
    const sesion = await this.verSesion(datos.id);

    if (ESTADOS_SOLO_LECTURA.includes(sesion.estado_sesion)) {
      throw new BadRequestException(
        `No se puede editar una sesión en estado ${sesion.estado_sesion}. ` +
        `Solo las sesiones PROGRAMADA, HABILITADA o ABIERTA son editables.`,
      );
    }

    const {
      id,
      planTratamientoId,
      mensualidadId,
      numeroSesion,
      fechaHoraProgramada,
      empleadoId,
      ...campos
    } = datos;

    const actualizacion: any = { ...campos };
    if (planTratamientoId !== undefined) actualizacion.plan_tratamiento = { id: planTratamientoId };
    if (mensualidadId !== undefined) actualizacion.mensualidad_id = mensualidadId;
    if (numeroSesion !== undefined) actualizacion.numero_sesion = numeroSesion;
    if (fechaHoraProgramada !== undefined) actualizacion.fecha_hora_programada = new Date(fechaHoraProgramada);
    if (empleadoId !== undefined) actualizacion.empleado_id = empleadoId;

    await this.sesionesRepository.update(id, actualizacion);
    const actualizada = await this.verSesion(id);

    if (actualizacion.estado_sesion === EstadoSesion.HABILITADA) {
      this.gateway.emitirSesionHabilitada(actualizada.id, actualizada.empleado_id ?? null);
    }

    return actualizada;
  }

  /**
   * Asigna o reasigna un fisioterapeuta a una sesión.
   * Solo disponible para recepcionistas y administradores.
   * Emite evento WebSocket 'sesion_asignada' al fisioterapeuta destino.
   *
   * @param id - ID de la sesión.
   * @param empleadoId - ID del fisioterapeuta en gestion-administrativa.
   */
  async asignarFisioterapeuta(id: number, empleadoId: number): Promise<Sesiones> {
    const sesion = await this.verSesion(id);

    if (ESTADOS_SOLO_LECTURA.includes(sesion.estado_sesion)) {
      throw new BadRequestException(
        `No se puede reasignar una sesión en estado ${sesion.estado_sesion}.`,
      );
    }

    await this.sesionesRepository.update(id, { empleado_id: empleadoId });
    const actualizada = await this.verSesion(id);

    const pacienteNombre = [
      sesion.plan_tratamiento?.evaluacion_inicial?.paciente?.persona?.nombre,
      sesion.plan_tratamiento?.evaluacion_inicial?.paciente?.persona?.apellido,
    ]
      .filter(Boolean)
      .join(' ') || 'Paciente';

    this.gateway.emitirSesionAsignada(
      actualizada.id,
      empleadoId,
      pacienteNombre,
      actualizada.numero_sesion,
    );

    return actualizada;
  }

  /**
   * Inicia una sesión habilitada: cambia estado a ABIERTA y registra la hora de inicio real.
   * Solo válido cuando la sesión está en estado HABILITADA.
   * Emite evento WebSocket 'sesion_iniciada'.
   *
   * @throws BadRequestException si el estado no es HABILITADA.
   */
  async iniciarSesion(id: number): Promise<Sesiones> {
    const sesion = await this.verSesion(id);

    if (sesion.estado_sesion !== EstadoSesion.HABILITADA && sesion.estado_sesion !== EstadoSesion.PROGRAMADA) {
      throw new BadRequestException(
        `Solo se puede iniciar una sesión en estado HABILITADA o PROGRAMADA. Estado actual: ${sesion.estado_sesion}`,
      );
    }

    await this.sesionesRepository.update(id, {
      estado_sesion: EstadoSesion.ABIERTA,
      fecha_hora_inicio: new Date(),
    });

    const actualizada = await this.verSesion(id);
    this.gateway.emitirSesionIniciada(actualizada.id, actualizada.empleado_id ?? null);
    return actualizada;
  }

  /**
   * Cierra una sesión abierta: cambia estado a CERRADA y registra la hora de fin real.
   * Una vez cerrada, la sesión es de solo lectura.
   * Los campos blockchain quedan en null hasta que el MS-6 esté disponible.
   * Emite evento WebSocket 'sesion_cerrada'.
   *
   * @throws BadRequestException si el estado no es ABIERTA.
   */
  async cerrarSesion(id: number): Promise<Sesiones> {
    const sesion = await this.verSesion(id);

    if (sesion.estado_sesion !== EstadoSesion.ABIERTA) {
      throw new BadRequestException(
        `Solo se puede cerrar una sesión en estado ABIERTA. Estado actual: ${sesion.estado_sesion}`,
      );
    }

    await this.sesionesRepository.update(id, {
      estado_sesion: EstadoSesion.CERRADA,
      fecha_hora_fin: new Date(),
    });

    const actualizada = await this.verSesion(id);
    this.gateway.emitirSesionCerrada(actualizada.id, actualizada.empleado_id ?? null);

    // Cargar sesión con relaciones para Telemetría
    const sesionCompleta = await this.sesionesRepository.findOne({
      where: { id },
      relations: {
        plan_tratamiento: {
          evaluacion_inicial: {
            paciente: true,
          },
        },
      },
    });

    if (sesionCompleta?.plan_tratamiento?.evaluacion_inicial) {
      const evalInicial = sesionCompleta.plan_tratamiento.evaluacion_inicial;
      this.biClient.emitirEvento({
        tipo_evento: 'sesion_completada',
        paciente_id: evalInicial.paciente?.id,
        empleado_id: sesionCompleta.empleado_id,
        categoria_semaforo: evalInicial.categoria_semaforo?.toLowerCase(),
        categoria_trabajo: evalInicial.categoria_trabajo?.toLowerCase(),
        categoria_enfermedad: evalInicial.categoria_enfermedad?.toLowerCase(),
      }).catch(() => {});
    }

    // Fire-and-forget: no bloquea el retorno al cliente
    this.registrarCierreEnBlockchain(actualizada).catch(() => {});

    return actualizada;
  }

  /**
   * Serializa los datos clínicos de la sesión cerrada y los registra en Sepolia.
   * Opera de forma asíncrona sin bloquear el cierre. Si blockchain no está disponible,
   * la sesión queda cerrada igualmente (hash_blockchain permanece null).
   */
  private async registrarCierreEnBlockchain(sesion: Sesiones): Promise<void> {
    const contenido = JSON.stringify({
      sesionId: sesion.id,
      numeroSesion: sesion.numero_sesion,
      fechaHoraFin: sesion.fecha_hora_fin?.toISOString() ?? null,
      observaciones: sesion.observaciones_clinicas ?? null,
      nivelDolorInicio: sesion.nivel_dolor_reportado ?? null,
      nivelDolorFin: sesion.nivel_dolor_post ?? null,
      empleadoId: sesion.empleado_id ?? null,
    });

    const resultado = await this.blockchainClient.firmar(contenido, 'CLINICO');
    if (resultado) {
      await this.sesionesRepository.update(sesion.id, {
        hash_blockchain: resultado.hash,
      });
      this.logger.log(
        `Sesión ${sesion.id} registrada en Sepolia. hash=${resultado.hash} tx=${resultado.txHash}`,
      );
    }
  }

  /**
   * Cierra y firma digitalmente una sesión, registrando el hash de blockchain.
   * Disponible cuando el MS-6 (blockchain-firmas) esté operativo.
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
   */
  async eliminarSesion(id: number): Promise<Sesiones> {
    const sesion = await this.verSesion(id);
    await this.sesionesRepository.delete(id);
    return sesion;
  }
}
