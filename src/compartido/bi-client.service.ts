import { Injectable, Logger } from '@nestjs/common';

export interface BiEventoPayload {
  tipo_evento: string;
  paciente_id?: number;
  empleado_id?: number;
  categoria_semaforo?: string;
  categoria_trabajo?: string;
  categoria_enfermedad?: string;
  valor_numerico?: number;
}

@Injectable()
export class BiClientService {
  private readonly logger = new Logger(BiClientService.name);
  private readonly biUrl = process.env.BI_AUTOMATIZACION_URL || 'http://localhost:8000/api';

  /**
   * Envía un evento a Django BI de manera asíncrona sin bloquear el hilo actual.
   * Maneja internamente los errores para no afectar la transacción principal.
   */
  async emitirEvento(payload: BiEventoPayload): Promise<void> {
    try {
      const url = `${this.biUrl}/bi-automatizacion/eventos/`;
      this.logger.log(`Enviando evento a BI: ${url} con payload: ${JSON.stringify(payload)}`);
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async res => {
        if (!res.ok) {
          const bodyErr = await res.text().catch(() => 'no body');
          this.logger.error(`BI service respondió con status ${res.status} al registrar evento: ${payload.tipo_evento}. Detalles: ${bodyErr}`);
        } else {
          this.logger.log(`Evento BI emitido exitosamente: ${payload.tipo_evento}`);
        }
      }).catch(err => {
        this.logger.error(`Error de red al enviar evento a BI: ${err.message}`);
      });
    } catch (error) {
      this.logger.error(`Excepción al intentar enviar evento BI: ${error.message}`);
    }
  }
}
