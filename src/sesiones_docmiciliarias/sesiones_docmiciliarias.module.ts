import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionesDocmiciliariasService } from './sesiones_docmiciliarias.service';
import { SesionesDocmiciliariasResolver } from './sesiones_docmiciliarias.resolver';
import { SesionesDomiciliarias } from './entities/sesiones_docmiciliaria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SesionesDomiciliarias])],
  providers: [SesionesDocmiciliariasResolver, SesionesDocmiciliariasService],
  exports: [SesionesDocmiciliariasService],
})
export class SesionesDocmiciliariasModule {}
