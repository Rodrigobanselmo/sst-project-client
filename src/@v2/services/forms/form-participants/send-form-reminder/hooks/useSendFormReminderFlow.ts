import { useCallback } from 'react';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import { isFormReminderEligible } from '../utils/form-reminder-eligibility';
import { useMutateSendFormReminder } from './useMutateSendFormReminder';
import { SendFormReminderResult } from '../service/send-form-reminder.types';

export const FORM_REMINDER_LIMIT = 4;

type SendFormReminderFlowParams = {
  companyId: string;
  applicationId: string;
  reminderCount: number;
  isAcceptingResponses: boolean;
  isShareableLink: boolean;
  onSuccess?: (data: SendFormReminderResult) => void;
};

export const useSendFormReminderFlow = () => {
  const sendReminderMutation = useMutateSendFormReminder();
  const { showConfirmation } = useConfirmationModal();
  const { showSnackBar } = useSystemSnackbar();

  const sendReminder = useCallback(
    async ({
      companyId,
      applicationId,
      reminderCount,
      isAcceptingResponses,
      isShareableLink,
      onSuccess,
    }: SendFormReminderFlowParams) => {
      if (
        !isFormReminderEligible({ isAcceptingResponses, isShareableLink }) ||
        reminderCount >= FORM_REMINDER_LIMIT
      ) {
        return;
      }

      const confirmed = await showConfirmation({
        title: 'Enviar E-mail de Reforço',
        message: `O e-mail de reforço será enviado apenas para participantes que ainda não responderam ao formulário.\n\nParticipantes que já responderam não receberão.\n\nEste envio consome 1 das ${FORM_REMINDER_LIMIT - reminderCount} rodadas restantes (${reminderCount}/${FORM_REMINDER_LIMIT} utilizadas).`,
        confirmText: 'Enviar Reforço',
        cancelText: 'Cancelar',
        variant: 'info',
      });

      if (!confirmed) return;

      return sendReminderMutation.mutateAsync(
        { companyId, applicationId },
        {
          onSuccess: (data) => {
            const parts: string[] = [];
            parts.push(`${data.emailsSent} e-mail(s) enviado(s)`);
            if (data.skippedAlreadyAnswered > 0) {
              parts.push(`${data.skippedAlreadyAnswered} já responderam`);
            }
            parts.push(`Reforços: ${data.reminderCount}/${data.reminderLimit}`);

            showSnackBar(parts.join(' · '), { type: 'success' });
            onSuccess?.(data);
          },
        },
      );
    },
    [sendReminderMutation, showConfirmation, showSnackBar],
  );

  return {
    sendReminder,
    isSending: sendReminderMutation.isPending,
  };
};
