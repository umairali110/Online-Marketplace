import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGigDto {
  @IsString()
  categorySlug!: string;

  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  deliveryDays!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  images?: string[];
}