import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericService } from 'src/services/genericService';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillService } from 'src/skill/skill.service';
import { FilterCvDto } from './dto/filterCvDto';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CvCreatedEvent, CvDeletedEvent, CvReadEvent, CvUpdatedEvent } from 'src/cv-events/events/cv.events';

@Injectable()
export class CvService extends GenericService<Cv>  {
  getRepository(): Repository<Cv> {
    return this.repository;
  }
  constructor(
    @InjectRepository(Cv)
    protected readonly repository: Repository<Cv>,
    private readonly skillService:SkillService,
    private readonly userService:UserService,
    private eventEmitter: EventEmitter2,

  ) {
    super(repository); 
  }
  async findByJob(job: string): Promise<Cv[]> {
    const cvs= await this.repository.find({ where: { job } });
    if (cvs) {
      (cvs as any).forEach((cv: Cv) => {
        const event = new CvReadEvent();
        event.cvId = cv.id;
        event.user = cv.user;
        this.eventEmitter.emit('cv.read', event);
      });
    }
    
    return cvs;
  }

  async findByUserId(userId: string): Promise<Cv[]> {
    const cvs=await this.repository.find({ where: { user: { id: userId } } });
    if (cvs) {
      (cvs as any).forEach((cv: Cv) => {
        const event = new CvReadEvent();
        event.cvId = cv.id;
        event.user = cv.user;
        this.eventEmitter.emit('cv.read', event);
      });
    }
    return cvs;
  }


  async addSkillToCv(cvId: string, skillId: string): Promise<Cv> {
    const cv = await this.repository.findOne({ where: { id: cvId }, relations: ['skills'] });
    if (!cv) {
      throw new Error(`CV with id ${cvId} not found`);
    }

    const skill = await this.skillService.findOne(skillId);
    if (!skill) {
      throw new Error(`Skill with id ${skillId} not found`);
    }

    cv.skills.push(skill);
     const event = new CvUpdatedEvent();
    event.cvId = cv.id;
    event.user =cv.user;
    event.details = `CV id:${cv.id} mis à jour`;
    this.eventEmitter.emit('cv.updated', event);
    return this.repository.save(cv);
  }

  async filterCvs(filter: FilterCvDto): Promise<Cv[]> {
    const { age, criteria } = filter;

    const query = this.repository.createQueryBuilder('cv');

    if (criteria) {
      query.andWhere(
        '(cv.name LIKE :criteria OR cv.firstName LIKE :criteria OR cv.job LIKE :criteria)',
        { criteria: `%${criteria}%` },
      );
    }

    if (age) {
      query.andWhere('cv.age = :age', { age });
    }

    return await query.getMany();
  }


  //services for version 2 of my cv 
  async createWithOwner(createCvDto: CreateCvDto): Promise<Cv> {
    const { userId, skillIds = [], ...cvData } = createCvDto;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
  
    const skills = skillIds.length > 0 
      ? await this.skillService.findByIds(skillIds)
      : [];
  
    const cv = this.repository.create({
      ...cvData,
      user,
      skills,
    });
    const event = new CvCreatedEvent();
    event.cvId = cv.id;
    event.user = user;
    event.details = `CV "${cv.name}" créé`;
    this.eventEmitter.emit('cv.created', event);
  
    return await this.repository.save(cv);
  }
  async removeIfOwner(id: string, userId:   string) {
    const cv=await this.repository.findOne({ where: { id }});
    if (!cv) {

      throw new Error(`CV with id ${id} not found`);
    }
    console.log("the current user id ",userId);
    if (!cv.user || cv.user.id !== userId) {

      throw new Error(`You are not the owner of this CV`);
    }
     const event = new CvDeletedEvent();
    event.cvId = cv.id;
    event.user = cv.user;
    event.details = `CV id:${cv.id} supprimé`;
    this.eventEmitter.emit('cv.deleted', event);
    return await this.remove(id);

  }
 
 
  async updateIfOwner(id: string, updateCvDto: UpdateCvDto, userId: string) {
    const cv=await this.findOne(id);
    if (!cv) {
      throw new Error(`CV with id ${id} not found`);
    }
    console.log("the current user id ",cv);
   
    if (cv.user.id !== userId) {
      throw new Error(`You are not the owner of this CV`);
    }
     const event = new CvUpdatedEvent();
    event.cvId = cv.id;
    event.user =cv.user;
    event.details = `CV id:${cv.id} mis à jour`;
    this.eventEmitter.emit('cv.updated', event);
    await this.repository.update(id, updateCvDto);
  }
  async setImagePath(cvId: string, imagePath: string): Promise<Cv> {
    const cv = await this.findOne(cvId);
    if (!cv) {
      throw new Error(`CV with id ${cvId} not found`);
    }
    cv.path = imagePath;
    return this.repository.save(cv);
  }

  
 
}
