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
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('api/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.id, createCommunityDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('directionId') directionId?: number,
  ) {
    return this.communitiesService.findAll({ page, limit, search, directionId });
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('slug') slug: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.communitiesService.findOne(slug, userId);
  }

  @Get('id/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.communitiesService.findById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(req.user.id, id, updateCommunityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.communitiesService.remove(req.user.id, id);
  }

  @Post(':id/join-request')
  @UseGuards(JwtAuthGuard)
  joinRequest(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.communitiesService.joinRequest(req.user.id, id);
  }

  @Post('avatar/presign')
  @UseGuards(JwtAuthGuard)
  getPresignedUrl(
    @Req() req: any,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.communitiesService.getPresignedUrl(req.user.id, fileName, contentType);
  }
}
