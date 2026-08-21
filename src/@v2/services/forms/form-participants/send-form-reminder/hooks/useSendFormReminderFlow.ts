import { useCallback } from 'react';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import { isFormReminderEligible } from '../utils/form-reminder-eligibility';
import { useMutateSendFormReminder } from './useMutateSendFormReminder';
import { SendFormReminderResult } from '../service/send-form-reminder.types';
import { resolveClientFormReminderLimit } from '@v2/models/form/helpers/resolve-form-reminder-limit';

type SendFormReminderFlowParams = {
  companyId: string;
  applicationId: string;
  reminderCount: number;
  reminderLimit?: number | null;
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
      reminderLimit: reminderLimitParam,
      isAcceptingResponses,
      isShareableLink,
      onSuccess,
    }: SendFormReminderFlowParams) => {
      const reminderLimit = resolveClientFormReminderLimit({
        reminderLimit: reminderLimitParam,
      });
      if (
        !isFormReminderEligible({ isAcceptingResponses, isShareableLink }) ||
        reminderCount >= reminderLimit
      ) {
        return;
      }

      const confirmed = await showConfirmation({
        title: 'Enviar E-mail de Reforço',
        message: `O e-mail de reforço será enviado apenas para participantes que ainda não responderam ao formulário.\n\nParticipantes que já responderam não receberão.\n\nEste envio consome 1 das ${reminderLimit - reminderCount} rodadas restantes (${reminderCount}/${reminderLimit} utilizadas).`,
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
