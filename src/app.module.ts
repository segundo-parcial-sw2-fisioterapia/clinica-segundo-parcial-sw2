import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PacientesModule } from './pacientes/pacientes.module';
import { PlanesTratamientosModule } from './planes_tratamientos/planes_tratamientos.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { PersonasModule } from './personas/personas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EjerciciosModule } from './ejercicios/ejercicios.module';
import { SesionesDocmiciliariasModule } from './sesiones_docmiciliarias/sesiones_docmiciliarias.module';
import { PlanesEjerciciosModule } from './planes_ejercicios/planes_ejercicios.module';
import { EvaluacionesInnicialesModule } from './evaluaciones_inniciales/evaluaciones_inniciales.module';
import { CompartidoModule } from './compartido/compartido.module';

@Module({
  imports: [
    // Carga de variables de entorno globales desde el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración Asíncrona de la Base de Datos PostgreSQL con TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        ssl: configService.get<string>('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // ¡Solo para desarrollo!
      }),
    }),

    // Configuración Asíncrona de GraphQL (Code First) con Apollo
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get<string>('NODE_ENV') !== 'production',
        introspection: true,
        context: ({ req }) => ({ req }),
      }),
    }),

    // Módulos del Subsistema Clínico
    PacientesModule,
    PlanesTratamientosModule,
    SesionesModule,
    PersonasModule,
    UsuariosModule,
    EjerciciosModule,
    SesionesDocmiciliariasModule,
    PlanesEjerciciosModule,
    EvaluacionesInnicialesModule,
    CompartidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
