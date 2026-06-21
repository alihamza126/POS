import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  RefreshCw,
  Pill,
  ChevronRight,
} from 'lucide-react';
import { useExpiryAlerts } from '../hooks/use-expiry-alerts';
import { useAuthStore } from '../../../stores/auth-store';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils';

export default function ExpiryAlertPanel() {
  const { alerts, counts, loading, refreshAlerts, dismissAlert } = useExpiryAlerts();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (counts.total === 0 && !loading) return null;

  const criticalAlerts = alerts.filter((a) => a.alert.severity === 'critical').slice(0, 3);
  const warningAlerts = alerts.filter((a) => a.alert.severity === 'warning').slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-navy/5 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-black text-red-800 text-sm">Expiry Alerts</h3>
            <p className="text-red-500 text-xs font-medium">
              {counts.critical > 0 && `${counts.critical} critical`}
              {counts.critical > 0 && counts.warning > 0 && ' · '}
              {counts.warning > 0 && `${counts.warning} warning`}
              {counts.info > 0 && ` · ${counts.info} info`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refreshAlerts()}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
          title="Refresh alerts"
        >
          <RefreshCw size={14} className={cn('text-red-600', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 space-y-2 border-b border-gray-50">
          <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Expired / Critical
          </p>
          {criticalAlerts.map((a) => (
            <AlertRow
              key={a.alert.id}
              alert={a}
              severity="critical"
              onDismiss={() => user && dismissAlert(a.alert.id, user.id)}
              onClick={() => navigate(`/inventory/${a.alert.productId}`)}
            />
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">
            ⚠ Expiring Soon
          </p>
          {warningAlerts.map((a) => (
            <AlertRow
              key={a.alert.id}
              alert={a}
              severity="warning"
              onDismiss={() => user && dismissAlert(a.alert.id, user.id)}
              onClick={() => navigate(`/inventory/${a.alert.productId}`)}
            />
          ))}
        </div>
      )}

      {/* View All link */}
      {counts.total > 6 && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate('/inventory?filter=expiring')}
            className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
          >
            View all {counts.total} alerts
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

interface AlertRowProps {
  alert: {
    alert: {
      id: string;
      productId: string;
      expiryDate: string;
      daysUntilExpiry: number;
      severity: string;
    };
    productName: string | null;
    productSku: string | null;
    composition: string | null;
  };
  severity: 'critical' | 'warning' | 'info';
  onDismiss: () => void;
  onClick: () => void;
}

function AlertRow({ alert: a, severity, onDismiss, onClick }: AlertRowProps) {
  const days = a.alert.daysUntilExpiry;
  const isExpired = days <= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border cursor-pointer group transition-all',
        severity === 'critical'
          ? 'bg-red-50 border-red-100 hover:bg-red-100'
          : 'bg-amber-50 border-amber-100 hover:bg-amber-100',
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          severity === 'critical' ? 'bg-red-100' : 'bg-amber-100',
        )}
      >
        <Pill
          size={14}
          className={severity === 'critical' ? 'text-red-600' : 'text-amber-600'}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs text-[#02025C] truncate">{a.productName || 'Unknown'}</p>
        {a.composition && (
          <p className="text-xs text-gray-500 truncate">{a.composition}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={10} className={severity === 'critical' ? 'text-red-400' : 'text-amber-400'} />
          <span
            className={cn(
              'text-xs font-bold',
              severity === 'critical' ? 'text-red-600' : 'text-amber-600',
            )}
          >
            {isExpired ? 'EXPIRED' : `${days} day${days !== 1 ? 's' : ''} left`}
          </span>
          <span className="text-xs text-gray-400">· Exp: {a.alert.expiryDate}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="w-6 h-6 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Dismiss alert"
      >
        <X size={10} className="text-gray-400" />
      </button>
    </div>
  );
}
