import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  FlaskConical,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useAuthStore } from '../../../stores/auth-store';
import { useToast } from '../../../hooks/use-toast';
import { APP_CONFIG } from '../../../shared/constants/config';
import FormulaFormDialog from '../components/FormulaFormDialog';

interface DiseaseFormula {
  id: string;
  diseaseName: string;
  category: string | null;
  notes: string | null;
  isActive: boolean;
  remedies: { name: string; potency?: string; dosage?: string; frequency?: string; duration?: string }[];
  createdAt: string;
}

export default function FormulaListPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [formulas, setFormulas] = useState<DiseaseFormula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<DiseaseFormula | null>(null);

  const fetchFormulas = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const result = await window.api.medical.listDiseaseFormulas(
        APP_CONFIG.branch.defaultId,
        search || undefined,
        !showInactive,
      );
      setFormulas(result || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load disease formulas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [search, showInactive, toast]);

  useEffect(() => {
    const debounce = setTimeout(fetchFormulas, 200);
    return () => clearTimeout(debounce);
  }, [fetchFormulas]);

  const handleToggleActive = async (formula: DiseaseFormula) => {
    try {
      // @ts-ignore
      await window.api.medical.setDiseaseFormulaActive(
        formula.id,
        !formula.isActive,
        user?.id,
        APP_CONFIG.branch.defaultId,
      );
      toast({
        title: formula.isActive ? 'Formula Deactivated' : 'Formula Reactivated',
        description: `"${formula.diseaseName}" has been ${formula.isActive ? 'deactivated' : 'reactivated'}.`,
      });
      fetchFormulas();
    } catch {
      toast({
        title: 'Failed',
        description: 'Could not update formula status.',
        variant: 'destructive',
      });
    }
  };

  const openEdit = (formula: DiseaseFormula) => {
    setEditingFormula(formula);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingFormula(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">
            Disease Formulas
          </h1>
          <p className="text-text-secondary mt-1">
            Reusable Disease → Remedy library for writing prescriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
            <FlaskConical size={16} />
            {formulas.length} Formulas
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} />
            New Formula
          </Button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <Input
            placeholder="Search by disease or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInactive((v) => !v)}
          className={showInactive ? 'bg-navy/5' : ''}
        >
          {showInactive ? 'Showing All' : 'Active Only'}
        </Button>
      </div>

      {/* Formula List */}
      <Card className="border-none shadow-soft bg-surface border border-navy/5 overflow-hidden">
        {loading && (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${String(i)}`}
                className="h-20 bg-background/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}
        {!loading && formulas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <FlaskConical size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">No formulas yet</p>
            <p className="text-sm mt-1">
              Add your first disease formula so it can be reused in prescriptions
            </p>
          </div>
        )}
        {!loading && formulas.length > 0 && (
          <div className="divide-y divide-navy/5">
            {formulas.map((formula) => (
              <div
                key={formula.id}
                className={`px-6 py-4 transition-colors ${!formula.isActive ? 'opacity-50' : 'hover:bg-background/40'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <FlaskConical size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-navy">{formula.diseaseName}</p>
                      {formula.category && (
                        <Badge variant="outline" className="text-[10px]">
                          {formula.category}
                        </Badge>
                      )}
                      {!formula.isActive && (
                        <Badge variant="outline" className="text-[10px] text-red-500 border-red-200">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formula.remedies.map((r, i) => (
                        <span
                          key={`${formula.id}-${i}`}
                          className="text-xs font-medium bg-navy/5 text-navy/70 px-2.5 py-1 rounded-lg"
                        >
                          {r.name}
                          {r.potency ? ` ${r.potency}` : ''}
                          {r.dosage ? ` · ${r.dosage}` : ''}
                          {r.frequency ? ` · ${r.frequency}` : ''}
                        </span>
                      ))}
                    </div>
                    {formula.notes && (
                      <p className="text-xs text-text-secondary mt-2">{formula.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-secondary hover:text-primary hover:bg-primary/10"
                      onClick={() => openEdit(formula)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${formula.isActive ? 'text-text-secondary hover:text-destructive hover:bg-destructive/10' : 'text-emerald-600 hover:bg-emerald-500/10'}`}
                      onClick={() => handleToggleActive(formula)}
                      title={formula.isActive ? 'Deactivate' : 'Reactivate'}
                    >
                      {formula.isActive ? <Trash2 size={14} /> : <RotateCcw size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <FormulaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchFormulas}
        formula={editingFormula}
      />
    </div>
  );
}
