import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjerciciosService } from './ejercicios.service';
import { EjerciciosResolver } from './ejercicios.resolver';
import { Ejercicios } from './entities/ejercicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ejercicios])],
  providers: [EjerciciosResolver, EjerciciosService],
  exports: [EjerciciosService],
})
export class EjerciciosModule {}
