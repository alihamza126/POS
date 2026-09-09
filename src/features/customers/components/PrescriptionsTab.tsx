import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Stethoscope, FileText, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import NewPrescriptionDialog from './NewPrescriptionDialog';

interface PrescriptionsTabProps {
  customerId: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'text-amber-600 border-amber-200 bg-amber-50',
  dispensed: 'text-emerald-600 border-emerald-200 bg-emerald-50',
  partial: 'text-blue-600 border-blue-200 bg-blue-50',
};

export default function PrescriptionsTab({ customerId }: PrescriptionsTabProps) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const result = await window.api.medical.getPrescriptions(customerId);
      setPrescriptions(result || []);
    } catch {
      // non-critical — leave list empty
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-black text-navy">Prescriptions</h4>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" size="sm">
          <Plus size={16} />
          New Prescription
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`skeleton-${String(i)}`}
              className="h-24 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && prescriptions.length === 0 && (
        <div className="bg-white p-12 rounded-[24px] text-center border-2 border-dashed border-navy/10">
          <Stethoscope size={40} className="mx-auto text-navy/20 mb-3" />
          <p className="font-bold text-navy">No prescriptions yet</p>
          <p className="text-text-secondary text-sm mt-1">
            Start a new prescription — pick a disease formula to auto-fill remedies.
          </p>
        </div>
      )}

      {!loading &&
        prescriptions.map((rx) => {
          const medicines = (() => {
            try {
              return JSON.parse(rx.medicines || '[]');
            } catch {
              return [];
            }
          })();
          return (
            <div
              key={rx.id}
              className="bg-white rounded-2xl border border-navy/5 shadow-soft p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy">
                      {rx.diagnosis || 'General Prescription'}
                    </p>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[rx.status] || 'text-navy/50'}
                    >
                      {rx.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {rx.prescriptionDate} · Dr. {rx.doctorName}
                  </p>
                </div>
                {rx.invoiceId && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <FileText size={12} />
                    Linked to sale
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {medicines.map((m: any, i: number) => (
                  <span
                    key={`${rx.id}-${i}`}
                    className="text-xs font-medium bg-navy/5 text-navy/70 px-2.5 py-1 rounded-lg"
                  >
                    {m.name}
                    {m.potency ? ` ${m.potency}` : ''}
                    {m.dosage ? ` · ${m.dosage}` : ''}
                    {m.frequency ? ` · ${m.frequency}` : ''}
                  </span>
                ))}
              </div>
              {rx.notes && <p className="text-xs text-text-secondary">{rx.notes}</p>}
            </div>
          );
        })}

      <NewPrescriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchPrescriptions}
        customerId={customerId}
      />
    </div>
  );
}
