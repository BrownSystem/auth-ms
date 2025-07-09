import { HttpStatus, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly jwtService;
    private readonly logger;
    constructor(client: ClientProxy, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    findAll(branchId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }[] | {
        message: string;
        status: HttpStatus;
    }>;
    signJWT(payload: IJwtPayload): Promise<string>;
    registerUser(registerUserDto: RegisterUserDto): Promise<{
        message: string;
        status: HttpStatus;
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
    verifyToken(token: string): Promise<{
        user: any;
        token: string;
    }>;
}
