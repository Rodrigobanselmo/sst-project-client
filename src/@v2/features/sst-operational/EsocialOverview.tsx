import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { sstGet, sstPost, messageOf } from './api';
import { useSstAccess } from './access';
import { DeclarationPanel } from './DeclarationPanel';
import { SecondaryDeclarationPanel } from './SecondaryDeclarationPanel';
import { OperationalStatusSummary } from './OperationalStatusSummary';
import { BulkDispatchPanel } from './BulkDispatchPanel';
import { SstDateField, useSstDateValidity } from './SstDateField';
import {
  policyDraftKey,
  policyImpactMessage,
  policyPreviewMatches,
  policyReviewError,
  type PolicyPreview,
  type SendingPolicyOverview,
} from './policy-review-model';

const dateLabel = (value: string | null) =>
  value ? value.slice(0, 10).split('-').reverse().join('/') : 'Não configurada';

export function EsocialOverview({ companyId, initialEnvironment = 2 }: { companyId: string; initialEnvironment?: 1 | 2 }) {
  const [declarationRequest, setDeclarationRequest] = useState<{
    companyId: string;
    id: string;
    sequence: number;
  }>();
  const openDeclaration = (id: string) =>
    setDeclarationRequest((current) => ({
      companyId,
      id,
      sequence: (current?.sequence || 0) + 1,
    }));
  const activeDeclarationRequest =
    declarationRequest?.companyId === companyId
      ? declarationRequest
      : undefined;
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const client = useQueryClient(),
    access = useSstAccess();
  const [from, setFrom] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [forceReview, setForceReview] = useState(false),
    [inFlightError, setInFlightError] = useState(false),
    [preview, setPreview] = useState<{
      data: PolicyPreview;
      draftKey: string;
    }>();
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const policy = useQuery<SendingPolicyOverview>(
    ['sst-policy', companyId],
    () => sstGet(companyId, '/sst-operational/policy'),
    { enabled: access.canRead, retry: false },
  );
  const draft = {
    fromDate: from,
    reason: reason.trim(),
    expectedRevision: policy.data?.policy?.revision || 0,
  };
  const reviewRequired = forceReview || Boolean(policy.data?.reviewRequired);
  const inFlight =
    Boolean(policy.data?.deliverySummary?.inFlight) || inFlightError;
  const matchingPreview = policyPreviewMatches(preview, draft);
  const clearAnalysis = () => {
    setPreview(undefined);
    attempt.current = null;
    setError('');
  };
  const handleError = async (e: any) => {
    const code = e.response?.data?.code;
    setError(policyReviewError(code) || messageOf(e));
    if (policyReviewError(code)) {
      setPreview(undefined);
      attempt.current = null;
      if (code !== 'INITIAL_POLICY_IN_FLIGHT') setForceReview(true);
      if (code === 'INITIAL_POLICY_IN_FLIGHT') setInFlightError(true);
      await policy.refetch();
    }
  };
  const analyze = async () => {
    setBusy(true);
    setError('');
    setPreview(undefined);
    attempt.current = null;
    try {
      const data: PolicyPreview = await sstPost(
        companyId,
        '/sst-operational/policy/preview',
        draft,
      );
      setPreview({ data, draftKey: policyDraftKey(draft) });
    } catch (e) {
      await handleError(e);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    if (reviewRequired && !matchingPreview) return;
    setBusy(true);
    setError('');
    const key = JSON.stringify([
      policyDraftKey(draft),
      preview?.data.previewHash || null,
    ]);
    // A lost response may hide a committed change. Keep the operation identity
    // until the result is known, or the draft/analysis changes.
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    try {
      await sstPost(companyId, '/sst-operational/policy', {
        ...draft,
        ...(reviewRequired && {
          operationId: attempt.current.operationId,
          expectedPreviewHash: preview!.data.previewHash,
        }),
      });
      await client.invalidateQueries(['sst-policy', companyId]);
      await client.invalidateQueries(['sst-declarations', companyId]);
      await client.invalidateQueries(['sst-declaration', companyId]);
      setFrom('');
      setReason('');
      setPreview(undefined);
      setForceReview(false);
      setInFlightError(false);
      attempt.current = null;
    } catch (e) {
      await handleError(e);
    } finally {
      setBusy(false);
    }
  };
  if (!access.canRead && access.canReadDeclaration)
    return (
      <Box sx={{ p: { xs: 8, md: 12 } }}>
        <Stack spacing={12} useFlexGap>
          <OperationalStatusSummary companyId={companyId} />
          <BulkDispatchPanel
            key={`bulk:${companyId}`}
            companyId={companyId}
            initialEnvironment={initialEnvironment}
            onOpenDeclaration={openDeclaration}
          />
          <DeclarationPanel
            key={`declaration:${companyId}`}
            companyId={companyId}
            initialEnvironment={initialEnvironment}
            requestedRunId={activeDeclarationRequest?.id}
            requestSequence={activeDeclarationRequest?.sequence}
          />
          <SecondaryDeclarationPanel companyId={companyId} initialEnvironment={initialEnvironment} />
        </Stack>
      </Box>
    );
  if (!access.canRead)
    return (
      <Alert severity="warning">
        Sem permissão para consultar o acompanhamento eSocial.
      </Alert>
    );
  return (
    <Box sx={{ p: { xs: 8, md: 12 } }}>
      <Stack spacing={12} useFlexGap>
        <Typography variant="h5">Acompanhamento eSocial</Typography>
        <Alert severity="info">
          As condições são cadastradas e corrigidas na caracterização e nos
          cadastros do empregado. Aqui você confere as declarações e acompanha o
          processamento e os recibos do eSocial.
        </Alert>
        <Typography variant="h6">Enviar condições a partir de</Typography>
        <Typography>
          {policy.data?.policy
            ? `Data configurada: ${policy.data.policy.fromDate.slice(0, 10)} · revisão ${policy.data.policy.revision}`
            : 'Informe a data inicial antes de preparar o primeiro envio.'}
        </Typography>
        <Typography>
          O histórico anterior continua disponível. Se já foi enviado por outro
          software, escolha de quando este sistema deve assumir os envios.
          Alterar esta data reavalia as pendências; não cria comprovantes de
          aceitação de outro emissor.
        </Typography>
        {access.canConfigure && (
          <Stack spacing={8} useFlexGap>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={8}
              useFlexGap
              sx={{ alignItems: { md: 'flex-start' } }}
            >
              <SstDateField
                label="Data inicial de envio"
                value={from}
                disabled={busy}
                onValidityChange={dateFieldValidity('from')}
                onChange={(value) => {
                  setFrom(value);
                  clearAnalysis();
                }}
                sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}
              />
              <TextField
                label="Motivo da configuração"
                value={reason}
                disabled={busy}
                onChange={(e) => {
                  setReason(e.target.value);
                  clearAnalysis();
                }}
                sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}
              />
              <Button
                disabled={
                  busy ||
                  !policy.data ||
                  policy.isError ||
                  inFlight ||
                  !from ||
                  !datesValid ||
                  !reason.trim()
                }
                onClick={reviewRequired ? analyze : save}
                sx={{
                  minHeight: 40,
                  whiteSpace: 'normal',
                  alignSelf: { md: 'center' },
                }}
              >
                {reviewRequired ? 'Consultar impacto' : 'Salvar data inicial'}
              </Button>
            </Stack>
            {inFlight && (
              <Alert severity="warning">
                Conclua os envios pendentes antes de alterar a data inicial.
                Tentativas bloqueadas podem ser retomadas ou canceladas no
                painel abaixo; resultados incertos precisam ser reconciliados.
                <Button
                  disabled={busy || policy.isFetching}
                  onClick={async () => {
                    const result = await policy.refetch();
                    if (result.data) setInFlightError(false);
                  }}
                  sx={{ display: 'block', mt: 4, whiteSpace: 'normal' }}
                >
                  Atualizar situação
                </Button>
              </Alert>
            )}
            {matchingPreview && preview && (
              <Box
                role="region"
                aria-label="Impacto da alteração da data inicial"
                sx={{
                  p: 8,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Stack spacing={8} useFlexGap>
                  <Typography variant="h6">
                    Confira a alteração da data inicial
                  </Typography>
                  <Typography>
                    De {dateLabel(preview.data.previousFromDate)} para{' '}
                    {dateLabel(preview.data.fromDate)}
                  </Typography>
                  <Typography>
                    {policyImpactMessage(preview.data.direction)}
                  </Typography>
                  <Alert severity="info">
                    {preview.data.acceptedDeclarations}{' '}
                    {preview.data.acceptedDeclarations === 1
                      ? 'evento aceito'
                      : 'eventos aceitos'}{' '}
                    de {preview.data.acceptedEmployments}{' '}
                    {preview.data.acceptedEmployments === 1
                      ? 'vínculo'
                      : 'vínculos'}{' '}
                    {preview.data.acceptedDeclarations === 1
                      ? 'será preservado'
                      : 'serão preservados'}
                    , incluindo XMLs e recibos. Salvar a data não transmite
                    eventos. Confira as condições na preparação do envio.
                  </Alert>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={8}
                    useFlexGap
                  >
                    <Button
                      variant="contained"
                      disabled={busy || inFlight || !datesValid}
                      onClick={save}
                      sx={{
                        minHeight: 40,
                        height: 'auto',
                        whiteSpace: 'normal',
                      }}
                    >
                      Confirmar alteração da data
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={clearAnalysis}
                      sx={{ minHeight: 40 }}
                    >
                      Voltar à edição
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <OperationalStatusSummary companyId={companyId} />
        <BulkDispatchPanel
          key={`bulk:${companyId}`}
          companyId={companyId}
          initialEnvironment={initialEnvironment}
          onOpenDeclaration={openDeclaration}
        />
        <DeclarationPanel
          key={`${companyId}:${policy.data?.policy?.revision || 0}`}
          companyId={companyId}
          initialEnvironment={initialEnvironment}
          requestedRunId={activeDeclarationRequest?.id}
          requestSequence={activeDeclarationRequest?.sequence}
        />
        <SecondaryDeclarationPanel companyId={companyId} initialEnvironment={initialEnvironment} />
        {policy.isError && (
          <Alert severity="error">
            Não foi possível consultar o acompanhamento. Recarregue para tentar
            novamente.
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
