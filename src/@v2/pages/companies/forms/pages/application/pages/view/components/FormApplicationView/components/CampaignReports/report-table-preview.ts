/** One continuous table; only its screen preview is shortened. */
export const REPORT_TABLE_PREVIEW_CSS = `
@media screen {
  [data-report-table-preview] > details > summary { cursor:pointer; padding:12px 0; font-weight:700; }
  [data-report-table-preview] > details > summary h4 { display:inline; margin:0; font-size:inherit; }
  [data-report-table-preview] [data-table-expand] { display:block; text-align:center; padding:12px; cursor:pointer; text-decoration:none; color:inherit; font-size:24px; }
  [data-report-table-preview]:has(> details[open]) [data-table-expand] { display:none!important; }
  [data-report-table-preview]:has(> details[open]) [data-table-viewport] tbody tr { display:table-row!important; opacity:1!important; }
  [data-report-table-preview]:not(:has(> details[open])) [data-table-viewport] tbody tr:nth-child(n+8) { display:none!important; }
  [data-report-table-preview]:not(:has(> details[open])) [data-table-viewport] tbody tr:nth-child(5) { opacity:.65!important; cursor:pointer; }
  [data-report-table-preview]:not(:has(> details[open])) [data-table-viewport] tbody tr:nth-child(6) { opacity:.35!important; cursor:pointer; }
  [data-report-table-preview]:not(:has(> details[open])) [data-table-viewport] tbody tr:nth-child(7) { opacity:.12!important; cursor:pointer; }
  [data-report-table-preview] tbody tr { transition:opacity .2s ease; }
  @media (hover:hover) {
    [data-report-table-preview]:not(:has(> details[open])):has([data-table-viewport] tbody tr:nth-child(n+5):hover) [data-table-viewport] tbody tr:nth-child(-n+7) { opacity:1!important; }
    [data-report-table-preview]:not(:has(> details[open])):has([data-table-viewport] tbody tr:nth-child(n+5):hover) [data-table-viewport] tbody tr:nth-child(8) { display:table-row!important; opacity:.65!important; cursor:pointer; }
    [data-report-table-preview]:not(:has(> details[open])):has([data-table-viewport] tbody tr:nth-child(n+5):hover) [data-table-viewport] tbody tr:nth-child(9) { display:table-row!important; opacity:.35!important; cursor:pointer; }
    [data-report-table-preview]:not(:has(> details[open])):has([data-table-viewport] tbody tr:nth-child(n+5):hover) [data-table-viewport] tbody tr:nth-child(10) { display:table-row!important; opacity:.12!important; cursor:pointer; }
  }
}
@media print {
  [data-report-table-preview] [data-table-viewport] tbody tr { display:table-row!important; opacity:1!important; }
  [data-report-table-preview] [data-table-expand] { display:none!important; }
  [data-report-table-preview] > details > summary { display:block!important; }
  [data-report-table-preview] > details > summary::marker { content:''; }
}
`;
