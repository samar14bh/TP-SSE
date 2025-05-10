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
import { PaginationService ,PaginationResult} from 'src/services/pagination.service';
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
    private readonly paginationService: PaginationService,
    private eventEmitter: EventEmitter2,

  ) {
    super(repository); 
  }


  //new paginate method
  async paginate(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Cv>> {
    const qb = this.repository
      .createQueryBuilder('cv')
      .leftJoinAndSelect('cv.user', 'user')
      .leftJoinAndSelect('cv.skills', 'skills');
      

    return this.paginationService.paginateQuery<Cv>(qb, page, limit);
  }
  //added using the event emitter
  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const entity = this.repository.create(createCvDto);
     const cv= await this.repository.save(entity);
    const user = await this.userService.findOne(createCvDto.userId);
    const event = new CvCreatedEvent();
    event.cvId = cv.id;
    event.user = user;
    event.details = `CV "${cv.name}" créé`;
    this.eventEmitter.emit('cv.created', event);
    return cv;
  }
  async findOne(id: string): Promise<Cv> {
    const cv = await this.repository.findOne({ where: { id }, relations: ['skills'] });
    if (!cv) {
      throw new Error(`CV with id ${id} not found`);
    }
    const event = new CvReadEvent();
    event.cvId = cv.id;
    event.user = cv.user;
    this.eventEmitter.emit('cv.read', event);
    return cv;
  }
  async remove(id: string): Promise<void> {
    const cv = await this.repository.findOne({ where: { id } });
    if (cv) {
      const event = new CvDeletedEvent();
      event.cvId = cv.id;
      event.user = cv.user;
      event.details = `CV id:${cv.id} supprimé`;
      this.eventEmitter.emit('cv.deleted', event);
    }
    await this.repository.delete(id);
  }
  async update(id: string, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.repository.findOne({ where: { id } });
    if (cv) {
      const event = new CvUpdatedEvent();
      event.cvId = cv.id;
      event.user = cv.user;
      event.details = `CV id:${cv.id} mis à jour`;
      this.eventEmitter.emit('cv.updated', event);
    }
    await this.repository.update(id, updateCvDto);
    return this.findOne(id);
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
  
    const datacv = this.repository.create({
      ...cvData,
      user,
      skills,
    });
    const cv= await this.repository.save(datacv);
    const event = new CvCreatedEvent();
    event.cvId = cv.id;
    event.user = user;
    event.details = `CV "${cv.name}" créé`;
    this.eventEmitter.emit('cv.created', event);
  
    return cv;
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
