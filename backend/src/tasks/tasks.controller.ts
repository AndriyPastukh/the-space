import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  RespondToProposalDto,
  TaskProposalDecisionDto,
} from './dto/respond-to-proposal.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(
    @Query() query: TaskQueryDto,
    @Query('categoryId') categoryId?: string | string[],
    @Query('authorId') authorId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('search') search?: string,
  ) {
    return this.tasksService.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search,
      authorId: authorId ? Number(authorId) : undefined,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      categories: Array.isArray(categoryId)
        ? categoryId.map(Number)
        : categoryId
          ? [Number(categoryId)]
          : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-responded')
  findMyResponded(@Req() req: any, @Query() query: TaskQueryDto) {
    return this.tasksService.findMyResponded(req.user.id, {
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, req.user.id, updateTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  apply(@Param('id') id: string, @Req() req: any, @Body('message') message?: string) {
    return this.tasksService.applyToTask(id, req.user.id, message);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/proposals/:proposalId')
  respondToProposal(
    @Param('id') id: string,
    @Param('proposalId') proposalId: string,
    @Req() req: any,
    @Body() body: RespondToProposalDto,
  ) {
    return this.tasksService.respondToProposal(
      id,
      req.user.id,
      proposalId,
      body.status as TaskProposalDecisionDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }
}
