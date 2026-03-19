export declare class CreateUserDto {
    username: string;
    name: string;
    phone?: string;
    password: string;
    role: string;
    workshopId?: number;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: string;
    workshopId?: number;
}
export declare class ResetPasswordDto {
    newPassword: string;
}
export declare class QueryUserDto {
    keyword?: string;
    role?: string;
    page?: number;
    pageSize?: number;
}
