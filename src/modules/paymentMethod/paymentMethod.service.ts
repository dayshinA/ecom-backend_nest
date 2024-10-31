// src/modules/paymentMethod/paymentMethod.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import PaymentMethod from '../../models/paymentMethod.model';
import {
  PaymentMethodInput,
  PaymentMethodUpdateInput,
  PaymentMethodResponse,
} from '../../graphql/types/checkout.types';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectModel(PaymentMethod)
    private paymentMethodModel: typeof PaymentMethod,
  ) {}

  async getAllPaymentMethods() {
    try {
      const paymentMethods = await this.paymentMethodModel.findAll();
      return paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  async getPaymentMethodById(methodId: number) {
    try {
      const paymentMethod = await this.paymentMethodModel.findByPk(methodId);

      if (!paymentMethod) {
        return {
          success: false,
          message: 'Payment method not found',
          paymentMethod: null,
        };
      }

      return {
        success: true,
        message: 'Payment method found',
        paymentMethod,
      };
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw new Error('Failed to fetch payment method');
    }
  }

  async createPaymentMethod(
    methodData: PaymentMethodInput,
  ): Promise<PaymentMethodResponse> {
    try {
      const newMethod = await this.paymentMethodModel.create({
        method_name: methodData.method_name,
      });

      return {
        success: true,
        message: 'Payment method created successfully',
        paymentMethod: newMethod,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'Payment method already exists',
          paymentMethod: null,
        };
      }
    }
  }

  async updatePaymentMethod(
    methodData: PaymentMethodUpdateInput,
  ): Promise<PaymentMethodResponse> {
    try {
      const paymentMethod = await this.paymentMethodModel.findByPk(
        methodData.method_id,
      );

      if (!paymentMethod) {
        return {
          success: false,
          message: 'Payment method not found',
          paymentMethod: null,
        };
      }

      //   check if the new method name already exists
      const existingMethod = await this.paymentMethodModel.findOne({
        where: {
          method_name: methodData.method_name,
        },
      });

      if (existingMethod && existingMethod.method_id !== methodData.method_id) {
        return {
          success: false,
          message: 'Payment method already exists',
          paymentMethod: null,
        };
      }

      paymentMethod.method_name = methodData.method_name;
      await paymentMethod.save();

      return {
        success: true,
        message: 'Payment method updated successfully',
        paymentMethod,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'Category name already exists under a different ID',
          paymentMethod: null,
        };
      }
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deletePaymentMethod(methodId: number) {
    try {
      const paymentMethod = await this.paymentMethodModel.findByPk(methodId);

      if (!paymentMethod) {
        return {
          success: false,
          message: 'Payment method not found',
        };
      }

      await paymentMethod.destroy();

      return {
        success: true,
        message: 'Payment method deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }
}
