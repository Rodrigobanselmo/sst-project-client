import { useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAccess } from 'core/hooks/useAccess';
import { PermissionEnum } from 'project/enum/permission.enum';
import {
  applyChemicalInventoryTransfer,
  previewChemicalInventoryTransfer,
  type ChemicalInventoryTransferPreview,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';

function transferError(error: unknown) {
  const message = axios.isAxiosError(error)
    ? error.response?.data?.message
    : null;
  return typeof message === 'string'
    ? message
    : 'Não foi possível concluir o envio ao Inventário.';
}

export function ChemicalInventoryTransfer({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) {
  const { isValidPermissions } = useAccess();
  const [preview, setPreview] = useState<ChemicalInventoryTransferPreview>();
  const [controlTypes, setControlTypes] = useState<
    Record<string, 'ADM' | 'ENG'>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const scope = { companyId, workspaceId };
  const controls = new Map(
    preview?.candidates.flatMap(({ origins }) =>
      origins
        .filter(({ control }) => control)
        .map((origin) => [origin.scenarioId, origin] as const),
    ),
  );

  async function openReview() {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    setControlTypes({});
    try {
      setPreview(await previewChemicalInventoryTransfer(scope));
    } catch (error) {
      setError(transferError(error));
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!preview || loading) return;
    setLoading(true);
    setError(undefined);
    try {
      const result = await applyChemicalInventoryTransfer(scope, {
        fingerprint: preview.fingerprint,
        controlTypes,
      });
      setSuccess(
        `${result.created} criado(s), ${result.updated} atualizado(s) e ${result.unchanged} já enviado(s).`,
      );
      setPreview(undefined);
    } catch (error) {
      setError(transferError(error));
    } finally {
      setLoading(false);
    }
  }

  if (!isValidPermissions([PermissionEnum.RISK_DATA])) return null;

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Button
        variant="contained"
        disabled={loading}
        onClick={() => void openReview()}
      >
        Revisar envio ao Inventário de Riscos
      </Button>
      {success && <Alert severity="success">{success}</Alert>}
      {error && !preview && <Alert severity="error">{error}</Alert>}
      {preview && (
        <Dialog
          open
          fullWidth
          maxWidth="md"
          onClose={() => {
            if (!loading) setPreview(undefined);
          }}
        >
          <DialogTitle>Enviar fatores priorizados ao Inventário</DialogTitle>
          <DialogContent>
            <Stack spacing={4}>
              <Alert severity="info">
                A probabilidade da triagem acompanha a fonte como evidência.
                Avalie a probabilidade ocupacional no Inventário.
              </Alert>
              {error && <Alert severity="error">{error}</Alert>}
              {preview.blocked.length > 0 && (
                <Alert severity="warning">
                  GSEs inativos, fora do estabelecimento ou compartilhados
                  precisam de revisão antes do envio.{' '}
                  {preview.blocked.join(', ')}.
                </Alert>
              )}
              {!preview.candidates.length && (
                <Alert severity="info">
                  Nenhum agente priorizado está elegível para envio.
                </Alert>
              )}
              {preview.candidates.map(
                ({ gseId, gse, agentId, agent, origins }) => (
                  <Box key={JSON.stringify([gseId, agentId])}>
                    <Typography fontWeight={700}>
                      {gse} · {agent}
                    </Typography>
                    {origins.map((origin) => (
                      <Typography key={origin.scenarioId} variant="body2">
                        {origin.source}
                        {origin.probability !== null &&
                          ` · Nota da triagem ${origin.probability}/5`}
                        {origin.prioritized &&
                          ` · Motivou o envio por ${origin.criterion}`}
                      </Typography>
                    ))}
                  </Box>
                ),
              )}
              {[...controls.values()].map(({ scenarioId, source, control }) => (
                <Stack key={scenarioId} spacing={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {source}
                  </Typography>
                  <Typography variant="body2">{control}</Typography>
                  <TextField
                    select
                    size="small"
                    label="Tipo de controle existente"
                    value={controlTypes[scenarioId] ?? ''}
                    disabled={loading}
                    onChange={({ target: { value } }) => {
                      if (value === 'ADM' || value === 'ENG') {
                        setControlTypes((previous) => ({
                          ...previous,
                          [scenarioId]: value,
                        }));
                      }
                    }}
                  >
                    <MenuItem value="ADM">Administrativo</MenuItem>
                    <MenuItem value="ENG">Engenharia</MenuItem>
                  </TextField>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} onClick={() => setPreview(undefined)}>
              Fechar
            </Button>
            <Button
              variant="contained"
              disabled={
                loading ||
                !preview.candidates.length ||
                Object.keys(controlTypes).length !== controls.size
              }
              onClick={() => void send()}
            >
              {loading ? 'Enviando…' : 'Enviar ao Inventário'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
