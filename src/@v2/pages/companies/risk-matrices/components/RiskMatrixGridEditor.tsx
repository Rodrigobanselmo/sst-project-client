import { FC, MouseEvent, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import NotesIcon from '@mui/icons-material/Notes';
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixYAxisDirectionEnum,
  RiskMatrixAxisEnum,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { RISK_MATRIX_COVERAGE_OPTIONS } from '../maps/risk-matrix.maps';
import { groupCoverageCriteriaForDisplay } from '../utils/risk-matrix-criteria-display.util';
import type {
  RiskMatrixEditorAxisLevel,
  RiskMatrixEditorCell,
  RiskMatrixEditorClassification,
} from '../utils/risk-matrix-editor-state.util';
import {
  coordinateFromGridPresentation,
  getCellClassificationKey,
  getPresentedGridAxes,
} from '../utils/risk-matrix-editor-state.util';
import { CriterionHierarchyView } from './CriterionHierarchyView';

type RiskMatrixGridEditorProps = {
  orientation: RiskMatrixGridOrientationEnum;
  yAxisDirection: RiskMatrixYAxisDirectionEnum;
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
  undefinedCoverages?: RiskMatrixCoverageKeyEnum[];
  undefinedCoveragesByAxis?: Partial<
    Record<RiskMatrixAxisEnum, RiskMatrixCoverageKeyEnum[]>
  >;
  severityLevels: RiskMatrixEditorAxisLevel[];
  probabilityLevels: RiskMatrixEditorAxisLevel[];
  classifications: RiskMatrixEditorClassification[];
  cells: RiskMatrixEditorCell[];
  selectedClassificationKey: string | null;
  disabled?: boolean;
  onChangeLabel: (
    axis: RiskMatrixEditorAxisLevel['axis'],
    value: number,
    label: string,
  ) => void;
  onChangeCriterion: (
    axis: RiskMatrixEditorAxisLevel['axis'],
    value: number,
    coverage: RiskMatrixCoverageKeyEnum,
    criterion: string,
  ) => void;
  onCopyCriterionToOtherCoverages: (
    axis: RiskMatrixEditorAxisLevel['axis'],
    value: number,
    sourceCoverage: RiskMatrixCoverageKeyEnum,
  ) => void;
  onPaintCell: (coordinate: { severity: number; probability: number }) => void;
};

export const RiskMatrixGridEditor: FC<RiskMatrixGridEditorProps> = ({
  orientation,
  yAxisDirection,
  selectedCoverages,
  undefinedCoverages = [],
  undefinedCoveragesByAxis,
  severityLevels,
  probabilityLevels,
  classifications,
  cells,
  selectedClassificationKey,
  disabled = false,
  onChangeLabel,
  onChangeCriterion,
  onCopyCriterionToOtherCoverages,
  onPaintCell,
}) => {
  const presentation = getPresentedGridAxes({
    severityLevels,
    probabilityLevels,
    orientation,
    yAxisDirection,
  });
  const columns = presentation.xLevels;
  const rows = presentation.yLevels;

  const classificationByKey = new Map(
    classifications.map((item) => [item.key, item]),
  );
  const columnMinWidth = 240;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        display="grid"
        sx={{
          minWidth: 260 + columns.length * columnMinWidth,
          gridTemplateColumns: `minmax(260px, 0.9fr) repeat(${columns.length}, minmax(${columnMinWidth}px, 1fr))`,
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {presentation.yTitle} ↓
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {presentation.xTitle} →
          </Typography>
        </Box>

        {columns.map((level) => (
          <AxisHeader
            key={`x-${level.axis}-${level.value}`}
            title={presentation.xTitle}
            level={level}
            selectedCoverages={selectedCoverages}
            undefinedCoverages={
              undefinedCoveragesByAxis?.[level.axis] ?? undefinedCoverages
            }
            disabled={disabled}
            onChangeLabel={(label) => onChangeLabel(level.axis, level.value, label)}
            onChangeCriterion={(coverage, criterion) =>
              onChangeCriterion(level.axis, level.value, coverage, criterion)
            }
            onCopyCriterionToOtherCoverages={(sourceCoverage) =>
              onCopyCriterionToOtherCoverages(level.axis, level.value, sourceCoverage)
            }
          />
        ))}

        {rows.map((rowLevel) => (
          <Box key={`y-row-${rowLevel.axis}-${rowLevel.value}`} display="contents">
            <AxisHeader
              title={presentation.yTitle}
              level={rowLevel}
              selectedCoverages={selectedCoverages}
              undefinedCoverages={
                undefinedCoveragesByAxis?.[rowLevel.axis] ?? undefinedCoverages
              }
              disabled={disabled}
              onChangeLabel={(label) =>
                onChangeLabel(rowLevel.axis, rowLevel.value, label)
              }
              onChangeCriterion={(coverage, criterion) =>
                onChangeCriterion(rowLevel.axis, rowLevel.value, coverage, criterion)
              }
              onCopyCriterionToOtherCoverages={(sourceCoverage) =>
                onCopyCriterionToOtherCoverages(
                  rowLevel.axis,
                  rowLevel.value,
                  sourceCoverage,
                )
              }
            />
            {columns.map((columnLevel) => {
              const coordinate = coordinateFromGridPresentation(
                orientation,
                columnLevel.value,
                rowLevel.value,
              );
              const classificationKey = getCellClassificationKey(
                cells,
                coordinate.severity,
                coordinate.probability,
              );
              const classification = classificationKey
                ? classificationByKey.get(classificationKey)
                : undefined;
              const selected =
                selectedClassificationKey === classificationKey &&
                Boolean(classificationKey);

              return (
                <Box
                  key={`cell-${coordinate.severity}-${coordinate.probability}`}
                  component="button"
                  type="button"
                  disabled={disabled}
                  onClick={() => onPaintCell(coordinate)}
                  aria-label={`Severidade ${coordinate.severity} × Probabilidade ${coordinate.probability}`}
                  sx={{
                    minHeight: 88,
                    p: 1.25,
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    borderStyle: classification ? 'solid' : 'dashed',
                    bgcolor: classification?.color || 'transparent',
                    color: classification ? contrastText(classification.color) : 'text.secondary',
                    cursor: disabled ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 0.75,
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    S{coordinate.severity} × P{coordinate.probability}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                    {classification
                      ? classification.label.trim() || 'Sem nome'
                      : 'Vazia'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const AxisHeader: FC<{
  title: string;
  level: RiskMatrixEditorAxisLevel;
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
  undefinedCoverages?: RiskMatrixCoverageKeyEnum[];
  disabled?: boolean;
  onChangeLabel: (label: string) => void;
  onChangeCriterion: (
    coverage: RiskMatrixCoverageKeyEnum,
    criterion: string,
  ) => void;
  onCopyCriterionToOtherCoverages: (
    sourceCoverage: RiskMatrixCoverageKeyEnum,
  ) => void;
}> = ({
  title,
  level,
  selectedCoverages,
  undefinedCoverages = [],
  disabled,
  onChangeLabel,
  onChangeCriterion,
  onCopyCriterionToOtherCoverages,
}) => {
  return (
    <Box
      sx={{
        p: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        minWidth: 0,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Box
          sx={{
            minWidth: 24,
            height: 24,
            px: 0.75,
            borderRadius: 1,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {level.value}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <TextField
        fullWidth
        required
        size="small"
        placeholder="Nome metodológico"
        value={level.label}
        disabled={disabled}
        onChange={(event) => onChangeLabel(event.target.value)}
      />
      <Box mt={0.75}>
        <CriteriaEditor
          axisTitle={title}
          levelValue={level.value}
          levelLabel={level.label}
          criteriaByCoverage={level.criteriaByCoverage}
          selectedCoverages={selectedCoverages}
          undefinedCoverages={undefinedCoverages}
          disabled={disabled}
          onChange={onChangeCriterion}
          onCopyToOtherCoverages={onCopyCriterionToOtherCoverages}
        />
      </Box>
    </Box>
  );
};

const CriteriaEditor: FC<{
  axisTitle: string;
  levelValue: number;
  levelLabel: string;
  criteriaByCoverage: Partial<Record<RiskMatrixCoverageKeyEnum, string>>;
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
  undefinedCoverages?: RiskMatrixCoverageKeyEnum[];
  disabled?: boolean;
  onChange: (coverage: RiskMatrixCoverageKeyEnum, value: string) => void;
  onCopyToOtherCoverages: (sourceCoverage: RiskMatrixCoverageKeyEnum) => void;
}> = ({
  axisTitle,
  levelValue,
  levelLabel,
  criteriaByCoverage,
  selectedCoverages,
  undefinedCoverages = [],
  disabled,
  onChange,
  onCopyToOtherCoverages,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const hasCriteria = selectedCoverages.some((coverage) =>
    Boolean(criteriaByCoverage[coverage]?.trim()),
  );
  const coverageOptions = RISK_MATRIX_COVERAGE_OPTIONS.filter((option) =>
    selectedCoverages.includes(option.value),
  );
  const canCopy = coverageOptions.length > 1 && !disabled;
  const triggerLabel = disabled
    ? 'Ver critério'
    : hasCriteria
      ? 'Critério'
      : 'Adicionar critério';

  return (
    <>
      <Tooltip
        title={
          disabled
            ? 'Consultar o critério metodológico deste nível. O critério descreve o eixo, não a classificação da célula.'
            : hasCriteria
              ? 'Editar critério do nível. O critério descreve o eixo para aquela classe de risco, não a classificação da célula.'
              : 'Adicionar critério opcional do nível. Isso não define o resultado da célula.'
        }
      >
        <span>
          <Button
            size="small"
            startIcon={<NotesIcon fontSize="small" />}
            onClick={(event: MouseEvent<HTMLElement>) =>
              setAnchorEl(event.currentTarget)
            }
            aria-label={triggerLabel}
            sx={{ minWidth: 0, px: 0.75, whiteSpace: 'nowrap' }}
          >
            {triggerLabel}
          </Button>
        </span>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 520, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              {axisTitle} {levelValue}
              {levelLabel.trim() ? ` — ${levelLabel.trim()}` : ''}
            </Typography>
            <IconButton size="small" onClick={() => setAnchorEl(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Critério deste nível do eixo, por coverage. Não classifica a
            interseção da matriz.
          </Typography>
          {coverageOptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Selecione ao menos uma cobertura para descrever o critério deste nível.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {(disabled
                ? groupCoverageCriteriaForDisplay({
                    selectedCoverages,
                    criteriaByCoverage,
                    undefinedCoverages,
                    options: RISK_MATRIX_COVERAGE_OPTIONS,
                  })
                : coverageOptions.map((option) => ({
                    key: option.value,
                    coverageKeys: [option.value],
                    label: `${option.code} — ${option.title}`,
                    criterion: criteriaByCoverage[option.value] ?? '',
                    isUndefined: undefinedCoverages.includes(option.value),
                  }))
              ).map((item) => {
                if (item.isUndefined) {
                  return (
                    <Box key={item.key}>
                      <Typography variant="subtitle2">{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Não há critério de {axisTitle.toLowerCase()} publicado
                        para esta coverage.
                      </Typography>
                    </Box>
                  );
                }

                if (disabled) {
                  return (
                    <Box
                      key={item.key}
                      sx={{
                        p: 1.25,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <CriterionHierarchyView criterion={item.criterion} />
                    </Box>
                  );
                }

                const coverage = item.coverageKeys[0];
                const value = item.criterion;
                return (
                  <Box key={item.key}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label={item.label}
                      placeholder="Critério opcional"
                      value={value}
                      onChange={(event) =>
                        onChange(coverage, event.target.value)
                      }
                    />
                    {canCopy && (
                      <Button
                        size="small"
                        sx={{ mt: 0.5 }}
                        onClick={() => onCopyToOtherCoverages(coverage)}
                      >
                        Aplicar às demais coberturas deste nível
                      </Button>
                    )}
                    <Button
                      size="small"
                      sx={{ mt: canCopy ? 0 : 0.5 }}
                      disabled={!value}
                      onClick={() => onChange(coverage, '')}
                    >
                      Remover critério
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

function contrastText(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#111111';
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111111' : '#FFFFFF';
}
