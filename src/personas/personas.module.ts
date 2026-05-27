import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasService } from './personas.service';
import { PersonasResolver } from './personas.resolver';
import { Personas } from './entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personas])],
  providers: [PersonasResolver, PersonasService],
  exports: [PersonasService],
})
export class PersonasModule {}
