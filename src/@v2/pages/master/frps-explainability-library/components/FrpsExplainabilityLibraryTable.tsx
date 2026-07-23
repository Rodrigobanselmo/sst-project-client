import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { getFrpsLibraryRowActions } from '@v2/services/forms/frps-explainability-library';

import {
  FRPS_GLOBAL_COMPANY_DISPLAY_NAME,
  FRPS_GLOBAL_ORIGIN_DISPLAY_NAME,
} from '../frps-catalog-admin-equivalence.util';
import type { FrpsLibraryTableRow } from '../frps-explainability-library-filters.util';
import { resolveFrpsLibraryCanonicalLinkAction } from '../frps-catalog-admin-equivalence.util';
import {
  FRPS_ALIAS_NAME_INDENT_PX,
  FRPS_CANONICAL_CHIP_SX,
  FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL,
  FRPS_LIBRARY_STICKY_TABLE_HEAD_SX,
  FRPS_LIBRARY_TABLE_CONTAINER_SX,
  FRPS_SEARCH_CANONICAL_ACTION_LABEL,
} from '../frps-explainability-library-ux.constants';
import {
  resolveFrpsLibraryExplanationChipProps,
  resolveFrpsLibraryOriginChipProps,
  resolveFrpsLibraryViewButtonVariant,
} from '../frps-library-row-visual.util';
import { FRPS_UNLINK_CANONICAL_ACTION_LABEL } from '../frps-library-unlink-canonical.util';
import {
  buildFrpsAliasGroupToggleLabel,
  isFrpsLibraryAliasSelectable,
} from '../frps-library-table-visibility.util';

/** Nome com no máx. 3 linhas; tooltip só quando truncado. */
function FrpsLibraryClampedName({
  name,
  fontWeight,
}: {
  name: string;
  fontWeight: number;
}) {
  const textRef = useRef<HTMLElement | null>(null);
  const [truncated, setTruncated] = useState(false);

  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [name, measure]);

  const text = (
    <Typography
      ref={textRef}
      variant="body2"
      fontWeight={fontWeight}
      onMouseEnter={measure}
      sx={{
        flex: 1,
        minWidth: 0,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
      }}
    >
      {name}
    </Typography>
  );

  if (!truncated) {
    return text;
  }

  return (
    <Tooltip title={name} placement="top-start" enterDelay={400}>
      <Box component="span" sx={{ flex: 1, minWidth: 0, display: 'block' }}>
        {text}
      </Box>
    </Tooltip>
  );
}

export function FrpsExplainabilityLibraryTable({
  rows,
  expandedCanonicalIds,
  onToggleCanonicalGroup,
  generatingRowId,
  selectedLocalIds,
  isMaster,
  onToggleLocal,
  onGenerate,
  onView,
  onOpenCanonicalPicker,
  onUnlinkFromCanonical,
}: {
  rows: FrpsLibraryTableRow[];
  expandedCanonicalIds: ReadonlySet<string>;
  onToggleCanonicalGroup: (canonicalId: string) => void;
  generatingRowId: string | null;
  selectedLocalIds: Set<string>;
  isMaster: boolean;
  onToggleLocal: (row: FrpsLibraryTableRow) => void;
  onGenerate: (row: FrpsLibraryTableRow) => void;
  onView: (row: FrpsLibraryTableRow) => void;
  onOpenCanonicalPicker: (
    row: FrpsLibraryTableRow,
    options: { preferManualPicker: boolean },
  ) => void;
  onUnlinkFromCanonical: (row: FrpsLibraryTableRow) => void;
}) {
  if (!rows.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Nenhum item encontrado para o recorte atual.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={FRPS_LIBRARY_TABLE_CONTAINER_SX}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              padding="checkbox"
              width={48}
              sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}
            />
            <TableCell sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>Nome</TableCell>
            <TableCell width={120} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Tipo
            </TableCell>
            <TableCell sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Fator de risco
            </TableCell>
            <TableCell width={90} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Origem
            </TableCell>
            <TableCell width={160} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Empresa
            </TableCell>
            <TableCell width={140} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Explicação
            </TableCell>
            <TableCell width={220} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Equivalência
            </TableCell>
            <TableCell width={150} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Candidato global
            </TableCell>
            <TableCell
              width={200}
              align="right"
              sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const actions = getFrpsLibraryRowActions({
              status: row.status,
              conceptualExplanationId: row.conceptualExplanationId,
              generateable: row.generateable,
              hasActiveEquivalence: row.hasActiveEquivalence,
              isMaster,
            });
            const isGenerating = generatingRowId === row.id;
            const selectable = isFrpsLibraryAliasSelectable(row);
            const indentAlias = row.isAliasRow;
            const isGroupExpanded = expandedCanonicalIds.has(row.catalogId);
            const showGroupToggle = row.isCanonical && row.aliasCount > 0;
            const canonicalLinkAction = resolveFrpsLibraryCanonicalLinkAction({
              origin: row.origin,
              hasActiveEquivalence: row.hasActiveEquivalence,
              hintStatus: row.globalCandidateHint.status,
            });
            const explanationChip = resolveFrpsLibraryExplanationChipProps(row);

            return (
              <TableRow
                key={row.id}
                hover
                selected={selectedLocalIds.has(row.catalogId)}
                sx={
                  row.isCanonical
                    ? { bgcolor: 'action.hover' }
                    : row.isOrphanAliasOnPage
                      ? { bgcolor: 'grey.50' }
                      : undefined
                }
              >
                <TableCell padding="checkbox">
                  {selectable ? (
                    <Checkbox
                      size="small"
                      checked={selectedLocalIds.has(row.catalogId)}
                      onChange={() => onToggleLocal(row)}
                      inputProps={{
                        'aria-label': `Selecionar ${row.name}`,
                      }}
                    />
                  ) : null}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      pl: indentAlias ? `${FRPS_ALIAS_NAME_INDENT_PX}px` : 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      gap={0.75}
                      minWidth={0}
                    >
                      {row.isCanonical ? (
                        <Chip
                          size="small"
                          label="Canônico"
                          sx={FRPS_CANONICAL_CHIP_SX}
                        />
                      ) : null}
                      {row.isAliasRow ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Alias"
                          color={row.isOrphanAliasOnPage ? 'warning' : 'default'}
                        />
                      ) : null}
                      <FrpsLibraryClampedName
                        name={row.name}
                        fontWeight={row.isCanonical ? 700 : 500}
                      />
                      {showGroupToggle ? (
                        <Button
                          size="small"
                          variant="text"
                          color="inherit"
                          onClick={() => onToggleCanonicalGroup(row.catalogId)}
                          aria-expanded={isGroupExpanded}
                          aria-label={
                            isGroupExpanded
                              ? `Recolher aliases de ${row.name}`
                              : `Expandir aliases de ${row.name}`
                          }
                          sx={{
                            minWidth: 0,
                            flexShrink: 0,
                            px: 0.75,
                            py: 0,
                            fontWeight: 600,
                            color: 'text.secondary',
                            textTransform: 'none',
                          }}
                        >
                          {buildFrpsAliasGroupToggleLabel({
                            aliasCount: row.aliasCount,
                            expanded: isGroupExpanded,
                          })}
                        </Button>
                      ) : null}
                    </Box>
                    {row.isOrphanAliasOnPage && row.canonicalLabel ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Canônico: {row.canonicalLabel} ·{' '}
                        {FRPS_GLOBAL_ORIGIN_DISPLAY_NAME} /{' '}
                        {FRPS_GLOBAL_COMPANY_DISPLAY_NAME}
                      </Typography>
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>{row.typeLabel}</TableCell>
                <TableCell>{row.riskName}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.originLabel}
                    {...resolveFrpsLibraryOriginChipProps(row.origin)}
                  />
                </TableCell>
                <TableCell>{row.companyName || '—'}</TableCell>
                <TableCell>
                  <Tooltip
                    title={explanationChip.title ?? ''}
                    disableHoverListener={!explanationChip.title}
                  >
                    <Chip
                      size="small"
                      label={row.statusLabel}
                      color={explanationChip.color}
                      variant={explanationChip.variant}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    color={
                      row.isCanonical || row.hasActiveEquivalence
                        ? 'text.primary'
                        : 'text.secondary'
                    }
                    fontWeight={row.isCanonical ? 600 : 400}
                  >
                    {row.equivalenceLabel}
                  </Typography>
                  {row.isOrphanAliasOnPage && row.canonicalLabel ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      ({FRPS_GLOBAL_ORIGIN_DISPLAY_NAME} ·{' '}
                      {FRPS_GLOBAL_COMPANY_DISPLAY_NAME})
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  {canonicalLinkAction ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                      gap={0.5}
                    >
                      {row.globalCandidateHint.status === 'EXACT_MATCH' ? (
                        <Chip
                          size="small"
                          color="success"
                          variant="outlined"
                          label="Correspondência exata"
                          title={
                            row.globalCandidateHint.sampleLabel || undefined
                          }
                        />
                      ) : null}
                      {row.globalCandidateHint.status ===
                      'POSSIBLE_CANDIDATES' ? (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label="Possíveis candidatos"
                          title={
                            row.globalCandidateHint.sampleLabel || undefined
                          }
                        />
                      ) : null}
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          onOpenCanonicalPicker(row, {
                            preferManualPicker: true,
                          })
                        }
                        sx={{
                          minWidth: 0,
                          px: 0.5,
                          py: 0,
                          textTransform: 'none',
                        }}
                      >
                        {canonicalLinkAction === 'SEARCH'
                          ? FRPS_SEARCH_CANONICAL_ACTION_LABEL
                          : FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL}
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={0.75}
                    flexWrap="wrap"
                  >
                    {actions.canView ? (
                      <Button
                        size="small"
                        color="primary"
                        variant={resolveFrpsLibraryViewButtonVariant(row.status)}
                        onClick={() => onView(row)}
                        disabled={isGenerating}
                      >
                        Visualizar
                      </Button>
                    ) : null}
                    {actions.canGenerate && row.origin === 'GLOBAL' ? (
                      <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        onClick={() => onGenerate(row)}
                        disabled={isGenerating || Boolean(generatingRowId)}
                        startIcon={
                          isGenerating ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : undefined
                        }
                      >
                        {isGenerating ? 'Gerando…' : 'Gerar'}
                      </Button>
                    ) : null}
                    {actions.canUnlinkFromCanonical ? (
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        onClick={() => onUnlinkFromCanonical(row)}
                        disabled={isGenerating}
                        sx={{ textTransform: 'none' }}
                      >
                        {FRPS_UNLINK_CANONICAL_ACTION_LABEL}
                      </Button>
                    ) : null}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
