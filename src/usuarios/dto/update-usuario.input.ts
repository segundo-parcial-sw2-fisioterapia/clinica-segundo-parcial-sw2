import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateUsuarioInput } from './create-usuario.input';

@InputType()
export class UpdateUsuarioInput extends PartialType(
  OmitType(CreateUsuarioInput, ['personaId'] as const),
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
