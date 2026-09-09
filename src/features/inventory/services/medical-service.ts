/**
 * MedicalService — orchestrates medical business workflows:
 * - Expiry alert refresh and management
 * - Patient record management
 * - Prescription workflows
 * - Clinic settings
 * - Product batch management
 */
import {
  ExpiryAlertRepository,
  PatientRecordRepository,
  PrescriptionRepository,
  ProductBatchRepository,
  ClinicSettingsRepository,
  DiseaseFormulaRepository,
  RemedyEntry,
} from '../repositories/medical-repository';
import { AuditService } from '../../audit/services/audit-service';

export class MedicalService {
  // ---------------------------------------------------------------------------
  // Expiry Alerts
  // ---------------------------------------------------------------------------
  static async getActiveAlerts(branchId: string) {
    return ExpiryAlertRepository.getActiveAlerts(branchId);
  }

  static async getAlertCounts(branchId: string) {
    return ExpiryAlertRepository.getAlertCounts(branchId);
  }

  static async dismissAlert(alertId: string, userId: string, branchId: string) {
    await ExpiryAlertRepository.dismissAlert(alertId, userId);
    await AuditService.log({
      action: 'EXPIRY_ALERT_DISMISSED',
      entity: 'expiry_alerts',
      entityId: alertId,
      userId,
      deviceId: 'local',
      branchId,
      metadata: { alertId },
    });
  }

  static async refreshExpiryAlerts(branchId: string, thresholdDays: number = 90) {
    await ExpiryAlertRepository.refreshAlertsForBranch(branchId, thresholdDays);
  }

  static async getExpiringBatches(branchId: string, thresholdDays: number = 90) {
    return ProductBatchRepository.getExpiringBatches(branchId, thresholdDays);
  }

  // ---------------------------------------------------------------------------
  // Product Batches
  // ---------------------------------------------------------------------------
  static async getBatchesForProduct(productId: string) {
    return ProductBatchRepository.getBatchesForProduct(productId);
  }

  static async addBatch(
    data: Parameters<typeof ProductBatchRepository.createBatch>[0],
    userId: string,
  ) {
    const batchId = await ProductBatchRepository.createBatch(data);
    await AuditService.log({
      action: 'BATCH_CREATED',
      entity: 'product_batches',
      entityId: batchId,
      userId,
      deviceId: 'local',
      branchId: data.branchId,
      metadata: { productId: data.productId, batchNumber: data.batchNumber },
    });
    return batchId;
  }

  // ---------------------------------------------------------------------------
  // Patient Records
  // ---------------------------------------------------------------------------
  static async getPatientRecord(customerId: string) {
    return PatientRecordRepository.getByCustomerId(customerId);
  }

  static async savePatientRecord(
    customerId: string,
    data: Record<string, unknown>,
    userId: string,
    branchId: string,
  ) {
    const id = await PatientRecordRepository.upsert(
      customerId,
      data as Parameters<typeof PatientRecordRepository.upsert>[1],
    );
    await AuditService.log({
      action: 'PATIENT_RECORD_UPDATED',
      entity: 'patient_records',
      entityId: id,
      userId,
      deviceId: 'local',
      branchId,
      metadata: { customerId },
    });
    return id;
  }

  // ---------------------------------------------------------------------------
  // Prescriptions
  // ---------------------------------------------------------------------------
  static async createPrescription(
    data: Parameters<typeof PrescriptionRepository.create>[0],
  ) {
    const id = await PrescriptionRepository.create(data);
    await AuditService.log({
      action: 'PRESCRIPTION_CREATED',
      entity: 'prescriptions',
      entityId: id,
      userId: data.userId,
      deviceId: 'local',
      branchId: data.branchId,
      metadata: { customerId: data.customerId, doctorName: data.doctorName },
    });
    return id;
  }

  static async getPrescriptionsByCustomer(customerId: string) {
    return PrescriptionRepository.getByCustomerId(customerId);
  }

  static async getPrescriptionById(id: string) {
    return PrescriptionRepository.getById(id);
  }

  static async linkPrescriptionToInvoice(
    prescriptionId: string,
    invoiceId: string,
    userId: string,
    branchId: string,
  ) {
    await PrescriptionRepository.linkToInvoice(prescriptionId, invoiceId);
    await AuditService.log({
      action: 'PRESCRIPTION_DISPENSED',
      entity: 'prescriptions',
      entityId: prescriptionId,
      userId,
      deviceId: 'local',
      branchId,
      metadata: { invoiceId },
    });
  }

  // ---------------------------------------------------------------------------
  // Clinic Settings
  // ---------------------------------------------------------------------------
  static async getClinicSettings() {
    const settings = await ClinicSettingsRepository.getAll();
    // Return with defaults for missing keys
    return {
      clinicName: settings.clinicName ?? 'Homio Medical Clinic',
      doctorName: settings.doctorName ?? '',
      licenseNumber: settings.licenseNumber ?? '',
      address: settings.address ?? '',
      phone: settings.phone ?? '',
      email: settings.email ?? '',
      receiptFooter: settings.receiptFooter ?? 'Thank you for visiting us. Get well soon!',
      expiryAlertDays: parseInt(settings.expiryAlertDays ?? '90', 10),
      paperSize: settings.paperSize ?? '80mm', // 58mm, 80mm, A4
      printerName: settings.printerName ?? '', // OS printer device name — empty = use OS default
      currency: settings.currency ?? 'Rs.',
      showBatchOnReceipt: settings.showBatchOnReceipt === 'true',
      showExpiryOnReceipt: settings.showExpiryOnReceipt === 'true',
      showCompositionOnReceipt: settings.showCompositionOnReceipt === 'true',
    };
  }

  static async saveClinicSettings(
    settings: Record<string, string>,
    userId: string,
    branchId: string,
  ) {
    const oldSettings = await ClinicSettingsRepository.getAll();
    await ClinicSettingsRepository.setMany(settings);
    await AuditService.log({
      action: 'CLINIC_SETTINGS_UPDATED',
      entity: 'clinic_settings',
      entityId: 'clinic_settings',
      userId,
      deviceId: 'local',
      branchId,
      oldValue: oldSettings,
      newValue: settings,
      metadata: {},
    });
  }

  // ---------------------------------------------------------------------------
  // Disease Formulas — Disease → Remedy library for prescribing
  // ---------------------------------------------------------------------------
  static async listDiseaseFormulas(
    branchId: string,
    filters?: { query?: string; activeOnly?: boolean },
  ) {
    const rows = await DiseaseFormulaRepository.list(branchId, filters ?? {});
    return rows.map((row) => ({
      ...row,
      remedies: JSON.parse(row.remedies) as RemedyEntry[],
    }));
  }

  static async getDiseaseFormula(id: string) {
    const row = await DiseaseFormulaRepository.getById(id);
    if (!row) return null;
    return { ...row, remedies: JSON.parse(row.remedies) as RemedyEntry[] };
  }

  static async createDiseaseFormula(
    data: {
      diseaseName: string;
      category?: string;
      remedies: RemedyEntry[];
      notes?: string;
      branchId: string;
    },
    userId: string,
  ) {
    const id = await DiseaseFormulaRepository.create({ ...data, userId });
    await AuditService.log({
      action: 'DISEASE_FORMULA_CREATED',
      entity: 'disease_formulas',
      entityId: id,
      userId,
      deviceId: 'local',
      branchId: data.branchId,
      newValue: { diseaseName: data.diseaseName, remedyCount: data.remedies.length },
    });
    return id;
  }

  static async updateDiseaseFormula(
    id: string,
    data: Partial<{
      diseaseName: string;
      category: string;
      remedies: RemedyEntry[];
      notes: string;
    }>,
    userId: string,
    branchId: string,
  ) {
    const oldFormula = await DiseaseFormulaRepository.getById(id);
    await DiseaseFormulaRepository.update(id, data);
    await AuditService.log({
      action: 'DISEASE_FORMULA_UPDATED',
      entity: 'disease_formulas',
      entityId: id,
      userId,
      deviceId: 'local',
      branchId,
      oldValue: oldFormula ? { diseaseName: oldFormula.diseaseName } : undefined,
      newValue: data,
    });
  }

  static async setDiseaseFormulaActive(
    id: string,
    isActive: boolean,
    userId: string,
    branchId: string,
  ) {
    await DiseaseFormulaRepository.setActive(id, isActive);
    await AuditService.log({
      action: isActive ? 'DISEASE_FORMULA_REACTIVATED' : 'DISEASE_FORMULA_DEACTIVATED',
      entity: 'disease_formulas',
      entityId: id,
      userId,
      deviceId: 'local',
      branchId,
      metadata: { isActive },
    });
  }
}
