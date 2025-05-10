import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CvService } from '../cv/cv.service';
import { UserService } from 'src/user/user.service';
import { SkillService } from '../skill/skill.service';
import { randUserName, randEmail, randPassword, randFirstName, randNumber } from '@ngneat/falso';

async function bootstrap() {
const app = await NestFactory.createApplicationContext(AppModule);

  const cvService = app.get(CvService);
  const userService = app.get(UserService);
  const skillService = app.get(SkillService);

  const user = await userService.create({
    username: randUserName(),
    email: randEmail(),
    password: randPassword()[0]
  });
  const userId = user.id;

  const skills = await Promise.all([
    skillService.create({ designation: 'JavaScript' }),
    skillService.create({ designation: 'TypeScript' }),
    skillService.create({ designation: 'NestJS' }),
  ]);

  const cv = await cvService.create({
    name: randFirstName(),
    firstName: randFirstName(),
    age: randNumber({ min: 20, max: 50 }),
    cin: String(randNumber()),
    job: 'Software Developer',
    path: '/path/to/cv.pdf',
    userId: user.id,
  });
  

  await cvService.addSkillToCv(cv.id, skills[0].id);
await cvService.addSkillToCv(cv.id, skills[1].id);
    
console.log(`User ${user.username} created with CV ID: ${cv.id}`);
console.log(`Skills added to CV: ${skills.map(skill => skill.designation).join(', ')}`);
console.log(`CV created with ID: ${cv.id}`);

await app.close();
}

bootstrap();
