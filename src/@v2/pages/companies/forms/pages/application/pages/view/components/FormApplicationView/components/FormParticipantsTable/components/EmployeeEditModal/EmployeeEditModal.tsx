import { Box, Typography } from '@mui/material';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useEmployeeEditModal } from './hooks/useEmployeeEditModal';
import { EmployeeEditForm } from './components/EmployeeEditForm/EmployeeEditForm';

interface EmployeeEditModalProps {
  companyId: string;
  encryptedEmployeeId: string;
  participantData: FormParticipantsBrowseResultModel;
}

export const EmployeeEditModal = ({
  companyId,
  encryptedEmployeeId,
  participantData,
}: EmployeeEditModalProps) => {
  const {
    employee,
    isLoading,
    isUpdating,
    onSubmit,
    onClose,
    formRef,
    handleSubmit,
  } = useEmployeeEditModal({
    companyId,
    encryptedEmployeeId,
    participantData,
  });

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.EMPLOYEE_EDIT}
      title="Editar Funcionário"
      minWidthDesk={800}
      maxWidthDesk={1000}
      loading={isUpdating}
      onSubmit={onSubmit}
      closeButtonOptions={{
        text: 'Cancelar',
        onClick: onClose,
      }}
      submitButtonOptions={{
        text: 'Salvar',
      }}
    >
      <Box sx={{ p: 3, minHeight: 400 }}>
        {isLoading ? (
          <Box>
            <SSkeleton height={40} sx={{ mb: 2 }} />
            <SSkeleton height={40} sx={{ mb: 2 }} />
            <SSkeleton height={40} sx={{ mb: 2 }} />
            <SSkeleton height={40} sx={{ mb: 2 }} />
            <SSkeleton height={40} sx={{ mb: 2 }} />
          </Box>
        ) : !employee ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Typography color="text.secondary">
              Funcionário não encontrado
            </Typography>
          </Box>
        ) : (
          <EmployeeEditForm
            ref={formRef}
            employee={employee}
            participantData={participantData}
            companyId={companyId}
            onSubmit={handleSubmit}
          />
        )}
      </Box>
    </SModalWrapper>
  );
};
