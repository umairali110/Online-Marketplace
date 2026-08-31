import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/list-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsDto) {
    return this.productsService.list(query);
  }

  @Get('best-deals')
  bestDeals() {
    return this.productsService.bestDeals();
  }

    @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.productsService.relatedTo(slug);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}