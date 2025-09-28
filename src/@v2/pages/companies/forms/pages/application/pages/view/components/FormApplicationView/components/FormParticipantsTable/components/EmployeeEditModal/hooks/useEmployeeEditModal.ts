import { useCallback, useRef } from 'react';
import { useModal } from '@v2/hooks/useModal';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useInvalidateQuery } from '@v2/hooks/api/useInvalidateQuery';

interface UseEmployeeEditModalProps {
  companyId: string;
  encryptedEmployeeId: string;
  participantData: FormParticipantsBrowseResultModel;
}

export interface EmployeeFormData {
  name: string;
  email?: string;
  phone?: string;
  cpf: string;
  hierarchyId: string;
}

export const useEmployeeEditModal = ({
  companyId,
  encryptedEmployeeId,
  participantData,
}: UseEmployeeEditModalProps) => {
  const { closeModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { invalidateQueryKey } = useInvalidateQuery();
  const formRef = useRef<{ onSubmit: () => void } | null>(null);

  // We need to get the actual employee ID from the encrypted ID
  // For now, we'll use the participant data directly since we have the employee info
  const employeeId = participantData.id; // This might need to be adjusted based on your data structure

  const { data: employee, isLoading } = useQueryEmployee(
    {
      id: employeeId,
      companyId,
    },
    { enabled: !!employeeId },
  );

  const updateEmployeeMutation = useMutUpdateEmployee();

  const handleSubmit = useCallback(
    async (formData: EmployeeFormData) => {
      if (!employee) return;

      try {
        await updateEmployeeMutation.mutateAsync({
          id: employee.id,
          companyId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          hierarchyId: formData.hierarchyId,
        });

        invalidateQueryKey([QueryKeyFormEnum.FORM_PARTICIPANTS]);

        enqueueSnackbar('Funcionário atualizado com sucesso', {
          variant: 'success',
        });

        closeModal();
      } catch (error) {
        enqueueSnackbar('Erro ao atualizar funcionário', {
          variant: 'error',
        });
      }
    },
    [
      employee,
      updateEmployeeMutation,
      companyId,
      enqueueSnackbar,
      closeModal,
      invalidateQueryKey,
    ],
  );

  const onSubmit = useCallback(() => {
    if (formRef.current) {
      formRef.current.onSubmit();
    }
  }, []);

  const onClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    employee,
    isLoading,
    isUpdating: updateEmployeeMutation.isLoading,
    onSubmit,
    onClose,
    handleSubmit,
    formRef,
  };
};
