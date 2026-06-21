import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Camera, Scan, CameraOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

/**
 * QR/Barcode scanner modal.
 *
 * Camera mode: Uses the native BarcodeDetector API (built into Electron/Chromium)
 * with getUserMedia — no external packages required.
 *
 * Keyboard-wedge mode: Auto-focused input that accepts rapid barcode scanner
 * keyboard output and submits on Enter.
 */
export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  // Check if BarcodeDetector is available in this Chromium
  const barcodeDetectorSupported =
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

  // ----- Camera cleanup -----
  const stopCamera = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  // ----- Start camera + BarcodeDetector loop -----
  const startCamera = useCallback(async () => {
    setError(null);

    if (!barcodeDetectorSupported) {
      setError(
        'Camera barcode scanning is not supported in this environment. Use the manual input below.',
      );
      setCameraSupported(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      // @ts-ignore — BarcodeDetector is available in Chromium but not in TS lib yet
      const detector = new (window as any).BarcodeDetector({
        formats: [
          'qr_code',
          'ean_13',
          'ean_8',
          'code_128',
          'code_39',
          'upc_a',
          'upc_e',
          'data_matrix',
          'pdf417',
        ],
      });

      const detect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        try {
          const barcodes: any[] = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue as string;
            stopCamera();
            onScan(code);
            onClose();
            return; // stop loop after successful scan
          }
        } catch {
          // Detection frame failed — ignore and continue
        }
        animFrameRef.current = requestAnimationFrame(detect);
      };

      animFrameRef.current = requestAnimationFrame(detect);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (msg.toLowerCase().includes('found') || msg.toLowerCase().includes('device')) {
        setError('No camera found. Use the manual input or keyboard scanner below.');
        setCameraSupported(false);
      } else {
        setError('Camera unavailable. Use the manual input or keyboard scanner below.');
      }
    }
  }, [barcodeDetectorSupported, onScan, onClose, stopCamera]);

  // ----- Lifecycle -----
  useEffect(() => {
    if (isOpen) {
      setManualInput('');
      setError(null);
      setScanning(false);
      // Auto-focus manual input for keyboard-wedge scanners
      setTimeout(() => manualInputRef.current?.focus(), 120);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  // ----- Manual / wedge scanner submit -----
  const handleManualSubmit = () => {
    const val = manualInput.trim();
    if (val) {
      onScan(val);
      setManualInput('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleManualSubmit();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,2,92,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-[480px] p-6 relative animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#02025C] rounded-xl flex items-center justify-center">
              <Scan size={20} className="text-[#24D4FE]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#02025C]">QR / Barcode Scanner</h2>
              <p className="text-xs text-gray-500">
                {barcodeDetectorSupported
                  ? 'Point camera at barcode or type manually'
                  : 'Type or scan with keyboard scanner below'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Camera Section — only if BarcodeDetector is available */}
        {cameraSupported && (
          <div className="mb-4">
            {/* Video preview */}
            <div
              className="w-full rounded-2xl overflow-hidden bg-gray-900 relative"
              style={{ height: scanning ? 240 : 0, transition: 'height 0.2s' }}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Scan overlay crosshair */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-32 border-2 border-[#24D4FE] rounded-xl opacity-70 shadow-[0_0_20px_rgba(36,212,254,0.4)]" />
                </div>
              )}
            </div>

            {!scanning ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-10 rounded-2xl border-2 border-dashed border-[#24D4FE]/40 hover:border-[#24D4FE] hover:bg-[#24D4FE]/5 transition-all flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#24D4FE]/10 group-hover:bg-[#24D4FE]/20 flex items-center justify-center transition-colors">
                  <Camera size={28} className="text-[#24D4FE]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[#02025C]">Click to Start Camera</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Camera-based QR &amp; barcode scanning (no plugin needed)
                  </p>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="mt-3 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CameraOff size={16} />
                Stop Camera
              </button>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            or type / scan below
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Manual / Keyboard-Wedge input */}
        <div className="flex gap-2">
          <input
            ref={manualInputRef}
            type="text"
            placeholder="Scan barcode or type product code..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#24D4FE] focus:border-transparent text-sm font-medium bg-gray-50"
            autoComplete="off"
          />
          <Button
            onClick={handleManualSubmit}
            disabled={!manualInput.trim()}
            className="px-5 rounded-xl bg-[#02025C] hover:bg-[#02025C]/90 text-white font-bold"
          >
            Search
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Physical barcode scanners auto-submit — just scan directly into this field!
        </p>
      </div>
    </div>
  );
}
