import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RoleGuard } from '../jwt/RoleGuard';
import { CurrentUser } from '../decorator/currentUser';
import { Cv } from './entities/cv.entity';
import { LoggedUser } from 'src/Types/LoggedUser';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(
      @Body() createCvDto: CreateCvDto,
      @CurrentUser() user: LoggedUser,
  ): Promise<Cv> {
    return this.cvService.createWithOwner(createCvDto, user.userId);
  }

  @Get(':id')
  findOne(
      @Param('id') id: string,
      @CurrentUser() user: LoggedUser,
  ): Promise<Cv> {
    return this.cvService.findOneWithUser(id, user.userId);
  }

  @Patch(':id')
  update(
      @Param('id') id: string,
      @Body() updateCvDto: UpdateCvDto,
      @CurrentUser() user: LoggedUser,
  ): Promise<Cv> {
    return this.cvService.updateWithUser(id, updateCvDto, user.userId);
  }

  @Delete(':id')
  remove(
      @Param('id') id: string,
      @CurrentUser() user: LoggedUser,
  ): Promise<void> {
    return this.cvService.removeWithUser(id, user.userId);
  }
}
