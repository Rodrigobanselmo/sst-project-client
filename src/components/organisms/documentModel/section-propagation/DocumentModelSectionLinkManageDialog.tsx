import { FC, useEffect, useMemo, useState } from 'react';

import { Box, Button } from '@mui/material';
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
import {
  useMutAddDocumentModelSectionLinkMember,
  useMutGetDocumentModelSectionLinks,
  useMutRemoveDocumentModelSectionLinkMember,
} from 'core/services/hooks/mutations/manager/document-model/useMutDocumentModelSectionLinks/useMutDocumentModelSectionLinks';
import { StatusEnum } from 'project/enum/status.enum';

import {
  SectionLinkGroupResponse,
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

export const DocumentModelSectionLinkManageDialog: FC<Props> = ({
  open,
  companyId,
  modelId,
  headingId,
  headingLabel,
  onClose,
}) => {
  const getMutation = useMutGetDocumentModelSectionLinks();
  const addMutation = useMutAddDocumentModelSectionLinkMember();
  const removeMutation = useMutRemoveDocumentModelSectionLinkMember();
  const analyzeMutation = useMutAnalyzeSectionPropagation();
  const [payload, setPayload] = useState<SectionLinkGroupResponse | null>(null);
  const [adding, setAdding] = useState(false);
  const [addCandidates, setAddCandidates] = useState<SectionPropagationCandidate[]>([]);

  useEffect(() => {
    if (!open || !modelId || !headingId) return;
    setPayload(null);
    setAdding(false);
    setAddCandidates([]);
    void getMutation
      .mutateAsync({ id: modelId, headingId, companyId })
      .then((result) => {
        if (result) setPayload(result);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modelId, headingId, companyId]);

  const memberIds = useMemo(
    () => new Set((payload?.members || []).map((item) => item.documentModelId)),
    [payload],
  );

  const handleClose = () => {
    if (getMutation.isLoading || addMutation.isLoading || removeMutation.isLoading) return;
    onClose();
  };

  const handleRemove = async (documentModelId: number) => {
    if (!payload?.group?.id) return;
    try {
      const result = await removeMutation.mutateAsync({
        groupId: payload.group.id,
        modelId: documentModelId,
        relativeToModelId: modelId,
        companyId,
      });
      if (result) setPayload(result);
    } catch {
      // snackbar from mutation
    }
  };

  const handleStartAdd = async () => {
    if (!modelId || !headingId) return;
    setAdding(true);
    try {
      const analysis = await analyzeMutation.mutateAsync({
        id: modelId,
        headingId,
        companyId,
      });
      const rows = (analysis?.candidates || []).filter(
        (row) =>
          !memberIds.has(row.id) && (row.selectable || row.alreadyUpToDate),
      );
      setAddCandidates(rows);
    } catch {
      setAddCandidates([]);
    }
  };

  const handleAdd = async (documentModelId: number) => {
    if (!payload?.group?.id) return;
    try {
      const result = await addMutation.mutateAsync({
        groupId: payload.group.id,
        documentModelId,
        relativeToModelId: modelId,
        companyId,
      });
      if (result) {
        setPayload(result);
        setAddCandidates((current) => current.filter((row) => row.id !== documentModelId));
      }
    } catch {
      // snackbar from mutation
    }
  };

  const buttons = [
    {
      text: 'Fechar',
      variant: 'contained',
      onClick: handleClose,
    },
  ] as IModalButton[];

  const loading =
    getMutation.isLoading ||
    addMutation.isLoading ||
    removeMutation.isLoading ||
    analyzeMutation.isLoading;

  return (
    <SModal open={open} onClose={handleClose}>
      <SModalPaper center p={8} width={['100%', 720]} loading={loading}>
        <SModalHeader onClose={handleClose} title="Gerenciar vínculos da seção" />
        <SText fontWeight={600} mb={1}>
          Seção
        </SText>
        <SText color="text.light" mb={2}>
          {headingLabel || payload?.group?.label || '—'}
        </SText>
        <SText mb={6} maxWidth={680}>
          O vínculo é desta seção estrutural (título âncora + janela), não de um
          parágrafo ou área visual do editor. Remover um modelo daqui tira só
          este modelo deste grupo. Outras seções entre os mesmos modelos
          permanecem vinculadas nos seus próprios grupos. O conteúdo do
          documento não muda. O status de sincronização é em relação a este
          modelo — não há documento mestre permanente.
        </SText>

        {!payload?.group ? (
          <SText color="text.light" mb={4}>
            Esta seção ainda não está vinculada. Vincule após aplicar em outros
            modelos.
          </SText>
        ) : (
          <>
            <SText fontWeight={600} mb={3}>
              Modelos vinculados
            </SText>
            <Box sx={{ maxHeight: 360, overflow: 'auto', mb: 4 }}>
              {(payload.members || []).map((member) => (
                <Box
                  key={member.documentModelId}
                  sx={{ borderBottom: '1px solid', borderColor: 'grey.200', py: 4 }}
                >
                  <SFlex justify="space-between" align="flex-start" gap={4}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <SText fontSize={14} fontWeight={600}>
                        {member.name}
                        {member.current ? ' (este modelo)' : ''}
                      </SText>
                      <Box mt={2} mb={2}>
                        <DocumentModelClassificationChips
                          classifications={member.classifications}
                        />
                      </Box>
                      <SText fontSize={12} color="text.secondary">
                        {member.status === StatusEnum.INACTIVE ? 'INACTIVE' : 'ACTIVE'}
                        {' · '}
                        {member.broken
                          ? 'Vínculo quebrado'
                          : member.contentSync === 'synced'
                            ? 'Sincronizado com este modelo'
                            : member.contentSync === 'inactive'
                              ? 'Vínculo válido'
                              : 'Divergente deste modelo'}
                      </SText>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        void handleRemove(member.documentModelId);
                      }}
                      sx={{ textTransform: 'none', flexShrink: 0 }}
                    >
                      Remover do vínculo
                    </Button>
                  </SFlex>
                </Box>
              ))}
            </Box>
            {adding ? (
              <Box mb={4}>
                <SText fontWeight={600} mb={2}>
                  Adicionar modelo
                </SText>
                {addCandidates.length ? (
                  addCandidates.map((candidate) => (
                    <SFlex key={candidate.id} justify="space-between" align="center" mb={2}>
                      <SText fontSize={13}>{candidate.name}</SText>
                      <Button
                        size="small"
                        onClick={() => {
                          void handleAdd(candidate.id);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Adicionar
                      </Button>
                    </SFlex>
                  ))
                ) : (
                  <SText fontSize={13} color="text.light">
                    Nenhum modelo com correspondência segura para este vínculo.
                  </SText>
                )}
              </Box>
            ) : (
              <Button
                size="small"
                onClick={() => {
                  void handleStartAdd();
                }}
                sx={{ mb: 4, px: 0, minWidth: 0, textTransform: 'none' }}
              >
                Adicionar modelo
              </Button>
            )}
          </>
        )}

        <SModalButtons onClose={handleClose} loading={loading} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
