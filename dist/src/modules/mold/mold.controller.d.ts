import { MoldService } from './mold.service';
import { CreateMoldDto, UpdateMoldDto, UpdateDesignLifeDto, QueryMoldDto } from './dto/mold.dto';
export declare class MoldController {
    private moldService;
    constructor(moldService: MoldService);
    create(dto: CreateMoldDto): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        products: {
            id: number;
            name: string;
            createdAt: Date;
            customer: string | null;
            model: string | null;
            partNumber: string | null;
            moldId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        workshopId: number | null;
        moldNumber: string;
        type: import(".prisma/client").$Enums.MoldType;
        firstUseDate: Date | null;
        designLife: number;
        maintenanceCycle: number;
        status: import(".prisma/client").$Enums.MoldStatus;
        usageCount: number;
    }>;
    findAll(query: QueryMoldDto): Promise<{
        list: ({
            workshop: {
                id: number;
                name: string;
                isDefault: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            products: {
                id: number;
                name: string;
                createdAt: Date;
                customer: string | null;
                model: string | null;
                partNumber: string | null;
                moldId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            workshopId: number | null;
            moldNumber: string;
            type: import(".prisma/client").$Enums.MoldType;
            firstUseDate: Date | null;
            designLife: number;
            maintenanceCycle: number;
            status: import(".prisma/client").$Enums.MoldStatus;
            usageCount: number;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getStatistics(): Promise<{
        total: number;
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MoldGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MoldGroupByOutputType, "type"[]> & {
            _count: number;
        })[];
    }>;
    findOne(id: number): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        usageRecords: ({
            operator: {
                name: string;
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
        maintenanceRecords: ({
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
        certificationLogs: ({
            operator: {
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            newDesignLife: number;
            reportUrl: string;
            moldId: number;
            oldDesignLife: number;
            operatorId: number;
        })[];
        products: {
            id: number;
            name: string;
            createdAt: Date;
            customer: string | null;
            model: string | null;
            partNumber: string | null;
            moldId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        workshopId: number | null;
        moldNumber: string;
        type: import(".prisma/client").$Enums.MoldType;
        firstUseDate: Date | null;
        designLife: number;
        maintenanceCycle: number;
        status: import(".prisma/client").$Enums.MoldStatus;
        usageCount: number;
    }>;
    update(id: number, dto: UpdateMoldDto): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        products: {
            id: number;
            name: string;
            createdAt: Date;
            customer: string | null;
            model: string | null;
            partNumber: string | null;
            moldId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        workshopId: number | null;
        moldNumber: string;
        type: import(".prisma/client").$Enums.MoldType;
        firstUseDate: Date | null;
        designLife: number;
        maintenanceCycle: number;
        status: import(".prisma/client").$Enums.MoldStatus;
        usageCount: number;
    }>;
    updateDesignLife(id: number, dto: UpdateDesignLifeDto, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        workshopId: number | null;
        moldNumber: string;
        type: import(".prisma/client").$Enums.MoldType;
        firstUseDate: Date | null;
        designLife: number;
        maintenanceCycle: number;
        status: import(".prisma/client").$Enums.MoldStatus;
        usageCount: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        workshopId: number | null;
        moldNumber: string;
        type: import(".prisma/client").$Enums.MoldType;
        firstUseDate: Date | null;
        designLife: number;
        maintenanceCycle: number;
        status: import(".prisma/client").$Enums.MoldStatus;
        usageCount: number;
    }>;
}
