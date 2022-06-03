import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { initialPgrDocState } from 'components/organisms/modals/ModalAddDocPgr/hooks/useHandleActions';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import {
  IUpsertRiskGroupData,
  useMutUpsertRiskGroupData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertRiskGroupData';
import { pgrSchema } from 'core/utils/schemas/pgr.schema';

interface ISubmit
  extends Omit<IUpsertRiskGroupData, 'status' | 'id' | 'companyId'> {}

export const usePgrForm = (docId: string, data?: IRiskGroupData) => {
  const { onOpenModal } = useModal();
  const { handleSubmit, control, getValues, trigger, setFocus } = useForm({
    resolver: yupResolver(pgrSchema),
  });

  const [uneditable, setUneditable] = useState(true);

  const updateMutation = useMutUpsertRiskGroupData();

  const onSubmitNewVersion: SubmitHandler<ISubmit> = async (data) => {
    const submitData: IUpsertRiskGroupData = {
      id: docId,
      ...data,
    };
    await updateMutation.mutateAsync(submitData);
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
      await updateMutation.mutateAsync({
        id: docId,
        name,
        approvedBy,
        elaboratedBy,
        visitDate,
        source,
        revisionBy,
      });

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
      visitDate: data.visitDate || '',
      source: data.source || '',
      id: data.id,
      name: data.name,
      companyId: data.companyId,
      status: data.status,
    };

    onOpenModal(ModalEnum.WORKSPACE_SELECT, initialState);
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

export type IUseEditWorkspace = ReturnType<typeof usePgrForm>;
