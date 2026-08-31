import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role, WorkflowKey } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SellerWorkflowsService } from './seller-workflows.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller/workflows')
export class SellerWorkflowsController {
  constructor(private workflowsService: SellerWorkflowsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.workflowsService.list(userId);
  }

  @Patch(':key/toggle')
  toggle(@CurrentUser('id') userId: string, @Param('key') key: WorkflowKey) {
    return this.workflowsService.toggle(userId, key);
  }
}