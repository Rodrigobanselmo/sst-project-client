export const HoMethodRoutes = {
  BASE: 'v2/ho-methods',
  BY_ID: 'v2/ho-methods/:id',
  ORIGINAL_DOCUMENT: 'v2/ho-methods/:id/original-document',
  UPLOAD: 'v2/companies/:companyId/ho-methods/files',
  RISK_SEARCH: 'v2/ho-methods/risk-factors/search',
  IMPORT_PARSE_PDF: 'v2/ho-methods/import/parse-pdf',
  SAMPLERS: 'v2/ho-samplers',
  EXTRACTION_SOLVENTS: 'v2/ho-extraction-solvents',
  LABORATORIES: 'v2/ho-laboratories',
} as const;
