import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './entities/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDTO } from './dto/login.dto';
import { CurrentUser } from 'src/decorator/currentUser';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/jwt/RoleGuard';
import { Role } from 'src/decorator/roles.decorator';

@Controller('auth')
@UseGuards(RoleGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }
  @Post('login')
  async login(@Body() dto: LoginDTO) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(dto);
  }



  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.authService.findAll();
  }
 
  @Role('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.update(id, updateAuthDto);
  }
  @Delete(':id')
  @Role('admin')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  
}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user) {
    return this.authService.findOne(user.id); 
  }

}