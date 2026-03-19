import { Controller, Get, Post, Delete, Body, Param, Query, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsageRecordService } from './usage-record.service';
import { CreateUsageRecordDto, QueryUsageRecordDto } from './dto/usage-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ReminderService } from '../reminder/reminder.service';

@Controller('usage-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageRecordController {
  constructor(private service: UsageRecordService, private audit: AuditLogService, private reminder: ReminderService) {}

  @Post()
  async create(@Body() dto: CreateUsageRecordDto, @CurrentUser() user: any, @Req() req: any) {
    const record = await this.service.create(dto, user.id);
    this.reminder.checkSingleMold(dto.moldId).catch(() => {});
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'CREATE', targetType: 'usage_record', targetId: record.id, detail: `模具${record.mold?.moldNumber} 产品${dto.product} 数量${dto.quantity}`, ip: req.ip }).catch(() => {});
    return record;
  }

  @Get()
  findAll(@Query() query: QueryUsageRecordDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Req() req: any) {
    await this.service.remove(id);
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'DELETE', targetType: 'usage_record', targetId: id, ip: req.ip });
  }
}
