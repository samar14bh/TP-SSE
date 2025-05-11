import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericService } from '../services/genericService';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillService } from '../skill/skill.service';
import { FilterCvDto } from './dto/filterCvDto';
import { User } from '../user/entities/user.entity';
import { PaginationService, PaginationResult } from '../services/pagination.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CvCreatedEvent, CvReadEvent, CvUpdatedEvent, CvDeletedEvent } from 'src/cv-events/events/cv.events';

@Injectable()
export class CvService extends GenericService<Cv> {
  constructor(
      @InjectRepository(Cv) protected readonly repository: Repository<Cv>,
      @InjectRepository(User) protected readonly userRepository: Repository<User>,
      private readonly skillService: SkillService,
      private readonly paginationService: PaginationService,
      private readonly eventEmitter: EventEmitter2,
  ) {
    super(repository);
  }

  getRepository(): Repository<Cv> {
    return this.repository;
  }

  async paginate(page = 1, limit = 10): Promise<PaginationResult<Cv>> {
    const qb = this.repository
        .createQueryBuilder('cv')
        .leftJoinAndSelect('cv.user', 'user')
        .leftJoinAndSelect('cv.skills', 'skills');
    return this.paginationService.paginateQuery<Cv>(qb, page, limit);
  }

  async createWithOwner(createCvDto: CreateCvDto, userId: string): Promise<Cv> {
    const { skillIds = [], ...cvData } = createCvDto;
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
    const cv = this.repository.create({ ...cvData, user });

    if (skillIds.length) {
      cv.skills = await this.skillService.findByIds(skillIds);
    }

    const saved = await this.repository.save(cv);

    const event = new CvCreatedEvent();
    event.cvId = saved.id;
    event.user = user;
    event.details = `CV "${saved.name}" created (owner)`;
    this.eventEmitter.emit('cv.created', event);

    return saved;
  }

  async findOneWithUser(id: string, userId: string): Promise<Cv> {
    const cv = await this.repository.findOneOrFail({ where: { id }, relations: ['skills', 'user'] });

    const event = new CvReadEvent();
    event.cvId = cv.id;
    event.user = cv.user;
    event.details = `CV id:${cv.id} viewed`;
    this.eventEmitter.emit('cv.read', event);

    return cv;
  }

  async updateWithUser(id: string, updateCvDto: UpdateCvDto, userId: string): Promise<Cv> {
    const cv = await this.repository.findOneOrFail({ where: { id }, relations: ['user'] });

    if (cv.user.id !== userId) {
      throw new NotFoundException('Unauthorized action');
    }

    Object.assign(cv, updateCvDto);
    const updated = await this.repository.save(cv);

    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });

    const event = new CvUpdatedEvent();
    event.cvId = updated.id;
    event.user = user;
    event.details = `CV id:${updated.id} updated`;
    this.eventEmitter.emit('cv.updated', event);

    return this.repository.findOneOrFail({ where: { id }, relations: ['skills', 'user'] });
  }

  async removeWithUser(id: string, userId: string): Promise<void> {
    const cv = await this.repository.findOneOrFail({ where: { id }, relations: ['user'] });

    if (cv.user.id !== userId) {
      throw new NotFoundException('Unauthorized action');
    }

    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });

    const event = new CvDeletedEvent();
    event.cvId = cv.id;
    event.user = user;
    event.details = `CV id:${cv.id} deleted`;
    this.eventEmitter.emit('cv.deleted', event);

    await this.repository.delete(id);
  }

  async findByJob(job: string): Promise<Cv[]> {
    const cvs = await this.repository.find({ where: { job }, relations: ['user', 'skills'] });

    cvs.forEach(cv => {
      const event = new CvReadEvent();
      event.cvId = cv.id;
      event.user = cv.user;
      event.details = `CV id:${cv.id} viewed (job: ${job})`;
      this.eventEmitter.emit('cv.read', event);
    });

    return cvs;
  }

  async findByUserId(userId: string): Promise<Cv[]> {
    const cvs = await this.repository.find({ where: { user: { id: userId } }, relations: ['user', 'skills'] });

    cvs.forEach(cv => {
      const event = new CvReadEvent();
      event.cvId = cv.id;
      event.user = cv.user;
      event.details = `CV id:${cv.id} viewed (user: ${userId})`;
      this.eventEmitter.emit('cv.read', event);
    });

    return cvs;
  }

  async addSkillToCv(cvId: string, skillId: string): Promise<Cv> {
    const cv = await this.repository.findOneOrFail({ where: { id: cvId }, relations: ['skills', 'user'] });
    const skill = await this.skillService.findOne(skillId);

    if (!skill) throw new NotFoundException(`Skill with id ${skillId} not found`);

    cv.skills.push(skill);
    const saved = await this.repository.save(cv);

    const event = new CvUpdatedEvent();
    event.cvId = cv.id;
    event.user = cv.user;
    event.details = `CV id:${cv.id} updated (skill added)`;
    this.eventEmitter.emit('cv.updated', event);

    return saved;
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

    return query.getMany();
  }

  async setImagePath(cvId: string, imagePath: string): Promise<Cv> {
    const cv = await this.repository.findOneOrFail({ where: { id: cvId }, relations: ['user'] });
    cv.path = imagePath;
    return this.repository.save(cv);
  }
}
