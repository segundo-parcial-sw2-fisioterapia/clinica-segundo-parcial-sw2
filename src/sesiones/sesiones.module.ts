import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionesService } from './sesiones.service';
import { SesionesResolver } from './sesiones.resolver';
import { SesionesGateway } from './sesiones.gateway';
import { Sesiones } from './entities/sesione.entity';
import { CompartidoModule } from '../compartido/compartido.module';
import { PlanesTratamientos } from '../planes_tratamientos/entities/planes_tratamiento.entity';
import { BlockchainClientService } from '../blockchain/blockchain-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sesiones, PlanesTratamientos]),
    CompartidoModule,
  ],
  providers: [SesionesResolver, SesionesService, SesionesGateway, BlockchainClientService],
  exports: [SesionesService],
})
export class SesionesModule {}
