import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  private endOfDay(d: string): Date {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt;
  }

  async exportUsageCSV(moldId?: number, startDate?: string, endDate?: string): Promise<string> {
    const companyId = this.prisma.requireCompanyId();
    const where: any = { companyId };
    if (moldId) where.moldId = moldId;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = this.endOfDay(endDate);
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
    const companyId = this.prisma.requireCompanyId();
    const where: any = { companyId };
    if (moldId) where.moldId = moldId;
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = this.endOfDay(endDate);
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

  async exportMoldLedgerCSV(): Promise<string> {
    const companyId = this.prisma.requireCompanyId();
    const molds = await this.prisma.mold.findMany({
      where: { companyId },
      include: { workshop: { select: { name: true } }, products: { select: { name: true, customer: true, partNumber: true } } },
      orderBy: { moldNumber: 'asc' },
    });

    const BOM = '\uFEFF';
    const header = '模具编号,类型,车间,状态,设计寿命,保养周期,已用次数,首次使用日期,关联产品,客户\n';
    const statusMap = { IN_USE: '在用', REPAIRING: '维修中', STOPPED: '停用', SCRAPPED: '报废' };
    const typeMap = { COMPRESSION: '模压', EXTRUSION: '口型', CORNER: '接角' };
    const rows = molds.map((m) => {
      const products = m.products.map((p) => p.name).join(';');
      const customers = m.products.map((p) => p.customer).filter(Boolean).join(';');
      return `${m.moldNumber},${typeMap[m.type] || m.type},${m.workshop?.name || ''},${statusMap[m.status] || m.status},${m.designLife},${m.maintenanceCycle},${m.usageCount},${m.firstUseDate?.toISOString().slice(0, 10) || ''},${products},${customers}`;
    });
    return BOM + header + rows.join('\n');
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const companyId = this.prisma.requireCompanyId();
    const dateFilter: any = { companyId };
    if (startDate || endDate) {
      dateFilter.recordDate = {};
      if (startDate) dateFilter.recordDate.gte = new Date(startDate);
      if (endDate) dateFilter.recordDate.lte = this.endOfDay(endDate);
    }

    const moldWhere = { companyId };
    const [byType, byWorkshop, byMonth, moldCount, usageTotal, maintTotal] = await Promise.all([
      this.prisma.mold.groupBy({ by: ['type'], where: moldWhere, _count: true }),
      this.prisma.mold.groupBy({ by: ['workshopId'], where: moldWhere, _count: true }),
      this.prisma.usageRecord.groupBy({
        by: ['recordDate'],
        where: dateFilter,
        _sum: { quantity: true },
        _count: true,
      }),
      this.prisma.mold.count({ where: moldWhere }),
      this.prisma.usageRecord.aggregate({ where: dateFilter, _sum: { quantity: true }, _count: true }),
      this.prisma.maintenanceRecord.aggregate({ where: { companyId, ...(dateFilter.recordDate ? { recordDate: dateFilter.recordDate } : {}) }, _count: true }),
    ]);

    const workshops = await this.prisma.workshop.findMany({ where: { companyId }, select: { id: true, name: true } });
    const wsMap = Object.fromEntries(workshops.map((w) => [w.id, w.name]));

    const monthlyMap: Record<string, { quantity: number; count: number }> = {};
    for (const r of byMonth) {
      const key = r.recordDate.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { quantity: 0, count: 0 };
      monthlyMap[key].quantity += r._sum.quantity || 0;
      monthlyMap[key].count += r._count;
    }

    return {
      moldCount,
      usageRecordCount: usageTotal._count,
      usageTotalQuantity: usageTotal._sum.quantity || 0,
      maintenanceRecordCount: maintTotal._count,
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
      byWorkshop: byWorkshop.map((w) => ({ workshop: (w.workshopId ? wsMap[w.workshopId] : null) || '未分配', count: w._count })),
      monthly: Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data })),
    };
  }
}
