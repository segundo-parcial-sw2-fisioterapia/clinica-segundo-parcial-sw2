import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionesService } from './sesiones.service';
import { SesionesResolver } from './sesiones.resolver';
import { Sesiones } from './entities/sesione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sesiones])],
  providers: [SesionesResolver, SesionesService],
  exports: [SesionesService],
})
export class SesionesModule {}
