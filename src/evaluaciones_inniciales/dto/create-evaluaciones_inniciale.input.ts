import { InputType, Field, Int } from '@nestjs/graphql';
import {
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
  NivelIntensidad,
  EstadoEvaluacion,
} from '../../compartido/enums';

@InputType()
export class CreateEvaluacionesInnicialeInput {
  @Field(() => Int)
  @IsInt()
  pacienteId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  empleadoId?: number;

  @Field(() => EstadoEvaluacion, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoEvaluacion)
  estado?: EstadoEvaluacion;

  @Field()
  @IsNotEmpty()
  fecha_evaluacion: Date;

  @Field(() => CategoriaSemaforo, { nullable: true })
  @IsOptional()
  @IsEnum(CategoriaSemaforo)
  categoria_semaforo?: CategoriaSemaforo;

  @Field(() => NivelIntensidad, { nullable: true })
  @IsOptional()
  @IsEnum(NivelIntensidad)
  nivel?: NivelIntensidad;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  justificacion_semaforo?: string;

  @Field(() => CategoriaTrabajo, { nullable: true })
  @IsOptional()
  @IsEnum(CategoriaTrabajo)
  categoria_trabajo?: CategoriaTrabajo;

  @Field(() => CategoriaEnfermedad, { nullable: true })
  @IsOptional()
  @IsEnum(CategoriaEnfermedad)
  categoria_enfermedad?: CategoriaEnfermedad;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion_enfermedad?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
