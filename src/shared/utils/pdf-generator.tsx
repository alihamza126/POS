import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

export interface CompanyDetails {
  name: string;
  address?: string;
  phone?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentType: string;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'column' },
  headerCenter: { flexDirection: 'column', alignItems: 'center', flex: 1 },
  headerRight: { width: 60 },
  companyName: { fontSize: 16, fontWeight: 'bold' },
  documentTitle: { fontSize: 18, marginTop: 4, fontWeight: 'bold' },
  dateContext: { fontSize: 10, marginTop: 4, color: '#444' },
  timeText: { fontSize: 10, fontWeight: 'bold' },
  dateText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },

  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#24D4FE',
    padding: 5,
  },
  tableColHeaderItem: {
    width: '40%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#24D4FE',
    padding: 5,
  },
  tableCol: {
    width: '15%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 3,
  },
  tableColItem: {
    width: '40%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 3,
  },
  tableCellHeader: {
    margin: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#02025C',
  },
  tableCell: { margin: 1, fontSize: 7 },
  tableCellRight: { margin: 1, fontSize: 7, textAlign: 'right' },

  totalsContainer: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
    color: '#666',
  },
  totalValue: { width: 80, textAlign: 'right' },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
  },
  grandTotalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#02025C',
  },
  grandTotalValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#02025C',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#888',
    fontSize: 9,
  },
});

function InvoiceDocument({
  data,
  companyDetails = undefined,
}: {
  data: InvoiceData;
  companyDetails?: CompanyDetails;
}) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateString = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  const asOfDate = new Date(data.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.timeText}>{timeString}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.companyName}>
              {(companyDetails?.name || 'POS SYSTEM').toUpperCase()}
            </Text>
            {companyDetails?.address && (
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                {companyDetails.address}
              </Text>
            )}
            {companyDetails?.phone && (
              <Text style={{ fontSize: 8, color: '#666' }}>
                Ph: {companyDetails.phone}
              </Text>
            )}
            <Text style={styles.documentTitle}>Sales Invoice</Text>
            <Text style={styles.dateContext}>As of {asOfDate}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.separator} />

        <View style={styles.invoiceInfo}>
          <Text>Invoice Number: {data.invoiceNumber}</Text>
          <Text>Date: {data.date}</Text>
        </View>

        {data.customerName && (
          <View style={styles.customerInfo}>
            <Text>Customer: {data.customerName}</Text>
            {data.customerPhone && <Text>Phone: {data.customerPhone}</Text>}
          </View>
        )}

        <Text style={{ marginBottom: 10 }}>
          Payment Type: {data.paymentType.toUpperCase()}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeaderItem}>
              <Text style={styles.tableCellHeader}>Item</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Qty</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Price (Rs)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Disc (Rs)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total (Rs)</Text>
            </View>
          </View>

          {data.items.map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColItem}>
                <Text style={styles.tableCell}>
                  {item.productName || 'Unknown Product'}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  {(item.quantity || 0).toString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  {(item.unitPrice || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  {(item.discount || 0) > 0
                    ? (item.discount || 0).toLocaleString()
                    : '-'}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  {(item.total || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              Rs. {(data.subtotal || 0).toLocaleString()}
            </Text>
          </View>

          {(data.discount || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#dc2626' }]}>
                - Rs. {(data.discount || 0).toLocaleString()}
              </Text>
            </View>
          )}

          {(data.tax || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>
                Rs. {(data.tax || 0).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              Rs. {(data.grandTotal || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid Amount:</Text>
            <Text style={styles.totalValue}>
              Rs. {(data.paidAmount || 0).toLocaleString()}
            </Text>
          </View>

          {(data.changeAmount || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Change:</Text>
              <Text style={[styles.totalValue, { color: '#059669' }]}>
                Rs. {(data.changeAmount || 0).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
}

InvoiceDocument.defaultProps = {
  companyDetails: undefined,
};

export const generateInvoicePDF = async (
  data: InvoiceData,
  companyDetails?: CompanyDetails,
) => {
  const blob = await pdf(
    <InvoiceDocument data={data} companyDetails={companyDetails} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface LedgerEntry {
  type: string;
  date: string;
  num?: string;
  memo?: string;
  debit?: number;
  credit?: number;
  balance: number;
}

export interface CustomerStatementData {
  customerName: string;
  asOfDate: string;
  entries: LedgerEntry[];
  openingBalance?: number;
}

const statementStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica' },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    marginBottom: 20,
  },

  table: { width: '100%' },
  tableRow: { flexDirection: 'row', marginBottom: 3 },

  colType: { width: '12%' },
  colDate: { width: '13%' },
  colNum: { width: '10%' },
  colMemo: { width: '28%' },
  colDebit: { width: '12%' },
  colCredit: { width: '12%' },
  colBalance: { width: '13%' },

  headerRow: { flexDirection: 'row', marginBottom: 10 },
  headerCol: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
    marginHorizontal: 2,
  },

  headerCell: { fontWeight: 'bold', fontSize: 9, textAlign: 'center' },

  dataCellLeft: { fontSize: 9, textAlign: 'left', paddingHorizontal: 2 },
  dataCellRight: { fontSize: 9, textAlign: 'right', paddingHorizontal: 2 },

  customerNameRow: { flexDirection: 'row', marginTop: 5, marginBottom: 5 },
  customerNameText: {
    fontWeight: 'bold',
    fontSize: 9,
    flex: 1,
    paddingHorizontal: 2,
  },
});

function CustomerStatementDocument({ data }: { data: CustomerStatementData }) {
  const asOfDateStr = new Date(data.asOfDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={statementStyles.page}>
        <Text style={statementStyles.headerText}>As of {asOfDateStr}</Text>
        <View style={statementStyles.headerLine} />

        <View style={statementStyles.table}>
          {/* Headers */}
          <View style={statementStyles.headerRow}>
            <View style={[statementStyles.colType, statementStyles.headerCol]}>
              <Text style={statementStyles.headerCell}>Type</Text>
            </View>
            <View style={[statementStyles.colDate, statementStyles.headerCol]}>
              <Text style={statementStyles.headerCell}>Date</Text>
            </View>
            <View style={[statementStyles.colNum, statementStyles.headerCol]}>
              <Text style={statementStyles.headerCell}>Num</Text>
            </View>
            <View style={[statementStyles.colMemo, statementStyles.headerCol]}>
              <Text style={statementStyles.headerCell}>Memo</Text>
            </View>
            <View style={[statementStyles.colDebit, statementStyles.headerCol]}>
              <Text style={statementStyles.headerCell}>Debit</Text>
            </View>
            <View
              style={[statementStyles.colCredit, statementStyles.headerCol]}
            >
              <Text style={statementStyles.headerCell}>Credit</Text>
            </View>
            <View
              style={[statementStyles.colBalance, statementStyles.headerCol]}
            >
              <Text style={statementStyles.headerCell}>Balance</Text>
            </View>
          </View>

          {/* Customer Name & Opening Balance */}
          <View style={statementStyles.customerNameRow}>
            <Text style={statementStyles.customerNameText}>
              {data.customerName}
            </Text>
            <Text
              style={[
                statementStyles.colBalance,
                statementStyles.dataCellRight,
              ]}
            >
              {(data.openingBalance || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Data Rows */}
          {data.entries.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <View style={statementStyles.tableRow} key={index}>
              <View style={statementStyles.colType}>
                <Text style={statementStyles.dataCellLeft}>{entry.type}</Text>
              </View>
              <View style={statementStyles.colDate}>
                <Text style={statementStyles.dataCellLeft}>{entry.date}</Text>
              </View>
              <View style={statementStyles.colNum}>
                <Text style={statementStyles.dataCellLeft}>
                  {entry.num || ''}
                </Text>
              </View>
              <View style={statementStyles.colMemo}>
                <Text style={statementStyles.dataCellLeft}>
                  {entry.memo || ''}
                </Text>
              </View>
              <View style={statementStyles.colDebit}>
                <Text style={statementStyles.dataCellRight}>
                  {entry.debit
                    ? entry.debit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ''}
                </Text>
              </View>
              <View style={statementStyles.colCredit}>
                <Text style={statementStyles.dataCellRight}>
                  {entry.credit
                    ? entry.credit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ''}
                </Text>
              </View>
              <View style={statementStyles.colBalance}>
                <Text style={statementStyles.dataCellRight}>
                  {entry.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export const generateCustomerStatementPDF = async (
  data: CustomerStatementData,
) => {
  const blob = await pdf(<CustomerStatementDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Statement_${data.customerName.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
