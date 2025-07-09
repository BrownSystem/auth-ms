import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'find.all.user' })
  findAllMany(@Payload() branchId: string) {
    return this.authService.findAll(branchId);
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
}
