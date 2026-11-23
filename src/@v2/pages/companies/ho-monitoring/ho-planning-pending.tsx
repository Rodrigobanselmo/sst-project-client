import { Alert, Button, Stack, Typography } from '@mui/material';
export type PlanningPending = {
  exposureId: string | null;
  group: string;
  agent: string;
  evaluationType: string;
  fields: string[];
  reasons: string[];
  resolveAt: '3.2' | '3.3' | '3.4';
};
export type PlanningReadiness = { ready: boolean; pending: PlanningPending[] };
export const collectionRowId = (id: string, type: string) =>
  `ho-collection-${encodeURIComponent(id)}-${encodeURIComponent(type)}`;
export function PlanningPendingList({
  value: v,
  onResolve,
}: {
  value: PlanningReadiness;
  onResolve: (step: number) => void;
}) {
  return (
    <Stack spacing={6}>
      <Alert severity={v.ready ? 'success' : v.pending.some(p=>p.fields.some(f=>f!=='decision')) ? 'warning' : 'info'}>
        {v.ready
          ? 'Coletas confirmadas e dimensionadas. A etapa 3.6 está disponível.'
          : `${v.pending.filter(p=>p.fields.some(f=>f!=='decision')).length} pendência(s) técnica(s) e ${v.pending.filter(p=>p.fields.every(f=>f==='decision')).length} confirmação(ões) de planejamento antes da etapa 3.6. Nenhuma avaliação foi excluída.`}
      </Alert>
      {!v.ready && (
        <details open>
          <summary>Pendências e confirmações por GSE, agente e avaliação</summary>
          <Stack spacing={6} sx={{ mt: 6 }}>
            {v.pending.map((p, i) => (
              <Stack
                key={`${p.exposureId}:${p.evaluationType}:${i}`}
                spacing={4}
                sx={{
                  p: 6,
                  border: '1px solid',
                  borderColor: p.fields.every(f=>f==='decision') ? 'info.light' : 'warning.main',
                  borderRadius: 1,
                }}
              >
                <Typography fontWeight={700}>
                  {p.group} · {p.agent}
                  {p.evaluationType ? ` · ${p.evaluationType}` : ''}
                </Typography>
                {p.reasons.map((reason) => (
                  <Typography key={reason} variant="body2">
                    {reason}
                  </Typography>
                ))}
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  {p.exposureId && (
                    <Button
                      size="small"
                      component="a"
                      href={`#${collectionRowId(p.exposureId, p.evaluationType)}`}
                    >
                      Ver avaliação
                    </Button>
                  )}
                  {p.resolveAt !== '3.4' && (
                    <Button
                      size="small"
                      onClick={() => onResolve(Number(p.resolveAt.slice(2)))}
                    >
                      Resolver na etapa {p.resolveAt}
                    </Button>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </details>
      )}
    </Stack>
  );
}
