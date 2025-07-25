import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import { UpdateUserchDto } from './dto/update-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'find.all.user' })
  findAllMany() {
    return this.authService.findAll();
  }

  @MessagePattern({ cmd: 'find.all.user.branch' })
  findAllManyBranchId(@Payload() branchId: string) {
    return this.authService.findAllBranchId(branchId);
  }

  @MessagePattern({ cmd: 'auth.register.user' })
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern({ cmd: 'auth.login.user' })
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @MessagePattern({ cmd: 'auth.verify.user' })
  verifyUser() {
    return 'Verify token';
  }

  @MessagePattern({ cmd: 'auth.verify.token' })
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

  @MessagePattern({ cmd: 'auth.update.user' })
  update(@Payload() updateUserDto: UpdateUserchDto) {
    return this.authService.updateUser(updateUserDto);
  }
}
