

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEvent } from './entities/cv-event.entity';
import { CvEventsService } from './cv-events.service';
import { CvEventsController } from './cv-events.controller';
import { CvEventsListener } from './listeners/cv-events.listener';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CvEvent,User]),
  ],
  providers: [CvEventsService, CvEventsListener,UserService],
  controllers: [CvEventsController],
  exports: [CvEventsService]
})
export class CvEventsModule {}