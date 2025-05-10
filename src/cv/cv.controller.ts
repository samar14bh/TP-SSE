import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilterCvDto } from './dto/filterCvDto';
import { Cv } from './entities/cv.entity';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/jwt/RoleGuard';

@UseGuards(JwtAuthGuard, RoleGuard)

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  /*@Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }*/
  @Post()
      async create(@Body() cvDto: CreateCvDto, @Req() req): Promise<Cv> {
      return this.cvService.createWithOwner({
          ...cvDto,
          userId: req.userId,
      });}

  @Get()
  findAll() {
    return this.cvService.findAll();
  }
  @Get('filter')
  filterCvs(@Body() filterCvDto: FilterCvDto) { 
    return this.cvService.filterCvs(filterCvDto);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.remove(id);
  }

  
}
