// src/cv-events/cv-events.controller.ts

import { Controller, Get, Param, UseGuards, Req, Post } from '@nestjs/common';
import { Request } from 'express';
import { CvEventsService } from './cv-events.service';
import { CvEvent, OperationType } from './entities/cv-event.entity';
import { User } from '../user/entities/user.entity';
import { get } from 'http';
import { UserService } from 'src/user/user.service';


interface RequestWithUser extends Request {
  user: User; 
}

@Controller('cv-events')

export class CvEventsController {
  constructor(private readonly cvEventsService: CvEventsService,
    private readonly userService: UserService,
  ) {}

  
@Post('create')
  async create(@Req() req: RequestWithUser): Promise<CvEvent> {
    const user = await  this.userService.findOne("d92225a6-1349-4452-83bd-74d70e536721");
    const events = this.cvEventsService.createEvent("10", OperationType.CREATE,user,"detaials" );
    
    return events;
  }
@Get('')
  findAll(): Promise<CvEvent[]> {
    return this.cvEventsService.findAll();
  }

  @Get('cv/:id')
  async findByCv(@Param('id') id: string): Promise<CvEvent[]> {
    
    /*if (user.roles.includes('admin')) {
      return this.cvEventsService.findByCvId(id);
    }*/
    
    
    return await this.cvEventsService.findByCvId(id);
  }

  @Get('my-events')
  findMyEvents(@Req() req: RequestWithUser): Promise<CvEvent[]> {
    const user = req.user;
    return this.cvEventsService.findByUser(user.id);
  }
}