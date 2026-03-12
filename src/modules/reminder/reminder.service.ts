import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async findAll() {
    return this.prisma.reminderSetting.findMany();
  }

  async update(id: number, data: { enabled?: boolean; remainingThreshold?: number; warningPercent?: number; overduePercent?: number }) {
    return this.prisma.reminderSetting.update({ where: { id }, data });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMaintenanceReminders() {
    const settings = await this.prisma.reminderSetting.findMany({ where: { enabled: true } });
    if (!settings.length) return;

    const molds = await this.prisma.mold.findMany({
      where: { status: 'IN_USE' },
      select: { id: true, moldNumber: true, type: true, usageCount: true, maintenanceCycle: true },
    });

    for (const mold of molds) {
      const setting = settings.find((s) => s.moldType === mold.type);
      if (!setting) continue;

      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const ratio = (sinceLastMaint / mold.maintenanceCycle) * 100;

      if (ratio >= setting.overduePercent) {
        await this.notificationService.createForAllAdmins({
          type: 'MAINTENANCE_OVERDUE',
          title: '保养超期提醒',
          message: `模具 ${mold.moldNumber} 已超过保养周期，当前使用 ${sinceLastMaint}/${mold.maintenanceCycle} 次`,
          moldId: mold.id,
        });
      } else if (ratio >= setting.warningPercent) {
        await this.notificationService.createForAllAdmins({
          type: 'MAINTENANCE_SOON',
          title: '保养预警提醒',
          message: `模具 ${mold.moldNumber} 即将达到保养周期，当前使用 ${sinceLastMaint}/${mold.maintenanceCycle} 次`,
          moldId: mold.id,
        });
      }
    }
  }

  private async getUsageSinceLastMaintenance(moldId: number): Promise<number> {
    const lastMaint = await this.prisma.maintenanceRecord.findFirst({
      where: { moldId, type: 'MAINTAIN' },
      orderBy: { recordDate: 'desc' },
    });

    if (!lastMaint) {
      const total = await this.prisma.usageRecord.aggregate({ where: { moldId }, _sum: { quantity: true } });
      return total._sum.quantity || 0;
    }

    const total = await this.prisma.usageRecord.aggregate({
      where: { moldId, recordDate: { gt: lastMaint.recordDate } },
      _sum: { quantity: true },
    });
    return total._sum.quantity || 0;
  }

  async getMaintenanceAlerts() {
    const molds = await this.prisma.mold.findMany({
      where: { status: { in: ['IN_USE', 'REPAIRING'] } },
      include: {
        workshop: { select: { name: true } },
        products: { select: { name: true, customer: true }, take: 1 },
      },
    });

    const results: any[] = [];
    for (const mold of molds) {
      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const remaining = mold.maintenanceCycle - sinceLastMaint;
      const ratio = (sinceLastMaint / mold.maintenanceCycle) * 100;

      const lastMaint = await this.prisma.maintenanceRecord.findFirst({
        where: { moldId: mold.id, type: 'MAINTAIN' },
        orderBy: { recordDate: 'desc' },
        select: { recordDate: true },
      });

      let urgencyLevel: string;
      if (remaining <= 0) urgencyLevel = 'overdue';
      else if (remaining <= 200) urgencyLevel = 'critical';
      else if (remaining <= 500) urgencyLevel = 'warning';
      else urgencyLevel = 'normal';

      if (urgencyLevel === 'normal' && ratio < 60) continue;

      results.push({
        moldId: mold.id,
        moldNumber: mold.moldNumber,
        workshop: mold.workshop?.name || '',
        type: mold.type,
        status: mold.status,
        productName: mold.products[0]?.name || '',
        customer: mold.products[0]?.customer || '',
        maintenanceCycle: mold.maintenanceCycle,
        usageCount: mold.usageCount,
        designLife: mold.designLife,
        sinceLastMaint,
        remainingUses: remaining,
        isOverdue: remaining <= 0,
        urgencyLevel,
        lastMaintenanceDate: lastMaint?.recordDate?.toISOString().slice(0, 10) || null,
      });
    }

    results.sort((a, b) => {
      const order = { overdue: 0, critical: 1, warning: 2, normal: 3 };
      return (order[a.urgencyLevel] ?? 9) - (order[b.urgencyLevel] ?? 9);
    });

    return results;
  }
}
