import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt';

import { RegisterUserDto, Role } from './dto';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { envs, NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { UpdateUserchDto } from './dto/update-user.dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async onModuleInit() {
    void this.$connect();
    this.logger.log('PostgresDB connected');
  }

  async findAll() {
    try {
      const users = await this.user.findMany({
        where: { available: true },
        select: {
          id: true,
          name: true,
          email: true,
          branchId: true,
          role: true,
          available: true,
        },
      });

      if (users.length === 0) {
        return {
          message: '[FIND_ALL_USERS] no hay usuarios en esta lista.',
          status: HttpStatus.NOT_FOUND,
        };
      }

      return users;
    } catch (error) {
      return {
        message: '[FIND_ALL_USER] error al retornar usuarios',
        status: HttpStatus.NOT_FOUND,
      };
    }
  }

  async findAllBranchId(branchId: string) {
    try {
      const users = await this.user.findMany({
        where: {
          branchId,
          available: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          branchId: true,
          role: true,
        },
      });

      if (users.length === 0) {
        return {
          message: '[FIND_ALL_USERS] no hay usuarios en esta lista.',
          status: HttpStatus.NOT_FOUND,
        };
      }

      return users;
    } catch (error) {
      return {
        message: '[FIND_ALL_USER] error al retornar usuarios',
        status: HttpStatus.NOT_FOUND,
      };
    }
  }

  async signJWT(payload: IJwtPayload): Promise<string> {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password, role, branchId } = registerUserDto;
    try {
      if (branchId) {
        const existingBranch = await firstValueFrom(
          this.client.send({ cmd: 'find_one_branch_by_id' }, branchId),
        );

        if (!existingBranch) {
          return {
            message: '[REGISTER_USER] Branch not existing',
            status: HttpStatus.NOT_FOUND,
          };
        }
      }

      const user = await this.user.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new RpcException({
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
          password: bcrypt.hashSync(password, 10), // Hash the password
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
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async updateUser(updateUserDto: UpdateUserchDto) {
    const { id, email, name, role, branchId, password, available } =
      updateUserDto;

    try {
      const user = await this.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new RpcException({
          status: 404,
          message: '[UPDATE_USER] User not found',
        });
      }

      let branchValidated = null;
      if (branchId) {
        branchValidated = await firstValueFrom(
          this.client.send({ cmd: 'find_one_branch_by_id' }, branchId),
        );

        if (!branchValidated) {
          throw new RpcException({
            status: 404,
            message: '[UPDATE_USER] Branch not found',
          });
        }
      }

      const updatedUser = await this.user.update({
        where: { id },
        data: {
          ...(email && { email }),
          ...(name && { name }),
          ...(role && { role }),
          ...(branchId && { branchId }),
          ...(password && { password: bcrypt.hashSync(password, 10) }),
          ...(available !== undefined && { available: available }),
        },
      });

      const { password: _, ...rest } = updatedUser;
      return {
        status: 200,
        message: '[UPDATE_USER] User updated successfully',
        data: rest,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `[UPDATE_USER] ${error.message}`,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await this.user.findUnique({
        where: { email, available: true },
      });
      if (!user) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: '[LOGIN] User/Password not vailid',
        });
      }

      const isPassordValid = bcrypt.compareSync(password, user.password);
      if (!isPassordValid) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
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
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        message: 'Invalid token',
      });
    }
  }
}
