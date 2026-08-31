import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(private jobApplicationsService: JobApplicationsService) {}

  @Roles(Role.PROVIDER)
  @Post(':jobPostId')
  apply(
    @CurrentUser('id') userId: string,
    @Param('jobPostId') jobPostId: string,
    @Body() dto: CreateJobApplicationDto,
  ) {
    return this.jobApplicationsService.apply(userId, jobPostId, dto);
  }

  @Roles(Role.PROVIDER)
  @Get('mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.jobApplicationsService.listMine(userId);
  }

  @Roles(Role.CUSTOMER)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationsService.updateStatus(userId, id, dto.status);
  }
}