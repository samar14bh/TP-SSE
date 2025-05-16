// src/cv-events/cv-events.controller.ts

import { Controller, Get, Param, UseGuards, Req, Post, Sse } from '@nestjs/common';
import { Request } from 'express';
import { CvEventsService } from './cv-events.service';
import { CvEvent, OperationType } from './entities/cv-event.entity';
import { User } from '../user/entities/user.entity';
import { get } from 'http';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/jwt/RoleGuard';
import { filter, fromEvent, interval, map, merge, Observable } from 'rxjs';
import { CurrentUser } from 'src/decorator/currentUser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggedUser } from 'src/Types/LoggedUser';

import { MessageEvent } from 'src/Types/MessageEvent';
interface RequestWithUser extends Request {
  user: User; 
}

@Controller('cv-events')
export class CvEventsController {
  constructor(private readonly cvEventsService: CvEventsService,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2
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

  
@UseGuards(JwtAuthGuard)
@Sse('sse')
sse(@CurrentUser() user: LoggedUser): Observable<MessageEvent> {
  console.log("Current user:", user);  
  const isAdmin = user.role === 'admin';

  const events$ = ['cv.created', 'cv.updated', 'cv.deleted', 'cv.read'].map(eventType => 
    fromEvent(this.eventEmitter, eventType)
  );

  return merge(...events$).pipe(
    map((event: CvEvent) => {
      console.log("Event received:", event);

      const shouldSendEvent = isAdmin || event.user.id === user.userId;

      if (shouldSendEvent) {
        return {
          data: JSON.stringify(event), 
          type: event.typeOperation,
          id: String(event.id),
          retry: 10000 
        };
      }

      return null;
    }),
    filter((event) => event !== null)
  );
}



}

  
  
