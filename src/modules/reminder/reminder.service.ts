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

  @Cron(CronExpression.EVERY_HOUR)
  async checkMaintenanceReminders() {
    const settings = await this.prisma.reminderSetting.findMany({ where: { enabled: true } });
    if (!settings.length) return;

    const molds = await this.prisma.mold.findMany({
      where: { status: 'IN_USE' },
      select: { id: true, moldNumber: true, type: true, usageCount: true, maintenanceCycle: true, designLife: true },
    });

    for (const mold of molds) {
      const setting = settings.find((s) => s.moldType === mold.type);
      if (!setting) continue;

      const cycle = mold.maintenanceCycle || 5000;
      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const ratio = (sinceLastMaint / cycle) * 100;

      if (ratio >= setting.overduePercent) {
        const msg = { type: 'MAINTENANCE_OVERDUE' as any, title: '保养超期提醒', message: `模具 ${mold.moldNumber} 已超过保养周期，当前使用 ${sinceLastMaint}/${cycle} 次` };
        await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
        await this.notificationService.createForMoldOperators(mold.id, msg);
      } else if (ratio >= setting.warningPercent) {
        const msg = { type: 'MAINTENANCE_SOON' as any, title: '保养预警提醒', message: `模具 ${mold.moldNumber} 即将达到保养周期，当前使用 ${sinceLastMaint}/${cycle} 次` };
        await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
        await this.notificationService.createForMoldOperators(mold.id, msg);
      }

      const life = mold.designLife || 20000;
      if (mold.usageCount >= life) {
        const msg = { type: 'LIFE_EXCEEDED' as any, title: '模具寿命超限', message: `模具 ${mold.moldNumber} 累计使用 ${mold.usageCount} 次，已超过设计寿命 ${life} 次` };
        await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
        await this.notificationService.createForMoldOperators(mold.id, msg);
      } else if (mold.usageCount >= life * 0.9) {
        const msg = { type: 'LIFE_WARNING' as any, title: '模具寿命预警', message: `模具 ${mold.moldNumber} 累计使用 ${mold.usageCount}/${life} 次，即将达到设计寿命` };
        await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
        await this.notificationService.createForMoldOperators(mold.id, msg);
      }
    }
  }

  async checkSingleMold(moldId: number) {
    const mold = await this.prisma.mold.findUnique({
      where: { id: moldId },
      select: { id: true, moldNumber: true, type: true, usageCount: true, maintenanceCycle: true, designLife: true, status: true },
    });
    if (!mold || mold.status !== 'IN_USE') return;

    const cycle = mold.maintenanceCycle || 5000;
    const life = mold.designLife || 20000;
    const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);

    if (sinceLastMaint >= cycle) {
      const msg = { type: 'MAINTENANCE_OVERDUE' as any, title: '保养超期提醒', message: `模具 ${mold.moldNumber} 已超过保养周期，当前使用 ${sinceLastMaint}/${cycle} 次` };
      await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
      await this.notificationService.createForMoldOperators(mold.id, msg);
    }

    if (mold.usageCount >= life) {
      const msg = { type: 'LIFE_EXCEEDED' as any, title: '模具寿命超限', message: `模具 ${mold.moldNumber} 累计使用 ${mold.usageCount} 次，已超过设计寿命 ${life} 次` };
      await this.notificationService.createForAllAdmins({ ...msg, moldId: mold.id });
      await this.notificationService.createForMoldOperators(mold.id, msg);
    }
  }

  private async getUsageSinceLastMaintenance(moldId: number): Promise<number> {
    const lastMaint = await this.prisma.maintenanceRecord.findFirst({
      where: { moldId, type: 'MAINTAIN' },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastMaint) {
      const total = await this.prisma.usageRecord.aggregate({ where: { moldId }, _sum: { quantity: true } });
      return total._sum.quantity || 0;
    }

    const total = await this.prisma.usageRecord.aggregate({
      where: { moldId, createdAt: { gt: lastMaint.createdAt } },
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
      const cycle = mold.maintenanceCycle || 5000;
      const life = mold.designLife || 20000;
      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const maintRemaining = cycle - sinceLastMaint;
      const lifeRemaining = life - mold.usageCount;

      const lastMaint = await this.prisma.maintenanceRecord.findFirst({
        where: { moldId: mold.id, type: 'MAINTAIN' },
        orderBy: { createdAt: 'desc' },
        select: { recordDate: true },
      });

      const remaining = Math.min(maintRemaining, lifeRemaining);

      let urgencyLevel: string;
      if (remaining <= 0) urgencyLevel = 'CRITICAL';
      else if (remaining <= 200) urgencyLevel = 'CRITICAL';
      else if (remaining <= 500) urgencyLevel = 'WARNING';
      else urgencyLevel = 'NORMAL';

      const isOverdue = maintRemaining <= 0 || lifeRemaining <= 0;

      if (urgencyLevel === 'NORMAL' && maintRemaining > cycle * 0.4 && lifeRemaining > life * 0.4) continue;

      results.push({
        moldId: mold.id,
        moldNumber: mold.moldNumber,
        workshop: mold.workshop?.name || '',
        type: mold.type,
        status: mold.status,
        productName: mold.products[0]?.name || '',
        customer: mold.products[0]?.customer || '',
        maintenanceCycle: cycle,
        usageCount: mold.usageCount,
        designLife: life,
        sinceLastMaint,
        remainingUses: remaining,
        isOverdue,
        urgencyLevel,
        lastMaintenanceDate: lastMaint?.recordDate?.toISOString().slice(0, 10) || null,
      });
    }

    results.sort((a, b) => {
      const order = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
      const d = (order[a.urgencyLevel] ?? 9) - (order[b.urgencyLevel] ?? 9);
      if (d !== 0) return d;
      return a.remainingUses - b.remainingUses;
    });

    return results;
  }
}
