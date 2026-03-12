import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto, QueryUserDto } from './dto/user.dto';
export declare class UserController {
    private service;
    constructor(service: UserService);
    create(dto: CreateUserDto): Promise<{
        workshop: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isDefault: boolean;
        } | null;
        id: number;
        username: string;
        phone: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
        createdAt: Date;
    }>;
    findAll(query: QueryUserDto): Promise<{
        list: {
            workshop: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isDefault: boolean;
            } | null;
            id: number;
            username: string;
            phone: string | null;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            workshopId: number | null;
            lastLogin: Date | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getProfile(id: number): Promise<{
        workshop: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isDefault: boolean;
        } | null;
        id: number;
        username: string;
        phone: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
        createdAt: Date;
    }>;
    findOne(id: number): Promise<{
        workshop: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isDefault: boolean;
        } | null;
        id: number;
        username: string;
        phone: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        workshop: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isDefault: boolean;
        } | null;
        id: number;
        username: string;
        phone: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
        createdAt: Date;
    }>;
    resetPassword(id: number, dto: ResetPasswordDto): Promise<void>;
    remove(id: number): Promise<{
        id: number;
        username: string;
        phone: string | null;
        name: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        workshopId: number | null;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
