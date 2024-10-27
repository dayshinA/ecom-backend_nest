// src/config/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.config';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Make it available for other modules
})
export class CloudinaryModule {}
