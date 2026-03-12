import { MaintenanceRecordService } from './maintenance-record.service';
import { CreateMaintenanceRecordDto, QueryMaintenanceRecordDto } from './dto/maintenance-record.dto';
export declare class MaintenanceRecordController {
    private service;
    constructor(service: MaintenanceRecordService);
    create(dto: CreateMaintenanceRecordDto, userId: number): Promise<{
        operator: {
            name: string;
        };
        mold: {
            moldNumber: string;
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
            operator: {
                name: string;
            };
            mold: {
                moldNumber: string;
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
