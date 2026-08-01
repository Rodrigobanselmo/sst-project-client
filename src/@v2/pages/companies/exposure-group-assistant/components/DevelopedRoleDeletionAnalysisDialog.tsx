import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

import { useFetchDevelopedRoleDeletionEligibility } from '@v2/services/security/exposure-group-assistant/hooks/useFetchDevelopedRoleDeletionEligibility';
import { useMutateDeleteDevelopedRole } from '@v2/services/security/exposure-group-assistant/hooks/useMutateDeleteDevelopedRole';
import {
  DEVELOPED_ROLE_DELETE_CONFIRMATION,
  type DevelopedRoleDeletionEligibility,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

import { HierarchyPathSection } from './HierarchyPathSection';

function eligibilityLabel(eligibility: DevelopedRoleDeletionEligibility): string {
  switch (eligibility) {
    case 'ELIGIBLE_DIRECT_DELETE':
      return 'Elegível para exclusão direta';
    case 'ELIGIBLE_AFTER_EMPLOYEE_DETACH':
      return 'Elegível após desvincular empregado(s) do cargo desenvolvido';
    case 'BLOCKED_TECHNICAL_USE':
      return 'Bloqueado — uso técnico';
    case 'BLOCKED_OTHER_REFERENCES':
      return 'Bloqueado — outras referências';
    case 'UNKNOWN':
      return 'Inconclusivo';
    default:
      return eligibility;
  }
}

type ConfirmStep = 'analysis' | 'detach' | 'delete' | 'success';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId?: string;
  hierarchyId?: string;
  hierarchyName?: string;
  onClose: () => void;
  organogramHref?: string | null;
  onDeleted?: () => void;
};

export function DevelopedRoleDeletionAnalysisDialog({
  open,
  companyId,
  workspaceId,
  hierarchyId,
  hierarchyName,
  onClose,
  organogramHref,
  onDeleted,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState<ConfirmStep>('analysis');
  const enabled = open && Boolean(companyId && workspaceId && hierarchyId);
  const { data, isLoading, isError, error, refetch } =
    useFetchDevelopedRoleDeletionEligibility(
      {
        companyId,
        workspaceId: workspaceId || '',
        hierarchyId: hierarchyId || '',
      },
      enabled,
    );
  const deleteMutation = useMutateDeleteDevelopedRole();

  useEffect(() => {
    if (!open) {
      setStep('analysis');
      deleteMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isEligible =
    data?.eligibility === 'ELIGIBLE_DIRECT_DELETE' ||
    data?.eligibility === 'ELIGIBLE_AFTER_EMPLOYEE_DETACH';
  const needsDetach = data?.eligibility === 'ELIGIBLE_AFTER_EMPLOYEE_DETACH';
  const developedName =
    data?.hierarchyName || hierarchyName || data?.hierarchyId || '';
  const primaryName = data?.primaryRole?.name || 'cargo principal';
  const detachPlan = data?.employeeDetachPlan;
  const employeeCount = detachPlan?.employeeCount ?? data?.currentEmployeeCount ?? 0;

  const handleStartDeleteFlow = () => {
    if (needsDetach) setStep('detach');
    else setStep('delete');
  };

  const handleConfirmDelete = async () => {
    if (!data || !workspaceId || !hierarchyId) return;
    try {
      const result = await deleteMutation.mutateAsync({
        companyId,
        workspaceId,
        hierarchyId,
        expectedAnalysisHash: data.analysisHash,
        confirmation: DEVELOPED_ROLE_DELETE_CONFIRMATION,
      });
      setStep('success');
      enqueueSnackbar(
        result.message ||
          'Cargo desenvolvido excluído. O empregado permanece vinculado ao cargo principal.',
        { variant: 'success' },
      );
      onDeleted?.();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : 'Falha ao excluir cargo desenvolvido.');
      enqueueSnackbar(
        typeof message === 'string' ? message : 'Falha ao excluir cargo desenvolvido.',
        { variant: 'error' },
      );
      void refetch();
      setStep('analysis');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {step === 'success'
          ? 'Exclusão concluída'
          : step === 'detach'
            ? 'Desvincular empregado do cargo desenvolvido'
            : step === 'delete'
              ? 'Confirmar exclusão do cargo desenvolvido'
              : 'Analisar exclusão do cargo desenvolvido'}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && step === 'analysis' ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analisando referências técnicas…
            </Typography>
          </Stack>
        ) : null}

        {isError && step === 'analysis' ? (
          <Alert severity="error">
            Não foi possível analisar a exclusão.
            {error instanceof Error && error.message
              ? ` ${error.message}`
              : ''}
          </Alert>
        ) : null}

        {step === 'success' ? (
          <Alert severity="success">
            Cargo desenvolvido excluído. O empregado permanece vinculado ao cargo
            principal.
          </Alert>
        ) : null}

        {step === 'detach' && data ? (
          <Stack spacing={2}>
            <Alert severity="warning">
              O cargo desenvolvido “{developedName}” possui {employeeCount}{' '}
              {employeeCount === 1 ? 'empregado vinculado' : 'empregados vinculados'}.
              Para excluí-lo, é necessário remover primeiro esse vínculo auxiliar.
              {employeeCount === 1 ? (
                <>
                  {' '}
                  O empregado continuará vinculado ao cargo principal “{primaryName}”.
                </>
              ) : (
                <>
                  {' '}
                  Os empregados continuarão vinculados aos respectivos cargos
                  principais.
                </>
              )}
            </Alert>
            {detachPlan?.employees?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Empregados a desvincular do cargo desenvolvido
                </Typography>
                <Typography variant="body2" component="div">
                  {detachPlan.employees.map((e) => (
                    <div key={e.employeeId}>
                      {e.employeeName} → cargo principal preservado:{' '}
                      {e.primaryRoleName}
                    </div>
                  ))}
                </Typography>
              </Box>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              Esta ação ainda não grava alterações. A desvinculação e a exclusão
              ocorrerão juntas após a confirmação seguinte.
            </Typography>
          </Stack>
        ) : null}

        {step === 'delete' && data ? (
          <Stack spacing={2}>
            <Alert severity="warning">
              {needsDetach
                ? 'O vínculo auxiliar será removido e o empregado continuará no cargo principal. '
                : ''}
              Deseja excluir definitivamente o cargo desenvolvido “{developedName}”?
            </Alert>
            <Typography variant="body2">
              Elementos caracterizáveis relacionados (se houver) não serão
              excluídos nesta operação.
            </Typography>
          </Stack>
        ) : null}

        {step === 'analysis' && data ? (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Identificação
              </Typography>
              <Typography variant="body2" component="div">
                <div>Cargo desenvolvido: {developedName}</div>
                <div>
                  Cargo principal preservado:{' '}
                  {data.primaryRole?.name ||
                    (data.primaryRolePreserved
                      ? 'Sim'
                      : 'Não identificado / ausente')}
                </div>
                <div>Resultado: {eligibilityLabel(data.eligibility)}</div>
              </Typography>
            </Box>

            <HierarchyPathSection
              path={data.hierarchyPath}
              display={data.hierarchyPathDisplay}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Impacto
              </Typography>
              <Typography variant="body2" component="div">
                <div>
                  Empregados associados ao recurso auxiliar:{' '}
                  {data.currentEmployeeCount}
                </div>
                <div>
                  Cargo principal do empregado:{' '}
                  {data.primaryRolePreserved ? 'preservado' : 'não confirmado'}
                </div>
                <div>Riscos atuais: {data.currentRiskCount}</div>
                <div>
                  Evidências de riscos históricos:{' '}
                  {data.historicalRiskEvidenceCount}
                </div>
                <div>
                  Elementos caracterizáveis ativos:{' '}
                  {data.activeCharacterizationCount}
                </div>
                <div>
                  Elementos históricos sem uso técnico:{' '}
                  {data.historicalCharacterizationWithoutTechnicalUseCount}
                </div>
                <div>GSEs com uso técnico: {data.gseCount}</div>
                <div>Documentos/snapshots: {data.documentReferenceCount}</div>
                <div>Filhos hierárquicos: {data.hierarchicalChildCount}</div>
                <div>
                  Outras referências impeditivas:{' '}
                  {data.otherBlockingReferenceCount}
                </div>
              </Typography>
            </Box>

            {data.relatedElements.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Elementos relacionados (não serão excluídos automaticamente)
                </Typography>
                <Typography variant="body2" component="div">
                  {data.relatedElements.map((el) => (
                    <div key={el.id}>
                      {el.name} · {el.status}
                      {el.hasTechnicalUse
                        ? ` · uso técnico: ${el.technicalUseSignals.join(', ')}`
                        : ' · sem uso técnico identificado'}
                    </div>
                  ))}
                </Typography>
              </Box>
            ) : null}

            {data.warnings.map((w) => (
              <Alert key={w} severity="info">
                {w}
              </Alert>
            ))}

            {isEligible ? (
              <Alert severity="success">
                {needsDetach
                  ? 'Este cargo desenvolvido não possui uso técnico identificado. É necessário desvincular o(s) empregado(s) do cargo desenvolvido (recurso auxiliar) e, na mesma operação, excluí-lo. O cargo principal será preservado.'
                  : 'Este cargo desenvolvido não possui uso técnico nem empregados vinculados e pode ser excluído.'}
              </Alert>
            ) : (
              <Alert severity="warning">
                Não é possível excluir este cargo desenvolvido porque ele possui
                uso técnico ou referência impeditiva.
                {data.blockingReasons.length > 0 ? (
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    {data.blockingReasons.map((r) => (
                      <li key={r.code}>
                        {r.message}
                        {r.count != null ? ` (${r.count})` : ''}
                      </li>
                    ))}
                  </Box>
                ) : null}
              </Alert>
            )}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        {step === 'analysis' ? (
          <>
            <Button onClick={onClose}>Fechar</Button>
            {organogramHref ? (
              <Button
                variant="outlined"
                href={organogramHref}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(organogramHref);
                }}
              >
                Ver no organograma
              </Button>
            ) : null}
            {isEligible ? (
              <Button variant="contained" color="error" onClick={handleStartDeleteFlow}>
                {needsDetach
                  ? 'Desvincular empregado e continuar'
                  : 'Excluir cargo desenvolvido'}
              </Button>
            ) : null}
          </>
        ) : null}

        {step === 'detach' ? (
          <>
            <Button onClick={() => setStep('analysis')}>Cancelar</Button>
            <Button variant="contained" onClick={() => setStep('delete')}>
              Desvincular empregado e continuar
            </Button>
          </>
        ) : null}

        {step === 'delete' ? (
          <>
            <Button
              onClick={() => setStep(needsDetach ? 'detach' : 'analysis')}
              disabled={deleteMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={deleteMutation.isPending}
              onClick={() => {
                void handleConfirmDelete();
              }}
            >
              {deleteMutation.isPending ? 'Excluindo…' : 'Excluir cargo desenvolvido'}
            </Button>
          </>
        ) : null}

        {step === 'success' ? (
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
