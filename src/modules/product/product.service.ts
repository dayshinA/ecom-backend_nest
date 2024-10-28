// src/modules/product/product.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Product from '../../models/product.model';
import ProductVariation from '../../models/productVariation.model';
import Category from '../../models/category.model';
import Brand from '../../models/brand.model';
import User from '../../models/user.model';
import SellerProfile from '../../models/seller.model';
import SellerInventory from '../../models/sellerInventory.model';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariationInput,
  UpdateProductVariationInput,
  ProductType,
  InventoryItemType,
} from '../../graphql/types/product.types';
import { FileUpload } from 'graphql-upload';
import { CloudinaryService } from '../../config/cloudinary.config';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(ProductVariation)
    private productVariationModel: typeof ProductVariation,
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(Brand)
    private brandModel: typeof Brand,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(SellerProfile)
    private sellerProfileModel: typeof SellerProfile,
    @InjectModel(SellerInventory)
    private sellerInventoryModel: typeof SellerInventory,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAllProducts(): Promise<ProductType[]> {
    try {
      const products = await this.productModel.findAll({
        include: [
          {
            model: ProductVariation,
            as: 'variations',
          },
          {
            model: SellerProfile,
            as: 'seller',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name'],
              },
            ],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['category_name'],
          },
          {
            model: Brand,
            as: 'brand',
            attributes: ['brand_name'],
          },
        ],
      });

      return products.map((product) => {
        const plainProduct = product.get({ plain: true });
        return {
          ...plainProduct,
          seller_name: plainProduct.seller?.user?.name || null,
          store_name: plainProduct.seller?.store_name || null,
          category_name: plainProduct.category?.category_name || null,
          brand_name: plainProduct.brand?.brand_name || null,
        } as ProductType;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async getSellerInventory(seller_id: number): Promise<InventoryItemType[]> {
    try {
      const products = await this.productModel.findAll({
        where: { seller_id },
        include: [
          {
            model: SellerInventory,
            as: 'inventories',
            required: false,
          },
          {
            model: ProductVariation,
            as: 'variations',
          },
          {
            model: Category,
            as: 'category',
            attributes: ['category_name'],
          },
          {
            model: Brand,
            as: 'brand',
            attributes: ['brand_name'],
          },
        ],
      });

      return products.map((product) => {
        const plainProduct = product.get({ plain: true });
        return {
          ...plainProduct,
          category_name: plainProduct.category?.category_name || null,
          brand_name: plainProduct.brand?.brand_name || null,
          inventory_quantity:
            plainProduct.inventories?.length > 0
              ? plainProduct.inventories[0].quantity
              : plainProduct.stock_quantity,
          low_stock_threshold:
            plainProduct.inventories?.length > 0
              ? plainProduct.inventories[0].low_stock_threshold
              : 10,
        } as InventoryItemType;
      });
    } catch (error) {
      console.error('Error fetching seller inventory:', error);
      throw new BadRequestException('Failed to fetch seller inventory');
    }
  }

  async createProduct(
    productData: CreateProductInput,
    seller_id: number,
  ): Promise<Product> {
    try {
      const { variations, image, ...productInfo } = productData;

      // Check if the category exists
      const category = await this.categoryModel.findByPk(
        productInfo.category_id,
      );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${productInfo.category_id} does not exist`,
        );
      }

      // Check if brand exists
      const brand = await this.brandModel.findByPk(productInfo.brand_id);
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${productInfo.brand_id} does not exist`,
        );
      }

      // Check if seller exists
      const seller = await this.userModel.findByPk(seller_id);
      if (!seller) {
        throw new NotFoundException(
          `Seller with ID ${seller_id} does not exist`,
        );
      }

      // Handle image upload if provided
      let imageUrl: string | null = null;
      if (image) {
        const file: FileUpload = await image;

        const { createReadStream, filename } = file;
        const stream = createReadStream();

        const uploadResult = await this.cloudinaryService.uploadProductImage(
          stream,
          filename,
        );

        imageUrl = uploadResult.secure_url;
      }

      const newProduct = await this.productModel.create({
        ...productInfo,
        seller_id,
        image: imageUrl,
      });

      // Create a corresponding entry in SellerInventory
      await this.sellerInventoryModel.create({
        seller_id,
        product_id: newProduct.product_id,
        quantity: productInfo.stock_quantity || 0,
        low_stock_threshold: 10,
      });

      if (variations?.length > 0) {
        const createdVariations = await this.productVariationModel.bulkCreate(
          variations.map((variation) => ({
            ...variation,
            product_id: newProduct.product_id,
          })),
        );

        // Create SellerInventory entries for each variation
        await this.sellerInventoryModel.bulkCreate(
          createdVariations.map((variation) => ({
            seller_id,
            product_id: newProduct.product_id,
            variation_id: variation.variation_id,
            quantity: variation.stock_quantity || 0,
            low_stock_threshold: 10,
          })),
        );
      }

      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new BadRequestException(`Invalid ${error.index.split('_')[1]}`);
      }
      throw error;
    }
  }

  async updateProduct(
    productData: UpdateProductInput,
    seller_id: number,
  ): Promise<Product> {
    try {
      const product = await this.productModel.findOne({
        where: { product_id: productData.product_id, seller_id },
      });

      if (!product) {
        throw new NotFoundException(
          'Product not found or you are not authorized to update this product',
        );
      }

      if (productData.category_id) {
        const category = await this.categoryModel.findByPk(
          productData.category_id,
        );
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${productData.category_id} does not exist`,
          );
        }
      }

      if (productData.brand_id) {
        const brand = await this.brandModel.findByPk(productData.brand_id);
        if (!brand) {
          throw new NotFoundException(
            `Brand with ID ${productData.brand_id} does not exist`,
          );
        }
      }

      // Create update data object without the image property
      const { image, ...updateDataWithoutImage } = productData;
      const updateData: Partial<Product> = { ...updateDataWithoutImage };

      // Handle image upload if provided
      if (image) {
        const { createReadStream, filename } = await image;
        const stream = createReadStream();
        const uploadResult = await this.cloudinaryService.uploadProductImage(
          stream,
          filename,
        );
        updateData.image = uploadResult.secure_url;
      }

      await product.update(updateData);
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new BadRequestException(`Invalid ${error.index.split('_')[1]}`);
      }
      throw error;
    }
  }

  async deleteProduct(product_id: number, seller_id: number): Promise<boolean> {
    try {
      const deletedRowsCount = await this.productModel.destroy({
        where: { product_id, seller_id },
      });
      if (deletedRowsCount === 0) {
        throw new NotFoundException(
          'Product not found or you are not authorized to delete this product',
        );
      }
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async createProductVariation(
    product_id: number,
    variationData: CreateProductVariationInput,
    seller_id: number,
  ): Promise<ProductVariation> {
    try {
      const product = await this.productModel.findOne({
        where: { product_id, seller_id },
      });
      if (!product) {
        throw new NotFoundException(
          'Product not found or you are not authorized to add variations to this product',
        );
      }

      const newVariation = await this.productVariationModel.create({
        ...variationData,
        product_id,
      });

      // Create inventory entry for the variation
      await this.sellerInventoryModel.create({
        seller_id,
        product_id,
        variation_id: newVariation.variation_id,
        quantity: variationData.stock_quantity || 0,
        low_stock_threshold: 10,
      });

      return newVariation;
    } catch (error) {
      console.error('Error creating product variation:', error);
      throw error;
    }
  }

  async updateProductVariation(
    variationData: UpdateProductVariationInput,
    seller_id: number,
  ): Promise<ProductVariation> {
    try {
      const variation = await this.productVariationModel.findOne({
        where: { variation_id: variationData.variation_id },
        include: [
          {
            model: Product,
            as: 'product',
            where: { seller_id },
            required: true,
          },
        ],
      });

      if (!variation) {
        throw new NotFoundException(
          'Variation not found or you are not authorized to update this variation',
        );
      }

      await variation.update(variationData);
      return variation;
    } catch (error) {
      console.error('Error updating product variation:', error);
      throw error;
    }
  }

  async deleteProductVariation(
    variation_id: number,
    seller_id: number,
  ): Promise<boolean> {
    try {
      // First find the variation to check ownership
      const variation = await this.productVariationModel.findOne({
        where: { variation_id },
        include: [
          {
            model: Product,
            as: 'product',
            where: { seller_id },
            required: true,
          },
        ],
      });

      if (!variation) {
        throw new NotFoundException(
          'Variation not found or you are not authorized to delete this variation',
        );
      }

      await variation.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting product variation:', error);
      throw error;
    }
  }
}
