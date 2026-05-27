import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import {
  CategoriaSemaforo,
  CategoriaTrabajo,
  CategoriaEnfermedad,
  FrecuenciaSesion,
} from '../../compartido/enums';

@InputType()
export class CreateEvaluacionesInnicialeInput {
  @Field(() => Int)
  @IsInt()
  pacienteId: number;

  @Field(() => Int)
  @IsInt()
  empleadoId: number;

  @Field()
  @IsNotEmpty()
  fecha_evaluacion: Date;

  @Field(() => CategoriaSemaforo)
  @IsEnum(CategoriaSemaforo)
  categoria_semaforo: CategoriaSemaforo;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  justificacion_semaforo?: string;

  @Field(() => CategoriaTrabajo)
  @IsEnum(CategoriaTrabajo)
  categoria_trabajo: CategoriaTrabajo;

  @Field(() => CategoriaEnfermedad)
  @IsEnum(CategoriaEnfermedad)
  categoria_enfermedad: CategoriaEnfermedad;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion_enfermedad?: string;

  @Field(() => FrecuenciaSesion)
  @IsEnum(FrecuenciaSesion)
  frecuencia_sesion: FrecuenciaSesion;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  es_vigente?: boolean;
}
