"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoldService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MoldService = class MoldService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.mold.findUnique({ where: { moldNumber: dto.moldNumber } });
        if (exists)
            throw new common_1.ConflictException('模具编号已存在');
        return this.prisma.mold.create({
            data: {
                moldNumber: dto.moldNumber,
                type: dto.type,
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
    async findAll(query) {
        const { keyword, status, type, workshopId, page = 1, pageSize = 20 } = query;
        const where = {};
        if (keyword) {
            where.OR = [
                { moldNumber: { contains: keyword } },
                { products: { some: { name: { contains: keyword } } } },
                { products: { some: { customer: { contains: keyword } } } },
            ];
        }
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (workshopId)
            where.workshopId = workshopId;
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
    async findOne(id) {
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
        if (!mold)
            throw new common_1.NotFoundException('模具不存在');
        return mold;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.mold.update({
            where: { id },
            data: dto,
            include: { products: true, workshop: true },
        });
    }
    async updateDesignLife(id, dto, userId) {
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
    async remove(id) {
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
    async addProduct(moldId, data) {
        await this.findOne(moldId);
        return this.prisma.moldProduct.create({ data: { moldId, ...data } });
    }
    async removeProduct(productId) {
        return this.prisma.moldProduct.delete({ where: { id: productId } });
    }
};
exports.MoldService = MoldService;
exports.MoldService = MoldService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MoldService);
//# sourceMappingURL=mold.service.js.map