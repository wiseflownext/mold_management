import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MaintenanceRecordService } from './maintenance-record.service';
import { CreateMaintenanceRecordDto, QueryMaintenanceRecordDto } from './dto/maintenance-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('maintenance-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceRecordController {
  constructor(private service: MaintenanceRecordService) {}

  @Post()
  create(@Body() dto: CreateMaintenanceRecordDto, @CurrentUser('id') userId: number) {
    return this.service.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryMaintenanceRecordDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
