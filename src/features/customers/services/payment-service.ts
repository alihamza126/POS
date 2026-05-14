import { PaymentRepository } from '../repositories/payment-repository';
import { AuditService } from '../../audit/services/audit-service';

export class PaymentService {
  static async recordPayment(data: any, userId: string) {
    const payment = await PaymentRepository.create(data);

    await AuditService.log({
      userId,
      action: 'PAYMENT_CREATED',
      entity: 'customer_payment',
      entityId: payment.id,
      newValue: payment,
      branchId: data.branchId,
      deviceId: 'local',
      metadata: { customerId: data.customerId },
    });

    return payment;
  }

  static async getCustomerPayments(customerId: string) {
    return PaymentRepository.findAllByCustomerId(customerId);
  }

  static async getPayment(id: string) {
    return PaymentRepository.findById(id);
  }
}

export default PaymentService;
