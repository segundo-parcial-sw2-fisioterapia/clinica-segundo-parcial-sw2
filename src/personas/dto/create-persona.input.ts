import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePersonaInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ci: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}
