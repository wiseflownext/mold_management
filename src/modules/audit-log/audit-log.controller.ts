import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private service: AuditLogService) {}

  @Get()
  @Roles('admin')
  findAll(@Query() query: { page?: number; pageSize?: number; action?: string; targetType?: string }) {
    return this.service.findAll(query);
  }
}
