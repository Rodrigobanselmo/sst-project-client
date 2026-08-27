import { FC, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import SFlex from 'components/atoms/SFlex';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';
import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';

import { SCopyIcon } from 'assets/icons/SCopyIcon';
import { SLinkIcon } from 'assets/icons/SLinkIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { useMutGetDocumentModelSectionLinks, useMutRemoveDocumentModelSectionLinkMember } from 'core/services/hooks/mutations/manager/document-model/useMutDocumentModelSectionLinks/useMutDocumentModelSectionLinks';

import { DocumentModelSectionLinkAfterSaveDialog } from './DocumentModelSectionLinkAfterSaveDialog';
import { DocumentModelSectionLinkManageDialog } from './DocumentModelSectionLinkManageDialog';
import { DocumentModelSectionPropagationDialog } from './DocumentModelSectionPropagationDialog';
import { LinkedSaveEvent, resolveAfterSaveQueueAdvance } from './section-link-save-diff';
import {
  canOpenSectionPropagation,
  DOCUMENT_MODEL_SECTION_PROPAGATION_HEADING_MESSAGE,
  DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE,
  isDocumentHeadingTreeNode,
} from './section-propagation-gate';

type QueueItem = {
  headingId: string;
  label: string;
  groupId: string;
};

type Props = {
  companyId?: string;
  modelId?: number;
  isDirty: boolean;
  saveBusy: boolean;
  linkedSaveEvent?: LinkedSaveEvent | null;
  onLinkedSaveSettled?: () => void;
};

export const DocumentModelSectionPropagationAction: FC<Props> = ({
  companyId,
  modelId,
  isDirty,
  saveBusy,
  linkedSaveEvent = null,
  onLinkedSaveSettled,
}) => {
  const { isAuthSuccess } = useAuthShow();
  const { enqueueSnackbar } = useSnackbar();
  const v2Session = useDocumentEditorV2Session();
  const selectedItem = useAppSelector(selectDocumentSelectItem);
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [afterSaveOpen, setAfterSaveOpen] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [applyOverride, setApplyOverride] = useState<QueueItem | null>(null);
  const getLinksMutation = useMutGetDocumentModelSectionLinks();
  const unlinkMutation = useMutRemoveDocumentModelSectionLinkMember();

  const canEdit = isAuthSuccess({
    permissions: [PermissionEnum.DOCUMENT_MODEL],
    cruds: 'u',
  });
  const isHeadingSelected = isDocumentHeadingTreeNode(selectedItem);
  const headingLabel = selectedItem
    ? `${selectedItem.headingNumber ? `${selectedItem.headingNumber} ` : ''}${
        selectedItem.text || ''
      }`.trim()
    : '';

  const gate = useMemo(
    () =>
      canOpenSectionPropagation({
        hasModelId: Boolean(modelId),
        isHeadingSelected,
        canEdit,
        isDirty,
        v2LocalDirty: v2Session.v2LocalDirty,
        saveBusy,
        contentSavePending: v2Session.contentSavePending,
      }),
    [
      modelId,
      isHeadingSelected,
      canEdit,
      isDirty,
      v2Session.v2LocalDirty,
      v2Session.contentSavePending,
      saveBusy,
    ],
  );

  const headingId =
    isHeadingSelected && selectedItem ? String(selectedItem.id) : null;
  const currentQueued = queue[queueIndex];
  const applyHeadingId = applyOverride?.headingId || headingId;
  const applyHeadingLabel = applyOverride?.label || headingLabel;

  const finishQueue = () => {
    setQueue([]);
    setQueueIndex(0);
    setAfterSaveOpen(false);
    setApplyOverride(null);
    onLinkedSaveSettled?.();
  };

  const advanceQueue = () => {
    const step = resolveAfterSaveQueueAdvance({
      queueLength: queue.length,
      currentIndex: queueIndex,
    });
    if (step.done) {
      finishQueue();
      return;
    }
    setQueueIndex(step.nextIndex);
    setAfterSaveOpen(true);
  };

  useEffect(() => {
    if (!linkedSaveEvent?.seq || !modelId || !canEdit) {
      if (linkedSaveEvent?.seq) onLinkedSaveSettled?.();
      return;
    }
    const changed = linkedSaveEvent.changed || [];
    if (!changed.length) {
      onLinkedSaveSettled?.();
      return;
    }
    void (async () => {
      const nextQueue: QueueItem[] = [];
      for (const item of changed) {
        try {
          const result = await getLinksMutation.mutateAsync({
            id: modelId,
            headingId: item.headingId,
            companyId,
          });
          const others = (result?.members || []).filter(
            (member) => member.documentModelId !== modelId,
          );
          if (result?.group && others.length) {
            nextQueue.push({
              headingId: item.headingId,
              label: item.label,
              groupId: result.group.id,
            });
          }
        } catch {
          // skip this heading; others still must be offered
        }
      }
      if (!nextQueue.length) {
        onLinkedSaveSettled?.();
        return;
      }
      setQueue(nextQueue);
      setQueueIndex(0);
      setAfterSaveOpen(true);
    })();
    // Only react to a completed Strong Save with real window diffs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedSaveEvent?.seq]);

  if (!canEdit || !modelId) return null;

  return (
    <>
      <Box pt={4}>
        <SFlex gap={2} flexWrap="wrap">
        <STableButton
          text="Aplicar seção em outros modelos"
          icon={SCopyIcon}
          variant="outlined"
          color="white"
          iconColor="primary.main"
          disabled={!isHeadingSelected || saveBusy}
          sm
          onClick={() => {
            if (!gate.ok) {
              enqueueSnackbar(gate.reason || '', { variant: 'warning' });
              return;
            }
            setApplyOverride(null);
            setOpen(true);
          }}
        />
        <STableButton
          text="Gerenciar vínculos da seção"
          icon={SLinkIcon}
          variant="outlined"
          color="white"
          iconColor="primary.main"
          disabled={!isHeadingSelected || saveBusy}
          sm
          onClick={() => {
            if (!canEdit) {
              enqueueSnackbar(DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE, {
                variant: 'warning',
              });
              return;
            }
            if (!isHeadingSelected) {
              enqueueSnackbar(DOCUMENT_MODEL_SECTION_PROPAGATION_HEADING_MESSAGE, {
                variant: 'warning',
              });
              return;
            }
            setManageOpen(true);
          }}
        />
        </SFlex>
      </Box>
      <DocumentModelSectionPropagationDialog
        open={open}
        companyId={companyId}
        modelId={modelId}
        headingId={applyHeadingId}
        headingLabel={applyHeadingLabel}
        onClose={() => {
          const fromQueue = Boolean(applyOverride);
          setOpen(false);
          setApplyOverride(null);
          if (fromQueue) advanceQueue();
        }}
      />
      <DocumentModelSectionLinkManageDialog
        open={manageOpen}
        companyId={companyId}
        modelId={modelId}
        headingId={headingId}
        headingLabel={headingLabel}
        onClose={() => setManageOpen(false)}
      />
      <DocumentModelSectionLinkAfterSaveDialog
        open={afterSaveOpen}
        headingLabel={currentQueued?.label || ''}
        changedCount={queue.length}
        busy={unlinkMutation.isLoading}
        onApply={() => {
          if (!currentQueued) return;
          setAfterSaveOpen(false);
          setApplyOverride(currentQueued);
          setOpen(true);
        }}
        onUnlink={() => {
          if (!currentQueued || !modelId) return;
          void unlinkMutation
            .mutateAsync({
              groupId: currentQueued.groupId,
              modelId,
              relativeToModelId: modelId,
              companyId,
            })
            .then(() => {
              setAfterSaveOpen(false);
              advanceQueue();
            })
            .catch(() => undefined);
        }}
        onDismiss={() => {
          setAfterSaveOpen(false);
          advanceQueue();
        }}
      />
    </>
  );
};
