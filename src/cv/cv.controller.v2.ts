import { BadRequestException, Body, Controller, Delete,ForbiddenException,Get,NotFoundException,Param,  Patch,  Post,  Query,  UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CvService } from "./cv.service";
import { CreateCvDto } from "./dto/create-cv.dto";
import { Cv } from "./entities/cv.entity";
import { PaginationService } from "src/services/pagination.service";
import { ImageUploadInterceptor } from "src/Interceptor/image-upload.Interceptor";
import { JwtAuthGuard } from "src/jwt/jwt-auth.guard";
import { User } from "src/user/entities/user.entity";
import { CurrentUser } from "src/decorator/currentUser";
import { UpdateCvDto } from "./dto/update-cv.dto";
import { RoleGuard } from "src/jwt/RoleGuard";
import { Role } from "src/decorator/roles.decorator";



@UseGuards(JwtAuthGuard, RoleGuard)
@Controller({ path: 'cv', version: '2' })
export class CvControllerV2 {
    constructor(private readonly cvService:CvService,    private readonly paginationService: PaginationService
    ) {    
    }


    //before adding guard 
    @Get("paginate")
    async getAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ) {
      limit = limit > 50 ? 50 : limit;
      return this.cvService.paginate(page, limit);
    }
    /*
    @Post()
    async create(@Body() cvDto: CreateCvDto, @Req() req): Promise<Cv> {
    return this.cvService.createWithOwner({
        ...cvDto,
        userId: req.userId,
    });

    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateCvDto, @Request() req) {
        
        
        return await this.cvService.updateIfOwner(id, updateCvDto, req.userId);
    }
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        
        
        return await  this.cvService.removeIfOwner(id, req.userId);
    }
*/

    @Post()
    create(@Body() createCvDto: CreateCvDto, @CurrentUser() user: User) {
    createCvDto.userId = user.id; // Set the userId from the decorator
    return this.cvService.create(createCvDto);
    }

  
  
  //@UseGuards(AdminGuard)
  @Role('admin')
  @Get('getAll')
  findAllAdmin() {
    return this.cvService.findAll();
  }

  @Get()

  findAllByUser(@CurrentUser() user: User) {
    if (user.role === 'admin') {
      return this.cvService.findAll();
    }
    return this.cvService.findByUserId(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const cv = await this.cvService.findOne(id);
    if (!cv || !cv[0]) throw new NotFoundException('CV not found');

    if (user.role !== 'admin' && cv[0].user.id !== user.id) {
      throw new ForbiddenException("You can't access this CV");
    }

    return cv[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
    @CurrentUser() user: User,
  ) {
    const cv = await this.cvService.findOne(id);

    if (!cv || !cv[0]) throw new NotFoundException('CV not found');

    if (user.role !== 'admin' && cv[0].user.id !== user.id) {
      throw new ForbiddenException("You can't update this CV");
    }

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const cv = await this.cvService.findOne(id);

    if (!cv || !cv[0]) throw new NotFoundException('CV not found');

    if (user.role !== 'admin' && cv[0].user.id !== user.id) {
      throw new ForbiddenException("You can't delete this CV");
    }

    return this.cvService.remove(id);
  }



  @Post('upload')
  @UseInterceptors(ImageUploadInterceptor.imageInterceptor())
  async uploadCvImage(@UploadedFile() file: Express.Multer.File,@Body() body: { cvId: string}) {
    if (!file) {
      throw new BadRequestException('No valid image uploaded');
    }
    const path = file.path.replace(/\\/g, '/').replace(/^public\//, '');
    const updatedCv = await this.cvService.setImagePath(body.cvId, path);
    return {
      message: 'Image uploaded successfully',
      cv:updatedCv,
    };
  }


  

 

 

}

