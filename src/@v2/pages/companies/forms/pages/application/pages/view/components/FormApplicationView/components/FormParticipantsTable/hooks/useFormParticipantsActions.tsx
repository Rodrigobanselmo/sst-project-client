import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { EmployeeEditModal } from '../components/EmployeeEditModal/EmployeeEditModal';
import { useMutateSendFormEmail } from '@v2/services/forms/form-participants';

export const useFormParticipantsActions = ({
  companyId,
  applicationId,
}: {
  companyId: string;
  applicationId: string;
}) => {
  const { openModal } = useModal();
  const sendFormEmailMutation = useMutateSendFormEmail();

  const onFormParticipantAdd = () => {
    // TODO: Implement add participant functionality
    console.log('Add participant for application:', applicationId);
  };

  const onFormParticipantClick = (
    participant: FormParticipantsBrowseResultModel,
  ) => {
    openModal(
      ModalKeyEnum.EMPLOYEE_EDIT,
      <EmployeeEditModal
        companyId={companyId}
        encryptedEmployeeId={participant.encryptedEmployeeId}
        participantData={participant}
      />,
    );
  };

  const onSendFormEmail = (participantIds?: number[]) => {
    sendFormEmailMutation.mutate({
      companyId,
      applicationId,
      participantIds,
    });
  };

  return {
    onFormParticipantAdd,
    onFormParticipantClick,
    onSendFormEmail,
    sendFormEmailMutation,
  };
};
