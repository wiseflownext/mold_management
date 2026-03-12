import { UsageRecordService } from './usage-record.service';
import { CreateUsageRecordDto, QueryUsageRecordDto } from './dto/usage-record.dto';
export declare class UsageRecordController {
    private service;
    constructor(service: UsageRecordService);
    create(dto: CreateUsageRecordDto, userId: number): Promise<{
        operator: {
            name: string;
        };
        mold: {
            moldNumber: string;
        };
    } & {
        id: number;
        createdAt: Date;
        moldId: number;
        recordDate: Date;
        operatorId: number;
        shift: import(".prisma/client").$Enums.Shift;
        product: string;
        quantity: number;
        note: string | null;
    }>;
    findAll(query: QueryUsageRecordDto): Promise<{
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
            moldId: number;
            recordDate: Date;
            operatorId: number;
            shift: import(".prisma/client").$Enums.Shift;
            product: string;
            quantity: number;
            note: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    remove(id: number): Promise<void>;
}
