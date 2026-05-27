import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { N8nCitasService } from './n8n-citas.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { RegistrarPacienteN8nDto } from './dto/registrar-paciente-n8n.dto';
import { SolicitarCitaN8nDto } from './dto/solicitar-cita-n8n.dto';
import { RespuestaN8nDto } from './dto/respuesta-n8n.dto';

/**
 * Controlador REST exclusivo para la integración con n8n.
 * Todos los endpoints requieren el header x-n8n-api-key.
 * Prefijo de ruta: /n8n
 */
@Controller('n8n')
@UseGuards(ApiKeyGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class N8nCitasController {
  constructor(private readonly n8nCitasService: N8nCitasService) {}

  /**
   * Registra un nuevo paciente desde el flujo de WhatsApp.
   * Si la CI ya existe, retorna el paciente existente.
   * CU-01 / CU-09
   *
   * POST /n8n/pacientes
   */
  @Post('pacientes')
  async registrarPaciente(
    @Body() datos: RegistrarPacienteN8nDto,
  ): Promise<RespuestaN8nDto> {
    const resultado = await this.n8nCitasService.registrarPacienteDesdeWhatsApp(datos);
    return {
      exito: true,
      mensaje: resultado.esNuevo
        ? 'Paciente registrado exitosamente'
        : 'Paciente ya existente, retornando datos',
      datos: {
        personaId: resultado.persona.id,
        pacienteId: resultado.paciente.id,
        esNuevo: resultado.esNuevo,
        nombre: `${resultado.persona.nombre} ${resultado.persona.apellido}`,
      },
    };
  }

  /**
   * Consulta los horarios disponibles de un fisioterapeuta en una fecha.
   * CU-11
   *
   * GET /n8n/disponibilidad?empleadoId=...&fecha=2025-06-01&duracion=60
   */
  @Get('disponibilidad')
  async consultarDisponibilidad(
    @Query('empleadoId') empleadoId: string,
    @Query('fecha') fecha: string,
    @Query('duracion') duracion?: string,
  ): Promise<RespuestaN8nDto> {
    const bloques = await this.n8nCitasService.consultarDisponibilidad(
      parseInt(empleadoId, 10),
      fecha,
      duracion ? parseInt(duracion, 10) : 60,
    );
    return {
      exito: true,
      mensaje: `${bloques.length} bloques disponibles encontrados`,
      datos: { bloques },
    };
  }

  /**
   * Agenda una cita desde el flujo automatizado de WhatsApp.
   * CU-08 / CU-09
   *
   * POST /n8n/citas
   */
  @Post('citas')
  async agendarCita(
    @Body() datos: SolicitarCitaN8nDto,
  ): Promise<RespuestaN8nDto> {
    const cita = await this.n8nCitasService.agendarCitaDesdeN8n(datos);
    return {
      exito: true,
      mensaje: 'Cita agendada exitosamente desde WhatsApp',
      datos: { citaId: cita.id, fechaHora: cita.fecha_hora, estado: cita.estado },
    };
  }

  /**
   * Confirma una cita y notifica al paciente (n8n gestiona el envío de email/WhatsApp).
   * CU-12
   *
   * PATCH /n8n/citas/:id/confirmar
   */
  @Patch('citas/:id/confirmar')
  async confirmarCita(@Param('id') id: string): Promise<RespuestaN8nDto> {
    const cita = await this.n8nCitasService.confirmarCita(parseInt(id, 10));
    return {
      exito: true,
      mensaje: 'Cita confirmada exitosamente',
      datos: { citaId: cita.id, estado: cita.estado },
    };
  }

  /**
   * Cancela una cita desde el flujo automatizado.
   * CU-13
   *
   * PATCH /n8n/citas/:id/cancelar
   */
  @Patch('citas/:id/cancelar')
  async cancelarCita(@Param('id') id: string): Promise<RespuestaN8nDto> {
    const cita = await this.n8nCitasService.cancelarCita(parseInt(id, 10));
    return {
      exito: true,
      mensaje: 'Cita cancelada exitosamente',
      datos: { citaId: cita.id, estado: cita.estado },
    };
  }

  /**
   * Retorna las citas próximas para que n8n genere y envíe recordatorios.
   * CU-15
   *
   * GET /n8n/citas/recordatorios?horas=24
   */
  @Get('citas/recordatorios')
  async obtenerRecordatorios(
    @Query('horas') horas?: string,
  ): Promise<RespuestaN8nDto> {
    const citasProximas = await this.n8nCitasService.obtenerCitasParaRecordatorio(
      horas ? parseInt(horas, 10) : 24,
    );
    return {
      exito: true,
      mensaje: `${citasProximas.length} citas próximas encontradas`,
      datos: {
        citas: citasProximas.map((c) => ({
          citaId: c.id,
          pacienteNombre: c.paciente?.persona
            ? `${c.paciente.persona.nombre} ${c.paciente.persona.apellido}`
            : 'Sin datos',
          pacienteTelefono: c.paciente?.persona?.telefono,
          empleadoId: c.empleado_id,
          fechaHora: c.fecha_hora,
          estado: c.estado,
        })),
      },
    };
  }
}
