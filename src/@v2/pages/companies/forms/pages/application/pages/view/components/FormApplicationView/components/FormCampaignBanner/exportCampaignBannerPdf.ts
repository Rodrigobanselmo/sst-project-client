/**
 * Opens the campaign banner HTML in a new browser tab and triggers the print dialog
 * so the user can save it as PDF (100% client-side, no API involved).
 */
export function exportCampaignBannerPdf(html: string): void {
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();

  // Small delay to let images/SVGs render before the print dialog opens
  win.setTimeout(() => win.print(), 400);
}
