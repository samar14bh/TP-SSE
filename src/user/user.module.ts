import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './entities/auth.service';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[TypeOrmModule.forFeature([User]),JwtModule.register({ secret: 'SECRET_KEY', signOptions: { expiresIn: '60m' } })],
  controllers: [UserController,AuthController],
  providers: [UserService,AuthService,JwtStrategy],
  exports: [UserService], 
})
export class UserModule {}
