import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';

import { Skill } from './skill/entities/skill.entity';
import { Cv } from './cv/entities/cv.entity';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CvControllerV2 } from './cv/cv.controller.v2';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import * as dbConfigJson from './db/db.config.json';
const dbConfig = dbConfigJson as TypeOrmModuleOptions;
import { CvEventsModule } from './cv-events/cv-events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [ TypeOrmModule.forRoot(dbConfig), TypeOrmModule.forFeature([User, Skill, Cv]), CvModule, SkillModule,
    TypeOrmModule.forRoot({
    type:'mysql',
    host:'localhost', 
    port: 3306,  
    username:'root', 
    password:'dontgo',
    database:'cvbd', 
    synchronize: true,
    autoLoadEntities: true,
  }), TypeOrmModule.forFeature([User, Skill, Cv]), CvModule, SkillModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public', 'uploads'), 
    serveRoot: '/uploads',  
  }),
  JwtModule.register({ secret: 'SECRET_KEY', signOptions: { expiresIn: '60m' } })
  ,EventEmitterModule.forRoot(),
    
  CvEventsModule,
  
  
  ], 

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  /*configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(CvControllerV2);
  }*/
  
  
}


