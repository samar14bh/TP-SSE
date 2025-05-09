

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvEventsService } from '../cv-events.service';
import { OperationType } from '../entities/cv-event.entity';
import { CvCreatedEvent, CvUpdatedEvent, CvDeletedEvent, CvReadEvent } from '../events/cv.events';

@Injectable()
export class CvEventsListener {
  constructor(private readonly cvEventsService: CvEventsService) {}

  @OnEvent('cv.created')
  handleCvCreatedEvent(event: CvCreatedEvent) {
    this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.CREATE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.updated')
  handleCvUpdatedEvent(event: CvUpdatedEvent) {
    this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.UPDATE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.deleted')
  handleCvDeletedEvent(event: CvDeletedEvent) {
    this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.DELETE, 
      event.user,
      event.details
    );
  }

  @OnEvent('cv.read')
  handleCvReadEvent(event: CvReadEvent) {
    this.cvEventsService.createEvent(
      event.cvId, 
      OperationType.READ, 
      event.user
    );
  }
}