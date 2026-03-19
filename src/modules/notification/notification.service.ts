import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: number, page = 1, pageSize = 20) {
    const where = { userId };
    const [list, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { mold: { select: { moldNumber: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { list, total, unread, page, pageSize };
  }

  async markRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async createForAllAdmins(companyId: number, data: { type: any; title: string; message: string; moldId?: number }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin', companyId },
      select: { id: true },
    });
    if (!admins.length) return;
    await this.prisma.notification.createMany({
      data: admins.map((a) => ({ companyId, userId: a.id, ...data })),
    });
  }

  async createForMoldOperators(companyId: number, moldId: number, data: { type: any; title: string; message: string }) {
    const operators = await this.prisma.usageRecord.findMany({
      where: { moldId, companyId },
      select: { operatorId: true },
      distinct: ['operatorId'],
    });
    const adminIds = (await this.prisma.user.findMany({
      where: { role: 'admin', companyId },
      select: { id: true },
    })).map(a => a.id);
    const opIds = operators.map(o => o.operatorId).filter(id => !adminIds.includes(id));
    if (!opIds.length) return;
    await this.prisma.notification.createMany({
      data: opIds.map(uid => ({ companyId, userId: uid, moldId, ...data })),
    });
  }
}
