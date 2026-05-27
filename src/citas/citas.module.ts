import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasResolver } from './citas.resolver';
import { Citas } from './entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Citas])],
  providers: [CitasResolver, CitasService],
  exports: [CitasService],
})
export class CitasModule {}
