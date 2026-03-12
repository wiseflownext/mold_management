import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsageRecordService } from './usage-record.service';
import { CreateUsageRecordDto, QueryUsageRecordDto } from './dto/usage-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('usage-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageRecordController {
  constructor(private service: UsageRecordService) {}

  @Post()
  create(@Body() dto: CreateUsageRecordDto, @CurrentUser('id') userId: number) {
    return this.service.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryUsageRecordDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
