import type { buildChemicalExclusionReport } from './chemical-prioritization';

export async function exportChemicalExclusionPdf(params: {
  companyName: string;
  workspaceName: string;
  entries: ReturnType<typeof buildChemicalExclusionReport>;
}) {
  const { Document, Page, Text, View, pdf } = await import(
    '@react-pdf/renderer'
  );
  const blob = await pdf(
    <Document title="Justificativas de fatores químicos não priorizados">
      <Page size="A4" style={{ padding: 32, fontSize: 10, lineHeight: 1.4 }}>
        <Text style={{ fontSize: 16, marginBottom: 6 }}>
          Justificativas de fatores químicos não priorizados
        </Text>
        <Text>
          {params.companyName} · {params.workspaceName}
        </Text>
        <Text style={{ marginBottom: 14 }}>
          Prévia da revisão técnica · {new Date().toLocaleDateString('pt-BR')}
        </Text>
        {params.entries.map((entry) => (
          <View key={entry.key} style={{ marginBottom: 12 }}>
            <Text
              minPresenceAhead={36}
              style={{ fontFamily: 'Helvetica-Bold' }}
            >
              {entry.title}
            </Text>
            {entry.scenarios.map((scenario, index) => (
              <Text key={index}>{scenario}</Text>
            ))}
            <Text>Justificativa: {entry.justification}</Text>
            {entry.reference && (
              <Text>Limite, método ou referência: {entry.reference}</Text>
            )}
          </View>
        ))}
      </Page>
    </Document>,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'justificativas-quimicos-nao-priorizados.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
