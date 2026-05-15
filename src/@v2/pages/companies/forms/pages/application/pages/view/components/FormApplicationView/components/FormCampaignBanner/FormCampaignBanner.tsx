import { useCallback, useState } from 'react';
import { CircularProgress } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { IVisualIdentityModel } from '@v2/services/enterprise/visual-identity/read-visual-identity/service/read-visual-identity.types';
import { readVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/service/read-visual-identity.service';
import { readForm } from '@v2/services/forms/form/read-form-model/service/read-form-model.service';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { exportCampaignBannerPdf } from './exportCampaignBannerPdf';

const DEFAULT_PRIMARY = '#F27329';
const DEFAULT_DARK = '#1A202C';
const DEFAULT_COMPANY_NAME = 'SimpleSST';

const SIMPLE_SST_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="60" height="60"><defs><path id="s" d="M266.7 132.19L529.47 299.81L266.7 20.93V132.19ZM413.79 438.34L567.26 340.63L130.26 62.01c0 98.42 0 153.1 0 164.03.14 4.8.83 9.51 2.07 14.14a58.7 58.7 0 0 0 5.29 13.27 60.7 60.7 0 0 0 8.2 11.71c3.19 3.57 6.75 6.73 10.69 9.49 6.82 4.34 40.94 26.08 102.37 65.19l155.91 98.5ZM168.78 398.4c-4.29 2.8-37.46 24.72-38.51 60.74 0 10.66 0 63.97 0 159.93l270.58-172.17-153.75-98.06c-41.77 26.43-67.88 42.95-78.32 49.56Z"/></defs><use href="#s" fill="%%COLOR%%"/></svg>`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBannerText(raw: string): string {
  const escaped = escapeHtml(raw);

  const lines = escaped.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*- (.+)/);

    if (bulletMatch) {
      if (!inList) {
        result.push('<ul style="margin:4px 0 4px 18px;padding:0;">');
        inList = true;
      }
      result.push(`<li>${applyInlineFormatting(bulletMatch[1])}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line.trim() === '') {
        result.push('<br/>');
      } else {
        result.push(applyInlineFormatting(line));
      }
    }
  }

  if (inList) result.push('</ul>');

  return result.join('\n');
}

function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

/** Quebra visual segura para impressão: linhas só em `/`, sem espaço na string copiável. */
function formatUrlForBannerDisplay(url: string): string {
  const safe = escapeHtml(url);
  const marker = '/formulario/';
  const idx = safe.indexOf(marker);
  if (idx !== -1) {
    const prefix = safe.slice(0, idx + marker.length);
    const suffix = safe.slice(idx + marker.length);
    return `<span class="url-part">${prefix}</span><span class="url-part">${suffix}</span>`;
  }
  return safe.replace(/\//g, '/<wbr>');
}

async function generateQrSvgString(
  url: string,
  size: number,
): Promise<string> {
  const { QrCode, Ecc } = await import(
    '@rc-component/qrcode/es/libs/qrcodegen'
  );
  const { generatePath, getMarginSize } = await import(
    '@rc-component/qrcode/es/utils'
  );

  const qr = QrCode.encodeText(url, Ecc.MEDIUM);
  const cells = qr.getModules();
  const margin = getMarginSize(true, 1);
  const numCells = cells.length + margin * 2;
  const d = generatePath(cells, margin);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${numCells} ${numCells}" width="${size}" height="${size}" style="display:block;"><path fill="#000" d="${d}"/></svg>`;
}

function getTimeRangeByQuestionCount(count: number): string {
  if (count <= 32) return '10 a 15';
  if (count <= 50) return '15 a 20';
  if (count <= 100) return '25 a 40';
  return '50 a 60';
}

function formatAverageTimeForBanner(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '~1';
  return String(minutes);
}

interface BuildBannerHtmlParams {
  formApplication: FormApplicationReadModel;
  publicUrl: string;
  qrCodeSvg: string;
  visualIdentity: IVisualIdentityModel | null | undefined;
  modelQuestionCount: number | null | undefined;
}

const DEFAULT_INTRO_TEXT = (companyName: string) =>
  `O Programa de Gerenciamento de Riscos (PGR) está em andamento na ${companyName}, com ações voltadas para identificar os Fatores de Riscos Psicossociais (FRPS) no ambiente laboral.`;

const DEFAULT_WHY_TEXT =
  'Estamos aplicando o Copenhagen Psychosocial Questionnaire (COPSOQ III), um instrumento internacionalmente reconhecido e desenvolvido pelo Danish National Institute for Occupational Health. O questionário é anônimo e individual, garantindo total sigilo nas respostas. Ele nos ajudará a compreender os desafios psicossociais no trabalho e a planejar soluções eficazes para promover saúde mental e bem-estar.';

const DEFAULT_CONTACT_TEXT =
  'Entre em contato com o setor de RH da sua empresa ou diretamente com a SimpleSST: (51) 98348-5050';

function buildBannerHtml({
  formApplication,
  publicUrl,
  qrCodeSvg,
  visualIdentity,
  modelQuestionCount,
}: BuildBannerHtmlParams): string {
  const hasVI =
    visualIdentity?.visualIdentityEnabled && visualIdentity?.primaryColor;

  const primary = hasVI ? visualIdentity.primaryColor! : DEFAULT_PRIMARY;
  const dark = DEFAULT_DARK;
  const companyName = visualIdentity?.companyName || DEFAULT_COMPANY_NAME;
  const logoUrl = hasVI
    ? visualIdentity.customLogoUrl || visualIdentity.logoUrl
    : null;

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" style="max-height:60px;max-width:200px;object-fit:contain;" crossorigin="anonymous" />`
    : SIMPLE_SST_LOGO_SVG.replace('%%COLOR%%', primary);

  const formName = escapeHtml(formApplication.name);

  const introText = formApplication.bannerIntroText?.trim() || DEFAULT_INTRO_TEXT(companyName);
  const whyText = formApplication.bannerWhyText?.trim() || DEFAULT_WHY_TEXT;
  const contactText = formApplication.bannerContactText?.trim() || DEFAULT_CONTACT_TEXT;

  const avgTime = formApplication.averageTimeSpent;
  const hasRealAverage = avgTime !== null && avgTime > 0;

  const timeDisplay = hasRealAverage
    ? `~${formatAverageTimeForBanner(avgTime)}`
    : getTimeRangeByQuestionCount(modelQuestionCount ?? 32);

  const timeLabel = hasRealAverage ? 'minutos' : 'minutos';
  const timeSublabel = hasRealAverage ? 'Tempo médio real' : 'Tempo estimado';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Banner Campanha FRPS — ${escapeHtml(companyName)}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; height: 297mm; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #222; }
  body { display: flex; flex-direction: column; }
  .page { width: 210mm; min-height: 297mm; max-height: 297mm; overflow: hidden; display: flex; flex-direction: column; position: relative; }

  .header { background: ${dark}; color: #fff; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header-logo { flex-shrink: 0; }
  .header-title { text-align: right; }
  .header-title h1 { font-size: 22px; font-weight: 800; letter-spacing: 1px; line-height: 1.2; color: ${primary}; }
  .header-title h2 { font-size: 15px; font-weight: 600; letter-spacing: 0.5px; margin-top: 2px; color: #ccc; }

  .accent-bar { height: 6px; background: ${primary}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .content { flex: 1; padding: 22px 28px 16px; display: flex; flex-direction: column; gap: 16px; }

  .cta { text-align: center; }
  .cta h3 { font-size: 24px; font-weight: 800; color: ${primary}; margin-bottom: 6px; letter-spacing: 0.5px; }
  .cta p { font-size: 13px; color: #444; line-height: 1.5; max-width: 540px; margin: 0 auto; }

  .section { background: #f8f9fa; border-radius: 8px; padding: 14px 18px; border-left: 4px solid ${primary}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .section h4 { font-size: 15px; font-weight: 700; color: ${dark}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .section p { font-size: 14px; color: #444; line-height: 1.6; }
  .section ul, .cta ul, .contact ul { list-style: disc; margin: 4px 0 4px 18px; padding: 0; }
  .section li, .cta li, .contact li { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 2px; }

  .two-col { display: flex; gap: 16px; }
  .two-col > .section { flex: 1; }

  .access { display: flex; align-items: center; gap: 20px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; border: 2px solid ${primary}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .access-qr { flex-shrink: 0; }
  .access-qr svg { display: block; }
  .access-info { flex: 1; min-width: 0; }
  .access-info h4 { font-size: 14px; font-weight: 700; color: ${dark}; margin-bottom: 4px; text-transform: uppercase; }
  .access-info p { font-size: 12px; color: #444; line-height: 1.5; }
  .access-info .url { font-family: monospace; font-size: 9.5px; color: ${primary}; margin-top: 6px; background: #fff; padding: 5px 8px; border-radius: 4px; border: 1px solid #ddd; line-height: 1.35; word-break: normal; overflow-wrap: normal; }
  .access-info .url a { color: inherit; text-decoration: none; }
  .access-info .url .url-part { display: block; white-space: nowrap; }
  .access-time { flex-shrink: 0; text-align: center; background: ${primary}; color: #fff; border-radius: 8px; padding: 10px 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .access-time .big { font-size: 22px; font-weight: 800; line-height: 1; }
  .access-time .small { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

  .cta-bottom { text-align: center; padding: 10px 20px; }
  .cta-bottom p { font-size: 15px; color: ${dark}; font-weight: 600; line-height: 1.5; }
  .cta-bottom .highlight { color: ${primary}; font-weight: 800; font-size: 18px; }

  .contact { background: ${dark}; color: #fff; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .contact h4 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${primary}; margin-bottom: 3px; }
  .contact p { font-size: 12px; color: #ccc; line-height: 1.5; }

  .footer { background: ${primary}; color: #fff; text-align: center; padding: 8px 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  @media print {
    html, body { width: 210mm; height: 297mm; }
    .page { page-break-after: avoid; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-logo">${logoHtml}</div>
    <div class="header-title">
      <h1>FATORES DE RISCOS<br/>PSICOSSOCIAIS</h1>
      <h2>${escapeHtml(companyName.toUpperCase())}</h2>
    </div>
  </div>
  <div class="accent-bar"></div>

  <div class="content">
    <div class="cta">
      <h3>PARTICIPE DA PESQUISA</h3>
      <p>${formatBannerText(introText)}</p>
    </div>

    <div class="section">
      <h4>Por que participar?</h4>
      <p>${formatBannerText(whyText)}</p>
    </div>

    <div class="two-col">
      <div class="section">
        <h4>Confidencialidade</h4>
        <p>Suas respostas serão enviadas diretamente para a consultoria da <strong>SimpleSST</strong>, garantindo total confidencialidade. Nenhuma resposta individual será compartilhada com a empresa.</p>
      </div>
      <div class="section">
        <h4>Orientação</h4>
        <p>Responda com sinceridade e tranquilidade. Não existem respostas certas ou erradas. Suas percepções são valiosas para construir um ambiente de trabalho mais saudável.</p>
      </div>
    </div>

    <div class="access">
      <div class="access-qr">${qrCodeSvg}</div>
      <div class="access-info">
        <h4>Como participar?</h4>
        <p>Escaneie o QR Code ao lado com a câmera do celular ou acesse o link abaixo:</p>
        <div class="url"><a href="${escapeHtml(publicUrl)}">${formatUrlForBannerDisplay(publicUrl)}</a></div>
      </div>
      <div class="access-time">
        <div class="big">${timeDisplay}</div>
        <div class="small">${timeLabel}</div>
        <div class="small" style="margin-top:4px;font-size:8px;opacity:0.85">${timeSublabel}</div>
      </div>
    </div>

    <div class="cta-bottom">
      <p>Um ambiente de trabalho melhor é construído com a participação de todos.</p>
      <p class="highlight">Contamos com Você!</p>
    </div>
  </div>

  <div class="contact">
    <div>
      <h4>Dúvidas?</h4>
      <p>${formatBannerText(contactText)}</p>
    </div>
  </div>

  <div class="footer">
    ${formName} &bull; ${escapeHtml(companyName)} &bull; Programa de Gerenciamento de Riscos
  </div>

</div>
</body>
</html>`;
}

interface FormCampaignBannerProps {
  formApplication: FormApplicationReadModel;
  companyId: string;
  modelQuestionCount?: number | null;
}

export const FormCampaignBanner = ({
  formApplication,
  companyId,
  modelQuestionCount,
}: FormCampaignBannerProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      let visualIdentity: IVisualIdentityModel | null = null;
      try {
        visualIdentity = await readVisualIdentity({ companyId });
      } catch {
        // Fallback to SimpleSST defaults if visual identity is unavailable
      }

      let resolvedQuestionCount: number | null = modelQuestionCount ?? null;
      try {
        const formModel = await readForm({
          companyId,
          formId: formApplication.form.id,
        });
        const count = formModel.questionGroups.reduce(
          (sum, group) => sum + group.questions.length,
          0,
        );
        if (count > 0) resolvedQuestionCount = count;
      } catch {
        // Fallback to prop value or default if form model is unavailable
      }

      const publicUrl = `${window.location.origin}${formApplication.publicUrl()}`;
      const qrCodeSvg = await generateQrSvgString(publicUrl, 140);

      const html = buildBannerHtml({
        formApplication,
        publicUrl,
        qrCodeSvg,
        visualIdentity,
        modelQuestionCount: resolvedQuestionCount,
      });

      exportCampaignBannerPdf(html);
    } finally {
      setLoading(false);
    }
  }, [formApplication, companyId, modelQuestionCount]);

  return (
    <SButton
      text="Banner Campanha"
      icon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />
        )
      }
      onClick={() => void handleExport()}
      variant="outlined"
      color="primary"
      disabled={loading}
    />
  );
};
