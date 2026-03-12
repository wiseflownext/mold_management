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
    if (keyword) where.moldNumber = { contains: keyword };
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
    return mold;
  }

  async update(id: number, dto: UpdateMoldDto) {
    await this.findOne(id);
    return this.prisma.mold.update({
      where: { id },
      data: dto as any,
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
}
