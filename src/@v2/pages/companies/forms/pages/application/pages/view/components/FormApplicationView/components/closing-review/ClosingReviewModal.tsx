import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchClosingPrecheck } from '@v2/services/forms/form-application/closing-precheck/hooks/useFetchClosingPrecheck';
import { ClosingPrecheckEmployee } from '@v2/services/forms/form-application/closing-precheck/service/closing-precheck.types';
import { useState } from 'react';
import {
  canContinueClosingReview,
  closingPrecheckErrorMessage,
  closingReviewClassificationColor,
  closingReviewClassificationExplanation,
  closingReviewClassificationLabel,
  closingReviewCloseButtonLabel,
  closingReviewModalTitle,
  hasDivergenceAlert,
  shouldShowContinueClosingAction,
  type ClosingReviewModalMode,
} from './closing-review-ui.rules';

type ClosingReviewModalProps = {
  open: boolean;
  companyId: string;
  applicationId: string;
  onClose: () => void;
  onContinue?: () => void;
  continuing?: boolean;
  mode?: ClosingReviewModalMode;
};

export function ClosingReviewModal({
  open,
  companyId,
  applicationId,
  onClose,
  onContinue,
  continuing,
  mode = 'closing',
}: ClosingReviewModalProps) {
  const [showComposition, setShowComposition] = useState(false);
  const { precheck, isLoading, isError, error } = useFetchClosingPrecheck(
    { companyId, applicationId },
    { enabled: open },
  );

  const blockingTotal = precheck?.summary.blockingTotal ?? 0;
  const canContinue = canContinueClosingReview(blockingTotal);
  const showContinue = shouldShowContinueClosingAction(mode);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: 'min(96vw, 1680px)',
          maxWidth: '96vw',
          m: 2,
        },
      }}
    >
      <DialogTitle>{closingReviewModalTitle(mode)}</DialogTitle>
      <DialogContent sx={{ overflowX: 'hidden' }}>
        {isLoading && <Typography>Carregando revisão…</Typography>}
        {isError && (
          <Typography color="error">{closingPrecheckErrorMessage(error)}</Typography>
        )}
        {precheck && (
          <SFlex direction="column" gap={3}>
            <Typography variant="body2" color="text.secondary">
              Somente leitura. Nenhuma resposta, organograma ou análise é
              alterada nesta etapa.
            </Typography>
            <SFlex gap={3} flexWrap="wrap">
              <SummaryChip
                label="População"
                value={precheck.summary.populationTotal}
              />
              <SummaryChip
                label="Respondentes"
                value={precheck.summary.respondentsTotal}
              />
              <SummaryChip
                label="Sem resposta"
                value={precheck.summary.withoutResponseTotal}
              />
              <SummaryChip
                label="Divergências"
                value={precheck.summary.divergenceTotal}
                alert={hasDivergenceAlert(precheck.summary.divergenceTotal)}
              />
              <SummaryChip
                label="Bloqueantes"
                value={precheck.summary.blockingTotal}
                alert={hasDivergenceAlert(precheck.summary.blockingTotal)}
              />
            </SFlex>

            {precheck.possibleDuplicateHierarchyNames.length > 0 && (
              <Box>
                <Typography fontWeight={600}>
                  Possível duplicidade de setor
                </Typography>
                {precheck.possibleDuplicateHierarchyNames.map((item) => (
                  <Typography key={`${item.hierarchyIdA}-${item.hierarchyIdB}`}>
                    {item.nameA} × {item.nameB} (similaridade{' '}
                    {Math.round(item.similarity * 100)}%). Sem auto-merge.
                  </Typography>
                ))}
              </Box>
            )}

            <Box sx={{ overflowX: 'auto' }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Composição por setor
              </Typography>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Setor</TableCell>
                    <TableCell align="right">Empregados</TableCell>
                    <TableCell align="right">Respondentes</TableCell>
                    <TableCell align="right">Sem resposta</TableCell>
                    <TableCell align="right">Divergências</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {precheck.sectors.map((sector) => (
                    <TableRow key={sector.hierarchyId}>
                      <TableCell>{sector.name}</TableCell>
                      <TableCell align="right">
                        {sector.currentEmployeeCount}
                      </TableCell>
                      <TableCell align="right">{sector.respondentCount}</TableCell>
                      <TableCell align="right">
                        {sector.withoutResponseCount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: hasDivergenceAlert(sector.divergenceCount)
                            ? 'error.main'
                            : 'inherit',
                          fontWeight: hasDivergenceAlert(sector.divergenceCount)
                            ? 700
                            : 400,
                        }}
                      >
                        {sector.divergenceCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {showComposition && (
              <Box sx={{ overflowX: 'auto', maxHeight: 420 }}>
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  Conferência nominal
                </Typography>
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empregado</TableCell>
                      <TableCell>Setor atual</TableCell>
                      <TableCell>Cargo</TableCell>
                      <TableCell>Respondeu</TableCell>
                      <TableCell>Setor gravado</TableCell>
                      <TableCell>Classificação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {precheck.employees.map((employee) => (
                      <EmployeeRow
                        key={employee.employeeId}
                        employee={employee}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </SFlex>
        )}
      </DialogContent>
      <DialogActions>
        <SButton
          text={showComposition ? 'Ocultar composição' : 'Conferir composição'}
          variant="outlined"
          onClick={() => setShowComposition((value) => !value)}
          disabled={!precheck}
        />
        <SButton
          text={closingReviewCloseButtonLabel(mode)}
          variant="outlined"
          onClick={onClose}
        />
        {showContinue && (
          <SButton
            text="Continuar conclusão"
            onClick={onContinue}
            loading={continuing}
            disabled={!precheck || !canContinue || continuing || !onContinue}
          />
        )}
      </DialogActions>
    </Dialog>
  );
}

function SummaryChip({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        fontWeight={700}
        sx={{ color: alert ? 'error.main' : 'inherit' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function EmployeeRow({ employee }: { employee: ClosingPrecheckEmployee }) {
  const label = closingReviewClassificationLabel(employee.classification);
  const explanation = closingReviewClassificationExplanation(
    employee.classification,
  );
  const color = closingReviewClassificationColor(employee.classification);
  const content = (
    <Typography component="span" sx={{ color, fontWeight: 600 }}>
      {label}
    </Typography>
  );

  return (
    <TableRow>
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.currentSectorName ?? '—'}</TableCell>
      <TableCell>{employee.officeName ?? '—'}</TableCell>
      <TableCell>{employee.hasResponded ? 'Sim' : 'Não'}</TableCell>
      <TableCell>{employee.snapshotSectorName ?? '—'}</TableCell>
      <TableCell>
        {explanation ? (
          <Tooltip title={explanation}>
            <span>{content}</span>
          </Tooltip>
        ) : (
          content
        )}
      </TableCell>
    </TableRow>
  );
}
