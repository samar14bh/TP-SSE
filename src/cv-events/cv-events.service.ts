
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvEvent, OperationType } from './entities/cv-event.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CvEventsService {
  constructor(
    @InjectRepository(CvEvent)
    private cvEventRepository: Repository<CvEvent>,
  ) {}

  async createEvent(cvId: string, typeOperation: OperationType, user: User, details?: string): Promise<CvEvent> {
    const event = this.cvEventRepository.create({
      cvId,
      typeOperation,
      user,
      details
    });
    
    return this.cvEventRepository.save(event);
  }

  async findAll(): Promise<CvEvent[]> {
    return this.cvEventRepository.find({
      order: { dateHeure: 'DESC' }
    });
  }

  async findByCvId(cvId: string): Promise<CvEvent[]> {
    return this.cvEventRepository.find({
      where: { cvId },
      order: { dateHeure: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<CvEvent[]> {
    return this.cvEventRepository.find({
      where: { user: { id: userId } },
      order: { dateHeure: 'DESC' }
    });
  }
}