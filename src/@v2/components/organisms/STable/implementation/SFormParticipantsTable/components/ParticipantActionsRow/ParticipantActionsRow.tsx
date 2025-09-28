import { FC, useRef, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';

import { SMoreOptionsIcon } from 'assets/icons/SMoreOptionsIcon/SMoreOptionsIcon';
import { SIconCopy } from '@v2/assets/icons/SIconCopy/SIconCopy';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuOption } from 'components/molecules/SMenu/types';

import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { SIconWhatsApp } from '@v2/assets/icons/SIconWhatsApp/SIconWhatsApp';
import { SIconEmail } from '@v2/assets/icons/SIconEmail/SIconEmail';
import { useFormParticipantsActions } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormParticipantsTable/hooks/useFormParticipantsActions';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

interface ParticipantActionsRowProps {
  participant: FormParticipantsBrowseResultModel;
  formApplication: FormApplicationReadModel;
}

export const ParticipantActionsRow: FC<ParticipantActionsRowProps> = ({
  participant,
  formApplication,
}) => {
  const { showSnackBar } = useSystemSnackbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement>(null);
  const { onSendFormEmail } = useFormParticipantsActions({
    companyId: formApplication.companyId,
    applicationId: formApplication.id,
  });

  const handleMenuAction = (action: 'copy' | 'email' | 'whatsapp') => {
    const baseUrl = `${window.location.origin}${formApplication.publicUrl}`;
    const linkWithEmployeeId = `${baseUrl}?encrypt=${participant.encryptedEmployeeId}`;

    if (action === 'copy') {
      navigator.clipboard
        .writeText(linkWithEmployeeId)
        .then(() => {
          showSnackBar('Link copiado para a área de transferência!', {
            type: 'success',
          });
        })
        .catch(() => {
          showSnackBar('Erro ao copiar o link. Tente novamente.', {
            type: 'error',
          });
        });
    } else if (action === 'email') {
      if (onSendFormEmail) {
        onSendFormEmail([participant.id]);
      } else {
        showSnackBar('Funcionalidade de email não disponível', {
          type: 'error',
        });
      }
    } else if (action === 'whatsapp') {
      const message = encodeURIComponent(
        `Olá! Aqui está o link do seu formulário: ${linkWithEmployeeId}`,
      );
      const whatsappUrl = `https://wa.me/${participant.phone?.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      showSnackBar('Redirecionando para o WhatsApp...', {
        type: 'success',
      });
    }
  };

  const getMenuOptions = (): IMenuOption[] => {
    const isAcceptingResponses =
      formApplication.status === FormApplicationStatusEnum.PROGRESS;

    return [
      {
        value: 'copy',
        name: 'Copiar Link',
        icon: () => <SIconCopy fontSize={16} />,
        iconColor: 'primary.main',
        disabled: !isAcceptingResponses,
      },
      {
        value: 'email',
        name: 'Enviar Email',
        icon: () => <SIconEmail fontSize={16} />,
        disabled:
          !participant.email || !onSendFormEmail || !isAcceptingResponses,
      },
      {
        value: 'whatsapp',
        name: 'Enviar WhatsApp',
        icon: () => <SIconWhatsApp fontSize="16px" />,
        disabled: true && !participant.phone, // Disabled if no phone
        iconColor: participant.phone ? '#25D366' : 'text.disabled',
        color: participant.phone ? undefined : 'text.disabled',
      },
    ];
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleMenuSelect = (option: { value: string | number }) => {
    handleMenuAction(option.value as 'copy' | 'email' | 'whatsapp');
    setIsMenuOpen(false);
  };

  return (
    <>
      <Tooltip title="Ações">
        <div ref={menuAnchorRef}>
          <IconButton
            size="small"
            onClick={handleMenuToggle}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <SMoreOptionsIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        </div>
      </Tooltip>
      <SMenu
        isOpen={isMenuOpen}
        close={handleMenuClose}
        anchorEl={menuAnchorRef.current}
        options={getMenuOptions()}
        handleSelect={handleMenuSelect}
      />
    </>
  );
};
