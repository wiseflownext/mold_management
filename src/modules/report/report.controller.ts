import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportController {
  constructor(private service: ReportService) {}

  @Get('usage')
  async exportUsage(
    @Res() res: Response,
    @Query('moldId') moldId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.service.exportUsageCSV(moldId ? +moldId : undefined, startDate, endDate);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=usage_report.csv');
    res.send(csv);
  }

  @Get('maintenance')
  async exportMaintenance(
    @Res() res: Response,
    @Query('moldId') moldId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.service.exportMaintenanceCSV(moldId ? +moldId : undefined, startDate, endDate);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.csv');
    res.send(csv);
  }

  @Get('mold-ledger')
  async exportMoldLedger(@Res() res: Response) {
    const csv = await this.service.exportMoldLedgerCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=mold_ledger.csv');
    res.send(csv);
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getStatistics(startDate, endDate);
  }
}
