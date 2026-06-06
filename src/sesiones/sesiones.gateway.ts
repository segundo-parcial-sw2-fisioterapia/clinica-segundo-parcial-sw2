import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';

@WebSocketGateway({ cors: { origin: '*' } })
export class SesionesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(SesionesGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway de Sesiones iniciado');
  }

  handleConnection(client: any) {
    this.logger.debug(`Cliente WS conectado: ${client.id ?? 'anon'}`);
  }

  handleDisconnect(client: any) {
    this.logger.debug(`Cliente WS desconectado: ${client.id ?? 'anon'}`);
  }

  /** Emite un mensaje JSON a todos los clientes WebSocket conectados */
  private broadcast(event: string, data: any): void {
    if (!this.server) return;
    const mensaje = JSON.stringify({ event, data });
    this.server.clients.forEach((client: any) => {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(mensaje);
      }
    });
  }

  /** El recepcionista asignó o reasignó un fisioterapeuta a una sesión */
  emitirSesionAsignada(
    sesionId: number,
    empleadoId: number,
    pacienteNombre: string,
    numeroSesion: number,
  ): void {
    this.broadcast('sesion_asignada', { sesionId, empleadoId, pacienteNombre, numeroSesion });
  }

  /** Una mensualidad fue pagada y la sesión pasó a HABILITADA */
  emitirSesionHabilitada(sesionId: number, empleadoId: number | null): void {
    this.broadcast('sesion_habilitada', { sesionId, empleadoId });
  }

  /** El fisioterapeuta inició la sesión (ABIERTA) */
  emitirSesionIniciada(sesionId: number, empleadoId: number | null): void {
    this.broadcast('sesion_iniciada', { sesionId, empleadoId });
  }

  /** El fisioterapeuta cerró la sesión (CERRADA) */
  emitirSesionCerrada(sesionId: number, empleadoId: number | null): void {
    this.broadcast('sesion_cerrada', { sesionId, empleadoId });
  }
}
