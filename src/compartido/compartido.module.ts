import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { Personas } from '../personas/entities/persona.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { Usuarios } from '../usuarios/entities/usuario.entity';
import { BiClientService } from './bi-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Personas, Pacientes, Usuarios])],
  controllers: [AuthController],
  providers: [ApiKeyGuard, AuthService, BiClientService],
  exports: [BiClientService],
})
export class CompartidoModule {}
