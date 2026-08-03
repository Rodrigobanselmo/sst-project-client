import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { STagButton } from 'components/atoms/STagButton';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { queryClient } from 'core/services/queryClient';
import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useDebouncedCallback } from 'use-debounce';

import {
  browseHierarchySanitization,
  bulkDeleteHierarchySanitization,
  getHierarchySanitizationDetails,
} from './hierarchy-sanitization.api';
import type {
  HierarchySanitizationDetailsResponse,
  HierarchySanitizationItem,
} from './hierarchy-sanitization.types';
import {
  buildSanitizationBulkConfirmMessage,
  buildSingleDeleteConfirmMessage,
  formatDependencySummary,
  formatTypeLabelLines,
  mergeEligibleSelection,
  pruneSelectionAfterReload,
  SANITIZATION_TABLE_COL_WIDTHS as COL_W,
  SANITIZATION_TABLE_LAYOUT as TABLE_LAYOUT,
} from './hierarchy-sanitization.utils';

const modalName = ModalEnum.HIERARCHY_SANITIZATION;

type CategoryFilter = 'ALL' | 'OFFICE' | 'SUB_OFFICE';
type StatusFilter = 'ALL' | 'ELIGIBLE' | 'BLOCKED';

type ConfirmState =
  | { kind: 'single'; row: HierarchySanitizationItem }
  | { kind: 'bulk'; message: string; ids: string[] }
  | null;

export const ModalHierarchySanitization = () => {
  const { registerModal, isOpen } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const { isValidPermissions } = useAccess();
  const { removeNodesFromTree } = useHierarchyTreeActions();
  const canDelete = isValidPermissions([PermissionEnum.EMPLOYEE]);
  const deleteInFlightRef = useRef(false);

  const open = isOpen(modalName);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selected, setSelected] = useState<string[]>([]);
  const [items, setItems] = useState<HierarchySanitizationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    analyzedRoles: 0,
    officeWithoutEmployees: 0,
    developedWithoutUse: 0,
    eligible: 0,
    blocked: 0,
  });
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [details, setDetails] =
    useState<HierarchySanitizationDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, 400);

  const load = useCallback(async () => {
    if (!companyId || !open) return;
    setLoading(true);
    try {
      const result = await browseHierarchySanitization({
        companyId,
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        category,
        status,
      });
      setItems(result.data);
      setTotal(result.total);
      setSummary(result.summary);
      setSelected((prev) => pruneSelectionAfterReload(prev, result.data));
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          'Não foi possível carregar o diagnóstico de sanitização.',
        { variant: 'error' },
      );
    } finally {
      setLoading(false);
    }
  }, [
    category,
    companyId,
    enqueueSnackbar,
    open,
    page,
    rowsPerPage,
    search,
    status,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const eligibleOnPage = useMemo(
    () => items.filter((item) => item.status === 'ELIGIBLE'),
    [items],
  );

  const selectedEligible = selected.filter((id) =>
    eligibleOnPage.some((item) => item.hierarchyId === id),
  );

  const toggleRow = (id: string, eligible: boolean) => {
    if (!eligible || !canDelete) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const togglePageEligible = () => {
    if (!canDelete) return;
    const pageIds = eligibleOnPage.map((i) => i.hierarchyId);
    const allSelected =
      !!pageIds.length && pageIds.every((id) => selected.includes(id));
    setSelected((prev) => mergeEligibleSelection(prev, items, !allSelected));
  };

  const invalidateHierarchy = async (deletedIds: string[]) => {
    if (deletedIds.length) {
      removeNodesFromTree(deletedIds);
    }
    await queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);
    await queryClient.invalidateQueries([QueryEnum.GHO, companyId]);
  };

  const openDetails = async (row: HierarchySanitizationItem) => {
    if (!companyId) return;
    setDetailsLoading(true);
    setDetails(null);
    try {
      const result = await getHierarchySanitizationDetails({
        companyId,
        hierarchyId: row.hierarchyId,
      });
      setDetails(result);
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          'Não foi possível carregar as dependências.',
        { variant: 'error' },
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const executeDelete = async (ids: string[], successLabel: string) => {
    if (!companyId || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    setBusy(true);
    setConfirm(null);
    try {
      const result = await bulkDeleteHierarchySanitization({
        companyId,
        hierarchyIds: ids,
        confirm: true,
      });
      const deletedIds = result.items
        .filter((i) => i.result === 'DELETED')
        .map((i) => i.hierarchyId);

      if (result.deleted > 0) {
        enqueueSnackbar(successLabel, { variant: 'success' });
      } else {
        enqueueSnackbar(
          result.items[0]?.reason || 'Nenhum cargo foi excluído.',
          { variant: 'warning' },
        );
      }

      setSelected((prev) => prev.filter((id) => !deletedIds.includes(id)));
      await invalidateHierarchy(deletedIds);
      await load();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Falha ao excluir cargo(s).',
        { variant: 'error' },
      );
    } finally {
      setBusy(false);
      deleteInFlightRef.current = false;
    }
  };

  const handleDeleteOne = (row: HierarchySanitizationItem) => {
    if (!canDelete || row.status !== 'ELIGIBLE' || busy) return;
    setConfirm({ kind: 'single', row });
  };

  const handleBulkDelete = async () => {
    if (!companyId || !canDelete || !selected.length || busy) return;
    setBusy(true);
    try {
      const preview = await bulkDeleteHierarchySanitization({
        companyId,
        hierarchyIds: selected,
        confirm: false,
      });
      setBusy(false);
      if (!preview.eligible) {
        enqueueSnackbar('Nenhum cargo elegível na seleção atual.', {
          variant: 'warning',
        });
        return;
      }
      setConfirm({
        kind: 'bulk',
        message: buildSanitizationBulkConfirmMessage(preview),
        ids: selected,
      });
    } catch (error: any) {
      setBusy(false);
      enqueueSnackbar(
        error?.response?.data?.message || 'Falha no dry-run de sanitização.',
        { variant: 'error' },
      );
    }
  };

  const confirmMessage =
    confirm?.kind === 'single'
      ? buildSingleDeleteConfirmMessage(confirm.row)
      : confirm?.kind === 'bulk'
        ? confirm.message
        : '';

  return (
    <>
      <SModal
        {...registerModal(modalName)}
        keepMounted={false}
        onClose={() => onCloseModal(modalName)}
      >
        <SModalPaper
          p={8}
          center
          sx={{
            width: 'min(1700px, 96vw)',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <SModalHeader
            tag="edit"
            onClose={() => onCloseModal(modalName)}
            title="Sanitizar organograma — cargos sem utilização"
          />

          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))"
            gap={2}
            mb={4}
            flexShrink={0}
          >
            {[
              ['Analisados', summary.analyzedRoles],
              ['Cargos s/ empregados', summary.officeWithoutEmployees],
              ['Desenvolvidos s/ uso', summary.developedWithoutUse],
              ['Aptos', summary.eligible],
              ['Bloqueados', summary.blocked],
            ].map(([label, value]) => (
              <Box
                key={String(label)}
                sx={{
                  p: 3,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
              >
                <Typography fontSize={12} color="text.secondary">
                  {label}
                </Typography>
                <Typography fontSize={22} fontWeight={700}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            mb={3}
            alignItems="center"
            flexShrink={0}
          >
            <TextField
              size="small"
              label="Buscar"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={category}
                onChange={(e) => {
                  setPage(0);
                  setCategory(e.target.value as CategoryFilter);
                }}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                <MenuItem value="OFFICE">Cargos comuns</MenuItem>
                <MenuItem value="SUB_OFFICE">Cargos desenvolvidos</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Situação</InputLabel>
              <Select
                label="Situação"
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value as StatusFilter);
                }}
              >
                <MenuItem value="ALL">Todas</MenuItem>
                <MenuItem value="ELIGIBLE">Aptos</MenuItem>
                <MenuItem value="BLOCKED">Bloqueados</MenuItem>
              </Select>
            </FormControl>
            <Box flex={1} />
            {canDelete && (
              <STagButton
                large
                text={`Excluir selecionados (${selected.length})`}
                icon={SDeleteIcon}
                bg="error.main"
                active
                disabled={!selected.length || busy || loading}
                loading={busy}
                onClick={() => void handleBulkDelete()}
              />
            )}
          </Box>

          {/* Único container scrollável da tabela (X e Y). */}
          <Box
            sx={{
              flex: 1,
              minHeight: 280,
              maxHeight: '52vh',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              overflowX: 'auto',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pan-y',
              position: 'relative',
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" p={8}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Table
                size="small"
                stickyHeader
                sx={{
                  width: '100%',
                  minWidth: TABLE_LAYOUT.tableMinWidth,
                  tableLayout: 'fixed',
                  borderCollapse: 'separate',
                  '& .MuiTableCell-root': {
                    py: 1,
                    verticalAlign: 'top',
                    overflow: 'hidden',
                  },
                  '& .MuiTableCell-head': {
                    bgcolor: 'background.paper',
                  },
                  '& .col-select': {
                    width: COL_W.selection,
                    maxWidth: TABLE_LAYOUT.selectionMaxPx,
                    px: '4px',
                    boxSizing: 'border-box',
                  },
                  '& .col-name': {
                    width: COL_W.name,
                    pl: `${TABLE_LAYOUT.namePaddingLeftPx}px`,
                    pr: 1,
                    boxSizing: 'border-box',
                  },
                  '& .col-type': {
                    width: COL_W.type,
                    maxWidth: TABLE_LAYOUT.typeMaxPx,
                    px: '4px',
                    boxSizing: 'border-box',
                  },
                  '& .col-path': {
                    width: COL_W.path,
                    px: 1,
                  },
                  '& .col-deps': {
                    width: COL_W.deps,
                    px: 1,
                  },
                  '& .col-status': {
                    width: COL_W.status,
                    px: 0.75,
                  },
                  '& .col-reason': {
                    width: COL_W.reason,
                    px: 1,
                  },
                  '& .col-actions': {
                    width: COL_W.actions,
                    px: 0.5,
                  },
                }}
              >
                <colgroup>
                  <col style={{ width: COL_W.selection }} />
                  <col style={{ width: COL_W.name }} />
                  <col style={{ width: COL_W.type }} />
                  <col style={{ width: COL_W.path }} />
                  <col style={{ width: COL_W.deps }} />
                  <col style={{ width: COL_W.status }} />
                  <col style={{ width: COL_W.reason }} />
                  <col style={{ width: COL_W.actions }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell className="col-select">
                      <Checkbox
                        size="small"
                        checked={
                          !!eligibleOnPage.length &&
                          eligibleOnPage.every((i) =>
                            selected.includes(i.hierarchyId),
                          )
                        }
                        indeterminate={
                          selectedEligible.length > 0 &&
                          selectedEligible.length < eligibleOnPage.length
                        }
                        onChange={togglePageEligible}
                        disabled={!canDelete || !eligibleOnPage.length}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>
                    <TableCell className="col-name">Nome</TableCell>
                    <TableCell className="col-type">Tipo</TableCell>
                    <TableCell className="col-path">Caminho</TableCell>
                    <TableCell className="col-deps">Dependências</TableCell>
                    <TableCell className="col-status">Situação</TableCell>
                    <TableCell className="col-reason">Motivo</TableCell>
                    <TableCell className="col-actions" align="right">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => {
                    const eligible = row.status === 'ELIGIBLE';
                    const typeLines = formatTypeLabelLines(row.type);
                    return (
                      <TableRow key={row.hierarchyId} hover>
                        <TableCell className="col-select">
                          <Checkbox
                            size="small"
                            checked={selected.includes(row.hierarchyId)}
                            disabled={!canDelete || !eligible}
                            onChange={() =>
                              toggleRow(row.hierarchyId, eligible)
                            }
                            sx={{ p: 0.5 }}
                          />
                        </TableCell>
                        <TableCell className="col-name">
                          <Tooltip title={row.name}>
                            <Typography fontSize={13} noWrap>
                              {row.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="col-type">
                          <Typography
                            component="div"
                            fontSize={11}
                            lineHeight={1.15}
                            sx={{
                              width: '100%',
                              maxWidth: TABLE_LAYOUT.typeMaxPx,
                              whiteSpace: 'normal',
                              wordBreak: 'normal',
                              overflowWrap: 'normal',
                            }}
                          >
                            {typeLines.map((line, idx) => (
                              <React.Fragment key={line}>
                                {idx > 0 ? <br /> : null}
                                {line}
                              </React.Fragment>
                            ))}
                          </Typography>
                        </TableCell>
                        <TableCell className="col-path">
                          <Tooltip title={row.path}>
                            <Typography
                              fontSize={12}
                              noWrap
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {row.path}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="col-deps">
                          <Typography
                            fontSize={11}
                            sx={{
                              fontVariantNumeric: 'tabular-nums',
                              lineHeight: 1.3,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatDependencySummary(row)}
                          </Typography>
                        </TableCell>
                        <TableCell className="col-status">
                          <Chip
                            size="small"
                            label={eligible ? 'Apto' : 'Bloqueado'}
                            color={eligible ? 'success' : 'warning'}
                            sx={{ maxWidth: '100%', height: 22, fontSize: 11 }}
                          />
                        </TableCell>
                        <TableCell className="col-reason">
                          <Typography
                            fontSize={12}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.5,
                            }}
                          >
                            {row.reason}
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={() => void openDetails(row)}
                            sx={{
                              px: 0,
                              minWidth: 0,
                              textTransform: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Ver detalhes
                          </Button>
                        </TableCell>
                        <TableCell className="col-actions" align="right">
                          {canDelete ? (
                            <STagButton
                              text="Excluir"
                              icon={SDeleteIcon}
                              disabled={!eligible || busy}
                              onClick={() => handleDeleteOne(row)}
                            />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography p={4} color="text.secondary">
                          Nenhum cargo encontrado para os filtros atuais.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="Por página"
            sx={{ flexShrink: 0 }}
          />

          <SModalButtons
            onClose={() => onCloseModal(modalName)}
            buttons={[{ text: 'Fechar' }]}
          />
        </SModalPaper>
      </SModal>

      <Dialog
        open={!!confirm}
        onClose={() => !busy && setConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirm?.kind === 'bulk'
            ? 'Excluir cargos selecionados?'
            : 'Excluir cargo sem utilização?'}
        </DialogTitle>
        <DialogContent>
          <Typography whiteSpace="pre-line">{confirmMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirm(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy}
            onClick={() => {
              if (!confirm || deleteInFlightRef.current) return;
              if (confirm.kind === 'single') {
                void executeDelete(
                  [confirm.row.hierarchyId],
                  `Cargo excluído: ${confirm.row.name}`,
                );
              } else {
                void executeDelete(
                  confirm.ids,
                  `Sanitização: exclusão confirmada.`,
                );
              }
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!details || detailsLoading}
        onClose={() => {
          setDetails(null);
          setDetailsLoading(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dependências do cargo</DialogTitle>
        <DialogContent dividers>
          {detailsLoading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={28} />
            </Box>
          )}
          {details && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography fontWeight={700}>{details.name}</Typography>
              <Typography fontSize={13} color="text.secondary">
                {details.typeLabel} · {details.path}
              </Typography>
              <Typography fontSize={13}>
                ID: {details.hierarchyId}
                {details.parentName
                  ? ` · Cargo principal: ${details.parentName}`
                  : ''}
              </Typography>
              <Chip
                size="small"
                label={details.status === 'ELIGIBLE' ? 'Apto' : 'Bloqueado'}
                color={details.status === 'ELIGIBLE' ? 'success' : 'warning'}
                sx={{ alignSelf: 'flex-start' }}
              />
              <Typography fontWeight={600}>Conclusão</Typography>
              <Typography fontSize={14}>{details.conclusion}</Typography>

              <Divider />
              <Typography fontWeight={600}>Empregados</Typography>
              {!details.employees.length && (
                <Typography fontSize={13} color="text.secondary">
                  Nenhum empregado associado.
                </Typography>
              )}
              {details.employees.map((e) => (
                <Typography key={e.employeeId} fontSize={13}>
                  {e.employeeName} (#{e.employeeId})
                  {e.primaryRoleName
                    ? ` · principal: ${e.primaryRoleName}`
                    : ' · sem cargo principal'}
                </Typography>
              ))}

              <Divider />
              <Typography fontWeight={600}>
                Elementos caracterizáveis / GSE
              </Typography>
              {!details.hohLinks.length && (
                <Typography fontSize={13} color="text.secondary">
                  Nenhum vínculo HOH.
                </Typography>
              )}
              {details.hohLinks.map((h) => (
                <Box key={h.hohId} mb={1}>
                  <Typography fontSize={13} fontWeight={600}>
                    {h.characterizationName || h.groupName}{' '}
                    {h.isActiveLink ? '(ativo)' : '(inativo/encerrado)'}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    ID: {h.homogeneousGroupId} · tipo:{' '}
                    {h.characterizationType || h.groupType || '—'} · riscos:{' '}
                    {h.currentRiskCount}/{h.historicalRiskCount}
                  </Typography>
                </Box>
              ))}

              <Divider />
              <Typography fontWeight={600}>Fatores de risco</Typography>
              {!details.risks.length && (
                <Typography fontSize={13} color="text.secondary">
                  Nenhum risco direto ou via HOH do próprio cargo.
                </Typography>
              )}
              {details.risks.map((r) => (
                <Box key={r.riskFactorDataId} mb={1}>
                  <Typography fontSize={13} fontWeight={600}>
                    {r.riskName} ({r.isCurrent ? 'atual' : 'histórico'})
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    Origem:{' '}
                    {r.origin === 'DIRECT_HIERARCHY'
                      ? 'direto no cargo'
                      : `via elemento ${r.elementName || r.elementId}`}
                    {' · '}
                    {r.blockReason}
                  </Typography>
                </Box>
              ))}

              <Divider />
              <Typography fontWeight={600}>Exames</Typography>
              {!details.exams.length && (
                <Typography fontSize={13} color="text.secondary">
                  Nenhum exame vinculado.
                </Typography>
              )}
              {details.exams.map((x) => (
                <Typography key={x.examHistoryId} fontSize={13}>
                  {x.examName || 'Exame'} · {x.employeeName}
                  {x.doneDate
                    ? ` · ${new Date(x.doneDate).toLocaleDateString('pt-BR')}`
                    : ''}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetails(null);
              setDetailsLoading(false);
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
