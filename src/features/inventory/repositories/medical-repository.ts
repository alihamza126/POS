import { db } from '../../../database/sqlite/db';
import {
  productBatches,
  expiryAlerts,
  patientRecords,
  prescriptions,
  clinicSettings,
} from '../../../database/schema/medical';
import { products } from '../../../database/schema/inventory';
import { eq, and, lt, lte, gte, desc, asc, ne, isNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Product Batch Repository
// ---------------------------------------------------------------------------
export class ProductBatchRepository {
  static async getBatchesForProduct(productId: string) {
    return db
      .select()
      .from(productBatches)
      .where(
        and(
          eq(productBatches.productId, productId),
          eq(productBatches.isActive, true),
        ),
      )
      .orderBy(asc(productBatches.expiryDate)); // FEFO order
  }

  static async createBatch(data: {
    productId: string;
    batchNumber: string;
    expiryDate?: string;
    manufacturingDate?: string;
    purchasePrice: number;
    sellingPrice?: number;
    quantity: number;
    supplierId?: string;
    purchaseInvoiceId?: string;
    branchId: string;
  }) {
    const id = uuidv4();
    await db.insert(productBatches).values({ id, ...data });
    return id;
  }

  static async updateBatchQuantity(batchId: string, quantityDelta: number) {
    const [batch] = await db
      .select()
      .from(productBatches)
      .where(eq(productBatches.id, batchId));
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const newQty = batch.quantity + quantityDelta;
    await db
      .update(productBatches)
      .set({
        quantity: newQty,
        isActive: newQty > 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(productBatches.id, batchId));
  }

  static async getExpiringBatches(branchId: string, thresholdDays: number = 90) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);
    const thresholdStr = thresholdDate.toISOString().split('T')[0];

    return db
      .select({
        batch: productBatches,
        productName: products.name,
        productSku: products.sku,
        composition: products.composition,
      })
      .from(productBatches)
      .leftJoin(products, eq(productBatches.productId, products.id))
      .where(
        and(
          eq(productBatches.branchId, branchId),
          eq(productBatches.isActive, true),
          lte(productBatches.expiryDate, thresholdStr),
        ),
      )
      .orderBy(asc(productBatches.expiryDate));
  }
}

// ---------------------------------------------------------------------------
// Expiry Alert Repository
// ---------------------------------------------------------------------------
export class ExpiryAlertRepository {
  static async getActiveAlerts(branchId: string) {
    return db
      .select({
        alert: expiryAlerts,
        productName: products.name,
        productSku: products.sku,
        composition: products.composition,
      })
      .from(expiryAlerts)
      .leftJoin(products, eq(expiryAlerts.productId, products.id))
      .where(
        and(
          eq(expiryAlerts.branchId, branchId),
          eq(expiryAlerts.status, 'active'),
        ),
      )
      .orderBy(asc(expiryAlerts.expiryDate));
  }

  static async createAlert(data: {
    productId: string;
    batchId?: string;
    expiryDate: string;
    daysUntilExpiry: number;
    severity: 'critical' | 'warning' | 'info';
    branchId: string;
  }) {
    const id = uuidv4();
    await db.insert(expiryAlerts).values({
      id,
      productId: data.productId,
      batchId: data.batchId,
      expiryDate: data.expiryDate,
      daysUntilExpiry: data.daysUntilExpiry,
      severity: data.severity,
      status: 'active',
      branchId: data.branchId,
    });
    return id;
  }

  static async dismissAlert(alertId: string, userId: string) {
    await db
      .update(expiryAlerts)
      .set({
        status: 'dismissed',
        dismissedBy: userId,
        dismissedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(expiryAlerts.id, alertId));
  }

  static async getAlertCounts(branchId: string) {
    const alerts = await db
      .select()
      .from(expiryAlerts)
      .where(
        and(
          eq(expiryAlerts.branchId, branchId),
          eq(expiryAlerts.status, 'active'),
        ),
      );

    return {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
      total: alerts.length,
    };
  }

  // Called by background checker — refresh all alerts for a branch
  static async refreshAlertsForBranch(branchId: string, thresholdDays: number = 90) {
    const today = new Date().toISOString().split('T')[0];
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + thresholdDays);
    const thresholdStr = threshold.toISOString().split('T')[0];

    // Get all products with expiry dates in this branch
    const expiringProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.branchId, branchId),
          eq(products.active, true),
          // expiryDate is not null and <= threshold
          lte(products.expiryDate, thresholdStr),
        ),
      );

    // Get all active batches expiring within threshold
    const expiringBatches = await ProductBatchRepository.getExpiringBatches(
      branchId,
      thresholdDays,
    );

    // Dismiss all old active alerts first (we'll recreate)
    await db
      .update(expiryAlerts)
      .set({ status: 'dismissed', updatedAt: new Date().toISOString() })
      .where(
        and(eq(expiryAlerts.branchId, branchId), eq(expiryAlerts.status, 'active')),
      );

    const todayDate = new Date();

    // Create new alerts for products
    for (const product of expiringProducts) {
      if (!product.expiryDate) continue;
      const expiry = new Date(product.expiryDate);
      const diffDays = Math.ceil(
        (expiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const severity: 'critical' | 'warning' | 'info' =
        diffDays <= 7 ? 'critical' : diffDays <= 30 ? 'warning' : 'info';
      await ExpiryAlertRepository.createAlert({
        productId: product.id,
        expiryDate: product.expiryDate,
        daysUntilExpiry: diffDays,
        severity,
        branchId,
      });
    }

    // Create alerts for batches (skip if already covered by product alert)
    for (const row of expiringBatches) {
      if (!row.batch.expiryDate) continue;
      const expiry = new Date(row.batch.expiryDate);
      const diffDays = Math.ceil(
        (expiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const severity: 'critical' | 'warning' | 'info' =
        diffDays <= 7 ? 'critical' : diffDays <= 30 ? 'warning' : 'info';
      await ExpiryAlertRepository.createAlert({
        productId: row.batch.productId,
        batchId: row.batch.id,
        expiryDate: row.batch.expiryDate,
        daysUntilExpiry: diffDays,
        severity,
        branchId,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Patient Record Repository
// ---------------------------------------------------------------------------
export class PatientRecordRepository {
  static async getByCustomerId(customerId: string) {
    const rows = await db
      .select()
      .from(patientRecords)
      .where(eq(patientRecords.customerId, customerId));
    return rows[0] || null;
  }

  static async upsert(customerId: string, data: Partial<typeof patientRecords.$inferInsert>) {
    const existing = await PatientRecordRepository.getByCustomerId(customerId);
    if (existing) {
      await db
        .update(patientRecords)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(patientRecords.customerId, customerId));
      return existing.id;
    } else {
      const id = uuidv4();
      await db.insert(patientRecords).values({ id, customerId, ...data });
      return id;
    }
  }
}

// ---------------------------------------------------------------------------
// Prescription Repository
// ---------------------------------------------------------------------------
export class PrescriptionRepository {
  static async create(data: {
    customerId: string;
    invoiceId?: string;
    doctorName: string;
    doctorLicense?: string;
    clinicName?: string;
    prescriptionDate: string;
    diagnosis?: string;
    notes?: string;
    medicines: string; // JSON
    branchId: string;
    userId: string;
  }) {
    const id = uuidv4();
    await db.insert(prescriptions).values({ id, ...data });
    return id;
  }

  static async getByCustomerId(customerId: string) {
    return db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.customerId, customerId))
      .orderBy(desc(prescriptions.createdAt));
  }

  static async linkToInvoice(prescriptionId: string, invoiceId: string) {
    await db
      .update(prescriptions)
      .set({ invoiceId, status: 'dispensed', updatedAt: new Date().toISOString() })
      .where(eq(prescriptions.id, prescriptionId));
  }

  static async getById(id: string) {
    const rows = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));
    return rows[0] || null;
  }
}

// ---------------------------------------------------------------------------
// Clinic Settings Repository
// ---------------------------------------------------------------------------
export class ClinicSettingsRepository {
  static async get(key: string): Promise<string | null> {
    const rows = await db
      .select()
      .from(clinicSettings)
      .where(eq(clinicSettings.key, key));
    return rows[0]?.value ?? null;
  }

  static async getAll(): Promise<Record<string, string>> {
    const rows = await db.select().from(clinicSettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  static async set(key: string, value: string) {
    const existing = await ClinicSettingsRepository.get(key);
    if (existing !== null) {
      await db
        .update(clinicSettings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(clinicSettings.key, key));
    } else {
      await db.insert(clinicSettings).values({ id: uuidv4(), key, value });
    }
  }

  static async setMany(settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await ClinicSettingsRepository.set(key, value);
    }
  }
}
