import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { getSaveActionColor } from 'core/utils/save-action-color';
import { RoleEnum } from 'project/enum/roles.enums';

import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { CriterionHierarchyView } from '@v2/pages/companies/risk-matrices/components/CriterionHierarchyView';
import { RiskMatrixColorInput } from '@v2/pages/companies/risk-matrices/components/RiskMatrixColorInput';
import { RiskMatrixGridEditor } from '@v2/pages/companies/risk-matrices/components/RiskMatrixGridEditor';
import {
  RISK_MATRIX_COVERAGE_OPTIONS,
  RISK_MATRIX_ORIENTATION_OPTIONS,
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS,
  RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS,
} from '@v2/pages/companies/risk-matrices/maps/risk-matrix.maps';
import { getAxisLevelsByAxis } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-editor-state.util';
import {
  getRiskMatrixApiErrorBody,
  getRiskMatrixApiErrorMessage,
} from '@v2/pages/companies/risk-matrices/utils/risk-matrix-error.util';
import { useFetchReadSystemRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useFetchReadSystemRiskMatrix';
import { useMutateSaveSystemRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix';
import { RiskMatrixAxisEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  overlayEditorialOnEditorState,
  setSystemAxisCriterion,
  setSystemAxisLevelColor,
  setSystemClassificationColor,
  toAxisLevelColorByValue,
} from './utils/system-risk-matrix-editorial.util';
import {
  beginSystemRiskMatrixSave,
  completeSystemRiskMatrixSave,
  createSystemRiskMatrixDraft,
  failSystemRiskMatrixSave,
  isSystemRiskMatrixDraftDirty,
  isSystemRiskMatrixDraftStale,
  receiveSystemRiskMatrixProjection,
  type SystemRiskMatrixDraft,
} from './utils/system-risk-matrix-draft.util';
import { hydrateSystemRiskMatrixView } from './utils/system-risk-matrix-view.util';

export const SystemRiskMatrixPage: FC = () => {
  const router = useRouter();
  const { showSnackBar } = useSystemSnackbar();
  const { data, isLoading, isError, error, refetch } =
    useFetchReadSystemRiskMatrix();
  const saveMutation = useMutateSaveSystemRiskMatrix();
  const [draft, setDraft] = useState<SystemRiskMatrixDraft | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    if (!data) return;
    setDraft((current) => receiveSystemRiskMatrixProjection(current, data));
  }, [data]);

  const editorial = draft?.editorial ?? null;
  const busy = Boolean(
    draft?.saving || saveMutation.isPending || loadingLatest,
  );
  const stale = Boolean(draft && isSystemRiskMatrixDraftStale(draft));
  const updateEditorial = (
    update: (
      current: NonNullable<typeof editorial>,
    ) => NonNullable<typeof editorial>,
  ) => {
    setDraft((current) =>
      current && !current.saving
        ? { ...current, editorial: update(current.editorial) }
        : current,
    );
  };

  const currentProjection = draft?.latest;
  const view = useMemo(
    () =>
      currentProjection ? hydrateSystemRiskMatrixView(currentProjection) : null,
    [currentProjection],
  );
  const editor = useMemo(() => {
    if (!view) return null;
    if (!editorial) return view.editor;
    return overlayEditorialOnEditorState(view.editor, editorial);
  }, [view, editorial]);

  const severityLevels = useMemo(
    () =>
      editor
        ? getAxisLevelsByAxis(editor.axisLevels, RiskMatrixAxisEnum.SEVERITY)
        : [],
    [editor],
  );
  const probabilityLevels = useMemo(
    () =>
      editor
        ? getAxisLevelsByAxis(editor.axisLevels, RiskMatrixAxisEnum.PROBABILITY)
        : [],
    [editor],
  );

  const dirty = Boolean(draft && isSystemRiskMatrixDraftDirty(draft));
  const orientationLabel = RISK_MATRIX_ORIENTATION_OPTIONS.find(
    (option) => option.value === editor?.gridOrientation,
  )?.label;
  const yAxisLabel = RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS.find(
    (option) => option.value === editor?.yAxisDirection,
  )?.label;

  const handleSave = async () => {
    if (!draft || busy || stale || !dirty) return;
    const submission = beginSystemRiskMatrixSave(draft, () =>
      crypto.randomUUID(),
    );
    setDraft(submission.draft);
    try {
      const saved = await saveMutation.mutateAsync(submission.payload);
      setDraft((current) =>
        current
          ? completeSystemRiskMatrixSave(current, saved)
          : createSystemRiskMatrixDraft(saved),
      );
    } catch (saveError) {
      const conflict =
        getRiskMatrixApiErrorBody(saveError)?.code ===
        'SYSTEM_RISK_MATRIX_REVISION_CONFLICT';
      setDraft((current) =>
        current ? failSystemRiskMatrixSave(current, conflict) : current,
      );
      if (conflict) void refetch();
      showSnackBar(
        getRiskMatrixApiErrorMessage(
          saveError,
          'Não foi possível salvar a matriz-mãe.',
        ),
        { type: 'error' },
      );
    }
  };

  const handleLoadLatest = async () => {
    setLoadingLatest(true);
    try {
      const latest = await refetch();
      if (latest.isError || !latest.data) {
        showSnackBar(
          'Não foi possível carregar a versão atual. Seu rascunho foi mantido.',
          { type: 'error' },
        );
        return;
      }
      setDraft(createSystemRiskMatrixDraft(latest.data));
    } finally {
      setLoadingLatest(false);
    }
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box sx={{ px: { xs: '16px', md: '24px' }, pb: '32px', pt: '16px' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap="16px"
          flexWrap="wrap"
          mb="16px"
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              Matriz Padrão SimpleSST
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Textos de orientação e cores são globais; salvar não recalcula
              avaliações nem altera exposições já registradas. O cálculo 5×5
              permanece fixo.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap="8px" mt="12px">
              <Chip size="small" color="primary" label="SYSTEM" />
              <Chip size="small" color="secondary" label="Edição editorial" />
            </Box>
          </Box>
          <Box display="flex" gap="16px" flexWrap="wrap">
            <Button
              variant="outlined"
              disabled={busy}
              onClick={() => router.push(RoutesEnum.DATABASE)}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              color={getSaveActionColor(dirty)}
              disabled={!dirty || busy || !editorial || stale}
              onClick={() => void handleSave()}
            >
              Salvar
            </Button>
          </Box>
        </Box>

        {isLoading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert severity="error">
            {getRiskMatrixApiErrorMessage(
              error,
              'Não foi possível carregar a Matriz Padrão SimpleSST.',
            )}
          </Alert>
        )}

        {stale && (
          <Alert
            severity="warning"
            sx={{ mb: '16px', '& .MuiAlert-message': { minWidth: 0 } }}
          >
            <Typography variant="body2">
              A matriz foi alterada por outra sessão. Seu rascunho foi mantido e
              não substituiu a versão publicada. Carregar a versão atual
              descarta as alterações não salvas desta tela.
            </Typography>
            <Button
              variant="outlined"
              disabled={busy}
              onClick={() => void handleLoadLatest()}
              sx={{ mt: '16px' }}
            >
              Carregar versão atual
            </Button>
          </Alert>
        )}

        {view && editor && editorial && (
          <Box display="flex" flexDirection="column" gap="16px">
            <Alert severity="info">
              Os textos orientam a leitura dos níveis e as cores atualizam a
              apresentação da matriz padrão. Matrizes próprias já publicadas
              conservam a cópia utilizada. Interromper atividades (P≥6)
              permanece fora desta edição.
            </Alert>

            {view.gaps.map((gap) => (
              <Alert key={`${gap.coverageKey}-${gap.field}`} severity="warning">
                {gap.message}
              </Alert>
            ))}

            {data?.extraordinaryProbability && (
              <Alert severity="warning">
                P{data.extraordinaryProbability.value} — IA —{' '}
                {data.extraordinaryProbability.label}. Fora da edição editorial.
              </Alert>
            )}

            <Paper
              variant="outlined"
              sx={{ p: '16px', minWidth: 0 }}
              data-testid="system-risk-matrix-name"
            >
              <Typography variant="subtitle1" gutterBottom>
                Nome da matriz
              </Typography>
              <Typography>{editor.name}</Typography>
              {editor.description && (
                <>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ mt: '16px' }}
                  >
                    Descrição
                  </Typography>
                  <Typography color="text.secondary">
                    {editor.description}
                  </Typography>
                </>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: '16px', minWidth: 0 }}>
              <Typography variant="subtitle1" gutterBottom>
                Coberturas
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: '12px' }}
              >
                Cada tipo de risco tem orientações próprias de severidade e
                probabilidade.
              </Typography>
              <Box display="flex" flexWrap="wrap" gap="8px">
                {RISK_MATRIX_COVERAGE_OPTIONS.filter((option) =>
                  editor.coverages.includes(option.value),
                ).map((option) => (
                  <Chip
                    key={option.value}
                    label={`${option.code} — ${option.title}`}
                    color={
                      view.undefinedCoverages.includes(option.value)
                        ? 'warning'
                        : 'default'
                    }
                    variant={
                      view.undefinedCoverages.includes(option.value)
                        ? 'filled'
                        : 'outlined'
                    }
                  />
                ))}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: '16px', minWidth: 0 }}>
              <Typography variant="subtitle1" gutterBottom>
                Matriz
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: '16px' }}
              >
                {orientationLabel}. {yAxisLabel}. Grade estrutural somente
                leitura. As células usam a cor da classificação final.
              </Typography>
              <RiskMatrixGridEditor
                orientation={editor.gridOrientation}
                yAxisDirection={editor.yAxisDirection}
                selectedCoverages={editor.coverages}
                undefinedCoveragesByAxis={view.undefinedCoveragesByAxis}
                severityLevels={severityLevels}
                probabilityLevels={probabilityLevels}
                classifications={editor.classifications}
                cells={editor.cells}
                selectedClassificationKey={null}
                disabled
                axisLevelColorByValue={toAxisLevelColorByValue(
                  editorial.axisLevelColors,
                )}
                onChangeLabel={() => undefined}
                onChangeCriterion={() => undefined}
                onCopyCriterionToOtherCoverages={() => undefined}
                onPaintCell={() => undefined}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: '16px', minWidth: 0 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cores de Severidade e Probabilidade
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: '16px' }}
              >
                Uma única cor por nível, compartilhada pelos eixos. S1 = P1, S2
                = P2, S3 = P3, S4 = P4 e S5 = P5. Independente das cores C1..C5.
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                gap="16px"
                data-testid="system-risk-matrix-axis-colors"
              >
                {editorial.axisLevelColors.map((item) => (
                  <Box
                    key={item.value}
                    display="flex"
                    alignItems="center"
                    gap="16px"
                    flexWrap="wrap"
                  >
                    <Typography sx={{ minWidth: 148 }}>
                      Nível {item.value} (S{item.value} = P{item.value})
                    </Typography>
                    <RiskMatrixColorInput
                      value={item.color}
                      disabled={busy}
                      onChange={(color) =>
                        updateEditorial((current) =>
                          setSystemAxisLevelColor(current, item.value, color),
                        )
                      }
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: '16px', minWidth: 0 }}>
              <Typography variant="subtitle1" gutterBottom>
                Classificações finais
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: '16px' }}
              >
                Nomes, siglas e faixas SimpleSST permanecem fixos. As cores das
                classificações podem ser alteradas separadamente das cores de
                severidade e probabilidade.
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                gap="16px"
                data-testid="system-risk-matrix-classification-colors"
              >
                {editor.classifications.map((classification) => {
                  const bandLabel = classification.compatibilityBands
                    .map(
                      (band) =>
                        RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS.find(
                          (option) => option.value === band,
                        )?.label ?? String(band),
                    )
                    .join(', ');
                  return (
                    <Box
                      key={classification.key}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'minmax(0, 1fr) auto',
                        md: 'minmax(148px, max-content) 32px 180px minmax(0, 1fr)',
                      }}
                      columnGap="16px"
                      rowGap="12px"
                      alignItems="center"
                      minWidth={0}
                    >
                      <Typography
                        sx={{ whiteSpace: { xs: 'normal', md: 'nowrap' } }}
                      >
                        {classification.key} — {classification.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        title="Sigla (somente leitura)"
                      >
                        {classification.abbreviation || '—'}
                      </Typography>
                      <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                        <RiskMatrixColorInput
                          value={classification.color}
                          disabled={busy}
                          onChange={(color) =>
                            updateEditorial((current) =>
                              setSystemClassificationColor(
                                current,
                                classification.key,
                                color,
                              ),
                            )
                          }
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
                      >
                        {bandLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: '16px', minWidth: 0 }}>
              <Typography variant="subtitle1" gutterBottom>
                Critérios metodológicos dos eixos
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: '16px' }}
              >
                Textos de orientação por tipo de risco. A prévia abaixo de cada
                campo mostra a organização do texto e preserva o que foi
                digitado.
              </Typography>
              {editor.coverages.map((coverage) => {
                const option = RISK_MATRIX_COVERAGE_OPTIONS.find(
                  (item) => item.value === coverage,
                );
                const severityGap =
                  view.undefinedCoveragesByAxis[
                    RiskMatrixAxisEnum.SEVERITY
                  ]?.includes(coverage);
                const probabilityGap =
                  view.undefinedCoveragesByAxis[
                    RiskMatrixAxisEnum.PROBABILITY
                  ]?.includes(coverage);
                return (
                  <SAccordion
                    key={coverage}
                    defaultExpanded={false}
                    title={
                      <Typography variant="subtitle2">
                        {option ? `${option.code} — ${option.title}` : coverage}
                      </Typography>
                    }
                    accordionProps={{
                      disableGutters: true,
                      sx: { mb: '16px' },
                    }}
                  >
                    <Box display="flex" flexDirection="column" gap="16px">
                      {[
                        {
                          title: 'Severidade',
                          axis: RiskMatrixAxisEnum.SEVERITY,
                          levels: severityLevels,
                          isUndefined: severityGap,
                        },
                        {
                          title: 'Probabilidade',
                          axis: RiskMatrixAxisEnum.PROBABILITY,
                          levels: probabilityLevels,
                          isUndefined: probabilityGap,
                        },
                      ].map((axis) => (
                        <Box key={axis.title}>
                          <Typography variant="caption" color="text.secondary">
                            {axis.title}
                          </Typography>
                          {axis.isUndefined ? (
                            <Alert severity="warning" sx={{ mt: '16px' }}>
                              {
                                view.gaps.find(
                                  (gap) =>
                                    gap.coverageKey === coverage &&
                                    (gap.axis === axis.axis || !gap.axis),
                                )?.message
                              }
                            </Alert>
                          ) : (
                            axis.levels.map((level) => {
                              const criterion =
                                editorial.axisCriteria.find(
                                  (item) =>
                                    item.axis === axis.axis &&
                                    item.value === level.value &&
                                    item.coverageKey === coverage,
                                )?.criterion ??
                                level.criteriaByCoverage[coverage] ??
                                '';
                              return (
                                <Box
                                  key={`${axis.title}-${level.value}`}
                                  sx={{
                                    mt: '16px',
                                    p: '16px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2" fontWeight={600}>
                                    {level.value} — {level.label}
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    disabled={busy}
                                    sx={{ mt: '16px' }}
                                    label="Critério"
                                    inputProps={{
                                      'aria-label': `Critério ${coverage} ${axis.title} ${level.value}`,
                                    }}
                                    value={criterion}
                                    onChange={(event) =>
                                      updateEditorial((current) =>
                                        setSystemAxisCriterion(current, {
                                          axis: axis.axis,
                                          value: level.value,
                                          coverageKey: coverage,
                                          criterion: event.target.value,
                                        }),
                                      )
                                    }
                                  />
                                  <Box sx={{ mt: '16px' }}>
                                    <CriterionHierarchyView
                                      criterion={criterion}
                                    />
                                  </Box>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      ))}
                    </Box>
                  </SAccordion>
                );
              })}
            </Paper>
          </Box>
        )}
      </Box>
    </SAuthShow>
  );
};
