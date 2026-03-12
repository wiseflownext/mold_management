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
exports.MaintenanceRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MaintenanceRecordService = class MaintenanceRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, operatorId) {
        const mold = await this.prisma.mold.findUnique({ where: { id: dto.moldId } });
        if (!mold)
            throw new common_1.NotFoundException('模具不存在');
        return this.prisma.maintenanceRecord.create({
            data: {
                moldId: dto.moldId,
                type: dto.type,
                content: dto.content,
                recordDate: new Date(dto.recordDate),
                operatorId,
            },
            include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
        });
    }
    async findAll(query) {
        const { moldId, operatorId, type, startDate, endDate, page = 1, pageSize = 20 } = query;
        const where = {};
        if (moldId)
            where.moldId = moldId;
        if (operatorId)
            where.operatorId = operatorId;
        if (type)
            where.type = type;
        if (startDate || endDate) {
            where.recordDate = {};
            if (startDate)
                where.recordDate.gte = new Date(startDate);
            if (endDate)
                where.recordDate.lte = new Date(endDate);
        }
        const [list, total] = await Promise.all([
            this.prisma.maintenanceRecord.findMany({
                where,
                include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
                orderBy: { recordDate: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.maintenanceRecord.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async remove(id) {
        const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('记录不存在');
        return this.prisma.maintenanceRecord.delete({ where: { id } });
    }
};
exports.MaintenanceRecordService = MaintenanceRecordService;
exports.MaintenanceRecordService = MaintenanceRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceRecordService);
//# sourceMappingURL=maintenance-record.service.js.map