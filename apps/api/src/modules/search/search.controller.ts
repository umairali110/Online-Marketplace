import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

// Deliberately public — a marketplace search bar shouldn't require login.
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(@Query('q') q: string) {
    return this.searchService.search(q);
  }
}