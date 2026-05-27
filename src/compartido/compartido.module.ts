import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { N8nCitasService } from './n8n/n8n-citas.service';
import { N8nCitasController } from './n8n/n8n-citas.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { Personas } from '../personas/entities/persona.entity';
import { Pacientes } from '../pacientes/entities/paciente.entity';
import { Citas } from '../citas/entities/cita.entity';
import { Usuarios } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personas, Pacientes, Citas, Usuarios])],
  controllers: [N8nCitasController, AuthController],
  providers: [N8nCitasService, ApiKeyGuard, AuthService],
})
export class CompartidoModule {}
