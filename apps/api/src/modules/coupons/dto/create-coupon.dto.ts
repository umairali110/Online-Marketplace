import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsEnum(CouponType)
  type!: CouponType;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  value!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}