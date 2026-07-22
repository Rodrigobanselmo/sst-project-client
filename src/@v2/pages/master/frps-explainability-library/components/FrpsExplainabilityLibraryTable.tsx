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
  Typography,
} from '@mui/material';
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
  buildFrpsAliasGroupToggleLabel,
  isFrpsLibraryAliasSelectable,
} from '../frps-library-table-visibility.util';

function statusColor(
  status: FrpsLibraryTableRow['status'],
): 'default' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'VALIDATED':
      return 'success';
    case 'DRAFT_AI':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

export function FrpsExplainabilityLibraryTable({
  rows,
  expandedCanonicalIds,
  onToggleCanonicalGroup,
  generatingRowId,
  selectedLocalIds,
  onToggleLocal,
  onGenerate,
  onView,
  onOpenCanonicalPicker,
}: {
  rows: FrpsLibraryTableRow[];
  expandedCanonicalIds: ReadonlySet<string>;
  onToggleCanonicalGroup: (canonicalId: string) => void;
  generatingRowId: string | null;
  selectedLocalIds: Set<string>;
  onToggleLocal: (row: FrpsLibraryTableRow) => void;
  onGenerate: (row: FrpsLibraryTableRow) => void;
  onView: (row: FrpsLibraryTableRow) => void;
  onOpenCanonicalPicker: (
    row: FrpsLibraryTableRow,
    options: { preferManualPicker: boolean },
  ) => void;
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
            <TableCell width={120} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Explicação
            </TableCell>
            <TableCell width={220} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Equivalência
            </TableCell>
            <TableCell width={150} sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}>
              Candidato global
            </TableCell>
            <TableCell
              width={160}
              align="right"
              sx={FRPS_LIBRARY_STICKY_TABLE_HEAD_SX}
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const actions = getFrpsLibraryRowActions(
              row.status,
              row.conceptualExplanationId,
            );
            const isGenerating = generatingRowId === row.id;
            const selectable = isFrpsLibraryAliasSelectable(row);
            const indentAlias = row.isAliasRow;
            const isGroupExpanded = expandedCanonicalIds.has(row.catalogId);
            const showGroupToggle =
              row.isCanonical && row.aliasCount > 0;
            const canonicalLinkAction = resolveFrpsLibraryCanonicalLinkAction({
              origin: row.origin,
              hasActiveEquivalence: row.hasActiveEquivalence,
              hintStatus: row.globalCandidateHint.status,
            });

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
                      pl: indentAlias
                        ? `${FRPS_ALIAS_NAME_INDENT_PX}px`
                        : 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
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
                      <Typography
                        variant="body2"
                        fontWeight={row.isCanonical ? 700 : 500}
                      >
                        {row.name}
                      </Typography>
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
                    color={row.origin === 'GLOBAL' ? 'primary' : 'default'}
                    variant={row.origin === 'GLOBAL' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>{row.companyName || '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.statusLabel}
                    color={statusColor(row.status)}
                    variant={
                      row.status === 'NEVER_GENERATED' ? 'outlined' : 'filled'
                    }
                  />
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
                        variant="outlined"
                        onClick={() => onView(row)}
                        disabled={isGenerating}
                      >
                        Visualizar
                      </Button>
                    ) : null}
                    {actions.canGenerate && row.origin === 'GLOBAL' ? (
                      <Button
                        size="small"
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
