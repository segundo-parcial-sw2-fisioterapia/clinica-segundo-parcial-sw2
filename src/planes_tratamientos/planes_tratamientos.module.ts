import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanesTratamientosService } from './planes_tratamientos.service';
import { PlanesTratamientosResolver } from './planes_tratamientos.resolver';
import { PlanesTratamientos } from './entities/planes_tratamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanesTratamientos])],
  providers: [PlanesTratamientosResolver, PlanesTratamientosService],
  exports: [PlanesTratamientosService],
})
export class PlanesTratamientosModule {}
