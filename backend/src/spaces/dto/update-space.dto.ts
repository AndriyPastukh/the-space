import { IsString, MinLength, MaxLength, IsOptional, IsArray, IsInt, Min, IsUrl } from 'class-validator';

export class UpdateSpaceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  directions?: number[];

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
