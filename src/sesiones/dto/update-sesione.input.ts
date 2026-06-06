import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateSesioneInput } from './create-sesione.input';

@InputType()
export class UpdateSesioneInput extends PartialType(CreateSesioneInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
