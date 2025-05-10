

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvEventsService } from '../cv-events.service';
import { OperationType } from '../entities/cv-event.entity';
import { CvCreatedEvent, CvUpdatedEvent, CvDeletedEvent, CvReadEvent } from '../events/cv.events';

@Injectable()
export class CvEventsListener {
  constructor(private readonly cvEventsService: CvEventsService) {}

  @OnEvent('cv.created')
  async handleCvCreatedEvent(event: CvCreatedEvent) {
    await this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.CREATE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.updated')
  async handleCvUpdatedEvent(event: CvUpdatedEvent) {
    await this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.UPDATE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.deleted')
  async handleCvDeletedEvent(event: CvDeletedEvent) {
    await this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.DELETE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.read')
 async  handleCvReadEvent(event: CvReadEvent) {
    await this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.READ, 
      event.user
    );
  }
}