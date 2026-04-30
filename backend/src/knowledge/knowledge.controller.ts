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
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createKnowledgeDto: CreateKnowledgeDto) {
    return this.knowledgeService.create(req.user.id, createKnowledgeDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('offerCat') offerCat?: string | string[],
    @Query('requestCat') requestCat?: string | string[],
  ) {
    return this.knowledgeService.findAll({
      page,
      limit,
      offerCat: Array.isArray(offerCat) ? offerCat : offerCat ? [offerCat] : undefined,
      requestCat: Array.isArray(requestCat) ? requestCat : requestCat ? [requestCat] : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateKnowledgeDto: UpdateKnowledgeDto,
  ) {
    return this.knowledgeService.update(id, req.user.id, updateKnowledgeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.knowledgeService.remove(id, req.user.id);
  }
}
