import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobPostDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsString()
  categorySlug!: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}