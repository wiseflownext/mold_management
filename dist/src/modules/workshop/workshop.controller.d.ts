import { WorkshopService } from './workshop.service';
export declare class WorkshopController {
    private service;
    constructor(service: WorkshopService);
    create(name: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
    }[]>;
    update(id: number, name: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
    }>;
}
