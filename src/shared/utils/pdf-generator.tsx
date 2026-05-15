import jsPDFInvoiceTemplate, { OutputType } from "jspdf-invoice-template-nodejs";
import logo from "../../../assets/icon.png";

export interface CompanyDetails {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface LedgerEntry {
  id: string;
  type: string;
  date: string;
  number?: string;
  memo?: string;
  debit?: number;
  credit?: number;
  balance: number;
}

export interface CustomerStatementData {
  customerName: string;
  phone?: string;
  address?: string;
  ledger: LedgerEntry[];
  summary: {
    currentBalance: number;
    totalInvoices: number;
    totalPayments: number;
  };
  companyDetails?: CompanyDetails;
}

export interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentType: string;
}

const safeString = (val: any): string => {
  if (val === null || val === undefined) return " ";
  const str = String(val).trim();
  return str === "" ? " " : str;
};

const cleanCustomerName = (name: string | undefined): string => {
  if (!name) return "Walk-in Customer";
  // Remove "Statement" suffix if it exists in the name (case insensitive)
  return name.replace(/\s*Statement\s*$/i, '').trim();
};

const cleanMemo = (memo: string | undefined, type: string): string => {
  if (!memo) return " ";
  // Aggressively remove the type name if it appears at the start (with or without colon, dash, or space)
  const regex = new RegExp(`^${type}[:\\s\\-]*`, 'i');
  return memo.replace(regex, '').trim() || " ";
};

const safeNumber = (val: any): string => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const DEVELOPER_FOOTER = "Software Developed by AH Developer | Contact: +923037828419";
const FOOTER_FONT_SIZE = 11;
const PRIMARY_COLOR = "#24D4FE"; // Cyan Brand Color
const TEXT_LIGHT_BLACK = "#374151"; // Light black / Slate 700

export const generateInvoicePDF = (data: InvoiceData, companyDetails?: CompanyDetails) => {
  try {
    const props: any = {
      outputType: OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: `Invoice_${data.invoiceNumber || "000"}`,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: logo,
        type: 'PNG',
        width: 30,
        height: 30,
        margin: {
          top: 0,
          left: 0
        }
      },
      business: {
        name: safeString(companyDetails?.name || "A POS").toUpperCase(),
        address: safeString(companyDetails?.address),
        phone: safeString(companyDetails?.phone),
        email: safeString(companyDetails?.email),
        email_1: " ",
        website: " ",
      },
      contact: {
        label: "Invoice issued for:",
        name: cleanCustomerName(data.customerName),
        address: " ",
        phone: " ",
        email: " ",
        otherInfo: " ",
      },
      invoice: {
        label: "Invoice #: ",
        num: safeString(data.invoiceNumber),
        invDate: `Date: ${safeString(new Date(data.date).toLocaleDateString())}`,
        invGenDate: `Generated: ${safeString(new Date().toLocaleDateString())}`,
        headerBorder: true,
        tableBodyBorder: true,
        headerBackgroundColor: PRIMARY_COLOR,
        headerColor: "#FFFFFF",
        // Setting table text color to light black as requested
        tableColor: TEXT_LIGHT_BLACK,
        header: [
          { title: "#", style: { width: 10 } },
          { title: "Description", style: { width: 85 } },
          { title: "Price", style: { width: 25 } },
          { title: "Qty", style: { width: 20 } },
          { title: "Total", style: { width: 30 } }
        ],
        table: data.items.map((item, index) => [
          safeString(index + 1),
          safeString(item.productName) + "\n ",
          safeNumber(item.unitPrice),
          safeString(item.quantity),
          safeNumber(item.total)
        ]),
        additionalRows: [
          {
            col1: 'SubTotal:',
            col2: safeNumber(data.subtotal),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE, color: TEXT_LIGHT_BLACK }
          },
          {
            col1: 'Discount:',
            col2: safeNumber(data.discount),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE, color: TEXT_LIGHT_BLACK }
          },
          {
            col1: 'TOTAL:',
            col2: safeNumber(data.grandTotal),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE + 1, color: TEXT_LIGHT_BLACK, fontWeight: 'bold' }
          }
        ],
        invDescLabel: "Notes",
        invDesc: `Payment Method: ${safeString(data.paymentType)}`,
      },
      footer: {
        text: DEVELOPER_FOOTER,
      },
      pageEnable: true,
      pageLabel: "Page ",
    };

    jsPDFInvoiceTemplate(props);
  } catch (err) {
    console.error("PDF Error:", err);
  }
};

export const generateCustomerStatementPDF = (data: CustomerStatementData) => {
  try {
    const totalDebit = data.ledger.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = data.ledger.reduce((sum, entry) => sum + (entry.credit || 0), 0);

    // Latest entry on last (FIFO) - Oldest first
    const sortedLedger = [...data.ledger].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const cleanName = cleanCustomerName(data.customerName);

    const props: any = {
      outputType: OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: `${cleanName}_Statement`,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: logo,
        type: 'PNG',
        width: 30,
        height: 30,
        margin: {
          top: 0,
          left: 0
        }
      },
      business: {
        name: safeString(data.companyDetails?.name || "A POS").toUpperCase(),
        address: safeString(data.companyDetails?.address),
        phone: safeString(data.companyDetails?.phone),
        email: safeString(data.companyDetails?.email),
        email_1: " ",
        website: " ",
      },
      contact: {
        label: "Customer Details:",
        name: cleanName,
        address: safeString(data.address),
        phone: safeString(data.phone),
        email: " ",
        otherInfo: " ",
      },
      invoice: {
        label: "CUSTOMER STATEMENT",
        num: " ",
        invDate: `Period End: ${safeString(new Date().toLocaleDateString())}`,
        invGenDate: `Generated: ${safeString(new Date().toLocaleDateString())}`,
        headerBorder: true,
        tableBodyBorder: true,
        headerBackgroundColor: PRIMARY_COLOR,
        headerColor: "#FFFFFF",
        // Setting table text color to light black as requested
        tableColor: TEXT_LIGHT_BLACK,
        header: [
          { title: "Date", style: { width: 25 } },
          { title: "Type", style: { width: 25 } },
          { title: "Memo", style: { width: 65 } },
          { title: "Debit", style: { width: 25 } },
          { title: "Credit", style: { width: 25 } },
          { title: "Balance", style: { width: 25 } }
        ],
        table: sortedLedger.map((entry) => [
          safeString(new Date(entry.date).toLocaleDateString()),
          safeString(entry.type),
          cleanMemo(entry.memo, entry.type) + "\n ",
          safeNumber(entry.debit || 0),
          safeNumber(entry.credit || 0),
          safeNumber(entry.balance)
        ]),
        additionalRows: [
          {
            col1: 'Total Debit:',
            col2: safeNumber(totalDebit),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE, color: TEXT_LIGHT_BLACK }
          },
          {
            col1: 'Total Credit:',
            col2: safeNumber(totalCredit),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE, color: TEXT_LIGHT_BLACK }
          },
          {
            col1: 'NET BALANCE:',
            col2: safeNumber(data.summary.currentBalance),
            col3: ' ',
            style: { fontSize: FOOTER_FONT_SIZE + 1, color: TEXT_LIGHT_BLACK, fontWeight: 'bold' }
          }
        ],
        invDescLabel: "Account Summary",
        invDesc: `Cumulative activity report for ${cleanName}.\nTotal Invoices: ${data.summary.totalInvoices}\nTotal Payments: ${data.summary.totalPayments}`,
      },
      footer: {
        text: DEVELOPER_FOOTER,
      },
      pageEnable: true,
      pageLabel: "Page ",
    };

    jsPDFInvoiceTemplate(props);
  } catch (err) {
    console.error("Statement PDF Error:", err);
  }
};
