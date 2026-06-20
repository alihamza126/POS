import {
  SupplierRepository,
  SupplierFilter,
} from '../repositories/supplier-repository';
import { SupplierPaymentRepository } from '../repositories/supplier-payment-repository';
import { PurchaseInvoiceRepository } from '../repositories/purchase-invoice-repository';
import { AuditService } from '../../audit/services/audit-service';

export class SupplierService {
  static async getSuppliers(filters: SupplierFilter) {
    return SupplierRepository.findAll(filters);
  }

  static async getSupplier(id: string) {
    return SupplierRepository.findById(id);
  }

  static async createSupplier(data: any, userId: string) {
    const supplier = await SupplierRepository.create(data);

    await AuditService.log({
      userId,
      action: 'SUPPLIER_CREATED',
      entity: 'supplier',
      entityId: supplier.id,
      newValue: supplier,
      branchId: supplier.branchId,
      deviceId: 'local',
    });

    return supplier;
  }

  static async updateSupplier(id: string, data: any, userId: string) {
    const oldSupplier = await SupplierRepository.findById(id);
    const supplier = await SupplierRepository.update(id, data);

    await AuditService.log({
      userId,
      action: 'SUPPLIER_UPDATED',
      entity: 'supplier',
      entityId: id,
      oldValue: oldSupplier,
      newValue: supplier,
      branchId: supplier.branchId,
      deviceId: 'local',
    });

    return supplier;
  }

  static async deleteSupplier(id: string, userId: string) {
    const supplier = await SupplierRepository.softDelete(id);

    await AuditService.log({
      userId,
      action: 'SUPPLIER_DELETED',
      entity: 'supplier',
      entityId: id,
      branchId: supplier.branchId,
      deviceId: 'local',
    });

    return supplier;
  }

  static async createPurchaseInvoice(invoiceData: any, items: any[], userId: string, branchId: string, deviceId: string) {
    const purchase = await PurchaseInvoiceRepository.create(invoiceData, items, userId, branchId, deviceId);

    await AuditService.log({
      userId,
      action: 'PURCHASE_CREATED',
      entity: 'purchase_invoice',
      entityId: purchase.id,
      newValue: purchase,
      branchId,
      deviceId,
    });

    return purchase;
  }

  static async createSimplePurchase(data: any, userId: string) {
    const purchase = await PurchaseInvoiceRepository.createSimple({
      ...data,
      userId,
    });

    await AuditService.log({
      userId,
      action: 'PURCHASE_CREATED',
      entity: 'purchase_invoice',
      entityId: purchase.id,
      newValue: purchase,
      branchId: data.branchId,
      deviceId: data.deviceId || 'local',
      metadata: { simple: true, supplierId: data.supplierId },
    });

    return purchase;
  }

  static async getPurchaseInvoices(supplierId: string) {
    return PurchaseInvoiceRepository.findAllBySupplierId(supplierId);
  }

  static async getPurchasedProducts(supplierId: string) {
    return PurchaseInvoiceRepository.findAllItemsBySupplierId(supplierId);
  }

  static async recordPayment(data: any, userId: string) {
    const payment = await SupplierPaymentRepository.create(data);

    await AuditService.log({
      userId,
      action: 'SUPPLIER_PAYMENT_CREATED',
      entity: 'supplier_payment',
      entityId: payment.id,
      newValue: payment,
      branchId: data.branchId,
      deviceId: 'local',
      metadata: { supplierId: data.supplierId },
    });

    return payment;
  }

  static async getPayments(supplierId: string) {
    return SupplierPaymentRepository.findAllBySupplierId(supplierId);
  }
}

export default SupplierService;
