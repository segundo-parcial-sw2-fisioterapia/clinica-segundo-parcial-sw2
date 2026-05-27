import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanesEjerciciosService } from './planes_ejercicios.service';
import { PlanesEjerciciosResolver } from './planes_ejercicios.resolver';
import { PlanesEjercicios } from './entities/planes_ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanesEjercicios])],
  providers: [PlanesEjerciciosResolver, PlanesEjerciciosService],
  exports: [PlanesEjerciciosService],
})
export class PlanesEjerciciosModule {}
