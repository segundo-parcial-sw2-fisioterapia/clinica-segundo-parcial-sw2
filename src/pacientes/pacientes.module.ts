import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesResolver } from './pacientes.resolver';
import { Pacientes } from './entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pacientes])],
  providers: [PacientesResolver, PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
