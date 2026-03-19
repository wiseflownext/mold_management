import { PrismaService } from '../../prisma/prisma.service';
export declare class ReportService {
    private prisma;
    constructor(prisma: PrismaService);
    exportUsageCSV(moldId?: number, startDate?: string, endDate?: string): Promise<string>;
    exportMaintenanceCSV(moldId?: number, startDate?: string, endDate?: string): Promise<string>;
}
