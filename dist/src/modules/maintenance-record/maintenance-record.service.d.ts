import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaintenanceRecordDto, QueryMaintenanceRecordDto } from './dto/maintenance-record.dto';
export declare class MaintenanceRecordService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMaintenanceRecordDto, operatorId: number): Promise<{
        mold: {
            moldNumber: string;
        };
        operator: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MaintenanceType;
        moldId: number;
        recordDate: Date;
        operatorId: number;
        content: string;
    }>;
    findAll(query: QueryMaintenanceRecordDto): Promise<{
        list: ({
            mold: {
                moldNumber: string;
            };
            operator: {
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MaintenanceType;
            moldId: number;
            recordDate: Date;
            operatorId: number;
            content: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MaintenanceType;
        moldId: number;
        recordDate: Date;
        operatorId: number;
        content: string;
    }>;
}
