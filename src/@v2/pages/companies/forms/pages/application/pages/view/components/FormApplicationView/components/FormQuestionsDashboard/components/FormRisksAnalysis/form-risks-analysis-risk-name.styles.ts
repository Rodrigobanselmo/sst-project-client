/**
 * Estilos do nome do fator de risco no título do accordion da análise.
 * Mantém uma única linha; textos longos usam ellipsis.
 */
export const riskFactorNameTypographySx = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
  flex: 1,
};

/** Container flex do chip PSIC + nome: permite o texto encolher com ellipsis. */
export const riskFactorNameRowSx = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  width: '100%',
};

/**
 * Garante que o content do AccordionSummary ceda largura ao nome
 * (em vez de forçar quebra de linha no Typography).
 */
export const riskFactorAccordionSummarySx = {
  '& .MuiAccordionSummary-content': {
    minWidth: 0,
    overflow: 'hidden',
  },
  '& .MuiAccordionSummary-content > div:first-of-type': {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
};
