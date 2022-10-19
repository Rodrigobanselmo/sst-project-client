import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { initialPgrDocState } from 'components/organisms/modals/ModalAddDocPgr/hooks/useHandleActions';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IDocumentPCMSO } from 'core/interfaces/api/IDocumentPCMSO';
import {
  IUpsertDocumentPCMSO,
  useMutUpsertDocumentPCMSO,
} from 'core/services/hooks/mutations/checklist/docPCMSO/useMutUpsertDocPCMSO';
import { dateFormat } from 'core/utils/date/date-format';
import { pgrSchema } from 'core/utils/schemas/pgr.schema';

interface ISubmit
  extends Omit<
    IUpsertDocumentPCMSO,
    'status' | 'id' | 'companyId' | 'visitDate'
  > {
  visitDate?: string;
}

export const usePcmsoForm = (data?: IDocumentPCMSO) => {
  const { onOpenModal } = useModal();
  const { handleSubmit, control, getValues, trigger, setFocus } = useForm({
    resolver: yupResolver(pgrSchema),
  });

  const [uneditable, setUneditable] = useState(true);

  const updateMutation = useMutUpsertDocumentPCMSO();

  const onSubmitNewVersion: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertDocumentPCMSO = {
      ...data,
      visitDate: dateFormat(data.visitDate),
    };
    await updateMutation.mutateAsync(submitData).catch(() => {});
  };

  const onSave = async () => {
    const isValid = await trigger(['name']);

    if (isValid) {
      const {
        name,
        approvedBy,
        elaboratedBy,
        visitDate,
        revisionBy,
        source,
      }: ISubmit = getValues();
      await updateMutation
        .mutateAsync({
          id: data?.id,
          name,
          approvedBy,
          elaboratedBy,
          visitDate: dateFormat(visitDate),
          source,
          revisionBy,
        })
        .catch(() => {});

      setUneditable(true);
      return true;
    }
    return false;
  };

  const onEdit = () => {
    if (uneditable) {
      setUneditable(false);

      setTimeout(() => {
        setFocus('name');
      }, 100);
      return;
    }
    setUneditable(true);
  };

  const onGenerateVersion = async () => {
    if (!data) return;
    setUneditable(true);

    const initialState: Partial<typeof initialPgrDocState> = {
      approvedBy: data.approvedBy || '',
      elaboratedBy: data.elaboratedBy || '',
      revisionBy: data.revisionBy || '',
      visitDate: data.visitDate,
      source: data.source || '',
      coordinatorBy: data.coordinatorBy || '',
      id: data.id || '',
      name: data.name || '',
      companyId: data.companyId,
      status: data.status,
      professionals: data.professionals || [],
      // users: data.users || [],
      validityEnd: data.validityEnd,
      validityStart: data.validityStart,
    };

    const initialWorkspaceState = {
      title: 'Selecione o estabelecimento para o Sistema de Gestão SST',
      onSelect: (work: IWorkspace) =>
        onOpenModal(ModalEnum.RISK_GROUP_DOC_ADD, {
          workspaceId: work.id,
          workspaceName: work.name,
          ...initialState,
        }),
    } as typeof initialWorkspaceSelectState;

    onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
  };

  return {
    onSubmitNewVersion,
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    onSave,
    onGenerateVersion,
    uneditable,
    setUneditable,
    onEdit,
  };
};

export type IUseEditWorkspace = ReturnType<typeof usePcmsoForm>;
