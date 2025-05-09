// src/cv-events/events/cv.events.ts

import { User } from '../../user/entities/user.entity';

export class CvEvent {
  cvId: string;
  user: User;
  details?: string;
}

export class CvCreatedEvent extends CvEvent {}
export class CvUpdatedEvent extends CvEvent {}
export class CvDeletedEvent extends CvEvent {}
export class CvReadEvent extends CvEvent {}