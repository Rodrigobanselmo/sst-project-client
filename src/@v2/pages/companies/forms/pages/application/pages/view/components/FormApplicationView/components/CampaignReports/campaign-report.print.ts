/** Paper layout is independent of presentation size and fullscreen fitting. */
export const CAMPAIGN_REPORT_PRINT_CSS = `
@page { size: A4; margin: 18mm 16mm; background: white; }
:root { color-scheme: light !important; }
html, body { background: white !important; color: #17212f !important; margin: 0 !important; }
* { box-sizing: border-box; print-color-adjust: exact; }
article { width: auto !important; max-width: none !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: 0 !important; }
article, article p, article div, article li, article td, article th, article figcaption, article summary, article small { font-size: 10pt !important; line-height: 1.35 !important; color: #17212f !important; }
article p { margin: 3mm 0 !important; }
article [role="alert"] { background: #f3f5f8 !important; border: 1px solid #cbd5e1 !important; padding: 2mm !important; }
article [role="alert"] * { color: #17212f !important; }
article [role="alert"] svg { color: #536174 !important; }
article h1 { font-size: 24pt !important; line-height: 1.2 !important; }
article h2 { font-size: 16pt !important; line-height: 1.25 !important; }
article h3 { font-size: 13pt !important; line-height: 1.25 !important; }
h2, h3, summary { break-after: avoid !important; page-break-after: avoid !important; }
article section { padding: 0 !important; margin: 0 0 6mm !important; background: white !important; border: 0 !important; border-radius: 0 !important; }
article details { display: block !important; }
article summary { display: block !important; list-style: none !important; margin: 0 0 3mm !important; }
summary::-webkit-details-marker { display: none !important; }
summary h2, summary h3 { display: block !important; margin: 0 0 3mm !important; }
article figure { margin: 3mm 0 !important; padding: 3mm !important; border: 1px solid #d4dbe5 !important; border-radius: 2mm !important; }
article figure [style], article figure div { line-height: 1.3 !important; }
article table { width: 100% !important; border-collapse: collapse; margin: 3mm 0 !important; }
article th, article td { padding: 2mm !important; border-bottom: 1px solid #cbd5e1 !important; }
article th { background: #f3f5f8 !important; }
thead { display: table-header-group; }
tr, li { break-inside: avoid; }
article li { margin: 0 0 2.5mm !important; }
article ul { margin: 2mm 0 !important; padding-left: 5mm !important; }
.campaign-report-question { break-before: page !important; page-break-before: always !important; break-inside: avoid !important; margin: 0 !important; padding: 0 !important; border: 0 !important; }
.campaign-report-question figure { break-inside: avoid !important; }
.campaign-report-question figure div { gap: 4px !important; }
.campaign-report-question summary { font-weight: 700; font-size: 11pt !important; }
[data-print-listening-block] { break-before: page !important; page-break-before: always !important; break-inside: avoid; margin: 0 !important; padding: 0 !important; border: 0 !important; }
[data-illustrated-slide] { display: block !important; }
[data-illustrated-slide]::after { content: ''; display: block; clear: both; }
[data-slide-image] { float: left !important; width: 42mm !important; max-width: 42mm !important; margin: 0 5mm 3mm 0 !important; }
[data-slide-image] figure { margin: 0 !important; padding: 0 !important; border: 0 !important; }
[data-slide-image] img { width: 42mm !important; height: 42mm !important; object-fit: contain; }
[data-slide-image] figcaption { font-size: 7pt !important; line-height: 1.2 !important; }
[data-slide-text] { display: block !important; }
[data-slide-paragraph] { font-size: 10pt !important; line-height: 1.35 !important; }
[data-report-evidence] { clear: both !important; margin-top: 3mm !important; }
[data-print-theme-block] { break-before: page !important; page-break-before: always !important; margin: 0 !important; padding: 0 !important; border: 0 !important; }
[data-print-theme-block] figure { break-inside: auto !important; }
[data-print-theme-block] figure > div:first-child { break-after: avoid !important; }
[data-print-theme-block] figure > div:nth-child(2) { break-after: avoid !important; }
[data-radar-controls], [data-comparison-controls] { display: none !important; }
[data-comparison-page] { break-before: page; }
[data-report-radar] svg text, [data-comparison-page] svg text { fill: #17212f !important; }
[data-report-radar] { break-inside: auto; }
figcaption { color: #536174 !important; }
svg > rect:first-child { fill: #e8edf3; }
a { color: inherit; text-decoration: none; }
`;

export type ReportPaperOrientation = 'portrait' | 'landscape';

export function campaignReportPrintCss(orientation: ReportPaperOrientation) {
  if (orientation === 'portrait') return CAMPAIGN_REPORT_PRINT_CSS;
  return (
    CAMPAIGN_REPORT_PRINT_CSS +
    `
@page { size: A4 landscape; margin: 12mm 16mm; background: white; }
article[aria-label="Evolução entre campanhas"] > header { margin-bottom: 3mm !important; padding-bottom: 3mm !important; }
article[aria-label="Evolução entre campanhas"] > header img { width: 12mm !important; height: 12mm !important; margin-bottom: 1mm !important; }
article[aria-label="Evolução entre campanhas"] > header h1 { margin: 3mm 0 !important; font-size: 20pt !important; }
article[aria-label="Evolução entre campanhas"] > header .MuiChip-root { margin-bottom: 1mm !important; }
article[aria-label="Evolução entre campanhas"] h2 { margin-top: 3mm !important; margin-bottom: 2mm !important; }

article, article p, article div, article li, article td, article th, article figcaption, article summary, article small { font-size: 9.5pt !important; }
article p { margin: 2mm 0 !important; }
article th, article td { padding: 1.3mm 2mm !important; }
article figure { padding: 2mm !important; margin: 2mm 0 !important; }
[data-print-theme-block] p, [data-print-theme-block] li, [data-print-theme-block] small { font-size: 9pt !important; line-height: 1.25 !important; }
[data-print-theme-block] li { margin-bottom: 1.3mm !important; }
[data-report-radar] svg { max-height: 100mm !important; width: auto !important; max-width: 100% !important; }
`
  );
}

export function prepareCampaignReportForPrint(article: HTMLElement) {
  article
    .querySelectorAll('details')
    .forEach((el) => el.setAttribute('open', ''));
  // A theme heading belongs to its first question, whose forced page break
  // would otherwise leave that heading alone on the preceding page.
  article.querySelectorAll('.campaign-report-theme').forEach((theme) => {
    const first = theme.querySelector('.campaign-report-question');
    const heading = theme.querySelector(
      ':scope > details > summary, :scope > h3',
    );
    if (!first || !heading) return;
    const title = article.ownerDocument.createElement('h3');
    title.textContent = heading.textContent;
    first.prepend(title);
    heading.remove();
  });
}
