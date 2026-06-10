import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FirmaResultado {
  hash: string;
  txHash: string;
  timestamp: string;
}

/**
 * Cliente HTTP interno hacia MS-6 blockchain-firmas.
 * Usa fetch nativo de Node 18+.
 * Si el servicio no está disponible devuelve null — no lanza excepción,
 * para que los flujos clínicos continúen sin bloqueo.
 */
@Injectable()
export class BlockchainClientService {
  private readonly logger = new Logger(BlockchainClientService.name);
  private readonly blockchainUrl: string;

  constructor(private readonly config: ConfigService) {
    this.blockchainUrl =
      config.get<string>('BLOCKCHAIN_SERVICE_URL') ?? 'http://localhost:3002/api';
  }

  /**
   * Envía el contenido a blockchain-firmas, obtiene el hash SHA-256
   * y lo registra en Ethereum Sepolia.
   *
   * @param contenido - Texto serializado de la sesión clínica.
   * @param tipo      - "CLINICO" o "ADMINISTRATIVO".
   * @returns FirmaResultado con hash y txHash, o null si el servicio no responde.
   */
  async firmar(contenido: string, tipo: string): Promise<FirmaResultado | null> {
    try {
      const resp = await fetch(`${this.blockchainUrl}/firmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido, tipo }),
      });
      if (!resp.ok) {
        this.logger.warn(`blockchain-firmas respondió ${resp.status}: ${resp.statusText}`);
        return null;
      }
      return (await resp.json()) as FirmaResultado;
    } catch (e: any) {
      this.logger.warn(`blockchain-firmas no disponible: ${e?.message ?? e}`);
      return null;
    }
  }
}
