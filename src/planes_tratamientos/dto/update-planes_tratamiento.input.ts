import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreatePlanesTratamientoInput } from './create-planes_tratamiento.input';

@InputType()
export class UpdatePlanesTratamientoInput extends PartialType(
  CreatePlanesTratamientoInput,
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
