import { Test, TestingModule } from '@nestjs/testing';
import { CvEventsService } from './cv-events.service';

describe('CvEventsService', () => {
  let service: CvEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvEventsService],
    }).compile();

    service = module.get<CvEventsService>(CvEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
