// src/modules/payment/payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import Payment from '../../models/payment.model';
import PaymentMethod from '../../models/paymentMethod.model';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    @InjectModel(PaymentMethod)
    private paymentMethodModel: typeof PaymentMethod,
  ) {}

  async processPayment(
    orderId: number,
    userId: number,
    methodId: number,
    amount: number,
    transaction?: Transaction,
  ): Promise<{ payment: Payment; isSuccessful: boolean }> {
    try {
      // Simulate payment processing with 90% success rate
      const isSuccessful = Math.random() < 0.9;
      const paymentStatus = isSuccessful ? 'Completed' : 'Failed';

      // Generate a unique transaction ID
      const transactionId = `SIMULATED-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;

      const payment = await this.paymentModel.create(
        {
          order_id: orderId,
          user_id: userId,
          method_id: methodId,
          amount: amount,
          currency: 'GHC',
          status: paymentStatus,
          transaction_id: transactionId,
          payment_date: new Date(),
        },
        { transaction },
      );

      return { payment, isSuccessful };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new BadRequestException('Failed to process payment');
    }
  }

  async getPaymentMethod(methodId: number): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.paymentMethodModel.findByPk(methodId);
      if (!paymentMethod) {
        throw new BadRequestException('Payment method not found');
      }
      return paymentMethod;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw new BadRequestException('Failed to fetch payment method');
    }
  }

}
