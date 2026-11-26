/** Títulos completos; em telas estreitas podem ocupar mais de uma linha. */
export const riskFactorNameTypographySx = {
  whiteSpace: 'normal' as const,
  overflowWrap: 'anywhere' as const,
  minWidth: 0,
  flex: 1,
};

export const riskFactorNameRowSx = {
  flex: 1,
  minWidth: 0,
  width: '100%',
  flexWrap: 'wrap' as const,
};

/** Nome usa o espaço disponível; indicadores ficam no extremo direito. */
export const riskFactorAccordionSummarySx = {
  '& .MuiAccordionSummary-content': {
    minWidth: 0,
    gap: '16px',
  },
  '& .MuiAccordionSummary-content > div:nth-of-type(2)': {
    flex: '0 0 auto !important',
    width: 'max-content',
    marginLeft: 'auto',
  },
  '& .MuiAccordionSummary-content > div:first-of-type': {
    flex: '1 1 0%',
    minWidth: 0,
  },
};
