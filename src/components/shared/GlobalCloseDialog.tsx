import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';
import { audioService } from '../../shared/utils/audio';

export default function GlobalCloseDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Listen for close request from main process
    const unsubscribe = (window as any).api.window.onCloseRequest(() => {
      setOpen(true);
      audioService.playWarning();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConfirm = () => {
    (window as any).api.window.confirmClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-primary-dark/20 rounded-3xl">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-primary-dark">
            Are you sure?
          </DialogTitle>
          <DialogDescription className="text-center text-text-secondary pt-2">
            You are about to close the application. Any unsaved changes might be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-4 sm:justify-center pt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl px-8 border-navy/20 text-navy hover:bg-navy/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-xl px-8 bg-red-600 hover:bg-red-700 text-white shadow-lg"
          >
            Yes, Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
