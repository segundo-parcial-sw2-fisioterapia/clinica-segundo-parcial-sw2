import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreatePersonaInput } from './create-persona.input';

@InputType()
export class UpdatePersonaInput extends PartialType(CreatePersonaInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
