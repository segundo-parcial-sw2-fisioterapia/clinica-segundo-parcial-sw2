import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { Personas } from '../personas/entities/persona.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { Usuarios } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personas, Pacientes, Usuarios])],
  controllers: [AuthController],
  providers: [ApiKeyGuard, AuthService],
})
export class CompartidoModule {}
