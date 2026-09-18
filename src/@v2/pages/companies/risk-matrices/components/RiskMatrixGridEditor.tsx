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
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { RISK_MATRIX_COVERAGE_OPTIONS } from '../maps/risk-matrix.maps';
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

type RiskMatrixGridEditorProps = {
  orientation: RiskMatrixGridOrientationEnum;
  yAxisDirection: RiskMatrixYAxisDirectionEnum;
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
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
          criteriaByCoverage={level.criteriaByCoverage}
          selectedCoverages={selectedCoverages}
          disabled={disabled}
          onChange={onChangeCriterion}
          onCopyToOtherCoverages={onCopyCriterionToOtherCoverages}
        />
      </Box>
    </Box>
  );
};

const CriteriaEditor: FC<{
  criteriaByCoverage: Partial<Record<RiskMatrixCoverageKeyEnum, string>>;
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
  disabled?: boolean;
  onChange: (coverage: RiskMatrixCoverageKeyEnum, value: string) => void;
  onCopyToOtherCoverages: (sourceCoverage: RiskMatrixCoverageKeyEnum) => void;
}> = ({
  criteriaByCoverage,
  selectedCoverages,
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
  const canCopy = coverageOptions.length > 1;

  return (
    <>
      <Tooltip
        title={
          hasCriteria
            ? 'Editar critério do nível. O critério descreve o eixo para aquela classe de risco, não a classificação da célula.'
            : 'Adicionar critério opcional do nível. Isso não define o resultado da célula.'
        }
      >
        <span>
          <Button
            size="small"
            disabled={disabled}
            startIcon={<NotesIcon fontSize="small" />}
            onClick={(event: MouseEvent<HTMLElement>) =>
              setAnchorEl(event.currentTarget)
            }
            aria-label={hasCriteria ? 'Editar critério' : 'Adicionar critério'}
            sx={{ minWidth: 0, px: 0.75, whiteSpace: 'nowrap' }}
          >
            {hasCriteria ? 'Critério' : 'Adicionar critério'}
          </Button>
        </span>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 360 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Critério do nível</Typography>
            <IconButton size="small" onClick={() => setAnchorEl(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Descreve este nível do eixo para cada classe de risco. Não classifica a
            interseção da matriz.
          </Typography>
          {coverageOptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Selecione ao menos uma cobertura para descrever o critério deste nível.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {coverageOptions.map((option) => {
                const value = criteriaByCoverage[option.value] ?? '';
                return (
                  <Box key={option.value}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label={option.title}
                      placeholder="Critério opcional"
                      value={value}
                      disabled={disabled}
                      onChange={(event) => onChange(option.value, event.target.value)}
                    />
                    {canCopy && (
                      <Button
                        size="small"
                        sx={{ mt: 0.5 }}
                        disabled={disabled}
                        onClick={() => onCopyToOtherCoverages(option.value)}
                      >
                        Aplicar às demais coberturas deste nível
                      </Button>
                    )}
                    <Button
                      size="small"
                      sx={{ mt: canCopy ? 0 : 0.5 }}
                      disabled={disabled || !value}
                      onClick={() => onChange(option.value, '')}
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
