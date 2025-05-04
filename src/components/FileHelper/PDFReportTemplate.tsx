import { Document, Page, Text, View } from '@react-pdf/renderer';
import styles from '@/styles/pdfStyles';

interface Column<T> {
  key: keyof T;
  label: string;
}

interface TotalItem {
  label: string;
  value: string;
}

interface Props<T> {
  title: string;
  dateRange: { start: string; end: string };
  userName: string;
  printDate: string;
  columns: Column<T>[];
  data: T[];
  totals?: TotalItem[];
}

export default function PDFReportTemplate<T>({
  title,
  dateRange,
  userName,
  printDate,
  columns,
  data,
  totals = [],
}: Props<T>) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {`Del ${dateRange.start} al ${dateRange.end}`}
            </Text>
          </View>
          <View>
            <Text style={styles.subtitle}>Creado por {userName}</Text>
            <Text style={styles.subtitle}>{printDate}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          {columns.map((col) => (
            <Text key={String(col.key)} style={styles.cell}>
              {col.label}
            </Text>
          ))}
        </View>

        {data.map((row, idx) => (
          <View style={styles.row} key={idx}>
            {columns.map((col) => (
              <Text key={String(col.key)} style={styles.cell}>
                {String(row[col.key] ?? '')}
              </Text>
            ))}
          </View>
        ))}

        {totals.length > 0 && (
          <View style={styles.summary}>
            {totals.map((item, idx) => (
              <View style={styles.summaryRow} key={idx}>
                <Text>{item.label}:</Text>
                <Text>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
