// src/cv-events/cv-events.controller.ts

import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { CvEventsService } from './cv-events.service';
import { CvEvent } from './entities/cv-event.entity';


// Étendre l'interface Request pour inclure l'utilisateur
interface RequestWithUser extends Request {
  user: any; // Remplacez 'any' par le type correct de votre utilisateur
}

@Controller('cv-events')

export class CvEventsController {
  constructor(private readonly cvEventsService: CvEventsService) {}

  @Get()

  findAll(): Promise<CvEvent[]> {
    return this.cvEventsService.findAll();
  }

  @Get('cv/:id')
  async findByCv(@Param('id') id: string, @Req() req: RequestWithUser): Promise<CvEvent[]> {
    const user = req.user;
    
    if (user.roles.includes('admin')) {
      return this.cvEventsService.findByCvId(id);
    }
    
    
    return this.cvEventsService.findByCvId(id);
  }

  @Get('my-events')
  findMyEvents(@Req() req: RequestWithUser): Promise<CvEvent[]> {
    const user = req.user;
    return this.cvEventsService.findByUser(user.id);
  }
}