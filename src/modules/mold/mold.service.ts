import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMoldDto, UpdateMoldDto, UpdateDesignLifeDto, QueryMoldDto } from './dto/mold.dto';

@Injectable()
export class MoldService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMoldDto) {
    const exists = await this.prisma.mold.findUnique({ where: { moldNumber: dto.moldNumber } });
    if (exists) throw new ConflictException('模具编号已存在');

    return this.prisma.mold.create({
      data: {
        moldNumber: dto.moldNumber,
        type: dto.type as any,
        workshopId: dto.workshopId,
        firstUseDate: dto.firstUseDate ? new Date(dto.firstUseDate) : null,
        designLife: dto.designLife,
        maintenanceCycle: dto.maintenanceCycle,
        periodicMaintenanceDays: dto.periodicMaintenanceDays,
        cavityCount: dto.cavityCount ?? 1,
        products: dto.products?.length
          ? { createMany: { data: dto.products } }
          : undefined,
      },
      include: { products: true, workshop: true },
    });
  }

  async findAll(query: QueryMoldDto) {
    const { keyword, status, type, workshopId, page = 1, pageSize = 20 } = query;
    const where: any = {};
    if (keyword) {
      where.OR = [
        { moldNumber: { contains: keyword } },
        { products: { some: { name: { contains: keyword } } } },
        { products: { some: { customer: { contains: keyword } } } },
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;
    if (workshopId) where.workshopId = workshopId;

    const [list, total] = await Promise.all([
      this.prisma.mold.findMany({
        where,
        include: { products: true, workshop: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.mold.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const mold = await this.prisma.mold.findUnique({
      where: { id },
      include: {
        products: true,
        workshop: true,
        usageRecords: { orderBy: { recordDate: 'desc' }, take: 20, include: { operator: { select: { name: true } } } },
        maintenanceRecords: { orderBy: { recordDate: 'desc' }, take: 20, include: { operator: { select: { name: true } } } },
        certificationLogs: { orderBy: { createdAt: 'desc' }, take: 10, include: { operator: { select: { name: true } } } },
      },
    });
    if (!mold) throw new NotFoundException('模具不存在');

    const lastMaint = await this.prisma.maintenanceRecord.findFirst({
      where: { moldId: id, type: 'MAINTAIN' },
      orderBy: { recordDate: 'desc' },
      select: { recordDate: true },
    });
    const usageAgg = await this.prisma.usageRecord.aggregate({
      where: { moldId: id, ...(lastMaint ? { recordDate: { gt: lastMaint.recordDate } } : {}) },
      _sum: { quantity: true },
    });

    const lastMaintenanceDate = lastMaint?.recordDate?.toISOString().slice(0, 10) || null;
    let daysSinceLastMaintenance: number | null = null;
    if (lastMaint) {
      daysSinceLastMaintenance = Math.floor((Date.now() - lastMaint.recordDate.getTime()) / 86400000);
    } else if (mold.firstUseDate) {
      daysSinceLastMaintenance = Math.floor((Date.now() - new Date(mold.firstUseDate).getTime()) / 86400000);
    }

    return {
      ...mold,
      sinceLastMaintenance: usageAgg._sum.quantity || 0,
      lastMaintenanceDate,
      daysSinceLastMaintenance,
    };
  }

  async update(id: number, dto: UpdateMoldDto) {
    await this.findOne(id);
    const { designLife, firstUseDate, ...rest } = dto as any;
    const data: any = { ...rest };
    if (firstUseDate) data.firstUseDate = new Date(firstUseDate);
    return this.prisma.mold.update({
      where: { id },
      data,
      include: { products: true, workshop: true },
    });
  }

  async updateDesignLife(id: number, dto: UpdateDesignLifeDto, userId: number) {
    const mold = await this.findOne(id);
    const [updated] = await this.prisma.$transaction([
      this.prisma.mold.update({
        where: { id },
        data: { designLife: dto.newDesignLife },
      }),
      this.prisma.certificationLog.create({
        data: {
          moldId: id,
          oldDesignLife: mold.designLife,
          newDesignLife: dto.newDesignLife,
          reportUrl: dto.reportUrl,
          operatorId: userId,
        },
      }),
    ]);
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.mold.delete({ where: { id } });
  }

  async getStatistics() {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.mold.count(),
      this.prisma.mold.groupBy({ by: ['status'], _count: true }),
      this.prisma.mold.groupBy({ by: ['type'], _count: true }),
    ]);
    return { total, byStatus, byType };
  }

  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [recordCount, totalProduction, activeMolds] = await Promise.all([
      this.prisma.usageRecord.count({ where: { recordDate: { gte: today, lt: tomorrow } } }),
      this.prisma.usageRecord.aggregate({ where: { recordDate: { gte: today, lt: tomorrow } }, _sum: { quantity: true } }),
      this.prisma.usageRecord.findMany({
        where: { recordDate: { gte: today, lt: tomorrow } },
        select: { moldId: true },
        distinct: ['moldId'],
      }),
    ]);

    return {
      recordCount,
      totalProduction: totalProduction._sum.quantity || 0,
      activeMolds: activeMolds.length,
    };
  }

  async addProduct(moldId: number, data: { customer?: string; model?: string; name: string; partNumber?: string }) {
    await this.findOne(moldId);
    return this.prisma.moldProduct.create({ data: { moldId, ...data } });
  }

  async removeProduct(productId: number) {
    return this.prisma.moldProduct.delete({ where: { id: productId } });
  }
}
