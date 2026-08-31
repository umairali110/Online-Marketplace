import { Controller, Get } from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private service: ServiceCategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}