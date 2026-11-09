import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { RadarPoint } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/formIndicatorRadar';
import { getIndicatorColorFromScore } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-indicator-quality.util';

export type IndicatorRadarPage = {
  groupName: string;
  scaleName?: string;
  points: RadarPoint[];
  chartImage?: string;
  message?: string;
};

const styles = StyleSheet.create({
  page: { padding: 36, paddingBottom: 50, fontSize: 10, color: '#202A38' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 9 },
  meta: { color: '#475467', marginBottom: 4 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 5 },
  chart: { width: 523, height: 373, marginBottom: 10 },
  message: { marginVertical: 10, color: '#475467' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D0D5DD',
    paddingVertical: 5,
  },
  name: { flex: 1, paddingRight: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: '#202A38',
    marginRight: 6,
  },
  value: { fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'right',
    color: '#475467',
    fontSize: 9,
  },
});

export default function PdfFormIndicatorsRadar({
  title,
  applicationName,
  formName,
  groupingLabel,
  issuedAt,
  pages,
}: {
  title: string;
  applicationName: string;
  formName: string;
  groupingLabel?: string | null;
  issuedAt: string;
  pages: IndicatorRadarPage[];
}) {
  return (
    <Document title={title}>
      {pages.map(
        ({ groupName, scaleName, points, chartImage, message }, index) => (
          <Page key={index} size="A4" style={styles.page} wrap>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.meta}>Aplicação: {applicationName}</Text>
            <Text style={styles.meta}>Formulário: {formName}</Text>
            <Text style={styles.meta}>Emitido em: {issuedAt}</Text>
            <Text style={styles.meta}>
              {groupingLabel ? `${groupingLabel}: ${groupName}` : groupName}
            </Text>
            {scaleName && <Text style={styles.section}>{scaleName}</Text>}
            {points.length > 0 && (
              <Text style={styles.meta}>
                Quanto mais perto de 100%, mais favorável é a condição.
              </Text>
            )}
            {chartImage && <Image src={chartImage} style={styles.chart} />}
            {message && <Text style={styles.message}>{message}</Text>}
            {points.map(({ id, name, percentage, score, hasValidAnswers }) => (
              <View key={id} style={styles.row} wrap={false}>
                <Text style={styles.name}>{name}</Text>
                {hasValidAnswers && (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: getIndicatorColorFromScore(score) },
                    ]}
                  />
                )}
                <Text style={styles.value}>
                  {hasValidAnswers ? `${percentage}%` : 'Sem respostas válidas'}
                </Text>
              </View>
            ))}
            <Text
              style={styles.footer}
              fixed
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </Page>
        ),
      )}
    </Document>
  );
}
