import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    findAllMany(branchId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }[] | {
        message: string;
        status: import("@nestjs/common").HttpStatus;
    }>;
    registerUser(registerUserDto: RegisterUserDto): Promise<{
        message: string;
        status: import("@nestjs/common").HttpStatus;
        date?: undefined;
    } | {
        status: number;
        message: string;
        date: {
            user: {
                email: string;
                name: string;
                branchId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                available: boolean;
            };
            token: string;
        };
    }>;
    loginUser(loginUserDto: LoginUserDto): Promise<{
        status: number;
        message: string;
        data: {
            user: {
                email: string;
                name: string;
                branchId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                available: boolean;
            };
            token: string;
        };
    }>;
    verifyUser(): string;
    verifyToken(token: string): Promise<{
        user: any;
        token: string;
    }>;
}
