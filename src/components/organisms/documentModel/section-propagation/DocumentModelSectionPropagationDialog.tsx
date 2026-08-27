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
import { DocumentModelClassificationChips } from 'components/organisms/tables/DocumentModelTable/DocumentModelClassificationChips';
import { useMutAnalyzeSectionPropagation } from 'core/services/hooks/mutations/manager/document-model/useMutAnalyzeSectionPropagation/useMutAnalyzeSectionPropagation';
import { useMutApplySectionPropagation } from 'core/services/hooks/mutations/manager/document-model/useMutApplySectionPropagation/useMutApplySectionPropagation';

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
  const [analysis, setAnalysis] = useState<SectionPropagationAnalyzeResponse | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [applyResult, setApplyResult] = useState<SectionPropagationApplyResponse | null>(
    null,
  );

  useEffect(() => {
    if (!open || !modelId || !headingId) return;
    setAnalysis(null);
    setSelectedIds([]);
    setPreviewId(null);
    setApplyResult(null);
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
  const selectableIds = useMemo(
    () => candidates.filter((row) => row.selectable).map((row) => row.id),
    [candidates],
  );

  const toggle = (candidate: SectionPropagationCandidate) => {
    if (!candidate.selectable || applyResult) return;
    setSelectedIds((current) =>
      current.includes(candidate.id)
        ? current.filter((id) => id !== candidate.id)
        : [...current, candidate.id],
    );
  };

  const handleApply = async () => {
    if (!modelId || !headingId || !selectedIds.length || !analysis?.source) return;
    const targets = candidates
      .filter((row) => selectedIds.includes(row.id) && row.selectable)
      .map((row) => ({ id: row.id, expectedUpdatedAt: row.updated_at }));
    if (!targets.length) return;
    try {
      const result = await applyMutation.mutateAsync({
        id: modelId,
        headingId,
        companyId,
        expectedSourceUpdatedAt: analysis.source.updated_at,
        expectedSourceHash: analysis.source.dataHash,
        targets,
      });
      if (result) setApplyResult(result);
    } catch {
      // snackbar from mutation
    }
  };

  const handleClose = () => {
    if (analyzeMutation.isLoading || applyMutation.isLoading) return;
    onClose();
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
              !selectedIds.length,
            onClick: () => {
              void handleApply();
            },
          },
        ]
  ) as IModalButton[];

  return (
    <SModal open={open} onClose={handleClose}>
      <SModalPaper
        center
        p={8}
        width={['100%', 760]}
        loading={analyzeMutation.isLoading || applyMutation.isLoading}
      >
        <SModalHeader onClose={handleClose} title="Aplicar seção em outros modelos" />
        <SText color="text.light" mb={2}>
          Seção: {headingLabel || analysis?.source.headingText || '—'}
        </SText>
        <SText mb={6} maxWidth={700}>
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
          </Box>
        ) : (
          <Box sx={{ maxHeight: 420, overflow: 'auto', mb: 4 }}>
            {candidates.map((candidate) => {
              const checked = selectedIds.includes(candidate.id);
              const disabled = !candidate.selectable;
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
                      <SText fontSize={14} fontWeight={600}>
                        {candidate.name}
                      </SText>
                      <Box mt={2} mb={2}>
                        <DocumentModelClassificationChips
                          classifications={candidate.classifications}
                        />
                      </Box>
                      <SText
                        fontSize={12}
                        color={candidate.selectable ? 'success.main' : 'text.light'}
                      >
                        {candidate.uiLabel}
                      </SText>
                      {candidate.selectable || candidate.alreadyUpToDate ? (
                        <Button
                          size="small"
                          onClick={() =>
                            setPreviewId((current) =>
                              current === candidate.id ? null : candidate.id,
                            )
                          }
                          sx={{ mt: 2, px: 0, minWidth: 0, textTransform: 'none' }}
                        >
                          Visualizar alteração
                        </Button>
                      ) : null}
                      <Collapse in={previewId === candidate.id}>
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
                      </Collapse>
                    </Box>
                  </SFlex>
                </Box>
              );
            })}
            {!analyzeMutation.isLoading && analysis && !candidates.length ? (
              <SText color="text.light">
                Nenhum outro modelo ativo do mesmo tipo foi encontrado.
              </SText>
            ) : null}
          </Box>
        )}

        <SText fontSize={11} color="text.light" mb={2}>
          {selectableIds.length
            ? `${selectableIds.length} modelo(s) compatível(is).`
            : 'Nenhum modelo compatível para seleção nesta V1.'}
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
