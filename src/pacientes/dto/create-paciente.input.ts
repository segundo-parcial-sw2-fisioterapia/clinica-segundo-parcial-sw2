import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { EstadoPaciente, SexoPaciente } from '../../compartido/enums';

@InputType()
export class CreatePacienteInput {
  @Field(() => Int)
  @IsInt()
  personaId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fecha_nacimiento?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  direccion?: string;

  @Field(() => SexoPaciente, { nullable: true })
  @IsOptional()
  @IsEnum(SexoPaciente)
  sexo?: SexoPaciente;

  @Field(() => EstadoPaciente, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoPaciente)
  estado?: EstadoPaciente;
}
