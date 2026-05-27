import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateEjercicioInput } from './create-ejercicio.input';

@InputType()
export class UpdateEjercicioInput extends PartialType(CreateEjercicioInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
