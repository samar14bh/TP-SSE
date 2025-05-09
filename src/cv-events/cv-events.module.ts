

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEvent } from './entities/cv-event.entity';
import { CvEventsService } from './cv-events.service';
import { CvEventsController } from './cv-events.controller';
import { CvEventsListener } from './listeners/cv-events.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([CvEvent]),
  ],
  providers: [CvEventsService, CvEventsListener],
  controllers: [CvEventsController],
  exports: [CvEventsService]
})
export class CvEventsModule {}