import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EstadoCita, OrigenCita, TipoCita } from '../../compartido/enums';

@InputType()
export class CreateCitaInput {
  @Field(() => Int)
  @IsInt()
  pacienteId: number;

  @Field(() => Int)
  @IsInt()
  empleadoId: number;

  @Field()
  @IsNotEmpty()
  fecha_hora: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(15)
  duracion_minutos?: number;

  @Field(() => TipoCita)
  @IsEnum(TipoCita)
  tipo: TipoCita;

  @Field(() => OrigenCita, { nullable: true })
  @IsOptional()
  @IsEnum(OrigenCita)
  origen?: OrigenCita;

  @Field(() => EstadoCita, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
