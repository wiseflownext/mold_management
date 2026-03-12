import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        createdAt: Date;
        username: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
    }>;
    findAll(query: QueryUserDto): Promise<{
        list: {
            workshop: {
                id: number;
                name: string;
                isDefault: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            name: string;
            createdAt: Date;
            username: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            workshopId: number | null;
            lastLogin: Date | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        createdAt: Date;
        username: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        workshop: {
            id: number;
            name: string;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        createdAt: Date;
        username: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
    }>;
    resetPassword(id: number, newPassword: string): Promise<void>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        phone: string | null;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
    }>;
}
