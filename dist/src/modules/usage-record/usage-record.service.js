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
exports.UsageRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsageRecordService = class UsageRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, operatorId) {
        const mold = await this.prisma.mold.findUnique({ where: { id: dto.moldId } });
        if (!mold)
            throw new common_1.NotFoundException('模具不存在');
        const [record] = await this.prisma.$transaction([
            this.prisma.usageRecord.create({
                data: {
                    moldId: dto.moldId,
                    product: dto.product,
                    quantity: dto.quantity,
                    shift: dto.shift,
                    recordDate: new Date(dto.recordDate),
                    operatorId,
                    note: dto.note,
                },
                include: { mold: { select: { moldNumber: true, workshop: { select: { name: true } } } }, operator: { select: { name: true } } },
            }),
            this.prisma.mold.update({
                where: { id: dto.moldId },
                data: {
                    usageCount: { increment: dto.quantity },
                    firstUseDate: mold.firstUseDate ? undefined : new Date(dto.recordDate),
                },
            }),
        ]);
        return record;
    }
    async findAll(query) {
        const { moldId, operatorId, startDate, endDate, page = 1, pageSize = 20 } = query;
        const where = {};
        if (moldId)
            where.moldId = moldId;
        if (operatorId)
            where.operatorId = operatorId;
        if (startDate || endDate) {
            where.recordDate = {};
            if (startDate)
                where.recordDate.gte = new Date(startDate);
            if (endDate)
                where.recordDate.lte = new Date(endDate);
        }
        const [list, total] = await Promise.all([
            this.prisma.usageRecord.findMany({
                where,
                include: { mold: { select: { moldNumber: true, workshop: { select: { name: true } } } }, operator: { select: { name: true } } },
                orderBy: { recordDate: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.usageRecord.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async remove(id) {
        const record = await this.prisma.usageRecord.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('记录不存在');
        await this.prisma.$transaction([
            this.prisma.usageRecord.delete({ where: { id } }),
            this.prisma.mold.update({
                where: { id: record.moldId },
                data: { usageCount: { decrement: record.quantity } },
            }),
        ]);
    }
};
exports.UsageRecordService = UsageRecordService;
exports.UsageRecordService = UsageRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageRecordService);
//# sourceMappingURL=usage-record.service.js.map