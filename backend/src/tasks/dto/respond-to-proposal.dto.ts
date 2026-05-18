import { IsEnum } from 'class-validator';

export enum TaskProposalDecisionDto {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class RespondToProposalDto {
  @IsEnum(TaskProposalDecisionDto)
  status: TaskProposalDecisionDto;
}
