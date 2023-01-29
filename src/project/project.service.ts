import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async getAllByUser(user: User): Promise<Project[]> {
    return await this.prisma.project.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async createProject(projectDto: ProjectDto, user: User): Promise<void> {
    const { title, urls } = projectDto;
    try {
      await this.prisma.project.create({
        data: {
          title,
          urls,
          userId: user.id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async updateProject(projectDto: ProjectDto, id: string): Promise<void> {
    const { title, urls } = projectDto;
    try {
      await this.prisma.project.update({
        where: {
          id
        },
        data: {
          title,
          urls,
        },
      });
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException(e);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
