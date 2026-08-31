import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('jobs')
export class JobPostsController {
  constructor(private jobPostsService: JobPostsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateJobPostDto) {
    return this.jobPostsService.create(userId, dto);
  }

  @Get('mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.jobPostsService.listMine(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.jobPostsService.findOneForOwner(userId, id);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateJobStatusDto) {
    return this.jobPostsService.updateStatus(userId, id, dto.status);
  }
}