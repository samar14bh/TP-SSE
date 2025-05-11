import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { SkillModule } from 'src/skill/skill.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { UserModule } from 'src/user/user.module';
import { CvControllerV2 } from './cv.controller.v2';
import { PaginationService } from 'src/services/pagination.service';
import {User} from "../user/entities/user.entity";

@Module({
  imports: [SkillModule,TypeOrmModule.forFeature([Cv, User]),UserModule],
  controllers: [CvController,CvControllerV2],
  providers: [CvService,PaginationService],
})
export class CvModule {}
