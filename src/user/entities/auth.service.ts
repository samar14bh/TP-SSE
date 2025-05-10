import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { LoginDTO } from '../dto/login.dto';

@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  
  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, role } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      salt,
      role,
    });

    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const { password, salt, ...rest } = user;
      return rest;
    }
  
    return null;
  }
  
  

  /*async login(data:LoginUserDTO)
  {
    const {email, password} = data;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    return {accessToken};
  }*/
    async login(data: LoginDTO) {
      const user = await this.validateUser(data.email, data.password);
    
      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }
    
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
    
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    
  async findAll() {
    return await this.userRepository.find();  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAuthDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateAuthDto).then((result) => {
      if (result.affected === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      return this.userRepository.findOne({ where: { id } });
    }
    );
  }

  async remove(id: string) {
    
    return await this.userRepository.delete(id).then((result) => {
      if (result.affected === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      return result;
    }
  );
  }


}
