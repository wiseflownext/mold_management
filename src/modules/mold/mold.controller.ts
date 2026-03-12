import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MoldService } from './mold.service';
import { CreateMoldDto, UpdateMoldDto, UpdateDesignLifeDto, QueryMoldDto } from './dto/mold.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('molds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoldController {
  constructor(private moldService: MoldService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateMoldDto) {
    return this.moldService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryMoldDto) {
    return this.moldService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.moldService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moldService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMoldDto) {
    return this.moldService.update(id, dto);
  }

  @Put(':id/design-life')
  @Roles('admin')
  updateDesignLife(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDesignLifeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.moldService.updateDesignLife(id, dto, userId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moldService.remove(id);
  }
}
