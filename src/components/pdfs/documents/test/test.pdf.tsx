import React from 'react';

import { Document, Page, Text, View } from '@react-pdf/renderer';

import { styles } from './styles';

export default function PDFTest() {
  return (
    <Document>
      {Array.from({ length: 1 }).map((_, i) => {
        return (
          <Page key={i} size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text>Section #1</Text>
            </View>
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <View key={index} style={styles.section}>
                  <Text>Section #2</Text>
                </View>
              );
            })}
          </Page>
        );
      })}
    </Document>
  );
}
