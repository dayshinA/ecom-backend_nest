// src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import User from '../../models/user.model';
import Role from '../../models/role.model';
import SellerProfile from '../../models/seller.model';
import { AuthService } from '../auth/auth.service';
import { CloudinaryService } from '../../config/cloudinary.config';
import { FileUpload } from 'graphql-upload';
import { Express } from 'express';
import { createReadStream } from 'fs';
import {
  SignUpInput,
  LoginInput,
  UpdateUserProfileInput,
  ChangePasswordInput,
} from '../../graphql/types/user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly authService: AuthService, // Add this
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createUser(userData: SignUpInput, profileImage: FileUpload) {
    const { password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const { createReadStream, filename } = profileImage;
      const stream = createReadStream();

      // Upload the image to Cloudinary directly from the stream
      const uploadResult = await this.cloudinaryService.uploadProfileImage(
        stream,
        filename,
      );

      const newUser = await this.userModel.create({
        ...otherData,
        password: hashedPassword,
        profile_image: uploadResult.secure_url,
      });

      const role = await Role.findByPk(newUser.role_id);
      const isSeller = role.role_name === 'Seller';

      const { password: _, ...userWithoutPassword } = newUser.get({
        plain: true,
      });

      return {
        success: true,
        message: 'User created successfully',
        user: {
          ...userWithoutPassword,
          role_name: role ? role.role_name : null,
          is_seller: isSeller,
        },
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors[0].path === 'email') {
          return {
            success: false,
            message: 'Email already exists',
            user: null,
          };
        } else if (error.errors[0].path === 'user_name') {
          return {
            success: false,
            message: 'Username already exists',
            user: null,
          };
        }
      }
      throw error;
    }
  }

  async loginUser(loginData: LoginInput) {
    const { user_name, password } = loginData;
    const user = await this.userModel.findOne({
      where: { user_name },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name'],
        },
        {
          model: SellerProfile,
          as: 'sellerProfile',
          attributes: ['seller_id'],
        },
      ],
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        token: null,
        user: null,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password',
        token: null,
        user: null,
      };
    }

    const isSeller = user.role.role_name === 'Seller';
    const token = this.authService.generateToken({
      user_id: user.user_id,
      user_name: user.user_name,
      role: user.role.role_name,
      is_seller: isSeller,
    });

    const {
      password: _,
      role,
      sellerProfile,
      ...userWithoutPassword
    } = user.get({ plain: true });

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        ...userWithoutPassword,
        role_name: role.role_name,
        is_seller: isSeller,
      },
    };
  }

  async getUserById(userId: number) {
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
          },
        ],
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return null;
      }

      const isSeller = user.role.role_name === 'Seller';
      const plainUser = user.get({ plain: true });

      return {
        ...plainUser,
        role_name: user.role.role_name,
        is_seller: isSeller,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, updateData: UpdateUserProfileInput) {
    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          user: null,
        };
      }

      // If the email is being updated, check if it's already in use
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.userModel.findOne({
          where: { email: updateData.email },
        });
        if (existingUser) {
          return {
            success: false,
            message: 'Email already in use',
            user: null,
          };
        }
      }

      // If the username is being updated, check if it's already in use
      if (updateData.user_name && updateData.user_name !== user.user_name) {
        const existingUser = await this.userModel.findOne({
          where: { user_name: updateData.user_name },
        });
        if (existingUser) {
          return {
            success: false,
            message: 'Username already in use',
            user: null,
          };
        }
      }

      // Update the user
      await user.update(updateData);

      // Fetch the updated user with the role
      const updatedUser = await this.userModel.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name'],
          },
        ],
        attributes: { exclude: ['password'] },
      });

      const isSeller = updatedUser.role.role_name === 'Seller';
      const plainUser = updatedUser.get({ plain: true });

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...plainUser,
          role_name: updatedUser.role.role_name,
          is_seller: isSeller,
        },
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(
    userId: number,
    changePasswordData: ChangePasswordInput,
  ) {
    try {
      const user = await this.userModel.findByPk(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(
        changePasswordData.old_password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid old password',
        };
      }

      // Make sure new password is different
      const isSamePassword = await bcrypt.compare(
        changePasswordData.new_password,
        user.password,
      );
      if (isSamePassword) {
        return {
          success: false,
          message: 'New password must be different from old password',
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordData.new_password,
        10,
      );

      // Update the user's password
      await user.update({ password: hashedNewPassword });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }
}
