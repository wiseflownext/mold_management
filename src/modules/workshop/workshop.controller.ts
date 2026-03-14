import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto, UpdateWorkshopDto } from './dto/workshop.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('workshops')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkshopController {
  constructor(private service: WorkshopService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateWorkshopDto) {
    return this.service.create(dto.name);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkshopDto) {
    return this.service.update(id, dto.name);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
