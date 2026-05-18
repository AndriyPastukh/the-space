import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { JoinRequestStatus } from '@prisma/client';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(req.user.id, createTeamDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('directionId') directionId?: number,
  ) {
    return this.teamsService.findAll({ page, limit, search, directionId });
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('slug') slug: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.teamsService.findOne(slug, userId);
  }

  @Get('id/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.teamsService.findById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(req.user.id, id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.teamsService.remove(req.user.id, id);
  }

  @Post(':id/join-request')
  @UseGuards(JwtAuthGuard)
  joinRequest(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.teamsService.joinRequest(req.user.id, id);
  }

  @Get(':id/join-requests')
  @UseGuards(JwtAuthGuard)
  getJoinRequests(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.teamsService.getJoinRequests(req.user.id, id);
  }

  @Patch(':id/join-requests/:requestId')
  @UseGuards(JwtAuthGuard)
  updateJoinRequestStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('requestId') requestId: string,
    @Req() req: any,
    @Body('status') status: JoinRequestStatus,
  ) {
    return this.teamsService.updateJoinRequestStatus(req.user.id, id, requestId, status);
  }

  @Post('avatar/presign')
  @UseGuards(JwtAuthGuard)
  getPresignedUrl(
    @Req() req: any,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.teamsService.getPresignedUrl(req.user.id, fileName, contentType);
  }
}
