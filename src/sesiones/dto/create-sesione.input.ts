import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { EstadoSesion } from '../../compartido/enums';

@InputType()
export class CreateSesioneInput {
  @Field(() => Int)
  @IsInt()
  planTratamientoId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  mensualidadId?: number;

  @Field(() => Int)
  @IsInt()
  numeroSesion: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  empleadoId?: number;

  @Field()
  @IsNotEmpty()
  fechaHoraProgramada: string;

  @Field({ nullable: true })
  @IsOptional()
  fecha_hora_inicio?: Date;

  @Field({ nullable: true })
  @IsOptional()
  fecha_hora_fin?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones_clinicas?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  nivel_dolor_reportado?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  nivel_dolor_post?: number;

  @Field(() => EstadoSesion, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoSesion)
  estado_sesion?: EstadoSesion;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url_documento_firmado?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hash_blockchain?: string;
}
