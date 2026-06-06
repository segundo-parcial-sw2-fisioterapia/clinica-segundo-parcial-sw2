import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanesTratamientosService } from './planes_tratamientos.service';
import { PlanesTratamientosResolver } from './planes_tratamientos.resolver';
import { PlanesTratamientos } from './entities/planes_tratamiento.entity';
import { SesionesModule } from '../sesiones/sesiones.module';
import { EvaluacionesInnicialesModule } from '../evaluaciones_inniciales/evaluaciones_inniciales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanesTratamientos]),
    forwardRef(() => SesionesModule),
    forwardRef(() => EvaluacionesInnicialesModule),
  ],
  providers: [PlanesTratamientosResolver, PlanesTratamientosService],
  exports: [PlanesTratamientosService],
})
export class PlanesTratamientosModule {}
