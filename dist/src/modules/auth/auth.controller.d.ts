import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, RefreshDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<void>;
}
