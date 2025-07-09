"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("../config");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService extends client_1.PrismaClient {
    client;
    jwtService;
    logger = new common_1.Logger('AuthService');
    constructor(client, jwtService) {
        super();
        this.client = client;
        this.jwtService = jwtService;
    }
    async onModuleInit() {
        void this.$connect();
        this.logger.log('PostgresDB connected');
    }
    async findAll(branchId) {
        try {
            const users = await this.user.findMany({
                where: {
                    branchId,
                },
                select: {
                    name: true,
                    email: true,
                    role: true,
                },
            });
            if (users.length === 0) {
                return {
                    message: '[FIND_ALL_USERS] no hay usuarios en esta lista.',
                    status: common_1.HttpStatus.NOT_FOUND,
                };
            }
            return users;
        }
        catch (error) {
            return {
                message: '[FIND_ALL_USER] error al retornar usuarios',
                status: common_1.HttpStatus.NOT_FOUND,
            };
        }
    }
    async signJWT(payload) {
        try {
            return this.jwtService.sign(payload);
        }
        catch (error) {
            throw new microservices_1.RpcException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            });
        }
    }
    async registerUser(registerUserDto) {
        const { email, name, password, role, branchId } = registerUserDto;
        try {
            if (branchId) {
                const existingBranch = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: 'find_one_branch_by_id' }, branchId));
                if (!existingBranch) {
                    return {
                        message: '[REGISTER_USER] Branch not existing',
                        status: common_1.HttpStatus.NOT_FOUND,
                    };
                }
            }
            const user = await this.user.findUnique({
                where: { email: email },
            });
            if (user) {
                throw new microservices_1.RpcException({
                    status: 400,
                    message: '[REGISTER_USER] User already exists',
                });
            }
            const newUser = await this.user.create({
                data: {
                    email,
                    name,
                    role: role,
                    branchId,
                    password: bcrypt.hashSync(password, 10),
                },
            });
            const { password: _, ...rest } = newUser;
            return {
                status: 201,
                message: '[REGISTER_USER] User created successfully',
                date: {
                    user: rest,
                    token: await this.signJWT(rest),
                },
            };
        }
        catch (error) {
            throw new microservices_1.RpcException({
                status: 400,
                message: error.message,
            });
        }
    }
    async loginUser(loginUserDto) {
        const { email, password } = loginUserDto;
        try {
            const user = await this.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new microservices_1.RpcException({
                    status: common_1.HttpStatus.FORBIDDEN,
                    message: '[LOGIN] User/Password not vailid',
                });
            }
            const isPassordValid = bcrypt.compareSync(password, user.password);
            if (!isPassordValid) {
                throw new microservices_1.RpcException({
                    status: common_1.HttpStatus.FORBIDDEN,
                    message: '[LOGIN] User/Password not valid',
                });
            }
            const { password: _, createdAt, updatedAt, ...rest } = user;
            return {
                status: 201,
                message: '[LOGIN] User login successfully',
                data: {
                    user: rest,
                    token: await this.signJWT(rest),
                },
            };
        }
        catch (error) {
            throw new microservices_1.RpcException({
                status: 400,
                message: error.message,
            });
        }
    }
    async verifyToken(token) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: config_1.envs.jwtSecret,
            });
            return {
                user: user,
                token: await this.signJWT(user),
            };
        }
        catch (error) {
            throw new microservices_1.RpcException({
                message: 'Invalid token',
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map