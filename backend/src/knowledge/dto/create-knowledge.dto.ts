import { IsString, IsArray, IsOptional, MaxLength, IsDateString, IsUUID, ArrayMinSize, IsUrl } from 'class-validator';

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
  @IsUUID('all', { each: true })
  offerCategories: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  requestCategories: string[];
}
