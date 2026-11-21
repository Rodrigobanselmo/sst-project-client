import { createElement as h } from 'react';
import type { Campaign } from './ho-consolidation';

/** Render the persisted record, independently of native print dialogs. */
export async function downloadHoJustification(campaign: Campaign) {
  const { Document, Page, Text, View, StyleSheet, pdf } = await import(
    '@react-pdf/renderer'
  );
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      paddingBottom: 52,
      fontFamily: 'Helvetica',
      fontSize: 9,
      lineHeight: 1.45,
      color: '#222222',
    },
    title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
    subtitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 12 },
    paragraph: { marginBottom: 7 },
    card: {
      borderTopWidth: 1,
      borderTopColor: '#cccccc',
      paddingTop: 10,
      marginTop: 12,
    },
    agent: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 40,
      right: 40,
      fontSize: 8,
      color: '#555555',
    },
    small: { fontSize: 8, color: '#555555', marginTop: 12 },
  });
  const safe = (value: string) => value.replace(/[\u2010-\u2015]/g, '-');
  const text = (
    value: string,
    style: (typeof styles)[keyof typeof styles] = styles.paragraph,
  ) => h(Text, { style }, safe(value));
  const snapshot = campaign.snapshot;
  const excluded = snapshot.entries.filter((e) => !e.eligible);
  const document = h(
    Document,
    { title: `Justificativa - ${campaign.name}`, author: 'SimpleSST' },
    h(
      Page,
      { size: 'A4', style: styles.page },
      text(
        'Programa de monitoramento de fatores de riscos químicos',
        styles.title,
      ),
      text('Justificativas da consolidação', styles.subtitle),
      text(`Campanha: ${campaign.name}`),
      ...(snapshot.context
        ? [
            text(
              `Empresa: ${snapshot.context.companyName}\nEstabelecimento: ${snapshot.context.workspaceName}`,
            ),
          ]
        : []),
      text(
        `Data da consolidação: ${new Date(snapshot.consolidatedAt || campaign.createdAt).toLocaleString('pt-BR')}\nResponsável pelo registro (ID): ${snapshot.consolidatedById}`,
      ),
      text(
        `Laboratórios consultados no catálogo: ${snapshot.libraries.map((l) => l.name).join('; ')}.`,
      ),
      text(
        `${snapshot.entries.filter((e) => e.eligible).length} exposições elegíveis; ${excluded.length} mantidas no âmbito qualitativo. ${campaign.stage === 'PLANNING' ? `${campaign.selectedExposureIds.length} selecionadas para o planejamento da coleta.` : 'Seleção para planejamento ainda pendente.'}`,
      ),
      ...excluded.map((e) =>
        h(
          View,
          { key: e.exposureId, style: styles.card, wrap: false },
          text(`${e.name} | CAS ${e.cas || 'não informado'}`, styles.agent),
          text(`Origem: ${e.origin.replace(/\n/g, ' ')}`),
          text(e.justification || ''),
        ),
      ),
      ...(!excluded.length
        ? [
            text(
              'Não houve exclusões por ausência de método ou laboratório nesta consolidação.',
            ),
          ]
        : []),
      text(
        `Registro: ${campaign.id}\nConsulta: ${snapshot.fingerprint}`,
        styles.small,
      ),
      h(Text, {
        style: styles.footer,
        fixed: true,
        render: ({ pageNumber, totalPages }) =>
          `SimpleSST - Justificativas da campanha | ${pageNumber} / ${totalPages}`,
      }),
    ),
  );
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = `justificativa-monitoramento-${campaign.id}.pdf`;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
