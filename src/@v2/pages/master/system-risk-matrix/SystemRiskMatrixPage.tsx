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
import { getRiskMatrixApiErrorMessage } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-error.util';
import { useFetchReadSystemRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useFetchReadSystemRiskMatrix';
import { useMutateSaveSystemRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix';
import { RiskMatrixAxisEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  buildSystemRiskMatrixEditorialState,
  buildSystemRiskMatrixPutPayload,
  isSystemRiskMatrixEditorialDirty,
  overlayEditorialOnEditorState,
  setSystemAxisCriterion,
  setSystemAxisLevelColor,
  setSystemClassificationColor,
  toAxisLevelColorByValue,
  type SystemRiskMatrixEditorialState,
} from './utils/system-risk-matrix-editorial.util';
import { hydrateSystemRiskMatrixView } from './utils/system-risk-matrix-view.util';

export const SystemRiskMatrixPage: FC = () => {
  const router = useRouter();
  const { showSnackBar } = useSystemSnackbar();
  const { data, isLoading, isError, error } = useFetchReadSystemRiskMatrix();
  const saveMutation = useMutateSaveSystemRiskMatrix();
  const [editorial, setEditorial] = useState<SystemRiskMatrixEditorialState | null>(
    null,
  );
  const [baseline, setBaseline] = useState<SystemRiskMatrixEditorialState | null>(
    null,
  );

  useEffect(() => {
    if (!data) return;
    const next = buildSystemRiskMatrixEditorialState(data);
    setEditorial(next);
    setBaseline(next);
  }, [data]);

  const view = useMemo(
    () => (data ? hydrateSystemRiskMatrixView(data) : null),
    [data],
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

  const dirty = Boolean(
    editorial && baseline && isSystemRiskMatrixEditorialDirty(editorial, baseline),
  );
  const orientationLabel = RISK_MATRIX_ORIENTATION_OPTIONS.find(
    (option) => option.value === editor?.gridOrientation,
  )?.label;
  const yAxisLabel = RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS.find(
    (option) => option.value === editor?.yAxisDirection,
  )?.label;

  const handleSave = async () => {
    if (!editorial) return;
    try {
      const saved = await saveMutation.mutateAsync(
        buildSystemRiskMatrixPutPayload(editorial),
      );
      const next = buildSystemRiskMatrixEditorialState(saved);
      setEditorial(next);
      setBaseline(next);
    } catch (saveError) {
      showSnackBar(
        getRiskMatrixApiErrorMessage(
          saveError,
          'Não foi possível salvar a matriz-mãe.',
        ),
        { type: 'error' },
      );
    }
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box sx={{ px: { xs: 2, md: 5 }, pb: 10, pt: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
          mb={3}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              Matriz Padrão SimpleSST
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administração global da matriz-mãe. A grade 5×5 permanece
              estrutural; somente critérios e as duas paletas de cores são
              editoriais.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
              <Chip size="small" color="primary" label="SYSTEM" />
              <Chip size="small" color="secondary" label="Edição editorial" />
            </Box>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => router.push(RoutesEnum.DATABASE)}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              color={getSaveActionColor(dirty)}
              disabled={!dirty || saveMutation.isPending || !editorial}
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

        {view && editor && editorial && (
          <Box display="flex" flexDirection="column" gap={3}>
            <Alert severity="info">
              Esta é a representação visual da metodologia nativa 5×5. Não há
              persistência de CompanyRiskMatrix SYSTEM e o SAVE não altera o
              cálculo operacional das células. O estado extraordinário
              Interromper atividades (P≥6) não faz parte desta grade e não entra
              na edição.
            </Alert>

            {view.gaps.map((gap) => (
              <Alert key={`${gap.coverageKey}-${gap.field}`} severity="warning">
                {gap.message}
              </Alert>
            ))}

            {data?.extraordinaryProbability && (
              <Alert severity="warning">
                P{data.extraordinaryProbability.value} —{' '}
                {data.extraordinaryProbability.label}. Fora da edição editorial.
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nome da matriz
              </Typography>
              <Typography>{editor.name}</Typography>
              {editor.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Descrição
                  </Typography>
                  <Typography color="text.secondary">
                    {editor.description}
                  </Typography>
                </>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Coberturas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Classes metodológicas reconhecidas pelo padrão. Cada coverage
                tem critérios próprios de severidade e probabilidade.
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.75}>
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

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Matriz
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cores de Severidade e Probabilidade
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Uma única cor por value, compartilhada pelos eixos. S1 = P1, S2
                = P2, S3 = P3, S4 = P4 e S5 = P5. Independente das cores C1..C5.
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {editorial.axisLevelColors.map((item) => (
                  <Box
                    key={item.value}
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    flexWrap="wrap"
                  >
                    <Typography sx={{ minWidth: 148 }}>
                      Nível {item.value} (S{item.value} = P{item.value})
                    </Typography>
                    <RiskMatrixColorInput
                      value={item.color}
                      onChange={(color) =>
                        setEditorial((current) =>
                          current
                            ? setSystemAxisLevelColor(current, item.value, color)
                            : current,
                        )
                      }
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Classificações finais
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Key, label e faixa SimpleSST são estruturais. Somente a cor C1..C5
                é editorial e independente da paleta S/P.
              </Typography>
              <Box
                display="grid"
                width="max-content"
                maxWidth="100%"
                gridTemplateColumns="minmax(148px, max-content) max-content max-content"
                columnGap={1.5}
                rowGap={1.5}
                alignItems="center"
                justifyContent="start"
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
                    <Box key={classification.key} display="contents">
                      <Typography whiteSpace="nowrap">
                        {classification.key} — {classification.label}
                      </Typography>
                      <RiskMatrixColorInput
                        value={classification.color}
                        onChange={(color) =>
                          setEditorial((current) =>
                            current
                              ? setSystemClassificationColor(
                                  current,
                                  classification.key,
                                  color,
                                )
                              : current,
                          )
                        }
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        whiteSpace="nowrap"
                      >
                        {bandLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Critérios metodológicos dos eixos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Textos publicados por tipo de risco. O preview hierárquico não
                altera o valor enviado no SAVE.
              </Typography>
              {editor.coverages.map((coverage) => {
                const option = RISK_MATRIX_COVERAGE_OPTIONS.find(
                  (item) => item.value === coverage,
                );
                const severityGap = view.undefinedCoveragesByAxis[
                  RiskMatrixAxisEnum.SEVERITY
                ]?.includes(coverage);
                const probabilityGap = view.undefinedCoveragesByAxis[
                  RiskMatrixAxisEnum.PROBABILITY
                ]?.includes(coverage);
                return (
                  <SAccordion
                    key={coverage}
                    defaultExpanded={false}
                    title={
                      <Typography variant="subtitle2">
                        {option
                          ? `${option.code} — ${option.title}`
                          : coverage}
                      </Typography>
                    }
                    accordionProps={{
                      disableGutters: true,
                      sx: { mb: 1.5 },
                    }}
                  >
                    <Box display="flex" flexDirection="column" gap={1.5}>
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
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              {view.gaps.find(
                                (gap) =>
                                  gap.coverageKey === coverage &&
                                  (gap.axis === axis.axis || !gap.axis),
                              )?.message}
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
                                    mt: 1,
                                    p: 1.25,
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
                                    sx={{ mt: 1 }}
                                    label="Critério"
                                    value={criterion}
                                    onChange={(event) =>
                                      setEditorial((current) =>
                                        current
                                          ? setSystemAxisCriterion(current, {
                                              axis: axis.axis,
                                              value: level.value,
                                              coverageKey: coverage,
                                              criterion: event.target.value,
                                            })
                                          : current,
                                      )
                                    }
                                  />
                                  <Box sx={{ mt: 1 }}>
                                    <CriterionHierarchyView criterion={criterion} />
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
