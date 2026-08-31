import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JobFeedService } from './job-feed.service';
import { ListJobsDto } from './dto/list-jobs.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROVIDER)
@Controller('job-feed')
export class JobFeedController {
  constructor(private jobFeedService: JobFeedService) {}

  @Get()
  listOpen(@Query() query: ListJobsDto) {
    return this.jobFeedService.listOpen(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobFeedService.findOne(id);
  }
}