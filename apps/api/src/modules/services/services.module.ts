import { Module } from '@nestjs/common';
import { ServiceCategoriesController } from './service-categories.controller';
import { ServiceCategoriesService } from './service-categories.service';
import { ProviderProfileController } from './provider-profile.controller';
import { ProviderProfileService } from './provider-profile.service';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobFeedController } from './job-feed.controller';
import { JobFeedService } from './job-feed.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { NearbyProvidersController } from './nearby-providers.controller';
import { NearbyProvidersService } from './nearby-providers.service';
import { DirectHireController } from './direct-hire.controller';
import { DirectHireService } from './direct-hire.service';
import { GigsController } from './gigs.controller';
import { GigsService } from './gigs.service';
import { ProviderDirectoryController } from './provider-directory.controller';
import { ProviderDirectoryService } from './provider-directory.service';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AiModule, NotificationsModule],
  controllers: [
    ServiceCategoriesController,
    ProviderProfileController,
    JobPostsController,
    JobFeedController,
    JobApplicationsController,
    NearbyProvidersController,
    DirectHireController,
    GigsController,
    ProviderDirectoryController,
  ],
  providers: [
    ServiceCategoriesService,
    ProviderProfileService,
    JobPostsService,
    JobFeedService,
    JobApplicationsService,
    NearbyProvidersService,
    DirectHireService,
    GigsService,
    ProviderDirectoryService,
  ],
})
export class ServicesModule {}