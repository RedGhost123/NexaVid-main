// src/timeline/dto/save-timeline.dto.ts
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EditAction } from '../interfaces/edit-action.interface';

export class TimelineDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // Or you can create a `class` version of EditAction to validate fields strictly
  edits: EditAction[];
}
