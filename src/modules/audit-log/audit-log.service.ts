import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditPayload {
  userId: number;
  userName: string;
  action: string;
  targetType: string;
  targetId?: number;
  detail?: string;
  ip?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  log(payload: AuditPayload) {
    return this.prisma.auditLog.create({ data: payload });
  }

  findAll(query: { page?: number; pageSize?: number; action?: string; targetType?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.targetType) where.targetType = query.targetType;

    return this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]).then(([items, total]) => ({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }));
  }
}
