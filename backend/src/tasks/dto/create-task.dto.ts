import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export enum TaskStatusDto {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  points?: number;

  @IsEnum(TaskStatusDto)
  @IsOptional()
  status?: TaskStatusDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  urls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];
}
