'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Column<DataType> {
  key: keyof DataType;
  label: string;
}

interface PDFReportProps<DataType> {
  title: string; // <- El usuario pasa el título que quiere
  columns: Column<DataType>[];
  data: DataType[];
}

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', fontSize: 12, marginBottom: 10 },
  tableRow: { flexDirection: 'row', fontSize: 10, marginBottom: 5 },
  cell: { flex: 1 },
});

export function PDFReport<DataType>({
  title,
  columns,
  data,
}: PDFReportProps<DataType>) {
  const chunkSize = 20;
  const pages = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    pages.push(
      <Page key={i} size="A4" style={styles.page}>
        <Text style={styles.header}>{title}</Text>

        <View style={styles.tableHeader}>
          {columns.map((col) => (
            <Text key={String(col.key)} style={styles.cell}>
              {col.label}
            </Text>
          ))}
        </View>

        {chunk.map((item, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {columns.map((col) => (
              <Text key={String(col.key)} style={styles.cell}>
                {String(item[col.key] ?? '')}
              </Text>
            ))}
          </View>
        ))}
      </Page>,
    );
  }

  return <Document title={title}>{pages}</Document>;
}
