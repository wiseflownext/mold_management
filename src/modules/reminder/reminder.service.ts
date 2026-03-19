import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async findAll() {
    const companyId = this.prisma.requireCompanyId();
    return this.prisma.reminderSetting.findMany({ where: { companyId } });
  }

  async update(id: number, data: any) {
    const companyId = this.prisma.requireCompanyId();
    const setting = await this.prisma.reminderSetting.findFirst({ where: { id, companyId } });
    if (!setting) throw new Error('设置不存在');
    return this.prisma.reminderSetting.update({ where: { id }, data });
  }

  @Cron('0 8 * * *')
  async checkMaintenanceReminders() {
    const companies = await this.prisma.company.findMany({ where: { isActive: true }, select: { id: true } });
    for (const company of companies) {
      await this.checkRemindersForCompany(company.id);
    }
  }

  private async checkRemindersForCompany(companyId: number) {
    const settings = await this.prisma.reminderSetting.findMany({ where: { companyId, enabled: true } });
    if (!settings.length) return;

    const molds = await this.prisma.mold.findMany({
      where: { companyId, status: { in: ['IN_USE', 'REPAIRING'] } },
      select: { id: true, moldNumber: true, type: true, usageCount: true, maintenanceCycle: true, designLife: true, periodicMaintenanceDays: true, firstUseDate: true },
    });

    for (const mold of molds) {
      const setting = settings.find((s) => s.moldType === mold.type);
      if (!setting) continue;

      const cycle = mold.maintenanceCycle || 5000;
      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const ratio = (sinceLastMaint / cycle) * 100;

      if (ratio >= setting.overduePercent) {
        await this.sendDailyAlert(companyId, mold.id, 'MAINTENANCE_OVERDUE', '按次保养超期', `模具 ${mold.moldNumber} 已超周期 ${sinceLastMaint}/${cycle} 次，请及时保养`);
      } else if (ratio >= setting.warningPercent) {
        await this.sendDailyAlert(companyId, mold.id, 'MAINTENANCE_SOON', '按次保养预警', `模具 ${mold.moldNumber} 使用 ${sinceLastMaint}/${cycle} 次，即将到期`);
      }

      if (mold.periodicMaintenanceDays) {
        const daysSince = await this.getDaysSinceLastMaintenance(mold.id, mold.firstUseDate);
        const advDays = (setting as any).periodicAdvanceDays ?? 7;
        const daysLeft = mold.periodicMaintenanceDays - daysSince;
        if (daysLeft <= 0) {
          await this.sendDailyAlert(companyId, mold.id, 'MAINTENANCE_OVERDUE', '定期保养超期', `模具 ${mold.moldNumber} 已超 ${-daysLeft} 天未保养，请立即保养`);
        } else if (daysLeft <= advDays) {
          await this.sendDailyAlert(companyId, mold.id, 'MAINTENANCE_SOON', '定期保养预警', `模具 ${mold.moldNumber} 距定期保养还剩 ${daysLeft} 天`);
        }
      }

      const life = mold.designLife || 20000;
      if (mold.usageCount >= life) {
        await this.sendDailyAlert(companyId, mold.id, 'LIFE_EXCEEDED', '模具寿命超限', `模具 ${mold.moldNumber} 累计 ${mold.usageCount}/${life} 次`);
      } else if (mold.usageCount >= life * 0.9) {
        await this.sendDailyAlert(companyId, mold.id, 'LIFE_WARNING', '模具寿命预警', `模具 ${mold.moldNumber} 累计 ${mold.usageCount}/${life} 次`);
      }
    }
  }

  async checkSingleMold(moldId: number) {
    const mold = await this.prisma.mold.findUnique({
      where: { id: moldId },
      select: { id: true, companyId: true, moldNumber: true, type: true, usageCount: true, maintenanceCycle: true, designLife: true, status: true, periodicMaintenanceDays: true, firstUseDate: true },
    });
    if (!mold || !['IN_USE', 'REPAIRING'].includes(mold.status)) return;

    const companyId = mold.companyId;
    const cycle = mold.maintenanceCycle || 5000;
    const life = mold.designLife || 20000;
    const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);

    if (sinceLastMaint >= cycle) {
      await this.sendAlert(companyId, mold.id, 'MAINTENANCE_OVERDUE', '按次保养超期', `模具 ${mold.moldNumber} 使用 ${sinceLastMaint}/${cycle} 次`);
    }

    if (mold.periodicMaintenanceDays) {
      const daysSince = await this.getDaysSinceLastMaintenance(mold.id, mold.firstUseDate);
      if (daysSince >= mold.periodicMaintenanceDays) {
        await this.sendAlert(companyId, mold.id, 'MAINTENANCE_OVERDUE', '定期保养超期', `模具 ${mold.moldNumber} 已超 ${daysSince - mold.periodicMaintenanceDays} 天未保养`);
      }
    }

    if (mold.usageCount >= life) {
      await this.sendAlert(companyId, mold.id, 'LIFE_EXCEEDED', '模具寿命超限', `模具 ${mold.moldNumber} 累计 ${mold.usageCount}/${life} 次`);
    }
  }

  private async sendAlert(companyId: number, moldId: number, type: string, title: string, message: string) {
    const msg = { type: type as any, title, message };
    await this.notificationService.createForAllAdmins(companyId, { ...msg, moldId });
    await this.notificationService.createForMoldOperators(companyId, moldId, msg);
  }

  private async sendDailyAlert(companyId: number, moldId: number, type: string, title: string, message: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exists = await this.prisma.notification.findFirst({
      where: { moldId, type: type as any, companyId, createdAt: { gte: today } },
    });
    if (exists) return;
    await this.sendAlert(companyId, moldId, type, title, message);
  }

  private async getDaysSinceLastMaintenance(moldId: number, firstUseDate?: Date | null): Promise<number> {
    const lastMaint = await this.prisma.maintenanceRecord.findFirst({
      where: { moldId, type: 'MAINTAIN' },
      orderBy: { recordDate: 'desc' },
      select: { recordDate: true },
    });
    const base = lastMaint?.recordDate || firstUseDate || new Date();
    return Math.floor((Date.now() - new Date(base).getTime()) / 86400000);
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
    const companyId = this.prisma.requireCompanyId();
    const settings = await this.prisma.reminderSetting.findMany({ where: { companyId } });
    const molds = await this.prisma.mold.findMany({
      where: { companyId, status: { in: ['IN_USE', 'REPAIRING'] } },
      include: {
        workshop: { select: { name: true } },
        products: { select: { name: true, customer: true }, take: 1 },
      },
    });

    const results: any[] = [];
    for (const mold of molds) {
      const setting = settings.find((s) => s.moldType === mold.type);
      const advDays = (setting as any)?.periodicAdvanceDays ?? 7;
      const cycle = mold.maintenanceCycle || 5000;
      const life = mold.designLife || 20000;
      const sinceLastMaint = await this.getUsageSinceLastMaintenance(mold.id);
      const maintRemaining = cycle - sinceLastMaint;
      const lifeRemaining = life - mold.usageCount;
      const daysSince = await this.getDaysSinceLastMaintenance(mold.id, mold.firstUseDate);
      const periodicDays = mold.periodicMaintenanceDays || 0;
      const periodicRemaining = periodicDays > 0 ? periodicDays - daysSince : null;

      const lastMaint = await this.prisma.maintenanceRecord.findFirst({
        where: { moldId: mold.id, type: 'MAINTAIN' },
        orderBy: { recordDate: 'desc' },
        select: { recordDate: true },
      });

      const remaining = Math.min(maintRemaining, lifeRemaining);
      const isPeriodicOverdue = periodicRemaining !== null && periodicRemaining <= 0;
      const isPeriodicWarning = periodicRemaining !== null && periodicRemaining > 0 && periodicRemaining <= advDays;

      let urgencyLevel: string;
      if (remaining <= 0 || isPeriodicOverdue) urgencyLevel = 'CRITICAL';
      else if (remaining <= 200 || isPeriodicWarning) urgencyLevel = 'CRITICAL';
      else if (remaining <= 500 || (periodicRemaining !== null && periodicRemaining <= Math.ceil(periodicDays * 0.4))) urgencyLevel = 'WARNING';
      else urgencyLevel = 'NORMAL';

      const isOverdue = maintRemaining <= 0 || lifeRemaining <= 0 || isPeriodicOverdue;

      if (urgencyLevel === 'NORMAL' && maintRemaining > cycle * 0.4 && lifeRemaining > life * 0.4 && (periodicRemaining === null || periodicRemaining > advDays)) continue;

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
        periodicMaintenanceDays: periodicDays || null,
        daysSinceLastMaintenance: daysSince,
        periodicRemaining,
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
