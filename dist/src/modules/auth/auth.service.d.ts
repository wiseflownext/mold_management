import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            workshop: string | undefined;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void>;
}
