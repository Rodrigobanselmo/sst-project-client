import { useModal } from '@v2/hooks/useModal';

export const useFormParticipantsActions = ({ 
  companyId,
  applicationId 
}: { 
  companyId: string;
  applicationId: string;
}) => {
  const { onStackOpenModal } = useModal();

  const onFormParticipantAdd = () => {
    // TODO: Implement add participant functionality
    console.log('Add participant for application:', applicationId);
  };

  const onFormParticipantClick = (participantId: number) => {
    // TODO: Implement participant details/edit functionality
    console.log('View participant:', participantId, 'in application:', applicationId);
  };

  return {
    onFormParticipantAdd,
    onFormParticipantClick,
  };
};
