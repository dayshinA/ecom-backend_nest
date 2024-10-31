// src/modules/shippingAddress/shippingAddress.service.ts
import ShipppingAddress from '../../models/shippingAddress.model';
import {
  ShippingAddressInput,
  UpdateShippingAddressInput,
  ShippingAddressResponse,
  ShippingAddressesResponse,
} from '../../graphql/types/checkout.types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectModel(ShipppingAddress)
    private shippingAddressModel: typeof ShipppingAddress,
  ) {}

  async createShippingAddress(
    userId,
    input: ShippingAddressInput,
  ): Promise<ShippingAddressResponse> {
    try {
      const newShippingAddress = await this.shippingAddressModel.create({
        ...input,
        user_id: userId,
      });

      return {
        success: true,
        message: 'Shipping address created successfully',
        shippingAddress: newShippingAddress,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create shipping address',
        shippingAddress: null,
      };
    }
  }

  async getUserShippingAddresses(
    userId: number,
  ): Promise<ShippingAddressesResponse> {
    try {
      const addresses = await this.shippingAddressModel.findAll({
        where: { user_id: userId },
      });

      return {
        success: true,
        message: 'Shipping addresses fetched successfully',
        shippingAddresses: addresses,
      };
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      return {
        success: false,
        message: 'Failed to fetch shipping addresses',
        shippingAddresses: [],
      };
    }
  }

  async getShippingAddressById(addressId: number, userId: number) {
    try {
      const address = await this.shippingAddressModel.findOne({
        where: { address_id: addressId, user_id: userId },
      });

      if (!address) {
        throw new Error('Shipping address not found');
      }

      return address || null;
    } catch (error) {
      console.error('Error fetching shipping address:', error);
      throw new Error('Failed to fetch shipping address');
    }
  }

  async updateShippingAddress(
    userId: number,
    updateData: UpdateShippingAddressInput,
  ) {
    try {
      const address = await this.shippingAddressModel.findOne({
        where: { address_id: updateData.address_id, user_id: userId },
      });

      if (!address) {
        return {
          success: false,
          message: 'Shipping address not found',
          shippingAddress: null,
        };
      }

      await address.update(updateData);

      return {
        success: true,
        message: 'Shipping address updated successfully',
        shippingAddress: address,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update shipping address',
        shippingAddress: null,
      };
    }
  }

  async deleteShippingAddress(addressId: number, userId: number) {
    try {
      const address = await this.shippingAddressModel.findOne({
        where: { address_id: addressId, user_id: userId },
      });

      if (!address) {
        return {
          success: false,
          message: 'Shipping address not found',
        };
      }

      await address.destroy();

      return {
        success: true,
        message: 'Shipping address deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      return {
        success: false,
        message: 'Failed to delete shipping address',
      };
    }
  }
}
