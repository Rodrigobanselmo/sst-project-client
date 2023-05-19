import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { initialPgrDocState } from 'components/organisms/modals/ModalAddDocVersion/hooks/usePGRHandleActions';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/riskGroupData/useMutUpsertRiskGroupData';
import { dateFormat } from 'core/utils/date/date-format';
import { documentDataSchema } from 'core/utils/schemas/docuementData.schema';

interface ISubmit
  extends Omit<
    IUpsertRiskGroupData,
    'status' | 'id' | 'companyId' | 'visitDate'
  > {
  visitDate?: string;
}

export const usePgrForm = (docId: string, data?: any) => {
  const { onOpenModal } = useModal();
  const { handleSubmit, control, getValues, setValue, trigger, setFocus } =
    useForm({
      resolver: yupResolver(documentDataSchema),
    });

  const [uneditable, setUneditable] = useState(true);

  const updateMutation = useMutUpsertRiskGroupData();

  const onSubmitNewVersion: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertRiskGroupData = {
      id: docId,
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
          id: docId,
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

    const initialState: Partial<any> = {
      approvedBy: data.approvedBy || '',
      elaboratedBy: data.elaboratedBy || '',
      revisionBy: data.revisionBy || '',
      visitDate: data.visitDate,
      source: data.source || '',
      complementaryDocs: data.complementaryDocs || [],
      complementarySystems: data.complementarySystems || [],
      coordinatorBy: data.coordinatorBy || '',
      id: data.id || '',
      name: data.name || '',
      companyId: data.companyId,
      status: data.status,
      professionals: data.professionals || [],
      users: data.users || [],
      validityEnd: data.validityEnd,
      validityStart: data.validityStart,
      isQ5: data.isQ5 || false,
      hasEmergencyPlan: data.hasEmergencyPlan || false,
    };

    const initialWorkspaceState = {
      title: 'Selecione o estabelecimento para o Sistema de Gestão SST',
      onSelect: (work: IWorkspace) =>
        onOpenModal(ModalEnum.DOCUMENT_DATA_UPSERT, {
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
    setValue,
  };
};

export type IUseEditWorkspace = ReturnType<typeof usePgrForm>;
