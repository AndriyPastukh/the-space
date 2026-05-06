import {
  IsString,
  IsArray,
  IsOptional,
  MaxLength,
  IsDateString,
  ArrayMinSize,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @MaxLength(2000)
  offerDescription: string;

  @IsString()
  @MaxLength(2000)
  requestDescription: string;

  @IsDateString()
  deadline: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  urls?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  offerCategories: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  requestCategories: number[];
}
