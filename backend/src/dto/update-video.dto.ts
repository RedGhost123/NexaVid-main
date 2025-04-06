import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateVideoDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
