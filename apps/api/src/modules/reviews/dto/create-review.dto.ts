import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  storeListingId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsUrl({}, { each: true })
  images?: string[];
}