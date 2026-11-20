import { Alert, Typography } from '@mui/material';
import type { ChemicalOccupationalEnrichResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { occupationalSearchMessages } from './occupational-search-message';

export function OccupationalSearchSummary({
  result,
}: {
  result?: ChemicalOccupationalEnrichResult | null;
}) {
  if (!result)
    return (
      <Alert severity="info">
        A pesquisa ainda não retornou um resultado. Tente pesquisar novamente ou
        preencha os dados manualmente.
      </Alert>
    );
  const messages = occupationalSearchMessages(result);
  return (
    <Alert
      severity={messages.some((item) => item.completed) ? 'info' : 'warning'}
    >
      <Typography variant="body2" fontWeight={600}>
        Resultado da pesquisa pelo CAS {result.identity.cas}
      </Typography>
      {messages.map((item) => (
        <Typography key={item.label} variant="body2" sx={{ mt: 2 }}>
          <strong>{item.label}:</strong> {item.message}
        </Typography>
      ))}
      <Typography variant="body2" sx={{ mt: 2 }}>
        Você pode continuar o cadastro e preencher os limites manualmente. A
        pesquisa não abrange ACGIH, NR-15 ou AIHA WEEL.
      </Typography>
    </Alert>
  );
}
