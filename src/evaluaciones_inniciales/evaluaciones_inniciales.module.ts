import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionesInnicialesService } from './evaluaciones_inniciales.service';
import { EvaluacionesInnicialesResolver } from './evaluaciones_inniciales.resolver';
import { EvaluacionesIniciales } from './entities/evaluaciones_inniciale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluacionesIniciales])],
  providers: [EvaluacionesInnicialesResolver, EvaluacionesInnicialesService],
  exports: [EvaluacionesInnicialesService],
})
export class EvaluacionesInnicialesModule {}
