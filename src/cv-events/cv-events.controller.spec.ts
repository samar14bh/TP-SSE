import { Test, TestingModule } from '@nestjs/testing';
import { CvEventsController } from './cv-events.controller';
import { CvEventsService } from './cv-events.service';

describe('CvEventsController', () => {
  let controller: CvEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvEventsController],
      providers: [CvEventsService],
    }).compile();

    controller = module.get<CvEventsController>(CvEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
