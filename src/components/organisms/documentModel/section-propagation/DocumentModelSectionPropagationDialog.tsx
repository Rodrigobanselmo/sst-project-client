import { FC, useEffect, useMemo, useState } from 'react';

import { Box, Button, Checkbox, Collapse } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { DocumentModelPgrClassificationFilters } from 'components/organisms/tables/DocumentModelTable/DocumentModelPgrClassificationFilters';
import { DocumentModelClassificationChips } from 'components/organisms/tables/DocumentModelTable/DocumentModelClassificationChips';
import { useMutAnalyzeSectionPropagation } from 'core/services/hooks/mutations/manager/document-model/useMutAnalyzeSectionPropagation/useMutAnalyzeSectionPropagation';
import { useMutApplySectionPropagation } from 'core/services/hooks/mutations/manager/document-model/useMutApplySectionPropagation/useMutApplySectionPropagation';
import { useMutCreateDocumentModelSectionLink } from 'core/services/hooks/mutations/manager/document-model/useMutDocumentModelSectionLinks/useMutDocumentModelSectionLinks';
import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  filterSectionPropagationCandidates,
  groupSectionPropagationCandidates,
  sectionPropagationNameColor,
  sectionPropagationStatusColor,
} from './section-propagation-list';
import {
  SectionPropagationAnalyzeResponse,
  SectionPropagationApplyResponse,
  SectionPropagationCandidate,
} from './section-propagation.types';

type Props = {
  open: boolean;
  companyId?: string;
  modelId?: number;
  headingId: string | null;
  headingLabel: string;
  onClose: () => void;
};

function PreviewBlock({
  title,
  lines,
}: {
  title: string;
  lines: SectionPropagationCandidate['preview']['current'];
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <SText fontSize={12} fontWeight={600} mb={2}>
        {title}
      </SText>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 4,
          maxHeight: 220,
          overflow: 'auto',
          backgroundColor: 'grey.50',
        }}
      >
        {lines.length ? (
          lines.map((line, index) => (
            <SText key={`${line.type}-${index}`} fontSize={12} mb={1}>
              [{line.type}] {line.text}
            </SText>
          ))
        ) : (
          <SText fontSize={12} color="text.light">
            —
          </SText>
        )}
      </Box>
    </Box>
  );
}

export const DocumentModelSectionPropagationDialog: FC<Props> = ({
  open,
  companyId,
  modelId,
  headingId,
  headingLabel,
  onClose,
}) => {
  const analyzeMutation = useMutAnalyzeSectionPropagation();
  const applyMutation = useMutApplySectionPropagation();
  const createLinkMutation = useMutCreateDocumentModelSectionLink();
  const [analysis, setAnalysis] = useState<SectionPropagationAnalyzeResponse | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);
  const [applyResult, setApplyResult] = useState<SectionPropagationApplyResponse | null>(
    null,
  );
  const [linkPrompt, setLinkPrompt] = useState(false);
  const [linkDone, setLinkDone] = useState(false);
  const [classificationFilters, setClassificationFilters] = useState<
    DocumentModelClassificationEnum[]
  >([]);

  useEffect(() => {
    if (!open || !modelId || !headingId) return;
    setAnalysis(null);
    setSelectedIds([]);
    setPreviewId(null);
    setConfirmApplyOpen(false);
    setApplyResult(null);
    setLinkPrompt(false);
    setLinkDone(false);
    setClassificationFilters([]);
    void analyzeMutation
      .mutateAsync({ id: modelId, headingId, companyId })
      .then((result) => {
        if (result) setAnalysis(result);
      })
      .catch(() => undefined);
    // Intentionally only re-run when the dialog opens for a heading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modelId, headingId, companyId]);

  const candidates = analysis?.candidates || [];
  const visibleCandidates = useMemo(
    () => filterSectionPropagationCandidates(candidates, classificationFilters),
    [candidates, classificationFilters],
  );
  const groups = useMemo(
    () => groupSectionPropagationCandidates(visibleCandidates),
    [visibleCandidates],
  );
  const selectableIds = useMemo(
    () => visibleCandidates.filter((row) => row.selectable).map((row) => row.id),
    [visibleCandidates],
  );
  const documentType = analysis?.source.type as DocumentTypeEnum | undefined;

  const toggle = (candidate: SectionPropagationCandidate) => {
    if (applyResult) return;
    if (!candidate.selectable && !candidate.alreadyUpToDate) return;
    setSelectedIds((current) =>
      current.includes(candidate.id)
        ? current.filter((id) => id !== candidate.id)
        : [...current, candidate.id],
    );
  };

  const handleApply = async (idsOverride?: number[]) => {
    const ids = idsOverride?.length ? idsOverride : selectedIds;
    if (!modelId || !headingId || !ids.length || !analysis?.source) return;
    const targets = candidates
      .filter(
        (row) =>
          ids.includes(row.id) && (row.selectable || row.alreadyUpToDate),
      )
      .map((row) => ({ id: row.id, expectedUpdatedAt: row.updated_at }));
    if (!targets.length) return;
    setConfirmApplyOpen(false);
    try {
      const result = await applyMutation.mutateAsync({
        id: modelId,
        headingId,
        companyId,
        expectedSourceUpdatedAt: analysis.source.updated_at,
        expectedSourceHash: analysis.source.dataHash,
        targets,
      });
      if (result) {
        setApplyResult(result);
        const linkable = result.results.some(
          (row) =>
            ids.includes(row.id) &&
            (row.outcome === 'updated' || row.outcome === 'already_up_to_date'),
        );
        setLinkPrompt(linkable);
      }
    } catch {
      // snackbar from mutation
    }
  };

  const requestApply = (idsOverride?: number[]) => {
    const ids = idsOverride?.length ? idsOverride : selectedIds;
    const needsConfirm = candidates.some(
      (row) => ids.includes(row.id) && row.selectable && !row.alreadyUpToDate,
    );
    if (needsConfirm) {
      if (idsOverride?.length) setSelectedIds(idsOverride);
      setConfirmApplyOpen(true);
      return;
    }
    void handleApply(ids);
  };

  const handleClose = () => {
    if (
      analyzeMutation.isLoading ||
      applyMutation.isLoading ||
      createLinkMutation.isLoading
    )
      return;
    onClose();
  };

  const handleKeepLinked = async () => {
    if (!modelId || !headingId || !applyResult) return;
    const memberModelIds = applyResult.results
      .filter(
        (row) =>
          selectedIds.includes(row.id) &&
          (row.outcome === 'updated' || row.outcome === 'already_up_to_date'),
      )
      .map((row) => row.id);
    if (!memberModelIds.length) {
      setLinkPrompt(false);
      setLinkDone(true);
      return;
    }
    try {
      await createLinkMutation.mutateAsync({
        id: modelId,
        headingId,
        memberModelIds,
        companyId,
      });
      setLinkPrompt(false);
      setLinkDone(true);
    } catch {
      // snackbar from mutation
    }
  };

  const handleSkipLink = () => {
    setLinkPrompt(false);
    setLinkDone(true);
  };

  const buttons = (
    applyResult
      ? [
          {
            text: 'Fechar',
            variant: 'contained',
            onClick: handleClose,
          },
        ]
      : [
          {
            text: 'Cancelar',
            variant: 'outlined',
            disabled: applyMutation.isLoading,
            onClick: handleClose,
          },
          {
            text: selectedIds.length
              ? `Aplicar em ${selectedIds.length} modelo${
                  selectedIds.length === 1 ? '' : 's'
                }`
              : 'Aplicar',
            variant: 'contained',
            disabled:
              applyMutation.isLoading ||
              analyzeMutation.isLoading ||
              !selectedIds.length ||
              confirmApplyOpen,
            onClick: () => {
              requestApply();
            },
          },
        ]
  ) as IModalButton[];

  return (
    <SModal open={open} onClose={handleClose}>
      <SModalPaper
        center
        p={8}
        width={['100%', 840]}
        loading={
          analyzeMutation.isLoading ||
          applyMutation.isLoading ||
          createLinkMutation.isLoading
        }
      >
        <SModalHeader onClose={handleClose} title="Aplicar seção em outros modelos" />
        <SText color="text.light" mb={2}>
          Seção: {headingLabel || analysis?.source.headingText || '—'}
        </SText>
        <SText mb={6} maxWidth={760}>
          Selecione os modelos nos quais esta versão da seção deverá ser
          aplicada.
        </SText>

        {applyResult ? (
          <Box mb={6}>
            <SText fontWeight={600} mb={2}>
              Atualização concluída
            </SText>
            <SText fontSize={13}>
              {applyResult.summary.updated} modelos atualizados
            </SText>
            <SText fontSize={13}>
              {applyResult.summary.alreadyUpToDate +
                candidates.filter(
                  (row) =>
                    row.alreadyUpToDate && !selectedIds.includes(row.id),
                ).length}{' '}
              já estava atualizado
            </SText>
            <SText fontSize={13}>
              {applyResult.summary.stale} não foi atualizado porque mudou desde
              a análise
            </SText>
            <SText fontSize={13}>
              {candidates.filter(
                (row) => !row.selectable && !row.alreadyUpToDate,
              ).length}{' '}
              não selecionáveis por divergência estrutural
            </SText>
            <SText fontSize={13} mb={4}>
              {applyResult.summary.errors} erros inesperados
            </SText>
            {applyResult.results.map((row) => (
              <SText key={row.id} fontSize={12} color="text.light">
                {row.name || row.id}: {row.uiLabel}
                {row.wrote ? ' (atualizado)' : ''}
              </SText>
            ))}
            {linkPrompt && !linkDone ? (
              <Box mt={6}>
                <SText fontWeight={600} mb={2}>
                  Deseja manter estas seções vinculadas para futuras atualizações?
                </SText>
                <SFlex gap={3}>
                  <Button
                    variant="contained"
                    disabled={createLinkMutation.isLoading}
                    onClick={() => {
                      void handleKeepLinked();
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Manter vinculadas
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={createLinkMutation.isLoading}
                    onClick={handleSkipLink}
                    sx={{ textTransform: 'none' }}
                  >
                    Agora não
                  </Button>
                </SFlex>
              </Box>
            ) : null}
            {linkDone ? (
              <SText fontSize={13} mt={4} color="text.secondary">
                {createLinkMutation.isSuccess
                  ? 'Seções mantidas vinculadas.'
                  : 'Nenhum vínculo foi criado nesta atualização.'}
              </SText>
            ) : null}
          </Box>
        ) : confirmApplyOpen ? (
          <Box mb={6}>
            <SText fontWeight={600} mb={4}>
              Confirmar substituição
            </SText>
            <SText fontSize={14} mb={6} maxWidth={760}>
              Os modelos selecionados possuem versões diferentes desta seção. A
              versão atual da seção será substituída pela versão deste modelo de
              origem. Deseja continuar?
            </SText>
            <SFlex gap={3} justifyContent="flex-end">
              <Button
                variant="outlined"
                disabled={applyMutation.isLoading}
                onClick={() => setConfirmApplyOpen(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                disabled={applyMutation.isLoading}
                onClick={() => {
                  void handleApply();
                }}
                sx={{ textTransform: 'none' }}
              >
                Aplicar
              </Button>
            </SFlex>
          </Box>
        ) : (
          <>
            {analysis && documentType ? (
              <Box mb={4}>
                <DocumentModelPgrClassificationFilters
                  documentType={documentType}
                  active={classificationFilters}
                  onChange={setClassificationFilters}
                />
                {classificationFilters.length ? (
                  <Button
                    size="small"
                    onClick={() => setClassificationFilters([])}
                    sx={{ ml: 2, mt: -2, mb: 2, px: 0, minWidth: 0, textTransform: 'none' }}
                  >
                    Limpar filtros
                  </Button>
                ) : null}
              </Box>
            ) : null}
            <Box sx={{ maxHeight: 420, overflow: 'auto', mb: 4 }}>
              {groups.map((group) =>
                group.count ? (
                  <Box key={group.id} mb={4}>
                    <SText fontSize={13} fontWeight={700} mb={2}>
                      {group.title} ({group.count})
                    </SText>
                    {group.candidates.map((candidate) => {
                      const checked = selectedIds.includes(candidate.id);
                      const disabled = !candidate.selectable && !candidate.alreadyUpToDate;
                      const currentCount =
                        candidate.preview.currentCount ?? candidate.preview.current.length;
                      const nextCount =
                        candidate.preview.nextCount ?? candidate.preview.next.length;
                      return (
                        <Box
                          key={candidate.id}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'grey.200',
                            py: 4,
                          }}
                        >
                          <SFlex align="flex-start" gap={2}>
                            <Checkbox
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggle(candidate)}
                              size="small"
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <SText
                                fontSize={14}
                                fontWeight={600}
                                color={sectionPropagationNameColor(group.id)}
                              >
                                {candidate.name}
                              </SText>
                              <Box mt={2} mb={2}>
                                <DocumentModelClassificationChips
                                  classifications={candidate.classifications}
                                />
                              </Box>
                              <SText
                                fontSize={12}
                                color={sectionPropagationStatusColor(candidate.uiStatus)}
                              >
                                {candidate.linked ? 'Vinculado · ' : ''}
                                {candidate.uiLabel}
                              </SText>
                              {candidate.selectable || candidate.alreadyUpToDate ? (
                                <SFlex gap={3} mt={2} align="center">
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      setPreviewId((current) =>
                                        current === candidate.id ? null : candidate.id,
                                      )
                                    }
                                    sx={{ px: 0, minWidth: 0, textTransform: 'none' }}
                                  >
                                    Visualizar
                                  </Button>
                                </SFlex>
                              ) : null}
                              <Collapse in={previewId === candidate.id}>
                                <SText fontSize={12} color="text.secondary" mt={3}>
                                  Modelo: {candidate.name}
                                </SText>
                                {currentCount !== nextCount ? (
                                  <SText fontSize={12} color="text.secondary" mt={1}>
                                    Estrutura: {currentCount} elementos → {nextCount} elementos
                                  </SText>
                                ) : null}
                                {candidate.selectable && !candidate.alreadyUpToDate ? (
                                  <SText fontSize={12} color="warning.dark" mt={1} mb={2}>
                                    A seção inteira será substituída.
                                  </SText>
                                ) : null}
                                <SFlex gap={4} mt={3}>
                                  <PreviewBlock
                                    title="Conteúdo atual"
                                    lines={candidate.preview.current}
                                  />
                                  <PreviewBlock
                                    title="Nova versão"
                                    lines={candidate.preview.next}
                                  />
                                </SFlex>
                                {candidate.selectable && !candidate.alreadyUpToDate ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={applyMutation.isLoading}
                                    onClick={() => requestApply([candidate.id])}
                                    sx={{ mt: 4, textTransform: 'none' }}
                                  >
                                    Aplicar neste modelo
                                  </Button>
                                ) : null}
                              </Collapse>
                            </Box>
                          </SFlex>
                        </Box>
                      );
                    })}
                  </Box>
                ) : null,
              )}
              {!analyzeMutation.isLoading && analysis && !candidates.length ? (
                <SText color="text.light">
                  Nenhum outro modelo ativo do mesmo tipo foi encontrado.
                </SText>
              ) : null}
              {!analyzeMutation.isLoading &&
              analysis &&
              candidates.length &&
              !visibleCandidates.length ? (
                <SText color="text.light">
                  Nenhum modelo corresponde aos filtros selecionados.
                </SText>
              ) : null}
            </Box>
          </>
        )}

        <SText fontSize={11} color="text.light" mb={2}>
          {selectableIds.length
            ? `${selectableIds.length} modelo(s) compatível(is).`
            : 'Nenhum modelo compatível para seleção nesta análise.'}
        </SText>
        <SModalButtons
          onClose={handleClose}
          loading={applyMutation.isLoading}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
