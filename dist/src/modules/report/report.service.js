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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReportService = class ReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportUsageCSV(moldId, startDate, endDate) {
        const where = {};
        if (moldId)
            where.moldId = moldId;
        if (startDate || endDate) {
            where.recordDate = {};
            if (startDate)
                where.recordDate.gte = new Date(startDate);
            if (endDate)
                where.recordDate.lte = new Date(endDate);
        }
        const records = await this.prisma.usageRecord.findMany({
            where,
            include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
            orderBy: { recordDate: 'desc' },
        });
        const BOM = '\uFEFF';
        const header = '模具编号,产品名称,数量,班次,日期,操作员,备注\n';
        const rows = records.map((r) => {
            const shift = r.shift === 'MORNING' ? '早班' : r.shift === 'AFTERNOON' ? '中班' : '晚班';
            return `${r.mold.moldNumber},${r.product},${r.quantity},${shift},${r.recordDate.toISOString().slice(0, 10)},${r.operator.name},${r.note || ''}`;
        });
        return BOM + header + rows.join('\n');
    }
    async exportMaintenanceCSV(moldId, startDate, endDate) {
        const where = {};
        if (moldId)
            where.moldId = moldId;
        if (startDate || endDate) {
            where.recordDate = {};
            if (startDate)
                where.recordDate.gte = new Date(startDate);
            if (endDate)
                where.recordDate.lte = new Date(endDate);
        }
        const records = await this.prisma.maintenanceRecord.findMany({
            where,
            include: { mold: { select: { moldNumber: true } }, operator: { select: { name: true } } },
            orderBy: { recordDate: 'desc' },
        });
        const BOM = '\uFEFF';
        const header = '模具编号,类型,内容,日期,操作员\n';
        const rows = records.map((r) => {
            const type = r.type === 'MAINTAIN' ? '保养' : '维修';
            return `${r.mold.moldNumber},${type},${r.content.replace(/,/g, '，')},${r.recordDate.toISOString().slice(0, 10)},${r.operator.name}`;
        });
        return BOM + header + rows.join('\n');
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportService);
//# sourceMappingURL=report.service.js.map