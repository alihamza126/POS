/**
 * Printer utilities for the main process.
 *
 * Root causes this file fixes (see KNOWLEDGE_BASE.md "Known Gaps" for the writeup):
 *  1. The old handler never let the caller target a specific printer — silent
 *     print always fell back to whatever Windows considered the OS default,
 *     which silently does nothing (or prints nowhere useful) if the thermal
 *     receipt printer isn't set as that default.
 *  2. The print window was always created with `show: false`. For a *non*
 *     silent print, Chromium/Windows attaches the native print dialog to the
 *     window that requested it — if that window is invisible (and the app's
 *     only other window is a locked fullscreen kiosk window), the dialog has
 *     nowhere to render and the click appears to do nothing.
 *  3. There was no timeout: if `did-finish-load` never fired (slow renderer,
 *     odd data: URL edge case, spooler hang) the returned Promise hung
 *     forever, leaving the UI stuck on "Printing…" with an orphaned hidden
 *     window.
 *  4. Failures resolved with `{ success: false, reason }` but callers in the
 *     renderer weren't consistently checking `success` before telling the
 *     cashier the slip printed — see the UI-side fixes in MedicalReceiptPrinter
 *     and PaymentDialog.
 */
import { BrowserWindow } from 'electron';

export interface PrinterInfo {
  name: string;
  displayName: string;
  isDefault: boolean;
  status: number;
}

export interface PrintResult {
  success: boolean;
  reason?: string;
}

const PRINT_TIMEOUT_MS = 20000;

/**
 * List printers known to the OS. Requires a live webContents instance —
 * we spin up a throwaway hidden window purely to ask Chromium for the list.
 */
export async function listPrinters(): Promise<PrinterInfo[]> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  try {
    const printers = await win.webContents.getPrintersAsync();
    return printers.map((p) => ({
      name: p.name,
      displayName: p.displayName || p.name,
      isDefault: !!p.isDefault,
      status: p.status,
    }));
  } finally {
    if (!win.isDestroyed()) win.destroy();
  }
}

/**
 * Render `html` in a hidden window and send it to the printer.
 *
 * - `silent: true`  → no OS dialog, goes straight to `deviceName` (or the
 *   OS default if `deviceName` is omitted). This is the normal path for a
 *   thermal receipt printer.
 * - `silent: false` → shows the window so the native "Print" dialog has a
 *   visible parent to attach to (it will not appear otherwise).
 *
 * Always resolves (never rejects, never hangs) so the renderer can rely on
 * `result.success` without a try/catch dance.
 */
export function printHtml(
  html: string,
  options: { silent: boolean; deviceName?: string },
): Promise<PrintResult> {
  return new Promise((resolve) => {
    const printWindow = new BrowserWindow({
      show: !options.silent,
      width: 400,
      height: 800,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    let settled = false;
    let timeoutId: NodeJS.Timeout;

    const finish = (result: PrintResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (!printWindow.isDestroyed()) printWindow.destroy();
      resolve(result);
    };

    timeoutId = setTimeout(() => {
      finish({
        success: false,
        reason:
          'Print timed out. Check that the printer is connected, powered on, and set as the selected printer in Settings → Printing.',
      });
    }, PRINT_TIMEOUT_MS);

    printWindow.webContents.once('did-finish-load', () => {
      printWindow.webContents.print(
        {
          silent: options.silent,
          printBackground: true,
          margins: { marginType: 'none' },
          ...(options.deviceName ? { deviceName: options.deviceName } : {}),
        },
        (success, failureReason) => {
          if (success) {
            finish({ success: true });
          } else {
            // eslint-disable-next-line no-console
            console.error('[Printer] Print failed:', failureReason);
            finish({
              success: false,
              reason:
                failureReason && failureReason !== 'cancelled'
                  ? failureReason
                  : 'Printer did not accept the job. Check the printer name in Settings → Printing.',
            });
          }
        },
      );
    });

    printWindow.webContents.once('did-fail-load', () => {
      finish({
        success: false,
        reason: 'Failed to render the receipt for printing.',
      });
    });

    const encodedHtml = encodeURIComponent(html);
    printWindow.loadURL(`data:text/html;charset=utf-8,${encodedHtml}`);
  });
}
