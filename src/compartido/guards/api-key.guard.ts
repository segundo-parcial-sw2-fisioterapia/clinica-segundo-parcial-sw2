import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Valida que la petición REST de n8n incluya el header x-n8n-api-key
 * con el valor configurado en la variable de entorno N8N_API_KEY.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const claveRecibida = request.headers['x-n8n-api-key'];
    const claveEsperada = this.configService.get<string>('N8N_API_KEY');

    if (!claveEsperada || claveRecibida !== claveEsperada) {
      throw new UnauthorizedException('API key inválida o ausente');
    }
    return true;
  }
}
