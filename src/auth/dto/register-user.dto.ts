import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';

export enum Role {
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  branchId: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either SELLER or ADMIN' })
  role?: Role;
}
