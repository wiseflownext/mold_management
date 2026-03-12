import { PrismaService } from '../../prisma/prisma.service';
export declare class WorkshopService {
    private prisma;
    constructor(prisma: PrismaService);
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
