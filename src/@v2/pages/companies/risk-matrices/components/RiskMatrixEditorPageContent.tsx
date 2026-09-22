import { FC, useEffect, useMemo, useRef, useState } from 'react';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { getSaveActionV2Color } from 'core/utils/save-action-color';

import { useFetchReadRiskMatrix } from '@v2/services/security/risk-matrix/hooks/useFetchReadRiskMatrix';
import { useFetchReadRiskMatrixVersion } from '@v2/services/security/risk-matrix/hooks/useFetchReadRiskMatrixVersion';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  useMutatePublishRiskMatrixVersion,
  useMutateReplaceRiskMatrixDraft,
} from '@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix';
import {
  CompanyRiskMatrixStatusEnum,
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixYAxisDirectionEnum,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  RISK_MATRIX_COVERAGE_OPTIONS,
  RISK_MATRIX_ORIENTATION_OPTIONS,
  RISK_MATRIX_PUBLISH_CONFIRMATION,
  RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE,
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS,
  RISK_MATRIX_SIMPLE_SST_HELP,
  RISK_MATRIX_STATUS_LABELS,
  RISK_MATRIX_VERSION_STATUS_LABELS,
  RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS,
} from '../maps/risk-matrix.maps';
import {
  formatClassificationDisplayLabel,
  isValidRiskMatrixClassificationAbbreviationFormat,
  normalizeRiskMatrixClassificationAbbreviation,
  sanitizeRiskMatrixClassificationAbbreviationInput,
} from '../utils/risk-matrix-classification-abbreviation.util';
import { getRiskMatrixApiErrorMessage } from '../utils/risk-matrix-error.util';
import {
  hasCustomAxisLevelColorOverride,
  resetCustomAxisLevelColors,
  resolveEffectiveCustomAxisLevelColors,
  setCustomAxisLevelColor,
  toCustomAxisLevelColorByValue,
} from '../utils/custom-axis-level-colors.util';
import {
  canAttemptPublishRiskMatrixVersion,
  copyAxisLevelCriterionToOtherCoverages,
  getAxisLevelsByAxis,
  hasFilledCriteriaForCoverage,
  hydrateEditorState,
  isClassificationUsedInCells,
  isEditorStateDirty,
  moveClassification,
  paintEditorCell,
  shouldShowRiskMatrixPublishActions,
  tryRemoveClassification,
  trySetClassificationCount,
  toggleCoverage,
  updateAxisLevel,
  updateAxisLevelCriterion,
  validateEditorState,
  isCompatibilityBandUsedByOther,
  setClassificationCompatibilityBands,
  toReplaceDraftPayload,
  type RiskMatrixEditorState,
} from '../utils/risk-matrix-editor-state.util';
import { getRiskMatricesPath } from '../utils/risk-matrix-paths.util';
import { RiskMatrixColorInput } from './RiskMatrixColorInput';
import { RiskMatrixGridEditor } from './RiskMatrixGridEditor';

type RiskMatrixEditorPageContentProps = {
  companyId: string;
  matrixId: string;
  versionId: string;
};

export const RiskMatrixEditorPageContent: FC<
  RiskMatrixEditorPageContentProps
> = ({ companyId, matrixId, versionId }) => {
  const router = useRouter();
  const { preventDiscardIf, preventWarn } = usePreventAction();
  const { showSnackBar } = useSystemSnackbar();
  const { showConfirmation } = useConfirmationModal();
  const hydratedKeyRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const publishingRef = useRef(false);
  const [editor, setEditor] = useState<RiskMatrixEditorState | null>(null);
  const [baseline, setBaseline] = useState<RiskMatrixEditorState | null>(null);
  const [selectedClassificationKey, setSelectedClassificationKey] = useState<
    string | null
  >(null);

  const {
    data: matrix,
    isLoading: isLoadingMatrix,
    isError: isMatrixError,
    error: matrixError,
  } = useFetchReadRiskMatrix({ companyId, matrixId });
  const {
    data: version,
    isLoading: isLoadingVersion,
    isError: isVersionError,
    error: versionError,
  } = useFetchReadRiskMatrixVersion({ companyId, matrixId, versionId });
  const systemPresentation = useSystemRiskMatrixPresentation();
  const replaceDraftMutation = useMutateReplaceRiskMatrixDraft({
    companyId,
    matrixId,
    versionId,
  });
  const publishMutation = useMutatePublishRiskMatrixVersion({
    companyId,
    matrixId,
    versionId,
  });

  useEffect(() => {
    if (!version) return;
    if (isLoadingMatrix) return;
    const hydrateKey = `${version.matrixId}:${version.id}:${version.status}`;
    if (hydratedKeyRef.current === hydrateKey) return;

    const next = hydrateEditorState(version, matrix);
    setEditor(next);
    setBaseline(next);
    setSelectedClassificationKey(null);
    hydratedKeyRef.current = hydrateKey;
  }, [version, matrix, isLoadingMatrix]);

  const readOnly =
    version?.status === CompanyRiskMatrixVersionStatusEnum.PUBLISHED ||
    matrix?.status === CompanyRiskMatrixStatusEnum.ARCHIVED;
  const dirty = Boolean(editor && baseline && isEditorStateDirty(editor, baseline));
  const validation = editor ? validateEditorState(editor) : null;

  const severityLevels = useMemo(
    () => (editor ? getAxisLevelsByAxis(editor.axisLevels, RiskMatrixAxisEnum.SEVERITY) : []),
    [editor],
  );
  const probabilityLevels = useMemo(
    () =>
      editor
        ? getAxisLevelsByAxis(editor.axisLevels, RiskMatrixAxisEnum.PROBABILITY)
        : [],
    [editor],
  );
  const usesOwnAxisPalette = hasCustomAxisLevelColorOverride(
    editor?.axisLevelColors,
  );
  const effectiveAxisLevelColors = resolveEffectiveCustomAxisLevelColors({
    stored: editor?.axisLevelColors,
    systemFallback: systemPresentation?.axisLevelColors,
  });
  const axisLevelColorByValue = toCustomAxisLevelColorByValue(
    effectiveAxisLevelColors,
  );

  const handleBack = () => {
    const goBack = () => router.push(getRiskMatricesPath(companyId));
    if (dirty && !readOnly) {
      preventDiscardIf(true, goBack, {
        title: 'Sair sem salvar?',
        text: 'As alterações desta etapa ainda não foram salvas.',
        confirmText: 'Sair sem salvar',
      });
      return;
    }
    goBack();
  };

  const isBusy =
    replaceDraftMutation.isPending || publishMutation.isPending;

  const handleSaveDraft = async () => {
    if (
      !editor ||
      readOnly ||
      savingRef.current ||
      publishingRef.current ||
      isBusy
    ) {
      return;
    }

    if (!editor.name.trim()) {
      showSnackBar('Nome da matriz é obrigatório', { type: 'error' });
      return;
    }

    const draftValidation = validateEditorState(editor);
    if (
      draftValidation.missingClassificationAbbreviations ||
      draftValidation.invalidClassificationAbbreviations ||
      draftValidation.duplicateClassificationAbbreviations.length > 0
    ) {
      showSnackBar(
        draftValidation.messages.find(
          (message) =>
            message.toLowerCase().includes('sigla') ||
            message.toLowerCase().includes('siglas'),
        ) || 'Corrija as siglas das classificações antes de salvar.',
        { type: 'error' },
      );
      return;
    }

    savingRef.current = true;
    try {
      const payload = toReplaceDraftPayload(editor);
      const saved = await replaceDraftMutation.mutateAsync(payload);
      const next = hydrateEditorState(saved, {
        name: payload.name,
        description: payload.description,
      });
      setEditor(next);
      setBaseline(next);
    } catch (error) {
      showSnackBar(
        getRiskMatrixApiErrorMessage(error, 'Não foi possível salvar o rascunho.'),
        { type: 'error' },
      );
    } finally {
      savingRef.current = false;
    }
  };

  const handlePublishVersion = async () => {
    if (
      !version ||
      readOnly ||
      savingRef.current ||
      publishingRef.current ||
      isBusy
    ) {
      return;
    }

    if (!canAttemptPublishRiskMatrixVersion({
      status: version.status,
      dirty,
      readOnly,
    })) {
      if (dirty) {
        showSnackBar(RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE, {
          type: 'error',
        });
      }
      return;
    }

    const confirmed = await showConfirmation({
      title: RISK_MATRIX_PUBLISH_CONFIRMATION.title,
      message: RISK_MATRIX_PUBLISH_CONFIRMATION.message,
      confirmText: RISK_MATRIX_PUBLISH_CONFIRMATION.confirmText,
      cancelText: RISK_MATRIX_PUBLISH_CONFIRMATION.cancelText,
      variant: 'warning',
    });
    if (!confirmed) return;

    publishingRef.current = true;
    try {
      const published = await publishMutation.mutateAsync();
      const next = hydrateEditorState(published);
      setEditor(next);
      setBaseline(next);
    } catch (error) {
      showSnackBar(
        getRiskMatrixApiErrorMessage(
          error,
          'Não foi possível publicar a versão.',
        ),
        { type: 'error' },
      );
    } finally {
      publishingRef.current = false;
    }
  };

  const updateEditor = (updater: (current: RiskMatrixEditorState) => RiskMatrixEditorState) => {
    if (readOnly) return;
    setEditor((current) => (current ? updater(current) : current));
  };

  const applyCoverageToggle = (coverage: RiskMatrixCoverageKeyEnum) => {
    updateEditor((current) => ({
      ...current,
      coverages: toggleCoverage(current.coverages, coverage),
    }));
  };

  const handleCoverageToggle = (coverage: RiskMatrixCoverageKeyEnum) => {
    if (!editor) return;
    const isRemoving = editor.coverages.includes(coverage);
    if (isRemoving && hasFilledCriteriaForCoverage(editor.axisLevels, coverage)) {
      preventWarn(
        'Os critérios desta cobertura deixarão de fazer parte da configuração salva. Enquanto esta tela estiver aberta, os textos permanecem disponíveis se você remarcar a cobertura.',
        () => applyCoverageToggle(coverage),
        {
          title: 'Remover cobertura?',
          confirmText: 'Remover cobertura',
        },
      );
      return;
    }
    applyCoverageToggle(coverage);
  };

  if (isVersionError) {
    return (
      <Alert severity="error">
        {getRiskMatrixApiErrorMessage(
          versionError,
          'Não foi possível carregar a versão da matriz.',
        )}
      </Alert>
    );
  }

  if (isLoadingVersion || isLoadingMatrix || !version || !editor) {
    return (
      <Box display="flex" alignItems="center" gap={2} py={4}>
        <CircularProgress size={22} />
        <Typography variant="body2" color="text.secondary">
          Carregando versão da matriz…
        </Typography>
      </Box>
    );
  }

  const classificationCount = editor.classifications.length === 5 ? 5 : 4;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        flexWrap="wrap"
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            {(!readOnly && editor?.name.trim()) ||
              matrix?.name ||
              version.nameSnapshot ||
              'Editor da matriz'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(!readOnly && editor
              ? editor.description.trim()
              : matrix?.description?.trim()) || 'Sem descrição'}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
            {matrix && (
              <Chip
                size="small"
                color={
                  matrix.status === CompanyRiskMatrixStatusEnum.ACTIVE
                    ? 'success'
                    : 'default'
                }
                label={RISK_MATRIX_STATUS_LABELS[matrix.status]}
              />
            )}
            <Chip
              size="small"
              color={
                version.status === CompanyRiskMatrixVersionStatusEnum.DRAFT
                  ? 'warning'
                  : version.status ===
                      CompanyRiskMatrixVersionStatusEnum.PUBLISHED
                    ? 'success'
                    : 'default'
              }
              label={`${RISK_MATRIX_VERSION_STATUS_LABELS[version.status]} v${version.versionNumber}`}
            />
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {shouldShowRiskMatrixPublishActions({
            status: version.status,
            readOnly,
          }) && (
            <>
              <SButton
                text={
                  replaceDraftMutation.isPending
                    ? 'Salvando rascunho...'
                    : 'Salvar rascunho'
                }
                onClick={handleSaveDraft}
                color={getSaveActionV2Color(dirty)}
                variant="contained"
                size="m"
                loading={replaceDraftMutation.isPending}
                disabled={isBusy}
              />
              <SButton
                text={
                  publishMutation.isPending
                    ? 'Publicando versão...'
                    : 'Publicar versão'
                }
                onClick={handlePublishVersion}
                color="primary"
                variant="contained"
                size="m"
                loading={publishMutation.isPending}
                disabled={isBusy}
                tooltip={
                  dirty ? RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE : undefined
                }
              />
            </>
          )}
          <Button variant="outlined" onClick={handleBack}>
            Voltar para o catálogo
          </Button>
        </Box>
      </Box>

      {isMatrixError && (
        <Alert severity="warning">
          {getRiskMatrixApiErrorMessage(
            matrixError,
            'A identidade da matriz não pôde ser carregada. A versão continua disponível para configuração.',
          )}
        </Alert>
      )}

      {dirty && !readOnly && (
        <Alert severity="warning">
          Há alterações não salvas. Não há autosave.
        </Alert>
      )}

      {readOnly && (
        <Alert severity="info">
          {version.status === CompanyRiskMatrixVersionStatusEnum.PUBLISHED
            ? 'Esta versão está publicada e somente leitura. A metodologia permanece visível para consulta e não pode ser editada. Correções exigem uma nova versão.'
            : 'Esta versão está somente leitura. Correções exigem uma nova versão.'}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nome da matriz
        </Typography>
        <TextField
          fullWidth
          required
          value={editor.name}
          onChange={(event) =>
            setEditor({ ...editor, name: event.target.value })
          }
          disabled={readOnly || isBusy}
          inputProps={{ maxLength: 255 }}
        />
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Descrição
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={editor.description}
          onChange={(event) =>
            setEditor({ ...editor, description: event.target.value })
          }
          disabled={readOnly || isBusy}
          inputProps={{ maxLength: 2000 }}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Coberturas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Classes metodológicas cobertas por esta versão. Isso não disponibiliza
          a matriz em estabelecimentos.
        </Typography>
        <FormGroup row>
          {RISK_MATRIX_COVERAGE_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  disabled={readOnly}
                  checked={editor.coverages.includes(option.value)}
                  onChange={() => handleCoverageToggle(option.value)}
                />
              }
              label={`${option.code} — ${option.title}`}
            />
          ))}
        </FormGroup>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Matriz
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cada célula é uma combinação de Severidade × Probabilidade. O nome do
          eixo é o nível metodológico; o critério só descreve esse nível. A
          classificação final é pintada na interseção e não é calculada.
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 360 }} disabled={readOnly}>
          <InputLabel>Orientação da matriz</InputLabel>
          <Select
            label="Orientação da matriz"
            value={editor.gridOrientation}
            onChange={(event) => {
              const next = event.target.value as RiskMatrixGridOrientationEnum;
              updateEditor((current) => ({
                ...current,
                gridOrientation: next,
              }));
            }}
          >
            {RISK_MATRIX_ORIENTATION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 260 }} disabled={readOnly}>
          <InputLabel>Direção do eixo vertical</InputLabel>
          <Select
            label="Direção do eixo vertical"
            value={editor.yAxisDirection}
            onChange={(event) => {
              const next = event.target.value as RiskMatrixYAxisDirectionEnum;
              updateEditor((current) => ({
                ...current,
                yAxisDirection: next,
              }));
            }}
          >
            {RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {editor.classifications.map((classification) => {
            const selected = selectedClassificationKey === classification.key;
            return (
              <Chip
                key={classification.key}
                clickable={!readOnly}
                disabled={readOnly}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() =>
                  setSelectedClassificationKey((current) =>
                    current === classification.key ? null : classification.key,
                  )
                }
                label={
                  selected
                    ? `Pincel: ${formatClassificationDisplayLabel({
                        label: classification.label,
                        abbreviation: classification.abbreviation,
                      })}`
                    : formatClassificationDisplayLabel({
                        label: classification.label,
                        abbreviation: classification.abbreviation,
                      })
                }
                sx={{
                  bgcolor: selected
                    ? classification.color || undefined
                    : 'transparent',
                  borderColor: classification.color || undefined,
                  color: selected && classification.color
                    ? undefined
                    : 'text.primary',
                }}
              />
            );
          })}
        </Box>
        {!selectedClassificationKey && !readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selecione uma classificação acima e clique nas células para pintar.
            Clique de novo na mesma classificação para limpar a célula.
          </Alert>
        )}
        <RiskMatrixGridEditor
          orientation={editor.gridOrientation}
          yAxisDirection={editor.yAxisDirection}
          selectedCoverages={editor.coverages}
          severityLevels={severityLevels}
          probabilityLevels={probabilityLevels}
          classifications={editor.classifications}
          cells={editor.cells}
          selectedClassificationKey={selectedClassificationKey}
          disabled={readOnly}
          axisLevelColorByValue={axisLevelColorByValue}
          onChangeLabel={(axis, value, label) =>
            updateEditor((current) => ({
              ...current,
              axisLevels: updateAxisLevel(current.axisLevels, axis, value, { label }),
            }))
          }
          onChangeCriterion={(axis, value, coverage, criterion) =>
            updateEditor((current) => ({
              ...current,
              axisLevels: updateAxisLevelCriterion(
                current.axisLevels,
                axis,
                value,
                coverage,
                criterion,
              ),
            }))
          }
          onCopyCriterionToOtherCoverages={(axis, value, sourceCoverage) =>
            updateEditor((current) => ({
              ...current,
              axisLevels: copyAxisLevelCriterionToOtherCoverages(
                current.axisLevels,
                axis,
                value,
                sourceCoverage,
                current.coverages,
              ),
            }))
          }
          onPaintCell={(coordinate) => {
            if (!selectedClassificationKey) {
              showSnackBar('Selecione uma classificação para pintar a matriz.', {
                type: 'error',
              });
              return;
            }
            updateEditor((current) => ({
              ...current,
              cells: paintEditorCell(
                current.cells,
                current.axisLevels,
                coordinate,
                selectedClassificationKey,
              ),
            }));
          }}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
          mb={2}
        >
          <Box>
            <Typography variant="subtitle1">
              Cores de Severidade e Probabilidade
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uma única cor por nível, compartilhada pelos eixos. S1 = P1, S2 =
              P2, S3 = P3, S4 = P4 e S5 = P5. Independente das cores das
              classificações finais.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {usesOwnAxisPalette
                ? 'Esta versão tem paleta própria.'
                : 'Usando paleta padrão SimpleSST vigente.'}
            </Typography>
          </Box>
          {usesOwnAxisPalette && !readOnly && (
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                updateEditor((current) => ({
                  ...current,
                  axisLevelColors: resetCustomAxisLevelColors(),
                }))
              }
            >
              Usar paleta padrão SimpleSST
            </Button>
          )}
        </Box>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {effectiveAxisLevelColors.map((item) => (
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
                disabled={readOnly || effectiveAxisLevelColors.length !== 5}
                onChange={(color) =>
                  updateEditor((current) => ({
                    ...current,
                    axisLevelColors: setCustomAxisLevelColor(
                      current.axisLevelColors,
                      systemPresentation?.axisLevelColors,
                      item.value,
                      color,
                    ),
                  }))
                }
              />
            </Box>
          ))}
          {effectiveAxisLevelColors.length !== 5 && (
            <Typography variant="body2" color="text.secondary">
              A paleta padrão SimpleSST ainda não está disponível para este
              contexto. As cores dos eixos ficam no fallback visual até o
              carregamento.
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          mb={2}
        >
          <Box>
            <Typography variant="subtitle1">Classificações finais</Typography>
            <Typography variant="body2" color="text.secondary">
              Nome, cor e compatibilidade SimpleSST ficam fora da grade. A
              compatibilidade é ponte com a escala 1 a 5, não o cálculo desta
              matriz.
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={readOnly}>
            <InputLabel>Quantidade</InputLabel>
            <Select
              label="Quantidade"
              value={classificationCount}
              onChange={(event) => {
                const count = Number(event.target.value) === 5 ? 5 : 4;
                updateEditor((current) => {
                  const result = trySetClassificationCount(
                    current.classifications,
                    current.cells,
                    count,
                  );
                  if (!result.ok) {
                    showSnackBar(result.reason, { type: 'error' });
                    return current;
                  }
                  return { ...current, classifications: result.classifications };
                });
              }}
            >
              <MenuItem value={4}>4 classificações</MenuItem>
              <MenuItem value={5}>5 classificações</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {editor.classifications.map((classification, index) => {
            const used = isClassificationUsedInCells(
              editor.cells,
              classification.key,
            );

            return (
              <Paper key={classification.key} variant="outlined" sx={{ p: 2 }}>
                <Box
                  display="flex"
                  gap={2}
                  flexWrap="wrap"
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 36,
                      borderRadius: 0.5,
                      bgcolor: classification.color || 'grey.300',
                      flexShrink: 0,
                    }}
                  />
                  <TextField
                    required
                    size="small"
                    label="Nome"
                    placeholder="Nome da classificação"
                    value={classification.label}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateEditor((current) => ({
                        ...current,
                        classifications: current.classifications.map((item) =>
                          item.key === classification.key
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      }))
                    }
                    sx={{ minWidth: 220, flex: 1 }}
                  />
                  <TextField
                    required
                    size="small"
                    label="Sigla"
                    placeholder="Ex.: DA"
                    value={classification.abbreviation}
                    disabled={readOnly}
                    helperText={
                      readOnly
                        ? undefined
                        : '1–4 caracteres A-Z / 0–9. Única nesta versão.'
                    }
                    inputProps={{
                      maxLength: 4,
                      style: { textTransform: 'uppercase' },
                      'aria-label': `Sigla da classificação ${classification.key}`,
                    }}
                    onChange={(event) =>
                      updateEditor((current) => ({
                        ...current,
                        classifications: current.classifications.map((item) =>
                          item.key === classification.key
                            ? {
                                ...item,
                                abbreviation:
                                  sanitizeRiskMatrixClassificationAbbreviationInput(
                                    event.target.value,
                                  ),
                              }
                            : item,
                        ),
                      }))
                    }
                    error={
                      !readOnly &&
                      Boolean(validation) &&
                      (validation!.duplicateClassificationAbbreviations.includes(
                        normalizeRiskMatrixClassificationAbbreviation(
                          classification.abbreviation,
                        ),
                      ) ||
                        (Boolean(
                          normalizeRiskMatrixClassificationAbbreviation(
                            classification.abbreviation,
                          ),
                        ) &&
                          !isValidRiskMatrixClassificationAbbreviationFormat(
                            normalizeRiskMatrixClassificationAbbreviation(
                              classification.abbreviation,
                            ),
                          )) ||
                        (!normalizeRiskMatrixClassificationAbbreviation(
                          classification.abbreviation,
                        ) &&
                          validation!.missingClassificationAbbreviations))
                    }
                    sx={{ width: 120, flexShrink: 0 }}
                  />
                  <RiskMatrixColorInput
                    value={classification.color}
                    disabled={readOnly}
                    onChange={(color) =>
                      updateEditor((current) => ({
                        ...current,
                        classifications: current.classifications.map((item) =>
                          item.key === classification.key
                            ? { ...item, color }
                            : item,
                        ),
                      }))
                    }
                  />
                  <Box display="flex" alignItems="center" gap={0.5}>
                  {readOnly ? (
                    <Typography variant="body2" sx={{ minWidth: 320 }}>
                      Compatibilidade SimpleSST:{' '}
                      {classification.compatibilityBands.length > 0
                        ? classification.compatibilityBands.join(', ')
                        : '—'}
                    </Typography>
                  ) : (
                  <FormControl size="small" sx={{ minWidth: 320 }}>
                    <InputLabel>Compatibilidade SimpleSST</InputLabel>
                    <Select
                      multiple
                      label="Compatibilidade SimpleSST"
                      value={classification.compatibilityBands}
                      onChange={(event) => {
                        const raw = event.target.value;
                        const selected = (
                          Array.isArray(raw) ? raw : [raw]
                        ).map(Number);
                        updateEditor((current) => ({
                          ...current,
                          classifications: setClassificationCompatibilityBands(
                            current.classifications,
                            classification.key,
                            selected,
                          ),
                        }));
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as number[]).map((band) => {
                            const option =
                              RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS.find(
                                (item) => item.value === Number(band),
                              );
                            return (
                              <Chip
                                key={band}
                                size="small"
                                label={option?.label ?? String(band)}
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS.map((option) => {
                        const usedByOther = isCompatibilityBandUsedByOther(
                          editor.classifications,
                          classification.key,
                          option.value,
                        );
                        return (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                            disabled={usedByOther}
                          >
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  )}
                  <Tooltip title={RISK_MATRIX_SIMPLE_SST_HELP}>
                    <HelpOutlineIcon
                      fontSize="small"
                      color="action"
                      aria-label="Ajuda sobre compatibilidade SimpleSST"
                    />
                  </Tooltip>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      disabled={readOnly || index === 0}
                      onClick={() =>
                        updateEditor((current) => ({
                          ...current,
                          classifications: moveClassification(
                            current.classifications,
                            classification.key,
                            'up',
                          ),
                        }))
                      }
                    >
                      Subir
                    </Button>
                    <Button
                      size="small"
                      disabled={
                        readOnly || index === editor.classifications.length - 1
                      }
                      onClick={() =>
                        updateEditor((current) => ({
                          ...current,
                          classifications: moveClassification(
                            current.classifications,
                            classification.key,
                            'down',
                          ),
                        }))
                      }
                    >
                      Descer
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={readOnly || editor.classifications.length <= 4}
                      onClick={() =>
                        updateEditor((current) => {
                          const result = tryRemoveClassification(
                            current.classifications,
                            current.cells,
                            classification.key,
                          );
                          if (!result.ok) {
                            showSnackBar(result.reason, { type: 'error' });
                            return current;
                          }
                          if (selectedClassificationKey === classification.key) {
                            setSelectedClassificationKey(null);
                          }
                          return { ...current, classifications: result.classifications };
                        })
                      }
                    >
                      Remover
                    </Button>
                  </Box>
                </Box>
                {used && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Em uso na matriz. Despinte as células antes de remover.
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Situação da configuração
        </Typography>
        {validation && !validation.distributionComplete && !readOnly && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {validation.messages.join(' ')}
          </Alert>
        )}
        {validation?.distributionComplete && dirty && !readOnly && (
          <Alert severity="info">
            Configuração estrutural e distribuição da matriz concluídas. Salve o
            rascunho antes de publicar.
          </Alert>
        )}
        {validation?.distributionComplete && !dirty && !readOnly && (
          <Alert severity="info">
            Configuração persistida pronta para publicação. A API valida a
            metodologia no momento de publicar. A publicação não disponibiliza
            a matriz em estabelecimentos.
          </Alert>
        )}
        {readOnly &&
          version.status === CompanyRiskMatrixVersionStatusEnum.PUBLISHED && (
          <Alert severity="info">
            Versão publicada. Grade, classificações, critérios e demais dados
            permanecem visíveis em consulta.
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          A publicação congela a metodologia desta versão. Ela não disponibiliza
          a matriz em estabelecimentos e não altera avaliações existentes.
        </Typography>
      </Paper>
    </Box>
  );
};
