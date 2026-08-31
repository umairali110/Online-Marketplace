import { IsString, MinLength } from 'class-validator';

export class ExtractVoiceDto {
  @IsString()
  @MinLength(10)
  transcript!: string;
}