import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useFetchBrowseCurationRisks } from '@v2/services/security/risk/sub-type/risk-subtype-curation/hooks/useFetchBrowseCurationRisks';
import {
  useMutateBulkAssignRiskSubtype,
  useMutateBulkClearRiskSubtype,
} from '@v2/services/security/risk/sub-type/risk-subtype-curation/hooks/useMutateRiskSubtypeCuration';
import { RiskSubtypeCurationFilterEnum } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';
import { useFetchBrowseRiskSubTypesMaster } from '@v2/services/security/risk/sub-type/risk-sub-type-master/hooks/useFetchBrowseRiskSubTypesMaster';
import {
  useMutateCreateRiskSubTypeMaster,
  useMutateUpdateRiskSubTypeMaster,
} from '@v2/services/security/risk/sub-type/risk-sub-type-master/hooks/useMutateRiskSubTypeMaster';
import type { IRiskSubTypeMasterItem } from '@v2/services/security/risk/sub-type/risk-sub-type-master/risk-sub-type-master.types';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { RiskEnum, RiskMap } from 'project/enum/risk.enums';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { RiskSubTypeFormModal } from './components/RiskSubTypeFormModal';
import { RiskSubTypeAiSuggestReviewModal } from './components/RiskSubTypeAiSuggestReviewModal';
import { RiskSubtypeCurationAiConfigDialog } from './components/RiskSubtypeCurationAiConfigDialog';
import { RiskSubTypeCompactListItem } from './components/RiskSubTypeCompactListItem';
import { useMutateSuggestRiskSubtypeCandidates } from '@v2/services/security/risk/sub-type/risk-subtype-curation/hooks/useMutateSuggestRiskSubtypeCandidates';
import type { ISuggestRiskSubtypeCandidatesResponse } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';
import {
  canEnableAiSuggestButton,
  formatAiSuggestErrorMessage,
  mergeSuggestBatchResponses,
} from './utils/risk-subtype-curation-ai.utils';

const ALL = 'ALL';

export const RiskSubTypeCurationPage: FC = () => {
  const { isAuthSuccess } = useAuthShow();
  const canAccess = isAuthSuccess({ roles: [RoleEnum.MASTER] });
  const [riskType, setRiskType] = useState<RiskTypeEnum>(RiskTypeEnum.QUI);
  const [subtypeSearch, setSubtypeSearch] = useState('');
  const [riskSearch, setRiskSearch] = useState('');
  const [riskPage, setRiskPage] = useState(1);
  const [riskStatus, setRiskStatus] = useState<StatusEnum | typeof ALL>(ALL);
  const [onlyPcmso, setOnlyPcmso] = useState(true);
  const [subtypeFilter, setSubtypeFilter] = useState<
    RiskSubtypeCurationFilterEnum | typeof ALL
  >(ALL);
  const [filterSubtypeId, setFilterSubtypeId] = useState<number | ''>('');
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<number | ''>('');
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubtype, setEditingSubtype] =
    useState<IRiskSubTypeMasterItem | null>(null);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [lastBulkResult, setLastBulkResult] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSuggestData, setAiSuggestData] =
    useState<ISuggestRiskSubtypeCandidatesResponse | null>(null);
  const [aiSuggestError, setAiSuggestError] = useState<string | null>(null);
  const [pendingAiApplyIds, setPendingAiApplyIds] = useState<string[]>([]);
  const [expandedSubtypeId, setExpandedSubtypeId] = useState<number | null>(null);
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_RISK_SUB_TYPE_CURATION);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setRiskPage(patch.page);
  });

  const { data: subTypesData, isLoading: loadingSubTypes } =
    useFetchBrowseRiskSubTypesMaster({
      type: riskType,
      page: 1,
      limit: 200,
      search: subtypeSearch.trim() || undefined,
    });

  const subtypeFilterValue =
    subtypeFilter === ALL
      ? RiskSubtypeCurationFilterEnum.ALL
      : subtypeFilter;

  const { data: risksData, isLoading: loadingRisks } =
    useFetchBrowseCurationRisks({
      type: riskType,
      page: riskPage,
      limit: pageLimit,
      search: riskSearch.trim() || undefined,
      status: riskStatus === ALL ? undefined : riskStatus,
      onlyPcmso,
      subtypeFilter: subtypeFilterValue,
      subtypeId:
        subtypeFilter === RiskSubtypeCurationFilterEnum.SPECIFIC &&
        filterSubtypeId !== ''
          ? Number(filterSubtypeId)
          : undefined,
    });

  const createSubtype = useMutateCreateRiskSubTypeMaster();
  const updateSubtype = useMutateUpdateRiskSubTypeMaster();
  const bulkAssign = useMutateBulkAssignRiskSubtype();
  const bulkClear = useMutateBulkClearRiskSubtype();
  const suggestCandidates = useMutateSuggestRiskSubtypeCandidates();

  const canSuggestWithAi = canEnableAiSuggestButton(riskType, selectedSubtypeId);

  const subTypes = subTypesData?.results ?? [];
  const risks = risksData?.results ?? [];

  const selectedSubtype = useMemo(
    () => subTypes.find((item) => item.id === selectedSubtypeId),
    [selectedSubtypeId, subTypes],
  );

  const masterAiOverrides = buildMasterAiRequestOverrides(canAccess, aiMasterConfig);

  const allSelected =
    risks.length > 0 && risks.every((r) => selectedRiskIds.includes(r.riskFactorId));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRiskIds([]);
      return;
    }
    setSelectedRiskIds(risks.map((r) => r.riskFactorId));
  };

  const toggleRisk = (id: string) => {
    setSelectedRiskIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const selectedSubtypeName = useMemo(
    () => subTypes.find((s) => s.id === selectedSubtypeId)?.name,
    [subTypes, selectedSubtypeId],
  );

  const aiLoadingScope = useMemo(() => {
    if (!suggestCandidates.isPending) return undefined;

    if (aiSuggestData?.scope.hasNextPage) {
      const nextPage =
        aiSuggestData.scope.nextPage ?? aiSuggestData.scope.page + 1;
      const limit = aiSuggestData.scope.limit;
      const eligibleTotal = aiSuggestData.scope.eligibleTotal;
      const skip = (nextPage - 1) * limit;

      return {
        page: nextPage,
        limit,
        eligibleTotal,
        rangeStart: eligibleTotal > 0 ? skip + 1 : 0,
        rangeEnd: Math.min(skip + limit, eligibleTotal),
      };
    }

    return {
      page: 1,
      limit: 100,
    };
  }, [aiSuggestData, suggestCandidates.isPending]);

  const handleSaveSubtype = (values: {
    name: string;
    description?: string;
    status?: StatusEnum;
  }) => {
    if (editingSubtype) {
      updateSubtype.mutate(
        {
          id: editingSubtype.id,
          description: values.description,
          status: values.status,
          ...(editingSubtype.system ? {} : { name: values.name }),
        },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingSubtype(null);
          },
        },
      );
      return;
    }

    createSubtype.mutate(
      {
        name: values.name,
        description: values.description,
        type: riskType,
      },
      {
        onSuccess: (created) => {
          setFormOpen(false);
          setSelectedSubtypeId(created.id);
        },
      },
    );
  };

  const handleBulkAssign = () => {
    const riskFactorIds = pendingAiApplyIds.length
      ? pendingAiApplyIds
      : selectedRiskIds;
    if (!selectedSubtypeId || !riskFactorIds.length) return;
    bulkAssign.mutate(
      {
        riskFactorIds,
        subTypeId: Number(selectedSubtypeId),
      },
      {
        onSuccess: (result) => {
          setConfirmAssignOpen(false);
          setAiModalOpen(false);
          setAiSuggestData(null);
          setAiSuggestError(null);
          setPendingAiApplyIds([]);
          setLastBulkResult(
            `Atualizados: ${result.updated}. Ignorados: ${result.skipped}.`,
          );
          setSelectedRiskIds([]);
        },
      },
    );
  };

  const handleSuggestWithAi = () => {
    if (!canSuggestWithAi || selectedSubtypeId === '') return;
    setAiModalOpen(true);
    setAiSuggestData(null);
    setAiSuggestError(null);
    suggestCandidates.mutate(
      {
        type: RiskTypeEnum.QUI,
        subTypeId: Number(selectedSubtypeId),
        onlyPcmso,
        search: riskSearch.trim() || undefined,
        page: 1,
        limit: 100,
        ...masterAiOverrides,
      },
      {
        onSuccess: (data) => {
          setAiSuggestData({
            ...data,
            scope: {
              ...data.scope,
              cumulativeAnalyzed: data.scope.analyzed,
              batchesLoaded: 1,
            },
          });
          setAiSuggestError(null);
        },
        onError: (error) => {
          setAiSuggestData(null);
          setAiSuggestError(formatAiSuggestErrorMessage(error));
        },
      },
    );
  };

  const handleLoadNextAiBatch = () => {
    if (!canSuggestWithAi || selectedSubtypeId === '' || !aiSuggestData?.scope.hasNextPage) {
      return;
    }
    const nextPage = aiSuggestData.scope.nextPage;
    if (!nextPage) return;

    suggestCandidates.mutate(
      {
        type: RiskTypeEnum.QUI,
        subTypeId: Number(selectedSubtypeId),
        onlyPcmso,
        search: riskSearch.trim() || undefined,
        page: nextPage,
        limit: aiSuggestData.scope.limit,
        ...masterAiOverrides,
      },
      {
        onSuccess: (data) => {
          setAiSuggestData((current) =>
            current ? mergeSuggestBatchResponses(current, data) : data,
          );
          setAiSuggestError(null);
        },
        onError: (error) => {
          setAiSuggestError(formatAiSuggestErrorMessage(error));
        },
      },
    );
  };

  const handleAiApplySelected = (riskFactorIds: string[]) => {
    if (!riskFactorIds.length) return;
    setPendingAiApplyIds(riskFactorIds);
    setConfirmAssignOpen(true);
  };

  const handleBulkClear = () => {
    if (!selectedRiskIds.length) return;
    bulkClear.mutate(
      { riskFactorIds: selectedRiskIds },
      {
        onSuccess: (result) => {
          setConfirmClearOpen(false);
          setLastBulkResult(
            `Subtipo removido de ${result.updated} risco(s). Ignorados: ${result.skipped}.`,
          );
          setSelectedRiskIds([]);
        },
      },
    );
  };

  if (!canAccess) {
    return (
      <Alert severity="warning">
        Acesso restrito a usuários MASTER. Se você acredita que deveria ter
        acesso, verifique o perfil ativo ou entre em contato com o suporte.
      </Alert>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h5">Curadoria de subtipos de risco</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie subtipos do catálogo global e aplique vínculos em massa aos
            fatores de risco. Esta ação altera o catálogo global; não altera
            caracterizações, PGR ou inventário diretamente.
          </Typography>
        </Box>

        <Alert severity="info">
          A IA sugere riscos compatíveis com o subtipo selecionado. A aplicação
          depende de revisão e confirmação manual do MASTER.
          <Box mt={1}>
            <AiActionButtonGroup
              variant="mui-outlined"
              label={
                suggestCandidates.isPending
                  ? 'Analisando com IA…'
                  : 'Sugerir candidatos com IA'
              }
              loading={suggestCandidates.isPending}
              disabled={!canSuggestWithAi}
              onExecute={handleSuggestWithAi}
              onConfigure={() => setAiConfigDialogOpen(true)}
              isMaster={canAccess}
            />
            {!canSuggestWithAi && (
              <Typography variant="caption" display="block" mt={0.5}>
                Disponível apenas para riscos químicos (QUI) com subtipo alvo
                selecionado em &quot;Aplicar subtipo&quot;.
              </Typography>
            )}
          </Box>
        </Alert>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tipo de risco
          </Typography>
          <TextField
            select
            size="small"
            value={riskType}
            onChange={(e) => {
              setRiskType(e.target.value as RiskTypeEnum);
              setSelectedRiskIds([]);
              setSelectedSubtypeId('');
              setRiskPage(1);
            }}
            sx={{ minWidth: 220 }}
          >
            {Object.values(RiskEnum).map((type) => (
              <MenuItem key={type} value={type}>
                {RiskMap[type]?.name ?? type}
              </MenuItem>
            ))}
          </TextField>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="h6">Subtipos</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setEditingSubtype(null);
                setFormOpen(true);
              }}
            >
              Criar subtipo
            </Button>
          </Box>
          <TextField
            size="small"
            placeholder="Buscar subtipo..."
            value={subtypeSearch}
            onChange={(e) => setSubtypeSearch(e.target.value)}
            sx={{ mb: 2, minWidth: 280 }}
          />
          <Box
            display="flex"
            flexDirection="column"
            gap={0.75}
            sx={{ maxHeight: { xs: 220, md: 280 }, overflowY: 'auto', pr: 0.5 }}
          >
            {loadingSubTypes && (
              <Typography variant="body2">Carregando...</Typography>
            )}
            {!loadingSubTypes && subTypes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhum subtipo para este tipo.
              </Typography>
            )}
            {subTypes.map((subtype) => (
              <RiskSubTypeCompactListItem
                key={subtype.id}
                subtype={subtype}
                expanded={expandedSubtypeId === subtype.id}
                onToggleExpand={() =>
                  setExpandedSubtypeId((current) =>
                    current === subtype.id ? null : subtype.id,
                  )
                }
                onEdit={() => {
                  setEditingSubtype(subtype);
                  setFormOpen(true);
                }}
              />
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Riscos do catálogo global
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              size="small"
              placeholder="Buscar nome, CAS ou eSocial..."
              value={riskSearch}
              onChange={(e) => {
                setRiskSearch(e.target.value);
                setRiskPage(1);
              }}
              sx={{ minWidth: 280 }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={riskStatus}
              onChange={(e) => {
                setRiskStatus(e.target.value as StatusEnum | typeof ALL);
                setRiskPage(1);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              <MenuItem value={StatusEnum.ACTIVE}>Ativo</MenuItem>
              <MenuItem value={StatusEnum.INACTIVE}>Inativo</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Subtipo atual"
              value={subtypeFilter}
              onChange={(e) => {
                setSubtypeFilter(
                  e.target.value as RiskSubtypeCurationFilterEnum | typeof ALL,
                );
                setRiskPage(1);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              <MenuItem value={RiskSubtypeCurationFilterEnum.NONE}>
                Sem subtipo
              </MenuItem>
              <MenuItem value={RiskSubtypeCurationFilterEnum.SPECIFIC}>
                Subtipo específico
              </MenuItem>
            </TextField>
            {subtypeFilter === RiskSubtypeCurationFilterEnum.SPECIFIC && (
              <TextField
                select
                size="small"
                label="Subtipo"
                value={filterSubtypeId}
                onChange={(e) => {
                  setFilterSubtypeId(
                    e.target.value === '' ? '' : Number(e.target.value),
                  );
                  setRiskPage(1);
                }}
                sx={{ minWidth: 220 }}
              >
                {subTypes.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={onlyPcmso}
                  onChange={(e) => {
                    setOnlyPcmso(e.target.checked);
                    setRiskPage(1);
                  }}
                />
              }
              label="Somente PCMSO"
            />
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
            <TextField
              select
              size="small"
              label="Aplicar subtipo"
              value={selectedSubtypeId}
              onChange={(e) =>
                setSelectedSubtypeId(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="">Selecione...</MenuItem>
              {subTypes
                .filter((s) => s.status === StatusEnum.ACTIVE)
                .map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
            </TextField>
            <Button
              variant="contained"
              disabled={
                !selectedRiskIds.length ||
                selectedSubtypeId === '' ||
                bulkAssign.isPending
              }
              onClick={() => setConfirmAssignOpen(true)}
            >
              Aplicar aos selecionados ({selectedRiskIds.length})
            </Button>
            <Button
              variant="outlined"
              color="warning"
              disabled={!selectedRiskIds.length || bulkClear.isPending}
              onClick={() => setConfirmClearOpen(true)}
            >
              Limpar subtipo
            </Button>
          </Box>

          {lastBulkResult && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLastBulkResult(null)}>
              {lastBulkResult}
            </Alert>
          )}

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>
                    <Checkbox checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>CAS</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>eSocial</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Subtipo</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>PCMSO</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingRisks && (
                  <tr>
                    <td colSpan={7} style={{ padding: 12 }}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {!loadingRisks &&
                  risks.map((risk) => (
                    <tr key={risk.riskFactorId}>
                      <td style={{ padding: 8 }}>
                        <Checkbox
                          checked={selectedRiskIds.includes(risk.riskFactorId)}
                          onChange={() => toggleRisk(risk.riskFactorId)}
                        />
                      </td>
                      <td style={{ padding: 8 }}>{risk.name}</td>
                      <td style={{ padding: 8 }}>{risk.cas ?? '—'}</td>
                      <td style={{ padding: 8 }}>{risk.esocialCode ?? '—'}</td>
                      <td style={{ padding: 8 }}>
                        {(risk.subTypes ?? []).map((s) => s.name).join(', ') ||
                          '—'}
                      </td>
                      <td style={{ padding: 8 }}>
                        {risk.isPCMSO ? 'Sim' : 'Não'}
                      </td>
                      <td style={{ padding: 8 }}>{risk.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Total: {risksData?.pagination.total ?? 0}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Button
                size="small"
                disabled={riskPage <= 1}
                onClick={() => setRiskPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Typography variant="body2">Página {riskPage}</Typography>
              <Button
                size="small"
                disabled={
                  !risksData ||
                  riskPage * pageLimit >= (risksData.pagination.total ?? 0)
                }
                onClick={() => setRiskPage((p) => p + 1)}
              >
                Próxima
              </Button>
              <TextField
                select
                size="small"
                value={pageLimit}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}/página
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </Paper>

        <RiskSubTypeFormModal
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingSubtype(null);
          }}
          riskType={riskType}
          editing={editingSubtype}
          onSubmit={handleSaveSubtype}
          loading={createSubtype.isPending || updateSubtype.isPending}
        />

        <Dialog open={confirmAssignOpen} onClose={() => {
          setConfirmAssignOpen(false);
          setPendingAiApplyIds([]);
        }}>
          <DialogTitle>Confirmar aplicação em massa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Aplicar o subtipo <strong>{selectedSubtypeName}</strong> a{' '}
              <strong>
                {pendingAiApplyIds.length || selectedRiskIds.length}
              </strong>{' '}
              fator(es) de risco selecionado(s)?
              <br />
              <br />
              Esta ação altera o catálogo global de fatores de risco. Não altera
              caracterizações ou PGR existentes diretamente.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setConfirmAssignOpen(false);
              setPendingAiApplyIds([]);
            }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleBulkAssign}>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <RiskSubTypeAiSuggestReviewModal
          open={aiModalOpen}
          loading={suggestCandidates.isPending && !aiSuggestData}
          loadingNextBatch={suggestCandidates.isPending && !!aiSuggestData}
          loadingScope={aiLoadingScope}
          error={aiSuggestError}
          data={aiSuggestData}
          subTypeName={selectedSubtypeName}
          applying={bulkAssign.isPending}
          onClose={() => {
            setAiModalOpen(false);
            setAiSuggestData(null);
            setAiSuggestError(null);
          }}
          onApplySelected={handleAiApplySelected}
          onLoadNextBatch={handleLoadNextAiBatch}
          onRefineSearch={() => {
            setAiModalOpen(false);
            setAiSuggestData(null);
            setAiSuggestError(null);
          }}
        />

        {canAccess && selectedSubtypeId !== '' && selectedSubtype && (
          <RiskSubtypeCurationAiConfigDialog
            open={aiConfigDialogOpen}
            onClose={() => setAiConfigDialogOpen(false)}
            onApply={setAiMasterConfig}
            subTypeId={Number(selectedSubtypeId)}
            subTypeName={selectedSubtype.name}
          />
        )}

        <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)}>
          <DialogTitle>Confirmar remoção em massa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Remover subtipo de <strong>{selectedRiskIds.length}</strong>{' '}
              fator(es) de risco selecionado(s)?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmClearOpen(false)}>Cancelar</Button>
            <Button color="warning" variant="contained" onClick={handleBulkClear}>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};
