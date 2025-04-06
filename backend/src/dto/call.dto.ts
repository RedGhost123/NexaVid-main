// src/call/dto/call-signal.dto.ts
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

export enum SignalType {
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice-candidate',
  SCREEN_SHARE = 'screen-share',
  MEDIA_FILE = 'media-file',
  END = 'end',
}

export class CallSignalDto {
  @IsString()
  @IsNotEmpty()
  callerId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsEnum(SignalType)
  type: SignalType;

  @IsObject()
  data: Record<string, any>; // You can refine this later if the structure is fixed
}
