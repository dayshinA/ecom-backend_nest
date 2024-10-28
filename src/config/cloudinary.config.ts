// src/config/cloudinary.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as multer from 'multer';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private readonly FOLDERS = {
    PRODUCTS: 'ecommerce/products',
    PROFILES: 'ecommerce/profiles',
    STORES: 'ecommerce/stores',
  };

  private createStorage(
    folder: string,
    allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'gif'],
  ) {
    return new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        return {
          folder, // Specify the folder where the file should be stored
          format: allowedFormats.includes(file.mimetype.split('/')[1])
            ? file.mimetype.split('/')[1]
            : 'jpg',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        };
      },
    });
  }

  public uploads = {
    products: multer({ storage: this.createStorage(this.FOLDERS.PRODUCTS) }),
    profiles: multer({
      storage: this.createStorage(this.FOLDERS.PROFILES),
      limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit for profile pics
    }),
    stores: multer({ storage: this.createStorage(this.FOLDERS.STORES) }),
  };

  public async uploadToCloudinary(
    file: string,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto',
      });
      return result;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  public async uploadProductImage(
    stream: NodeJS.ReadableStream,
    filename: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        {
          folder: this.FOLDERS.PRODUCTS,
          public_id: filename,
          resource_type: 'image',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      stream.pipe(cloudinaryStream);
    });
  }

  public async uploadProfileImage(
    stream: NodeJS.ReadableStream,
    filename: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        {
          folder: this.FOLDERS.PROFILES,
          public_id: filename,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.pipe(cloudinaryStream);
    });
  }

  public async uploadStoreImage(
    stream: NodeJS.ReadableStream,
    filename: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        {
          folder: this.FOLDERS.STORES,
          public_id: filename,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      stream.pipe(cloudinaryStream);
    });
  }

  public async deleteFromCloudinary(public_id: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(public_id);
      return true;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }

  public getFolderPath(type: string): string {
    return this.FOLDERS[type.toUpperCase()] || this.FOLDERS.PRODUCTS;
  }
}
