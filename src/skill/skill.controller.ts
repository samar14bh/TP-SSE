import { Controller, Get, Post, Body, Patch, Param, Delete, SetMetadata, UseGuards } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Role } from 'src/decorator/roles.decorator';

import { RoleGuard } from 'src/jwt/RoleGuard';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}


  @Role('admin')
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Get()
  @Role('user')
  findAll() {
    return this.skillService.findAll();
  }


  @Role('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(id);
  }


  @Role('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(id, updateSkillDto);
  }


  @Role('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.remove(id);
  }
}


