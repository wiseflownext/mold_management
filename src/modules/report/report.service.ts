import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async exportUsageCSV(moldId?: number, startDate?: string, endDate?: string): Promise<string> {
    const where: any = {};
    if (moldId) where.moldId = moldId;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = new Date(endDate);
    }

    const records = await this.prisma.usageRecord.findMany({
      where,
      include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
      orderBy: { recordDate: 'desc' },
    });

    const BOM = '\uFEFF';
    const header = '模具编号,产品名称,数量,班次,日期,操作员,备注\n';
    const rows = records.map((r) => {
      const shift = r.shift === 'MORNING' ? '早班' : r.shift === 'AFTERNOON' ? '中班' : '晚班';
      return `${r.mold.moldNumber},${r.product},${r.quantity},${shift},${r.recordDate.toISOString().slice(0, 10)},${r.operator.name},${r.note || ''}`;
    });
    return BOM + header + rows.join('\n');
  }

  async exportMaintenanceCSV(moldId?: number, startDate?: string, endDate?: string): Promise<string> {
    const where: any = {};
    if (moldId) where.moldId = moldId;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = new Date(endDate);
    }

    const records = await this.prisma.maintenanceRecord.findMany({
      where,
      include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
      orderBy: { recordDate: 'desc' },
    });

    const BOM = '\uFEFF';
    const header = '模具编号,类型,内容,日期,操作员\n';
    const rows = records.map((r) => {
      const type = r.type === 'MAINTAIN' ? '保养' : '维修';
      return `${r.mold.moldNumber},${type},${r.content.replace(/,/g, '，')},${r.recordDate.toISOString().slice(0, 10)},${r.operator.name}`;
    });
    return BOM + header + rows.join('\n');
  }
}
