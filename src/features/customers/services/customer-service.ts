import {
  CustomerRepository,
  CustomerFilter,
} from '../repositories/customer-repository';
import { PaymentRepository } from '../repositories/payment-repository';
import { AuditService } from '../../audit/services/audit-service';

export class CustomerService {
  static async getCustomers(filters: CustomerFilter) {
    return CustomerRepository.findAll(filters);
  }

  static async getCustomer(id: string) {
    return CustomerRepository.findById(id);
  }

  static async createCustomer(data: any, userId: string) {
    const customer = await CustomerRepository.create(data);

    await AuditService.log({
      userId,
      action: 'CUSTOMER_CREATED',
      entity: 'customer',
      entityId: customer.id,
      newValue: customer,
      branchId: customer.branchId,
      deviceId: 'local',
    });

    return customer;
  }

  static async updateCustomer(id: string, data: any, userId: string) {
    const oldCustomer = await CustomerRepository.findById(id);
    const customer = await CustomerRepository.update(id, data);

    await AuditService.log({
      userId,
      action: 'CUSTOMER_UPDATED',
      entity: 'customer',
      entityId: id,
      oldValue: oldCustomer,
      newValue: customer,
      branchId: customer.branchId,
      deviceId: 'local',
    });

    return customer;
  }

  static async deleteCustomer(id: string, userId: string) {
    const customer = await CustomerRepository.softDelete(id);

    await AuditService.log({
      userId,
      action: 'CUSTOMER_DELETED',
      entity: 'customer',
      entityId: id,
      branchId: customer.branchId,
      deviceId: 'local',
    });

    return customer;
  }

  static async createPayment(data: any, userId: string) {
    const payment = await PaymentRepository.create(data);

    await AuditService.log({
      userId,
      action: 'CUSTOMER_PAYMENT_CREATED',
      entity: 'customer_payment',
      entityId: payment.id,
      newValue: payment,
      branchId: payment.branchId,
      deviceId: 'local',
      metadata: { customerId: data.customerId },
    });

    return payment;
  }

  static async getPayments(customerId: string) {
    return PaymentRepository.findAllByCustomerId(customerId);
  }
}

export default CustomerService;
