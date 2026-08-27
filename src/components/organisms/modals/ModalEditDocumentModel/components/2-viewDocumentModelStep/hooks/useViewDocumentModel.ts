import { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import { getModelSectionsBySelectedItem } from 'components/organisms/documentModel/DocumentModelContent/utils/getModelBySelectedItem';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import {
  createV2SaveGuardSession,
  resolveOfficialSaveAttempt,
} from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-save-guard';
import {
  diffChangedHeadingWindows,
  listHeadingWindowFingerprints,
  ChangedLinkedSection,
  LinkedSaveEvent,
} from 'components/organisms/documentModel/section-propagation/section-link-save-diff';
import { IDocumentSlice } from 'store/reducers/document/documentSlice';

import { useMutPreviewDocumentModel } from 'core/services/hooks/mutations/checklist/documentData/useMutPreviewDocumentModel/useMutPreviewDocumentModel';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export type { LinkedSaveEvent } from 'components/organisms/documentModel/section-propagation/section-link-save-diff';

export const useViewDocumentModel = (props: IUseDocumentModel) => {
  const { onClose, data, saveDocumentModel, closeEditor, model } = props;
  const v2Session = useDocumentEditorV2Session();
  const store = useStore<any>();
  const downloadPreview = useMutPreviewDocumentModel();
  const [saveIntent, setSaveIntent] = useState<'stay' | 'exit' | null>(null);
  const [linkedSaveEvent, setLinkedSaveEvent] = useState<LinkedSaveEvent | null>(
    null,
  );
  const baselineRef = useRef<ChangedLinkedSection[] | null>(null);
  const pendingExitRef = useRef(false);

  useEffect(() => {
    baselineRef.current = listHeadingWindowFingerprints(
      (store.getState().document as IDocumentSlice).model,
    );
    pendingExitRef.current = false;
  }, [data?.id, store]);

  const onCloseUnsaved = async () => {
    onClose();
  };

  const onDownloadPreview = async () => {
    const selectedItem = (store.getState().document as IDocumentSlice)
      .selectItem;

    const modelDocument = (store.getState().document as IDocumentSlice).model;
    if (data.type && modelDocument && model && selectedItem) {
      const modelSections = getModelSectionsBySelectedItem(
        modelDocument,
        model.sections,
        selectedItem,
      );

      if (modelSections) {
        downloadPreview
          .mutateAsync({
            type: data.type,
            companyId: data.companyId,
            data: {
              ...model?.document,
              sections: [{ data: modelSections as any }],
            },
          })
          .catch(() => null);
      }
    }
  };

  const onLinkedSaveSettled = () => {
    if (pendingExitRef.current) {
      pendingExitRef.current = false;
      closeEditor();
    }
  };

  const runPersist = async (intent: 'stay' | 'exit') => {
    setSaveIntent(intent);
    const ok = await saveDocumentModel({
      exitAfterSuccess: intent === 'exit',
    });
    if (!ok) {
      setSaveIntent(null);
      return;
    }
    const saved = listHeadingWindowFingerprints(
      (store.getState().document as IDocumentSlice).model,
    );
    const previous = baselineRef.current;
    const changed =
      previous == null ? [] : diffChangedHeadingWindows(previous, saved);
    baselineRef.current = saved;
    setLinkedSaveEvent((current) => ({
      seq: (current?.seq || 0) + 1,
      intent,
      changed,
    }));
    if (ok && intent === 'exit') {
      if (!changed.length) {
        closeEditor();
        setSaveIntent(null);
        return;
      }
      pendingExitRef.current = true;
    }
    setSaveIntent(null);
  };

  const decideOfficialSave = (intent: 'stay' | 'exit') =>
    resolveOfficialSaveAttempt(
      createV2SaveGuardSession({
        surface: v2Session.visibleSurface,
        v2LocalDirty: v2Session.v2LocalDirty,
        experimentNotice: v2Session.experimentNotice,
        remountKey: v2Session.remountKey,
        saveEnabled: v2Session.canPersistV2,
      }),
      intent,
    );

  const onSubmit = async () => {
    const decision = decideOfficialSave('stay');
    if (!decision.persist) {
      v2Session.reportBlockedSave();
      return;
    }
    await runPersist('stay');
  };

  const onSubmitAndExit = async () => {
    const decision = decideOfficialSave('exit');
    if (!decision.persist || !decision.close) {
      v2Session.reportBlockedSave();
      return;
    }
    await runPersist('exit');
  };

  const saveBusy =
    props.saveMutation.isLoading ||
    props.updateMutation.isLoading ||
    saveIntent !== null;

  return {
    ...props,
    onSubmit,
    onSubmitAndExit,
    onCloseUnsaved,
    onDownloadPreview,
    downlandLoading: downloadPreview.isLoading,
    saveLoading: saveIntent === 'stay',
    saveAndExitLoading: saveIntent === 'exit',
    saveBusy,
    linkedSaveEvent,
    onLinkedSaveSettled,
  };
};

export type IUseViewDocumentModel = ReturnType<typeof useViewDocumentModel>;
