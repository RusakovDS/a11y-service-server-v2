import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User, Project } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtAccessTokenGuard } from 'src/auth/guard';
import { ProjectService } from './project.service';
import { ProjectDto } from './dto/';

@Controller('projects')
@UseGuards(JwtAccessTokenGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAllByUser(@GetUser() user: User): Promise<Project[]> {
    return this.projectService.getAllByUser(user);
  }

  @Post()
  async createProject(
    @Body() ProjectDto: ProjectDto,
    @GetUser() user: User,
  ): Promise<string> {
    await this.projectService.createProject(ProjectDto, user);
    return 'Created';
  }

  @Put('/:id')
  async updateProject(
    @Body() ProjectDto: ProjectDto,
    @Param('id') id: string,
  ): Promise<string> {
    await this.projectService.updateProject(ProjectDto, id);
    return 'Updated';
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string): Promise<void> {
    return this.projectService.deleteProject(id);
  }
}
