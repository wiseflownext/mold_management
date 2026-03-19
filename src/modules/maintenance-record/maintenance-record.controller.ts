import { Controller, Get, Post, Delete, Body, Param, Query, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MaintenanceRecordService } from './maintenance-record.service';
import { CreateMaintenanceRecordDto, QueryMaintenanceRecordDto } from './dto/maintenance-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('maintenance-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceRecordController {
  constructor(private service: MaintenanceRecordService, private audit: AuditLogService) {}

  @Post()
  async create(@Body() dto: CreateMaintenanceRecordDto, @CurrentUser() user: any, @Req() req: any) {
    const record = await this.service.create(dto, user.id);
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'CREATE', targetType: 'maintenance_record', targetId: record.id, detail: `模具ID${dto.moldId} ${dto.type}`, ip: req.ip }).catch(() => {});
    return record;
  }

  @Get()
  findAll(@Query() query: QueryMaintenanceRecordDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Req() req: any) {
    await this.service.remove(id);
    this.audit.log({ companyId: user.companyId, userId: user.id, userName: user.name, action: 'DELETE', targetType: 'maintenance_record', targetId: id, ip: req.ip });
  }
}
