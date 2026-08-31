import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function shapeCart(cart: any) {
  const items = cart.items.map((item: any) => ({
    id: item.id,
    storeListingId: item.storeListingId,
    productTitle: item.storeListing.product.title,
    productImage: item.storeListing.product.images[0] ?? null,
    storeName: item.storeListing.store.name,
    price: Number(item.storeListing.price),
    stock: item.storeListing.stock,
    qty: item.qty,
  }));

  const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);
  const shipping = 0; // all listings are freeDelivery=true by default in this MVP
  const tax = 0;
  const total = subtotal + shipping + tax;

  return { items, subtotal, shipping, tax, total };
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });
    return cart;
  }

  private async loadCartWithItems(cartId: string) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: { include: { storeListing: { include: { product: true, store: true } } } },
      },
    });
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const full = await this.loadCartWithItems(cart.id);
    return shapeCart(full);
  }

  async addItem(userId: string, storeListingId: string, qty = 1) {
    const listing = await this.prisma.storeListing.findUnique({ where: { id: storeListingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.stock < qty) throw new BadRequestException('Not enough stock');

    const cart = await this.getOrCreateCart(userId);
        await this.prisma.cart.update({ where: { id: cart.id }, data: { reminderSentAt: null } });
    await this.prisma.cartItem.upsert({
      where: { cartId_storeListingId: { cartId: cart.id, storeListingId } },
      update: { qty: { increment: qty } },
      create: { cartId: cart.id, storeListingId, qty },
    });

    return this.getCart(userId);
  }

  async updateQty(userId: string, itemId: string, qty: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, storeListing: true },
    });
    if (!item || item.cart.userId !== userId) throw new NotFoundException('Cart item not found');
    if (item.storeListing.stock < qty) throw new BadRequestException('Not enough stock');

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}