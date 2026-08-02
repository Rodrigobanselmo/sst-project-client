import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationAiAssistModal } from 'components/organisms/modals/ModalAddCharacterization/components/CharacterizationAiAssistModal/CharacterizationAiAssistModal';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

import { CharacterizationTechnicalContentArrayEditorDialog } from './CharacterizationTechnicalContentArrayEditorDialog';
import { CharacterizationTechnicalContentFieldCard } from './CharacterizationTechnicalContentFieldCard';
import { CharacterizationTechnicalContentSummaryAiDialog } from './CharacterizationTechnicalContentSummaryAiDialog';
import { CharacterizationTechnicalContentSummaryEditorDialog } from './CharacterizationTechnicalContentSummaryEditorDialog';
import { invalidateCharacterizationInventory } from './invalidate-characterization-inventory';
import {
  canGenerateInventorySummary,
  formatCharacterizationArrayContent,
  formatPlainContent,
  hasCharacterizationArrayContent,
  INVENTORY_SUMMARY_DISABLED_TOOLTIP,
  type CharacterizationTechnicalContentPrefer,
} from './technical-content.util';

type CharacterizationTechnicalContentManagerDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
  /** Abre assistente ou resumo IA automaticamente após carregar o detalhe. */
  prefer?: CharacterizationTechnicalContentPrefer;
};

type TechnicalDraft = Pick<
  ICharacterization,
  | 'id'
  | 'name'
  | 'type'
  | 'companyId'
  | 'workspaceId'
  | 'paragraphs'
  | 'activities'
  | 'considerations'
  | 'riskInventorySummary'
> &
  Partial<ICharacterization>;

type ArrayField = 'paragraphs' | 'activities' | 'considerations';
type EditorTarget = ArrayField | 'summary' | null;

function toDraft(detail: ICharacterization): TechnicalDraft {
  return {
    ...detail,
    paragraphs: detail.paragraphs || [],
    activities: detail.activities || [],
    considerations: detail.considerations || [],
    riskInventorySummary: detail.riskInventorySummary || '',
  };
}

/**
 * Modal de Conteúdo Técnico no padrão Fotos/Cargos:
 * editar / IA / salvar sem abrir o editor completo.
 */
export function CharacterizationTechnicalContentManagerDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
  prefer,
}: CharacterizationTechnicalContentManagerDialogProps) {
  const characterizationId = row?.id || '';
  const upsertMutation = useMutUpsertCharacterization();
  const [draft, setDraft] = useState<TechnicalDraft | null>(null);
  const [assistOpen, setAssistOpen] = useState(false);
  const [summaryAiOpen, setSummaryAiOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<EditorTarget>(null);
  const [saving, setSaving] = useState(false);
  const preferAppliedRef = useRef(false);
  const appliedTraceIdsRef = useRef<Set<string>>(new Set());

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useQueryCharacterization(open ? characterizationId : '', {
    companyId,
    workspaceId,
  });

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setAssistOpen(false);
      setSummaryAiOpen(false);
      setEditorTarget(null);
      preferAppliedRef.current = false;
      appliedTraceIdsRef.current = new Set();
      return;
    }
    if (detail?.id) {
      setDraft(toDraft(detail));
    }
  }, [open, detail]);

  const refresh = useCallback(async () => {
    const result = await refetch();
    if (result.data) {
      setDraft(toDraft(result.data));
    }
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
  }, [companyId, workspaceId, characterizationId, refetch]);

  const persist = useCallback(
    async (next: TechnicalDraft) => {
      if (!next.id) return;
      setSaving(true);
      try {
        await upsertMutation.mutateAsync({
          id: next.id,
          name: next.name,
          type: next.type,
          companyId,
          workspaceId,
          paragraphs: next.paragraphs || [],
          activities: next.activities || [],
          considerations: next.considerations || [],
          riskInventorySummary: next.riskInventorySummary || '',
        });
        await refresh();
      } catch {
        await refetch();
      } finally {
        setSaving(false);
      }
    },
    [companyId, workspaceId, upsertMutation, refresh, refetch],
  );

  const onEditArrayContent = useCallback(
    (
      values: { name: string; type: ParagraphEnum }[],
      type: ArrayField = 'considerations',
      defaultValue = ParagraphEnum.BULLET_0,
    ) => {
      setDraft((old) => {
        if (!old) return old;
        const nextValues = values.map(
          ({ name, type: paragraphType }) =>
            `${name}{type}=${paragraphType || defaultValue}`,
        );
        const next = { ...old, [type]: nextValues };
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const setData: Dispatch<SetStateAction<any>> = useCallback(
    (updater) => {
      setDraft((old) => {
        if (!old) return old;
        const next =
          typeof updater === 'function' ? updater(old) : { ...old, ...updater };
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const registerAiAssistAppliedTrace = useCallback((traceId: string) => {
    if (!traceId) return;
    appliedTraceIdsRef.current.add(traceId);
  }, []);

  useEffect(() => {
    if (!open || !draft?.id || preferAppliedRef.current) return;
    if (!prefer) return;
    preferAppliedRef.current = true;
    if (prefer === 'assist') {
      setAssistOpen(true);
      return;
    }
    if (prefer === 'summary') {
      const eligible = canGenerateInventorySummary({
        hasDescription: hasCharacterizationArrayContent(draft.paragraphs),
        hasProcesses: hasCharacterizationArrayContent(draft.activities),
        hasConsiderations: hasCharacterizationArrayContent(draft.considerations),
      });
      if (eligible) setSummaryAiOpen(true);
    }
  }, [open, draft, prefer]);

  const handleClose = useCallback(async () => {
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
    onClose();
  }, [companyId, workspaceId, characterizationId, onClose]);

  const flags = useMemo(() => {
    const hasDescription = hasCharacterizationArrayContent(draft?.paragraphs);
    const hasProcesses = hasCharacterizationArrayContent(draft?.activities);
    const hasConsiderations = hasCharacterizationArrayContent(
      draft?.considerations,
    );
    const hasInventorySummary = !!String(draft?.riskInventorySummary || '').trim();
    return {
      hasDescription,
      hasProcesses,
      hasConsiderations,
      hasInventorySummary,
      canSummary: canGenerateInventorySummary({
        hasDescription,
        hasProcesses,
        hasConsiderations,
      }),
    };
  }, [draft]);

  const assistData = (draft || {
    id: '',
    name: '',
    companyId,
    workspaceId,
    paragraphs: [],
    activities: [],
    considerations: [],
  }) as ICharacterization;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : () => void handleClose()}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: { xs: '100%', md: 1100, lg: 1200 },
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: { xs: 2, sm: 3 },
            py: 2,
            pr: 1,
          }}
        >
          <Box>
            <Typography component="span" fontWeight={700} fontSize={18}>
              Conteúdo Técnico
            </Typography>
            {row?.name ? (
              <Typography variant="body2" color="text.secondary">
                {row.name}
              </Typography>
            ) : null}
          </Box>
          <IconButton
            aria-label="Fechar"
            onClick={() => void handleClose()}
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
          }}
        >
          {isLoading && !draft ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={28} />
            </Box>
          ) : null}
          {isError ? (
            <Alert
              severity="error"
              action={
                <Box
                  component="button"
                  onClick={() => void refetch()}
                  sx={{
                    border: 0,
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    font: 'inherit',
                  }}
                >
                  Tentar novamente
                </Box>
              }
            >
              Não foi possível carregar o conteúdo técnico.
            </Alert>
          ) : null}
          {draft ? (
            <Box
              display="grid"
              gap={{ xs: 1.5, sm: 2 }}
              gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
              alignItems="stretch"
            >
              <CharacterizationTechnicalContentFieldCard
                title="Descrição"
                filled={flags.hasDescription}
                content={formatCharacterizationArrayContent(draft.paragraphs)}
                onEdit={() => setEditorTarget('paragraphs')}
                onAi={() => setAssistOpen(true)}
                aiLabel="Gerar Conteúdo com IA"
                editDisabled={saving}
                aiDisabled={saving}
              />
              <CharacterizationTechnicalContentFieldCard
                title="Processos e Atividades"
                filled={flags.hasProcesses}
                content={formatCharacterizationArrayContent(draft.activities)}
                onEdit={() => setEditorTarget('activities')}
                onAi={() => setAssistOpen(true)}
                aiLabel="Gerar Conteúdo com IA"
                editDisabled={saving}
                aiDisabled={saving}
              />
              <CharacterizationTechnicalContentFieldCard
                title="Considerações"
                filled={flags.hasConsiderations}
                content={formatCharacterizationArrayContent(
                  draft.considerations,
                )}
                onEdit={() => setEditorTarget('considerations')}
                onAi={() => setAssistOpen(true)}
                aiLabel="Gerar Conteúdo com IA"
                editDisabled={saving}
                aiDisabled={saving}
              />
              <CharacterizationTechnicalContentFieldCard
                title="Resumo do Inventário"
                filled={flags.hasInventorySummary}
                content={formatPlainContent(draft.riskInventorySummary)}
                onEdit={() => setEditorTarget('summary')}
                onAi={() => setSummaryAiOpen(true)}
                aiLabel="Gerar resumo com IA"
                editDisabled={saving}
                aiDisabled={saving || !flags.canSummary}
                aiDisabledTooltip={INVENTORY_SUMMARY_DISABLED_TOOLTIP}
                emptyVariant={
                  !flags.canSummary
                    ? 'summary-unavailable'
                    : 'summary-pending'
                }
                statusLabel={
                  flags.hasInventorySummary
                    ? 'Preenchido'
                    : !flags.canSummary
                      ? 'Indisponível'
                      : 'Pendente'
                }
                statusColor={
                  flags.hasInventorySummary
                    ? 'success'
                    : !flags.canSummary
                      ? 'warning'
                      : 'default'
                }
              />
            </Box>
          ) : null}
          {saving ? (
            <Alert severity="info" sx={{ mt: 2 }} icon={<CircularProgress size={16} />}>
              Salvando e atualizando a tabela…
            </Alert>
          ) : null}
        </DialogContent>
      </Dialog>

      {draft ? (
        <CharacterizationAiAssistModal
          open={assistOpen}
          onClose={() => setAssistOpen(false)}
          data={assistData as any}
          onEditArrayContent={onEditArrayContent as any}
          setData={setData as any}
          registerAiAssistAppliedTrace={registerAiAssistAppliedTrace}
        />
      ) : null}

      {draft ? (
        <CharacterizationTechnicalContentSummaryAiDialog
          open={summaryAiOpen}
          onClose={() => setSummaryAiOpen(false)}
          companyId={companyId}
          workspaceId={workspaceId}
          characterizationId={draft.id}
          currentSummary={String(draft.riskInventorySummary || '')}
          applying={saving}
          onApply={async (summary) => {
            await persist({ ...draft, riskInventorySummary: summary });
            setSummaryAiOpen(false);
          }}
        />
      ) : null}

      {draft && editorTarget && editorTarget !== 'summary' ? (
        <CharacterizationTechnicalContentArrayEditorDialog
          open
          title={
            editorTarget === 'paragraphs'
              ? 'Editar Descrição'
              : editorTarget === 'activities'
                ? 'Editar Processos e Atividades'
                : 'Editar Considerações'
          }
          values={draft[editorTarget] || []}
          defaultType={
            editorTarget === 'paragraphs'
              ? ParagraphEnum.PARAGRAPH
              : ParagraphEnum.BULLET_0
          }
          saving={saving}
          onClose={() => setEditorTarget(null)}
          onSave={async (next) => {
            await persist({ ...draft, [editorTarget]: next });
            setEditorTarget(null);
          }}
        />
      ) : null}

      {draft && editorTarget === 'summary' ? (
        <CharacterizationTechnicalContentSummaryEditorDialog
          open
          title="Editar Resumo do Inventário"
          value={String(draft.riskInventorySummary || '')}
          saving={saving}
          onClose={() => setEditorTarget(null)}
          onSave={async (next) => {
            await persist({ ...draft, riskInventorySummary: next });
            setEditorTarget(null);
          }}
        />
      ) : null}
    </>
  );
}
