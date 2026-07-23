/** Sanitiza segmento de nome de arquivo do relatório técnico FRPS. */
export function sanitizeFrpsTechnicalReportFilenamePart(value: string): string {
  const sanitized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return sanitized || 'aplicacao';
}

export function buildFrpsTechnicalReportFilename(params: {
  applicationName: string;
  date?: Date;
}): string {
  const date = params.date ?? new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const app = sanitizeFrpsTechnicalReportFilenamePart(params.applicationName);
  return `relatorio-tecnico-fontes-medidas-${app}-${yyyy}${mm}${dd}.pdf`;
}
