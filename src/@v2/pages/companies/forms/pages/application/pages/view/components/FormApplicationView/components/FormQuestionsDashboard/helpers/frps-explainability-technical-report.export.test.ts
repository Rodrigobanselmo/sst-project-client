/**
 * Testes estruturais do Relatório Técnico FRPS (client).
 * Executar: npx tsx --test <este-arquivo>
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildFrpsTechnicalReportFilename,
  sanitizeFrpsTechnicalReportFilenamePart,
} from './sanitizeFrpsTechnicalReportFilename';

const here = dirname(fileURLToPath(import.meta.url));

function resolveSrcRoot(from: string): string {
  let dir = from;
  for (let i = 0; i < 25; i++) {
    if (existsSync(join(dir, '@v2')) && existsSync(join(dir, 'components'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('src root not found');
}

const srcRoot = resolveSrcRoot(here);
const dashboardPath = join(here, '../FormQuestionsDashboard.tsx');
const exportHelperPath = join(
  here,
  'exportFrpsExplainabilityTechnicalReportPdfInBrowser.ts',
);
const oldExportPath = join(here, 'exportFormRiskAnalysisPdfInBrowser.ts');
const pdfPath = join(
  srcRoot,
  'components/pdfs/documents/frpsExplainabilityTechnicalReport/frpsExplainabilityTechnicalReport.pdf.tsx',
);
const routesPath = join(srcRoot, '@v2/constants/routes/forms.routes.ts');
const servicePath = join(
  srcRoot,
  '@v2/services/forms/form-questions-answers-analysis/frps-explainability-technical-report/frps-explainability-technical-report.service.ts',
);

describe('FRPS technical report client wiring', () => {
  const dashboard = readFileSync(dashboardPath, 'utf8');
  const exportHelper = readFileSync(exportHelperPath, 'utf8');
  const oldExport = readFileSync(oldExportPath, 'utf8');
  const pdf = readFileSync(pdfPath, 'utf8');
  const routes = readFileSync(routesPath, 'utf8');
  const service = readFileSync(servicePath, 'utf8');

  it('1 new button visible beside current export', () => {
    assert.match(dashboard, /Exportar Relatório Técnico/);
    assert.match(dashboard, /Exportar PDF \(Análise de Riscos\)/);
  });

  it('2 old button/export path unchanged', () => {
    assert.match(dashboard, /exportFormRiskAnalysisPdfInBrowser/);
    assert.match(oldExport, /relatorio-analise-riscos\.pdf/);
    assert.equal(oldExport.includes('explainability-technical-report'), false);
  });

  it('3 click uses only the new endpoint', () => {
    assert.match(
      routes,
      /EXPLAINABILITY_TECHNICAL_REPORT:[\s\S]*explainability-technical-report/,
    );
    assert.match(
      service,
      /FormRoutes\.FORM_QUESTIONS_ANSWERS\.EXPLAINABILITY_TECHNICAL_REPORT/,
    );
    assert.match(exportHelper, /readFrpsExplainabilityTechnicalReport/);
    assert.equal(exportHelper.includes('explain-item'), false);
    assert.equal(exportHelper.includes('EXPLAIN_ITEM_GENERATE'), false);
  });

  it('4 loading / anti-double-click flags', () => {
    assert.match(dashboard, /isExportingFrpsTechnicalReportPdf/);
    assert.match(dashboard, /Gerando relatório técnico\.\.\./);
    assert.match(dashboard, /setIsExportingFrpsTechnicalReportPdf\(true\)/);
  });

  it('5 PDF title and one-ficha structure', () => {
    assert.match(
      pdf,
      /Relatório Técnico de Fontes Geradoras e Medidas de Prevenção/,
    );
    assert.match(pdf, /ValidatedCard/);
    assert.match(pdf, /items\.map/);
  });

  it('6 DRAFT/NEVER only in pending section', () => {
    assert.match(pdf, /Pendências/);
    assert.match(pdf, /pendingReasonLabel/);
    assert.equal(pdf.includes('rascunho secreto'), false);
  });

  it('7 source/adm/eng sections', () => {
    assert.match(pdf, /Fonte Geradora/);
    assert.match(pdf, /Medida de Engenharia/);
    assert.match(pdf, /Medida Administrativa/);
    assert.match(pdf, /SourceFields/);
    assert.match(pdf, /RecommendationFields/);
  });

  it('8 empty sections omitted via Field helper', () => {
    assert.match(pdf, /if \(!String\(value\)\.trim\(\)\) return null/);
    assert.match(pdf, /if \(!value\.length\) return null/);
  });

  it('9 audit fields rendered', () => {
    assert.match(pdf, /Validado por/);
    assert.match(pdf, /Validado em/);
  });

  it('10 no contextual content fields', () => {
    assert.equal(pdf.includes('resumoContextual'), false);
    assert.equal(pdf.includes('evidenciasAgregadas'), false);
    assert.equal(exportHelper.includes('contextual'), false);
  });

  it('11 error snackbar preserves screen', () => {
    assert.match(
      dashboard,
      /Não foi possível gerar o relatório técnico/,
    );
    assert.match(dashboard, /finally \{\s*setIsExportingFrpsTechnicalReportPdf\(false\)/);
  });

  it('12 filename sanitized', () => {
    assert.equal(
      sanitizeFrpsTechnicalReportFilenamePart('Ação / Teste!'),
      'Acao-Teste',
    );
    assert.match(
      buildFrpsTechnicalReportFilename({
        applicationName: 'Campanha FRPS',
        date: new Date('2026-07-22T12:00:00.000Z'),
      }),
      /^relatorio-tecnico-fontes-medidas-Campanha-FRPS-\d{8}\.pdf$/,
    );
  });

  it('13 current risk analysis PDF template untouched', () => {
    const riskPdf = readFileSync(
      join(
        srcRoot,
        'components/pdfs/documents/formsRiskAnalysis/formsRiskAnalysis.pdf.tsx',
      ),
      'utf8',
    );
    assert.match(riskPdf, /Relatório de Análise de Riscos/);
    assert.equal(riskPdf.includes('Relatório Técnico de Fontes'), false);
  });
});
