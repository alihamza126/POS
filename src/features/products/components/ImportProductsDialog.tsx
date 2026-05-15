import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../stores/auth-store';
import { useToast } from '../../../hooks/use-toast';
import { FileUp, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ImportProductsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportProductsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          // @ts-ignore
          const response = await window.api.products.importBulk({
            products: parseResults.data,
            userId: user.id,
            branchId: 'BR-01', // Default branch
          });

          setResults(response);
          if (response.success > 0) {
            toast({
              title: 'Import Successful',
              description: `Successfully imported ${response.success} products.`,
            });
            onSuccess();
          } else {
            toast({
              title: 'Import Failed',
              description: 'No products were imported. Check the errors.',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('Import error:', error);
          toast({
            title: 'Import Error',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
          });
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        console.error('CSV Parse error:', error);
        toast({
          title: 'CSV Parsing Error',
          description: error.message,
          variant: 'destructive',
        });
        setImporting(false);
      },
    });
  };

  const downloadTemplate = () => {
    const csvContent = 'name,sku,barcode,description,categoryName,unit,purchasePrice,sellingPrice,reorderLevel,initialStock\n' +
      'Test Product,SKU001,123456789,Description here,Electronics,pcs,100,150,5,50';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setFile(null);
        setResults(null);
      }
    }}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <FileUp className="text-primary" size={28} />
            Import Products
          </DialogTitle>
          <DialogDescription className="text-white/60 font-medium">
            Upload a CSV file to bulk import products into your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {!results ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-navy/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="text-navy/40 group-hover:text-primary transition-colors" size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-navy">
                    {file ? file.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    Maximum file size 10MB
                  </p>
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
              </div>

              <div className="bg-navy/5 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-navy/40 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <p className="font-bold text-navy mb-1">Important Instructions:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Required columns: <span className="font-mono bg-white px-1 rounded border border-navy/10 text-navy">name</span>, <span className="font-mono bg-white px-1 rounded border border-navy/10 text-navy">sku</span></li>
                    <li>Optional columns: barcode, description, categoryName, unit, purchasePrice, sellingPrice, reorderLevel, initialStock</li>
                    <li>New categories will be created if they don't exist</li>
                  </ul>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2 font-bold text-navy border-navy/10 hover:bg-navy/5"
                onClick={downloadTemplate}
              >
                <Download size={18} />
                Download CSV Template
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Successful</p>
                  <p className="text-3xl font-black text-emerald-600">{results.success}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Failed</p>
                  <p className="text-3xl font-black text-red-600">{results.failed}</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-navy px-1">Import Errors:</p>
                  <div className="max-h-[200px] overflow-y-auto rounded-xl border border-red-500/10 bg-red-500/5 p-4 space-y-2">
                    {results.errors.slice(0, 10).map((err: string, i: number) => (
                      <p key={i} className="text-xs text-red-600 font-medium flex gap-2">
                        <span className="shrink-0">•</span>
                        {err}
                      </p>
                    ))}
                    {results.errors.length > 10 && (
                      <p className="text-xs text-red-400 italic">And {results.errors.length - 10} more errors...</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 py-4">
                <CheckCircle2 className="text-emerald-500" size={32} />
                <p className="font-bold text-navy">Import process completed</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-navy/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="font-bold text-text-secondary hover:bg-navy/5"
          >
            {results ? 'Close' : 'Cancel'}
          </Button>
          {!results && (
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="px-8 font-black gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Importing...
                </>
              ) : (
                'Start Import'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
