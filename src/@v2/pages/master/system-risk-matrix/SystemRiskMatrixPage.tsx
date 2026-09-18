import { FC, useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { CriterionHierarchyView } from '@v2/pages/companies/risk-matrices/components/CriterionHierarchyView';
import { RiskMatrixGridEditor } from '@v2/pages/companies/risk-matrices/components/RiskMatrixGridEditor';
import {
  RISK_MATRIX_COVERAGE_OPTIONS,
  RISK_MATRIX_ORIENTATION_OPTIONS,
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS,
  RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS,
} from '@v2/pages/companies/risk-matrices/maps/risk-matrix.maps';
import {
  getAxisLevelsByAxis,
} from '@v2/pages/companies/risk-matrices/utils/risk-matrix-editor-state.util';
import { getRiskMatrixApiErrorMessage } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-error.util';
import { useFetchReadSystemRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useFetchReadSystemRiskMatrix';
import { RiskMatrixAxisEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { hydrateSystemRiskMatrixView } from './utils/system-risk-matrix-view.util';

export const SystemRiskMatrixPage: FC = () => {
  const router = useRouter();
  const { data, isLoading, isError, error } = useFetchReadSystemRiskMatrix();

  const view = useMemo(
    () => (data ? hydrateSystemRiskMatrixView(data) : null),
    [data],
  );

  const severityLevels = useMemo(
    () =>
      view
        ? getAxisLevelsByAxis(view.editor.axisLevels, RiskMatrixAxisEnum.SEVERITY)
        : [],
    [view],
  );
  const probabilityLevels = useMemo(
    () =>
      view
        ? getAxisLevelsByAxis(
            view.editor.axisLevels,
            RiskMatrixAxisEnum.PROBABILITY,
          )
        : [],
    [view],
  );

  const orientationLabel = RISK_MATRIX_ORIENTATION_OPTIONS.find(
    (option) => option.value === view?.editor.gridOrientation,
  )?.label;
  const yAxisLabel = RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS.find(
    (option) => option.value === view?.editor.yAxisDirection,
  )?.label;

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
              Metodologia nativa do sistema. Visualização somente leitura.
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
              <Chip size="small" color="primary" label="SYSTEM" />
              <Chip size="small" label="Somente leitura" />
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => router.push(RoutesEnum.DATABASE)}
          >
            Voltar
          </Button>
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

        {view && (
          <Box display="flex" flexDirection="column" gap={3}>
            <Alert severity="info">
              Esta é a representação visual da metodologia nativa 5×5. Não há
              persistência de CompanyRiskMatrix SYSTEM e esta tela não altera o
              cálculo operacional. O estado extraordinário Interromper
              atividades (P≥6) não faz parte desta grade.
            </Alert>

            {view.gaps.map((gap) => (
              <Alert key={`${gap.coverageKey}-${gap.field}`} severity="warning">
                {gap.message}
              </Alert>
            ))}

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nome da matriz
              </Typography>
              <Typography>{view.editor.name}</Typography>
              {view.editor.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Descrição
                  </Typography>
                  <Typography color="text.secondary">
                    {view.editor.description}
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
                  view.editor.coverages.includes(option.value),
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
                {orientationLabel}. {yAxisLabel}.
              </Typography>
              <RiskMatrixGridEditor
                orientation={view.editor.gridOrientation}
                yAxisDirection={view.editor.yAxisDirection}
                selectedCoverages={view.editor.coverages}
                undefinedCoveragesByAxis={view.undefinedCoveragesByAxis}
                severityLevels={severityLevels}
                probabilityLevels={probabilityLevels}
                classifications={view.editor.classifications}
                cells={view.editor.cells}
                selectedClassificationKey={null}
                disabled
                onChangeLabel={() => undefined}
                onChangeCriterion={() => undefined}
                onCopyCriterionToOtherCoverages={() => undefined}
                onPaintCell={() => undefined}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Classificações finais
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cores operacionais do padrão SimpleSST. A compatibilidade 1 a 5
                é ponte documental, não um recálculo da célula.
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {view.editor.classifications.map((classification) => {
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
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 28,
                          borderRadius: 0.5,
                          bgcolor: classification.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography>
                        {classification.key} — {classification.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                Textos publicados por tipo de risco. Cada coverage tem o seu
                próprio bloco de critérios. Não há um critério universal.
              </Typography>
              {view.editor.coverages.map((coverage) => {
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
                            axis.levels.map((level) => (
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
                                <CriterionHierarchyView
                                  criterion={
                                    level.criteriaByCoverage[coverage] ?? ''
                                  }
                                />
                              </Box>
                            ))
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
