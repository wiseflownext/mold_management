import { WorkshopService } from './workshop.service';
export declare class WorkshopController {
    private service;
    constructor(service: WorkshopService);
    create(name: string): Promise<{
        id: number;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: number, name: string): Promise<{
        id: number;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
