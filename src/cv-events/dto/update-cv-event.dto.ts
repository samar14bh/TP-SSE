import { PartialType } from '@nestjs/mapped-types';
import { CreateCvEventDto } from './create-cv-event.dto';

export class UpdateCvEventDto extends PartialType(CreateCvEventDto) {}
