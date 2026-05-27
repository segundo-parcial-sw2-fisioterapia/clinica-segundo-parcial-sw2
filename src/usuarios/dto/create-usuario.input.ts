import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MinLength,
} from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../../compartido/enums';

@InputType()
export class CreateUsuarioInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasena: string;

  @Field(() => [RolUsuario])
  @IsEnum(RolUsuario, { each: true })
  roles: RolUsuario[];

  @Field(() => EstadoUsuario, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;

  @Field(() => Int)
  @IsInt()
  personaId: number;
}
