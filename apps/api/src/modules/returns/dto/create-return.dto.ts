import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateReturnDto {
  @IsString()
  subOrderId!: string;

  @IsString()
  @MinLength(10)
  reason!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsUrl({}, { each: true })
  images?: string[];
}