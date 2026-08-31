import { ArrayMaxSize, IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProviderProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  skills?: string[];

  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  categorySlugs!: string[];

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @MinLength(2)
  country!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}