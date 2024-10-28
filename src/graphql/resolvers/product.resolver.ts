// src/graphql/resolvers/product.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from '../../modules/product/product.service';
import { AuthGuard } from '../../middleware/auth.gurad';
import {
  ProductType,
  ProductsResponse,
  InventoryResponse,
  ProductResponse,
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariationInput,
  UpdateProductVariationInput,
} from '../types/product.types';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';

interface RequestContext {
  req: {
    user?: {
      user_id: number;
      role: string;
    };
  };
}

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}
  private transformToProductType(product: Product): ProductType {
    const plainProduct = product.get({ plain: true });
    return {
      ...plainProduct,
      seller_name: plainProduct.seller?.user?.name || null,
      store_name: plainProduct.seller?.store_name || null,
      category_name: plainProduct.category?.category_name || null,
      brand_name: plainProduct.brand?.brand_name || null,
    } as ProductType;
  }

  private transformVariationToProductType(
    variation: ProductVariation,
  ): ProductType {
    const plainVariation = variation.get({ plain: true });
    const product = variation.product?.get({ plain: true });
    if (!product) {
      throw new Error('Product not found for variation');
    }
    return {
      ...product,
      seller_name: product.seller?.user?.name || null,
      store_name: product.seller?.store_name || null,
      category_name: product.category?.category_name || null,
      brand_name: product.brand?.brand_name || null,
      variations: [plainVariation],
    } as ProductType;
  }

  private checkSellerAuth(
    context: RequestContext,
    action: string,
  ): { success: boolean; message: string } {
    if (!context.req.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }
    if (context.req.user.role !== 'Seller') {
      return {
        success: false,
        message: `Only sellers can ${action}`,
      };
    }
    return { success: true, message: '' };
  }

  @Query(() => ProductsResponse)
  async products(): Promise<ProductsResponse> {
    try {
      const products = await this.productService.getAllProducts();
      return {
        success: true,
        message: 'Products fetched successfully',
        products,
      };
    } catch (error) {
      console.error('Error resolving products:', error);
      return {
        success: false,
        message: error.message,
        products: [],
      };
    }
  }

  @Query(() => InventoryResponse)
  @UseGuards(AuthGuard)
  async sellerInventory(
    @Context() context: RequestContext,
  ): Promise<InventoryResponse> {
    const authCheck = this.checkSellerAuth(context, 'fetch their inventory');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        inventory: [],
      };
    }

    try {
      const inventory = await this.productService.getSellerInventory(
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Seller inventory fetched successfully',
        inventory,
      };
    } catch (error) {
      console.error('Error resolving seller inventory:', error);
      return {
        success: false,
        message: error.message,
        inventory: [],
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(context, 'create products');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      const newProduct = await this.productService.createProduct(
        input,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product created successfully',
        product: this.transformToProductType(newProduct),
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async updateProduct(
    @Args('input') input: UpdateProductInput,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(context, 'update products');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      const updatedProduct = await this.productService.updateProduct(
        input,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product updated successfully',
        product: this.transformToProductType(updatedProduct),
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Args('product_id') product_id: number,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(context, 'delete products');
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      await this.productService.deleteProduct(
        product_id,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product deleted successfully',
        product: null,
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async createProductVariation(
    @Args('product_id') product_id: number,
    @Args('input') input: CreateProductVariationInput,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(
      context,
      'create product variations',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      const newVariation = await this.productService.createProductVariation(
        product_id,
        input,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product variation created successfully',
        product: this.transformVariationToProductType(newVariation),
      };
    } catch (error) {
      console.error('Error creating product variation:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async updateProductVariation(
    @Args('input') input: UpdateProductVariationInput,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(
      context,
      'update product variations',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      const updatedVariation = await this.productService.updateProductVariation(
        input,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product variation updated successfully',
        product: this.transformVariationToProductType(updatedVariation),
      };
    } catch (error) {
      console.error('Error updating product variation:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }

  @Mutation(() => ProductResponse)
  @UseGuards(AuthGuard)
  async deleteProductVariation(
    @Args('variation_id') variation_id: number,
    @Context() context: RequestContext,
  ): Promise<ProductResponse> {
    const authCheck = this.checkSellerAuth(
      context,
      'delete product variations',
    );
    if (!authCheck.success) {
      return {
        success: false,
        message: authCheck.message,
        product: null,
      };
    }

    try {
      await this.productService.deleteProductVariation(
        variation_id,
        context.req.user.user_id,
      );
      return {
        success: true,
        message: 'Product variation deleted successfully',
        product: null,
      };
    } catch (error) {
      console.error('Error deleting product variation:', error);
      return {
        success: false,
        message: error.message,
        product: null,
      };
    }
  }
}
