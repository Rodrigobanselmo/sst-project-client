import { FC, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchBrowseExamRiskRules } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchBrowseExamRiskRules';
import {
  useMutateDeleteExamRiskRule,
  useMutateSyncExamRiskRulesNr07,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import {
  ExamRiskRuleScopeEnum,
  ExamRiskRuleSourceEnum,
  ExamRiskRuleStatusEnum,
  IExamRiskRule,
  IExamRiskRuleNr07SyncSummary,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  examRiskRuleDraftReasonLabels,
  examRiskRuleScopeLabels,
  examRiskRuleSourceLabels,
  examRiskRuleStatusLabels,
} from './exam-risk-rule-labels';
import { ExamRiskRuleFormModal } from './components/ExamRiskRuleFormModal';
import { ExamRiskRuleAcgihSyncDialog } from './components/ExamRiskRuleAcgihSyncDialog';
import { ExamRiskRuleImportExportMenu } from './components/ExamRiskRuleImportExportMenu';
import { ExamRiskRuleReferencesModal } from './components/ExamRiskRuleReferencesModal';
import { ExamRiskRuleTable } from './components/ExamRiskRuleTable';
import { ExamRiskRuleCoverageGapsPanel } from './components/ExamRiskRuleCoverageGapsPanel';
import { ExamRiskRuleAiAssistantDialog } from './components/ExamRiskRuleAiAssistantDialog';

const ALL = 'ALL';

type LibraryTab = 'rules' | 'coverage';

export const ExamRiskRuleListPage: FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('rules');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState<ExamRiskRuleScopeEnum | typeof ALL>(ALL);
  const [status, setStatus] = useState<ExamRiskRuleStatusEnum | typeof ALL>(
    ALL,
  );
  const [source, setSource] = useState<ExamRiskRuleSourceEnum | typeof ALL>(
    ALL,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IExamRiskRule | null>(null);
  const [toDelete, setToDelete] = useState<IExamRiskRule | null>(null);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [acgihSyncOpen, setAcgihSyncOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [syncSummary, setSyncSummary] =
    useState<IExamRiskRuleNr07SyncSummary | null>(null);
  const [referencesRuleId, setReferencesRuleId] = useState<string | null>(null);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_EXAM_RISK_RULES);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading } = useFetchBrowseExamRiskRules({
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    scope: scope === ALL ? undefined : scope,
    status: status === ALL ? undefined : status,
    source: source === ALL ? undefined : source,
  });

  const deleteMutation = useMutateDeleteExamRiskRule();
  const syncMutation = useMutateSyncExamRiskRulesNr07();

  const handleConfirmSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (summary) => {
        setSyncConfirmOpen(false);
        setSyncSummary(summary);
      },
    });
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (rule: IExamRiskRule) => {
    setEditing(rule);
    setFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(
      { id: toDelete.id },
      { onSuccess: () => setToDelete(null) },
    );
  };

  // Deriva a regra do conjunto atual para refletir remoções após invalidação.
  const referencesRule =
    data?.data.find((rule) => rule.id === referencesRuleId) ?? null;

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="h5">Biblioteca Risco × Exame</Typography>
            <Typography variant="body2" color="text.secondary">
              Padrão SimpleSST de indicação de exames a partir dos fatores de
              risco. Esta biblioteca reúne as regras efetivamente elegíveis para
              uso técnico do sistema.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            {activeTab === 'rules' && (
              <>
                <ExamRiskRuleImportExportMenu />
                <Button
                  variant="outlined"
                  onClick={() => setAiAssistantOpen(true)}
                >
                  Assistente de padrões
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSyncConfirmOpen(true)}
                  disabled={syncMutation.isPending}
                >
                  Sincronizar NR-07
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setAcgihSyncOpen(true)}
                >
                  Sincronizar ACGIH/BEI
                </Button>
                <Button variant="contained" onClick={handleOpenCreate}>
                  Nova regra
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_event, value: LibraryTab) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Regras" value="rules" />
          <Tab label="Cobertura / Gaps" value="coverage" />
        </Tabs>

        {activeTab === 'coverage' ? (
          <ExamRiskRuleCoverageGapsPanel />
        ) : (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              label="Buscar"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              label="Escopo"
              value={scope}
              onChange={(event) => {
                setScope(event.target.value as ExamRiskRuleScopeEnum | typeof ALL);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 170 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              {Object.values(ExamRiskRuleScopeEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleScopeLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as ExamRiskRuleStatusEnum | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              {Object.values(ExamRiskRuleStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Fonte"
              value={source}
              onChange={(event) => {
                setSource(
                  event.target.value as ExamRiskRuleSourceEnum | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(ExamRiskRuleSourceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {examRiskRuleSourceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <ExamRiskRuleTable
            data={data?.data ?? []}
            isLoading={isLoading}
            pagination={{
              total: data?.count ?? 0,
              limit: pageLimit,
              page,
            }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            onEdit={handleEdit}
            onDelete={setToDelete}
            onManageReferences={(rule) => setReferencesRuleId(rule.id)}
          />
        </Paper>
        )}
      </Box>

      <ExamRiskRuleFormModal
        open={formOpen}
        rule={editing}
        onClose={() => setFormOpen(false)}
      />

      <ExamRiskRuleReferencesModal
        rule={referencesRule}
        onClose={() => setReferencesRuleId(null)}
      />

      <ExamRiskRuleAcgihSyncDialog
        open={acgihSyncOpen}
        onClose={() => setAcgihSyncOpen(false)}
      />

      <ExamRiskRuleAiAssistantDialog
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Remover regra</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover esta regra? Esta ação faz soft delete
            e não afeta nenhum vínculo de empresa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={syncConfirmOpen}
        onClose={() => setSyncConfirmOpen(false)}
      >
        <DialogTitle>Sincronizar regras NR-07</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação lê a base normativa de Indicadores Biológicos da NR-7 e
            cria/atualiza regras AGENTE nesta biblioteca. É idempotente,
            reexecutável, não duplica regras, não sobrescreve regras curadas e
            não aplica nenhum vínculo em empresas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSyncConfirmOpen(false)}
            disabled={syncMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(syncSummary)}
        onClose={() => setSyncSummary(null)}
      >
        <DialogTitle>Resumo da sincronização NR-07</DialogTitle>
        <DialogContent>
          {syncSummary && (
            <Box display="flex" flexDirection="column" gap={0.5} minWidth={360}>
              <Typography variant="body2">
                Indicadores avaliados: <b>{syncSummary.totalIndicators}</b>
              </Typography>
              <Typography variant="body2">
                Criadas: <b>{syncSummary.created}</b>
              </Typography>
              <Typography variant="body2">
                Atualizadas: <b>{syncSummary.updated}</b>
              </Typography>
              <Typography variant="body2">
                Mantidas sem alteração: <b>{syncSummary.unchanged}</b>
              </Typography>
              <Typography variant="body2">
                Puladas por curadoria: <b>{syncSummary.curatedSkipped}</b>
              </Typography>
              <Typography variant="body2">
                Ativas no resultado: <b>{syncSummary.active}</b>
              </Typography>
              <Typography variant="body2">
                Em rascunho (pendência): <b>{syncSummary.draft}</b>
              </Typography>

              {Object.keys(syncSummary.draftReasons).length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Motivos das pendências:
                  </Typography>
                  {Object.entries(syncSummary.draftReasons)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => (
                      <Typography key={reason} variant="body2">
                        {examRiskRuleDraftReasonLabels[reason] ?? reason}:{' '}
                        <b>{count}</b>
                      </Typography>
                    ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSyncSummary(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </SAuthShow>
  );
};
